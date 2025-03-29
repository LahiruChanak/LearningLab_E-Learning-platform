$(document).ready(function () {

/* ------------------------------------------------ Password Update ------------------------------------------------- */

    // --------- Password visibility toggle ---------
    $(".password-toggle").on("click", function () {
        const $input = $(this).closest(".position-relative").find("input");
        const $icon = $(this).find("i");

        if ($input.attr("type") === "password") {
            $input.attr("type", "text");
            $icon.removeClass("hgi-view").addClass("hgi-view-off-slash");
        } else {
            $input.attr("type", "password");
            $icon.removeClass("hgi-view-off-slash").addClass("hgi-view");
        }
    });

    // -------- Handle password update submission --------
    $("#passwordUpdateForm").on("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "You are not logged in. Please login to update your password.");
            window.location.href = "../../../../frontend/index.html";
            return;
        }

        const currentPassword = $("#currentPassword").val().trim();
        const newPassword = $("#newPassword").val().trim();
        const confirmNewPassword = $("#confirmNewPassword").val().trim();
        const errorContainer = $(".error");
        const errorSpan = $("#passwordError");

        // Reset error display
        errorContainer.hide();
        errorSpan.text("");

        // Client-side validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            errorSpan.text("All fields are required.");
            errorContainer.show();
            return;
        }
        if (newPassword !== confirmNewPassword) {
            errorSpan.text("New password and confirmation do not match.");
            errorContainer.show();
            return;
        }

        // Connect to backend using jQuery AJAX
        $.ajax({
            url: "http://localhost:8080/api/v1/user/profile/password",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Password updated successfully!");
                    $("#passwordModal").modal("hide");
                    $("#passwordUpdateForm")[0].reset();
                    $(".password-strength-bar").css({width: "0%", background: "#e0e0e0"});
                    window.location.reload();
                } else {
                    errorSpan.text(response.message || "Error updating password.");
                    errorContainer.show();
                }
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to update password.";
                errorSpan.text(errorMsg);
                errorContainer.show();
                if (xhr.status === 401) {
                    showAlert("danger", "You are not authorized to update your password. Please login.");
                    window.location.href = "../../../../frontend/index.html";
                }
            }
        });
    });

/* -------------------------------------------------- Email Update -------------------------------------------------- */

    $("#emailUpdateForm").on("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "You are not logged in. Please log in to update your email.");
            // window.location.href = "../../../../frontend/index.html";
            return;
        }

        const currentEmail = $("#currentEmail").val().trim();
        const newEmail = $("#newEmail").val().trim();
        const password = $("#emailPassword").val().trim();
        const errorContainer = $(".error");
        const errorSpan = $("#emailError");

        // Reset error display
        errorContainer.hide();
        errorSpan.text("");

        if (!newEmail || !password) {
            errorSpan.text("All fields are required.")
            errorContainer.show();
            return;
        }
        if (newEmail === currentEmail) {
            errorSpan.text("New email must be different from the current email.");
            errorContainer.show();
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/profile/email",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                password: password,
                newEmail: newEmail
            }),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Email updated successfully! Please log in with your new email.");
                    $("#emailModal").modal("hide");
                    $("#emailUpdateForm")[0].reset();
                    localStorage.removeItem("token"); // Clear token since email changed

                    // window.location.href = "../../../../frontend/index.html";

                } else {
                    errorSpan.text(response.message || "Error updating email.");
                    errorContainer.show();
                }
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to update email.";
                errorSpan.text(errorMsg)
                errorContainer.show();
                if (xhr.status === 401) {
                    showAlert("danger", "You are not authorized to update your email. Please login.");
                    // window.location.href = "../../../../frontend/index.html";
                }
            }
        });
    });

