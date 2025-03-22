$(document).ready(function () {

  // Password validation and strength checking
  function validatePassword(password) {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Update password length display
    const $lengthElement = $("#new-length");
    if ($lengthElement.length) {
      $lengthElement.text(`At least 8 characters (${password.length}/8)`);
      $lengthElement.css("color", criteria.length ? "#00cc66" : "#ff4d4d");
      $lengthElement.toggleClass("valid", criteria.length);
    }

    // Update requirement list items
    $.each(criteria, function (criterion, isValid) {
      if (criterion !== "length") {
        const $newElement = $(`#new-${criterion}`);
        if ($newElement.length) {
          $newElement.toggleClass("valid", isValid);
          $newElement.css("color", isValid ? "#00cc66" : "#ff4d4d");
        }
      }
    });

    return criteria;
  }

  function getPasswordStrength(criteria) {
    const validCriteria = $.map(criteria, function (value) {
      return value ? 1 : null;
    }).length;

    return (validCriteria / 5) * 100;
  }

  function getStrengthColor(percentage) {
    const colorMap = {
      0: "#e0e0e0",
      40: "#ff4d4d",
      60: "#ffd700",
      80: "#2eff7b",
      100: "#00cc66",
    };

    let color = colorMap[0];
    $.each(colorMap, function (threshold, thresholdColor) {
      if (percentage > 0 && percentage <= threshold) {
        color = thresholdColor;
        return false;
      }
    });

    return color;
  }

  function initializePasswordFields() {
    const passwordFields = ["newPassword", "confirmNewPassword", "password"];

    $.each(passwordFields, function (index, fieldId) {
      const $input = $(`#${fieldId}`);
      if (!$input.length) return;

      const $container = $input.closest(".input-container");
      const $strengthBar = $container.find(".password-strength-bar");
      const $requirementsCard = $container.find(".password-requirements-card");

      $input.on("input", function () {
        if ($(this).val().length === 0) {
          $strengthBar.css({
            width: "0%",
            background: "#e0e0e0", // Reset to gray
          });

          if (
            $requirementsCard.length &&
            (fieldId === "newPassword" || fieldId === "password")
          ) {
            $requirementsCard.hide();
          }
        } else {
          const criteria = validatePassword($(this).val());
          const percentage = getPasswordStrength(criteria);
          $strengthBar.css({
            width: `${percentage}%`,
            background: getStrengthColor(percentage),
          });

          if (
            $requirementsCard.length &&
            (fieldId === "newPassword" || fieldId === "password")
          ) {
            $requirementsCard.show();
          }
        }
      });

      // Show requirement card on focus (if not empty)
      $input.on("focus", function () {
        if (
          $requirementsCard.length &&
          (fieldId === "newPassword" || fieldId === "password") &&
          $(this).val().length > 0
        ) {
          $requirementsCard.show();
        }
      });

      // Hide requirements card on blur
      $input.on("blur", function () {
        if (
          $requirementsCard.length &&
          (fieldId === "newPassword" || fieldId === "password")
        ) {
          $requirementsCard.hide();
        }
      });
    });
  }

  // Handle password update submission
  $("#passwordUpdateForm").on("submit", function (event) {
    event.preventDefault();

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
      success: function(response) {
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
      error: function(xhr) {
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

  initializePasswordFields();
});
