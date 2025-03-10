// Sample data for contacts - simulating server data
const contacts = [
  {
    id: 1,
    name: "Alexis Sears",
    lastMessage: "You can change the ord...",
    time: "11:33",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: false,
  },
  {
    id: 2,
    name: "Web Development",
    lastMessage: "Discussing next sprint",
    time: "11:39",
    avatar: "assets/images/user.jpg",
    isGroup: true,
    isArchived: false,
  },
  {
    id: 3,
    name: "William",
    lastMessage: "How have you been?",
    time: "Fri",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: true,
  },
  {
    id: 4,
    name: "John Doe",
    lastMessage: "How are you?",
    time: "Yesterday",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: true,
  },
  {
    id: 5,
    name: "Sarah Johnson",
    lastMessage: "Can you help me?",
    time: "10:45",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: false,
  },
  {
    id: 6,
    name: "Emily Davis Friends Group",
    lastMessage: "Can you help me?",
    time: "10:45",
    avatar: "assets/images/user.jpg",
    isGroup: true,
    isArchived: false,
  },
];

// Sample messages for each chat - simulating server data
const chatMessages = {
  1: [
    { id: 1, text: "Hi Alexis! How are you?", sent: true, time: "09:30" },
    {
      id: 2,
      text: "Hey! I'm good, thanks. How about you?",
      sent: false,
      time: "09:31",
    },
    {
      id: 3,
      text: "I'm doing great! Just working on the project.",
      sent: true,
      time: "09:32",
    },
  ],
  2: [
    {
      id: 1,
      text: "Team, let's discuss the next sprint tasks.",
      sent: false,
      time: "11:00",
      sender: "John",
    },
    {
      id: 2,
      text: "I've prepared the documentation.",
      sent: false,
      time: "11:05",
      sender: "Sarah",
    },
    { id: 3, text: "Great work everyone!", sent: true, time: "11:10" },
  ],
  3: [
    {
      id: 1,
      text: "William, do you have the report ready?",
      sent: true,
      time: "Yesterday",
    },
    {
      id: 2,
      text: "Yes, I'll send it shortly.",
      sent: false,
      time: "Yesterday",
    },
  ],
};

let currentChatId = null;
let currentFilter = "all";

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

// Function to send message
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

$(document).ready(() => {
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

  // Initialize the chat interface
  showWelcomeScreen();
  renderContacts();
});