/* ------------------------------------------- Two-Factor Authentication -------------------------------------------- */
    const codeInput = $(".code-input");

    // ------------ Move to next input field (2FA modal) ------------
    codeInput.on("input", function () {
        const $this = $(this);
        const index = codeInput.index(this);

        if ($this.val() && index < codeInput.length - 1) {
            codeInput
                .eq(index + 1)
                .focus();
        }
    });

    // ------------ Move to previous input field (2FA modal) ------------
    codeInput.on("keydown", function (e) {
        const $this = $(this);
        const index = codeInput.index(this);

        if (e.key === "Backspace" && !$this.val() && index > 0) {
            codeInput.eq(index - 1).focus();
        }
    });

    // ------------ Focus first input field (2FA modal) ------------
    $("#twoFactorModal").on("shown.bs.modal", function () {
        $(".code-input.first").focus();
    });

    // ------------ Setup and show 2FA modal ------------
    $("#setup2FAButton").on("click", function () {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please log in to enable 2FA.");
            // window.location.href = "../../../../frontend/index.html";
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/2fa/setup",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (response) {
                if (response.status === 200) {
                    const secret = response.data.secret;
                    const qrData = response.data.qrData; // otpauth://totp URI
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
                    $("#qrcode img").attr("src", qrCodeUrl);
                    $("#codeInput").val(secret);    // Display secret for manual entry
                    $("#twoFactorModal").modal("show");
                } else {
                    showAlert("danger", "Failed to setup 2FA: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error setting up 2FA: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
            }
        });
    });

    // ------------ Enable 2FA functionality ------------
    $("#enable2FA").on("click", function () {
        const token = localStorage.getItem("token");
        const inputs = codeInput;
        let code = "";
        inputs.each(function () {
            code += $(this).val();
        });

        const errorContainer = $(".error")
        const errorMessage = $("#error-message");

        if (code.length !== 6) {
            errorMessage.text("Please enter a 6-digit code.");
            errorContainer.show();
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/2fa/enable",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({code: code}),
            success: function (response) {
                if (response.status === 200) {
                    errorMessage.text("");
                    showAlert("success", "2FA has been successfully enabled!");
                    $("#twoFactorModal").modal("hide");
                    codeInput.val("");
                } else {
                    errorMessage.text(response.message || "Invalid verification code. Please try again.");
                    errorContainer.show();
                }
            },
            error: function (xhr) {
                errorMessage.text(xhr.responseJSON ? xhr.responseJSON.message : "Failed to enable 2FA.");
                errorContainer.show();
            }
        });
    });

    // ------------ Disable 2FA Confirmation ------------
    $("#disable2FA").on("click", function () {
        const token = localStorage.getItem("token");

        $.ajax({
            url: "http://localhost:8080/api/v1/user/2fa/disable",
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "2FA has been successfully disabled!");
                    $("#disable2FAModal").modal("hide");
                } else {
                    showAlert("success", "Failed to disable 2FA: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error disabling 2FA: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
            }
        });
    });

    // ------------ Function to copy the code to clipboard ------------
    $(".copy-btn").on("click", function () {
        // Get the code value
        const code = $("#codeInput").val();

        // Use the Clipboard API to copy the text
        navigator.clipboard
            .writeText(code)
            .then(() => {
                showAlert("info", "Code copied to clipboard.");
            })
            .catch((error) => {
                showAlert("danger", "Failed to copy code. Please try again.");
            });
    });

/* ------------------------------------------------ Account Deletion ------------------------------------------------ */

    $("#request-deletion").on("click", function (e) {
        e.preventDefault();

        const password = $("#delete-password").val().trim();
        const email = localStorage.getItem("email");

        if (!password || !email || !localStorage.getItem("token")) {
            showAlert("warning", "Please enter your password and ensure you are logged in!");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/delete/account",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({email, password}),
            success: function (response) {
                console.log("Success:", response);
                $("#deleteModal").modal("hide");
                showAlert("success", response.message);
                localStorage.clear();
                setTimeout(() => {
                    // window.location.href = "../../../../frontend/index.html";
                }, 1500);
            },
            error: function (xhr) {
                console.log("Error:", xhr);
                showAlert("danger", "Error: " + (xhr.responseJSON?.message || xhr.statusText));
                $("#delete-password").val("");
            }
        });
    });
});