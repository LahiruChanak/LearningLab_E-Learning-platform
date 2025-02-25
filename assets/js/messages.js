// Sample data for contacts
const contacts = [
  {
    id: 1,
    name: "Alexis Sears",
    lastMessage: "You can change the ord...",
    time: "11:33",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: false
  },
  {
    id: 2,
    name: "Web",
    lastMessage: "Discussing next sprint",
    time: "11:39",
    avatar: "assets/images/user.jpg",
    isGroup: true,
    isArchived: false
  },
  {
    id: 3,
    name: "William",
    lastMessage: "How have you been?",
    time: "Fri",
    avatar: "assets/images/user.jpg",
    isGroup: false,
    isArchived: true
  }
];

// Sample messages for each chat
const chatMessages = {
  1: [
    { id: 1, text: "Hi Alexis! How are you?", sent: true, time: "09:30" },
    { id: 2, text: "Hey! I'm good, thanks. How about you?", sent: false, time: "09:31" },
    { id: 3, text: "I'm doing great! Just working on the project.", sent: true, time: "09:32" }
  ],
  2: [
    { id: 1, text: "Team, let's discuss the next sprint tasks.", sent: false, time: "11:00", sender: "John" },
    { id: 2, text: "I've prepared the documentation.", sent: false, time: "11:05", sender: "Sarah" },
    { id: 3, text: "Great work everyone!", sent: true, time: "11:10" }
  ],
  3: [
    { id: 1, text: "William, do you have the report ready?", sent: true, time: "Yesterday" },
    { id: 2, text: "Yes, I'll send it shortly.", sent: false, time: "Yesterday" }
  ]
};

let currentChatId = 1;
let currentFilter = 'all';

// Function to filter contacts
function filterContacts(searchText) {
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = 
      (currentFilter === 'all' && !contact.isArchived) ||
      (currentFilter === 'group' && contact.isGroup && !contact.isArchived) ||
      (currentFilter === 'archived' && contact.isArchived);
    return matchesSearch && matchesFilter;
  });
  renderContacts(filteredContacts);
}

// Function to render contacts
function renderContacts(contactsList = contacts) {
  const contactList = document.getElementById("contactList");
  contactList.innerHTML = contactsList
    .map(
      (contact) => `
        <div class="contact-item ${contact.id === currentChatId ? 'active' : ''}" onclick="selectChat(${contact.id})">
          <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar" />
          <div class="contact-info">
            <div class="contact-name">
              ${contact.name}
              ${contact.isGroup ? '<span class="badge bg-primary ms-2">Group</span>' : ''}
              ${contact.isArchived ? '<span class="badge bg-secondary ms-2">Archived</span>' : ''}
            </div>
            <div class="contact-message">${contact.lastMessage}</div>
          </div>
          <div class="contact-time">${contact.time}</div>
        </div>
      `
    )
    .join("");
}

// Function to render messages
function renderMessages(chatId) {
  const messagesContainer = document.getElementById("chatMessages");
  const messages = chatMessages[chatId] || [];
  
  messagesContainer.innerHTML = messages
    .map(
      (message) => `
        <div class="message ${message.sent ? 'sent' : 'received'}">
          ${message.sender ? `<div class="sender-name">${message.sender}</div>` : ''}
          <div class="message-content">
            <div class="message-text">${message.text}</div>
            <div class="message-time">${message.time}</div>
          </div>
        </div>
      `
    )
    .join("");
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to select chat
function selectChat(chatId) {
  currentChatId = chatId;
  const selectedContact = contacts.find(c => c.id === chatId);
  
  // Update header
  document.querySelector('.user-info h6').textContent = selectedContact.name;
  document.querySelector('.user-avatar').src = selectedContact.avatar;
  
  renderContacts();
  renderMessages(chatId);
}

// Function to send message
function sendMessage(text) {
  if (!text.trim()) return;
  
  const newMessage = {
    id: chatMessages[currentChatId].length + 1,
    text: text,
    sent: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  chatMessages[currentChatId].push(newMessage);
  renderMessages(currentChatId);
  
  // Update last message in contacts
  const contactIndex = contacts.findIndex(c => c.id === currentChatId);
  contacts[contactIndex].lastMessage = text.substring(0, 20) + (text.length > 20 ? '...' : '');
  contacts[contactIndex].time = newMessage.time;
  renderContacts();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize first chat
  renderContacts();
  renderMessages(currentChatId);
  
  // Search functionality
  const searchBox = document.querySelector('.search-box');
  searchBox.addEventListener('input', (e) => filterContacts(e.target.value));
  
  // Filter buttons
  const filterButtons = document.querySelectorAll('.contacts-header button');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentFilter = button.textContent.toLowerCase().split(' ')[0];
      filterContacts(searchBox.value);
    });
  });
  
  // Send message
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  
  const handleSend = () => {
    sendMessage(messageInput.value);
    messageInput.value = '';
  };
  
  sendButton.addEventListener('click', handleSend);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
