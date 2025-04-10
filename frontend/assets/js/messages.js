let currentChatId = null;
let currentFilter = "all";
let token = localStorage.getItem('token') || null;
let availableContacts = [];

// Simulated API endpoints
const api = {
  getContacts: () => {
    return $.Deferred().resolve(contacts);
  },
  getMessages: (chatId) => {
    return $.Deferred().resolve(chatMessages[chatId] || []);
  },
  sendMessage: (chatId, message) => {
    const newMessage = {
      id: chatMessages[chatId].length + 1,
      text: message,
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    chatMessages[chatId].push(newMessage);
    return $.Deferred().resolve(newMessage);
  },
  updateContact: (contactId, data) => {
    const contactIndex = contacts.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      contacts[contactIndex] = { ...contacts[contactIndex], ...data };
    }
    return $.Deferred().resolve(contacts[contactIndex]);
  },
};

// Standalone function to fetch contacts from backend
function fetchContacts() {
  return $.ajax({
    url: 'http://localhost:8080/api/v1/chat/contacts',
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(response => {
    console.log('Contacts fetched from API:', response);
    return response;
  }).fail(error => {
    console.error('Error fetching contacts:', error);
  });
}

// Function to show welcome screen
function showWelcomeScreen() {
  $(".chat-header, .chat-input").hide();
}

// Function to filter contacts
function filterContacts(searchText) {
  api.getContacts().then((contacts) => {
    const filteredContacts = contacts.filter((contact) => {
      const matchesSearch = contact.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesFilter =
        (currentFilter === "all" && !contact.isArchived) ||
        (currentFilter === "group" && contact.isGroup && !contact.isArchived) ||
        (currentFilter === "archived" && contact.isArchived);
      return matchesSearch && matchesFilter;
    });
    renderContacts(filteredContacts);
  });
}

// Function to render contacts
function renderContacts(contactsList = contacts) {
  const filteredContacts = contactsList.filter((contact) => {
    return (
      (currentFilter === "all" && !contact.isArchived) ||
      (currentFilter === "group" && contact.isGroup && !contact.isArchived) ||
      (currentFilter === "archived" && contact.isArchived)
    );
  });

  const contactsHtml = filteredContacts
    .map(
      (contact) => `
        <div class="contact-item ${
          contact.id === currentChatId ? "active" : ""
        }" data-chat-id="${contact.id}">
          <img src="${contact.avatar}" alt="${
        contact.name
      }" class="contact-avatar" />
          <div class="contact-info">
            <div class="contact-name">
              ${contact.name}
              ${
                contact.isGroup
                  ? '<span class="badge bg-primary rounded-pill">Group</span>'
                  : ""
              }
              ${
                contact.isArchived
                  ? '<span class="badge bg-secondary rounded-pill">Archived</span>'
                  : ""
              }
            </div>
            <div class="contact-message">${contact.lastMessage}</div>
          </div>
          <div class="contact-time">${contact.time}</div>
        </div>
      `
    )
    .join("");

  $("#contactList").html(contactsHtml);
}

// Function to render messages
function renderMessages(chatId) {
  api.getMessages(chatId).then((messages) => {
    const selectedContact = contacts.find((c) => c.id === chatId);
    $(".chat-header, .chat-input").show();

    const messagesHtml = messages
      .map(
        (message) => `
          <div class="message ${message.sent ? "sent" : "received"}">
            <div class="sender-name">${
              message.sent ? "You" : message.sender || selectedContact.name
            }</div>
            <div class="message-content">
              <div class="message-text">${message.text}</div>
              <div class="message-time">${message.time}</div>
            </div>
          </div>
        `
      )
      .join("");

    $("#chatMessages").html(messagesHtml);
    $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
  });
}

// Function to select chat
function selectChat(chatId) {
  currentChatId = chatId;
  const selectedContact = contacts.find((c) => c.id === chatId);

  // Update header
  $(".user-info h6").text(selectedContact.name);
  $(".user-avatar").attr("src", selectedContact.avatar);

  renderContacts();
  renderMessages(chatId);
}

// Function to send the message
function sendMessage(text) {
  if (!text.trim() || !currentChatId) return;

  api.sendMessage(currentChatId, text).then((newMessage) => {
    renderMessages(currentChatId);

    // Update last message in contacts
    api
      .updateContact(currentChatId, {
        lastMessage: text.substring(0, 20) + (text.length > 20 ? "..." : ""),
        time: newMessage.time,
      })
      .then(() => {
        renderContacts();
      });
  });
}

// --------------------------------------- Contact List (dropdown menu) --------------------------------------- //
// Function to filter available contacts
function filterAvailableContacts(searchText) {
  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  renderAvailableContacts(filteredContacts);
}

// Function to render available contacts in dropdown
function renderAvailableContacts(contactsList = availableContacts) {
  if (contactsList.length === 0) {
    $(".new-contact-list").html('<div class="text-center p-3 pt-4 mt-2">No contacts found</div>');
    console.log('No available contacts to render');
    return;
  }

  const contactsHtml = contactsList.map(contact => `
    <div class="new-contact-item" data-contact-id="${contact.id}">
      <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar" />
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-role">${contact.role || 'User'}</div>
      </div>
    </div>
  `).join("");

  $(".new-contact-list").html(contactsHtml);
}

// Function to start new chat
function startNewChat(contactId) {
  const selectedContact = availableContacts.find(c => c.id === contactId);
  if (!selectedContact) {
    console.error('Contact not found:', contactId);
    return;
  }

  const newChat = {
    id: selectedContact.id,
    name: selectedContact.name,
    lastMessage: "",
    time: "Now",
    avatar: selectedContact.avatar,
    isGroup: false,
    isArchived: false,
  };

  if (!contacts.some(c => c.id === newChat.id)) {
    contacts.unshift(newChat);
  }

  if (!chatMessages[newChat.id]) {
    chatMessages[newChat.id] = [];
  }

  currentChatId = newChat.id; // Set current chat ID
  $(".user-info h6").text(selectedContact.name); // Update header
  $(".user-avatar").attr("src", selectedContact.avatar);
  $(".chat-header, .chat-input").show(); // Show chat UI
  $("#chatMessages").html('<div class="message"><div class="message-text">Start chatting with ' + selectedContact.name + '</div></div>'); // Load initial message
  $("#chatMessages").show(); // Ensure visibility
  $("#newMessageBtn").dropdown("hide"); // Close dropdown

  renderContacts(); // Update #contactList
  console.log('New chat started for:', selectedContact);
}

$(document).ready(() => {
  fetchContacts().then(response => {
    availableContacts = response.map(contact => ({
      id: contact.userId,
      name: contact.fullName,
      avatar: contact.profilePicture || "../assets/images/icons/placeholder.svg",
      role: contact.role || 'User'
    }));
    renderAvailableContacts();
  }).fail(error => {
    console.error('Failed to fetch contacts:', error);
  });

  // Add event listeners for message type buttons
  $("[data-message-type]").on("click", function () {
    currentFilter = $(this).data("messageType");
    $("[data-message-type]").removeClass("active");
    $(this).addClass("active");
    renderContacts();
  });

  // Add event listener for contact search input
  $("#contactSearch").on("input", function () {
    filterContacts($(this).val());
  });

  // Add event listener for contact selection
  $(document).on("click", ".contact-item", function () {
    selectChat($(this).data("chatId"));
  });

  // Add event listener for send button and input
  $("#sendButton").on("click", () => {
    sendMessage($("#messageInput").val());
    $("#messageInput").val("");
  });

  $("#messageInput").on("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage($("#messageInput").val());
      $("#messageInput").val("");
    }
  });

  // Initialize new message dropdown
  renderAvailableContacts();

  // Add event listener for new contact search
  $("#newContactSearch").on("input", function () {
    filterAvailableContacts($(this).val());
  });

  // Add event listener for new contact selection
  $(document).on("click", ".new-contact-item", function (e) {
    e.preventDefault();
    const contactId = $(this).data("contactId");
    console.log('Contact clicked:', contactId); // Debug click
    startNewChat(contactId);
  });

  // Initialize the chat interface
  showWelcomeScreen();
  renderContacts();
});
