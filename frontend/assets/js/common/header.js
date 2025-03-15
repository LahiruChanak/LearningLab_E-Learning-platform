// -------------------------- Notification Modal --------------------------
document.addEventListener("DOMContentLoaded", () => {
  const markAllReadBtn = document.getElementById("markAllRead");
  const notificationList = document.getElementById("notificationList");
  const deleteButtons = document.querySelectorAll(".btn-delete");

  // Mark All as Read functionality
  markAllReadBtn.addEventListener("click", () => {
    const notifications =
      notificationList.querySelectorAll(".notification-item");
    notifications.forEach((item) => {
      item.classList.add("read");
    });
  });

  // Delete individual notification functionality
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Hide tooltip before removing notification
      const tooltip = bootstrap.Tooltip.getInstance(button);
      if (tooltip) {
        tooltip.dispose();
      }

      const notification = button.closest(".notification-item");
      notification.remove();

      if (!notificationList.children.length) {
        notificationList.innerHTML =
          '<p class="no-notifications">No notifications available.</p>';
      }
    });
  });
});
