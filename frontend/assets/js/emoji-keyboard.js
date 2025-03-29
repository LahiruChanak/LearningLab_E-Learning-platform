// Initialize emoji keyboard
function initEmojiKeyboard() {
  const emojiButton = document.getElementById("emojiButton");
  const emojiBox = document.querySelector(".emoji-box");
  const messageInput = document.getElementById("messageInput");

  // Create and configure Emoji Mart picker
  const pickerOptions = {
    onEmojiSelect: (emoji) => insertEmoji(emoji.native),
    theme: "light",
    set: "native",
    autoFocus: false,
    showPreview: true,
    showSkinTones: false,
    emojiSize: 20,
  };

  // Create the picker instance
  const picker = new EmojiMart.Picker(pickerOptions);
  emojiBox.appendChild(picker);

  // Toggle emoji box visibility
  emojiButton.addEventListener("click", () => {
    emojiBox.classList.toggle("d-none");
  });

  // Close emoji box when clicking outside
  document.addEventListener("click", (e) => {
    if (!emojiBox.contains(e.target) && !emojiButton.contains(e.target)) {
      emojiBox.classList.add("d-none");
    }
  });
}

// Insert selected emoji into message input
function insertEmoji(emoji) {
  const messageInput = document.getElementById("messageInput");
  const cursorPos = messageInput.selectionStart;
  const textBefore = messageInput.value.substring(0, cursorPos);
  const textAfter = messageInput.value.substring(cursorPos);

  messageInput.value = textBefore + emoji + textAfter;
  messageInput.focus();
  messageInput.setSelectionRange(
    cursorPos + emoji.length,
    cursorPos + emoji.length
  );
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initEmojiKeyboard);
