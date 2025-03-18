$(document).ready(function () {

    /* ---------------------------------- User Profile Functions ---------------------------------- */

    // load user profile details
    function loadUserProfile() {
        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("danger", "You are not logged in. Please login to view your profile.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/profile",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (response) {
                if (response.status === 200) {
                    const userData = response.data;

                    $("#header-name").text(userData.fullName);
                    $("#header-role").text(
                        userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase() : "-"
                    );

                    if (userData.profileImage) {
                        $("#header-profile-image").attr("src", userData.profileImage);
                    }
                } else {
                    showAlert("danger", "Failed to load profile: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching profile:", xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText);
            }
        });
    }

    /* ---------------------------------- Notification Modal Functions ---------------------------------- */

    // mark all as read
    $("#markAllRead").on("click", function () {
        $("#notificationList .notification-item").addClass("read");
    });

    // Delete individual notification
    $(document).on("click", ".btn-delete", function () {
        const $button = $(this);
        const $notification = $button.closest(".notification-item");

        // Dispose Bootstrap tooltip if present
        const tooltip = bootstrap.Tooltip.getInstance($button[0]);
        if (tooltip) {
            tooltip.dispose();
        }

        $notification.remove();

        // check if the notification list is empty
        if ($("#notificationList").children().length === 0) {
            $("#notificationList").html('<p class="no-notifications">No notifications available.</p>');
        }
    });

    // Initialize tooltips for delete buttons
    $('[data-bs-toggle="tooltip"]').tooltip();

    loadUserProfile();
});