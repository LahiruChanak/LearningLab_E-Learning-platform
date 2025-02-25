// Emoji categories and their corresponding emojis
const emojiData = {
    'Smileys & People': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
    'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    'Food & Drink': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🎮', '🎲', '🧩', '🎭', '🎨', '🎬'],
    'Objects': ['💡', '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '📺', '📻', '📚', '📖', '📙', '✏️']
};

// Initialize emoji keyboard
function initEmojiKeyboard() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiBox = document.querySelector('.emoji-box');
    const messageInput = document.getElementById('messageInput');

    // Create category tabs and emoji grid
    createEmojiLayout(emojiBox);

    // Toggle emoji box visibility
    emojiButton.addEventListener('click', () => {
        emojiBox.classList.toggle('d-none');
    });

    // Close emoji box when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiBox.contains(e.target) && !emojiButton.contains(e.target)) {
            emojiBox.classList.add('d-none');
        }
    });
}

// Create emoji keyboard layout
function createEmojiLayout(emojiBox) {
    // Create category tabs
    const tabContainer = document.createElement('div');
    tabContainer.className = 'category-tabs d-flex mb-2 border-bottom';

    // Create emoji grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'emoji-grid';

    let isFirstCategory = true;
    for (const category in emojiData) {
        // Create category tab
        const tab = document.createElement('button');
        tab.className = `btn btn-sm ${isFirstCategory ? 'active' : ''}`;
        tab.textContent = category;
        tab.addEventListener('click', () => showCategory(category, gridContainer, tabContainer));
        tabContainer.appendChild(tab);

        if (isFirstCategory) {
            showCategory(category, gridContainer, tabContainer);
            isFirstCategory = false;
        }
    }

    emojiBox.innerHTML = '';
    emojiBox.appendChild(tabContainer);
    emojiBox.appendChild(gridContainer);
}

// Show emojis for selected category
function showCategory(category, gridContainer, tabContainer) {
    // Update active tab
    tabContainer.querySelectorAll('.btn').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === category) {
            tab.classList.add('active');
        }
    });

    // Display emojis
    gridContainer.innerHTML = '';
    emojiData[category].forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'emoji-item btn btn-sm';
        emojiButton.textContent = emoji;
        emojiButton.addEventListener('click', () => insertEmoji(emoji));
        gridContainer.appendChild(emojiButton);
    });
}

// Insert selected emoji into message input
function insertEmoji(emoji) {
    const messageInput = document.getElementById('messageInput');
    const cursorPos = messageInput.selectionStart;
    const textBefore = messageInput.value.substring(0, cursorPos);
    const textAfter = messageInput.value.substring(cursorPos);
    
    messageInput.value = textBefore + emoji + textAfter;
    messageInput.focus();
    messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initEmojiKeyboard);