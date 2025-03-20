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
  const lengthElement = document.getElementById("new-length");
  if (lengthElement) {
    lengthElement.textContent = `At least 8 characters (${password.length}/8)`;
    lengthElement.style.color = criteria.length ? "#00cc66" : "#ff4d4d";
    lengthElement.classList.toggle("valid", criteria.length);
  }

  // Update requirement list items
  Object.keys(criteria).forEach((criterion) => {
    if (criterion !== "length") {
      const newElement = document.getElementById("new-" + criterion);
      if (newElement) {
        newElement.classList.toggle("valid", criteria[criterion]);
        newElement.style.color = criteria[criterion] ? "#00cc66" : "#ff4d4d";
      }
    }
  });

  return criteria;
}

function getPasswordStrength(criteria) {
  const validCriteria = Object.values(criteria).filter(Boolean).length;

  return (validCriteria / 5) * 100; // calculate percentage and return it.
}

function getStrengthColor(percentage) {
  if (percentage === 0) return "#e0e0e0";
  if (percentage <= 40) return "#ff4d4d";
  if (percentage <= 60) return "#ffd700";
  if (percentage <= 80) return "#2eff7b";
  return "#00cc66";
}

function initializePasswordFields() {
  const passwordFields = ["newPassword", "confirmNewPassword", "password"];

  passwordFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    const container = input.closest(".input-container");
    const strengthBar = container.querySelector(".password-strength-bar");
    const requirementsCard = container.querySelector(
      ".password-requirements-card"
    );

    input.addEventListener("input", () => {
      if (input.value.length === 0) {
        // Reset bar when cleared or backspaced to empty
        strengthBar.style.width = "0%";
        strengthBar.style.background = "#e0e0e0"; // Reset to gray
        if (requirementsCard && (fieldId === "newPassword" || fieldId === "password")) {
          requirementsCard.style.display = "none";
        }
      } else {
        const criteria = validatePassword(input.value);
        const percentage = getPasswordStrength(criteria);
        strengthBar.style.width = `${percentage}%`;
        strengthBar.style.background = getStrengthColor(percentage);
        if (requirementsCard && (fieldId === "newPassword" || fieldId === "password")) {
          requirementsCard.style.display = "block";
        }
      }
    });

    // Show requirements card on focus (if not empty)
    input.addEventListener("focus", () => {
      if (
        requirementsCard &&
          (fieldId === "newPassword" || fieldId === "password") &&
        input.value.length > 0
      ) {
        requirementsCard.style.display = "block";
      }
    });

    // Hide requirements card on blur
    input.addEventListener("blur", () => {
      if (requirementsCard && (fieldId === "newPassword" || fieldId === "password")) {
        requirementsCard.style.display = "none";
      }
    });
  });
}

// Handle password update submission
function handlePasswordUpdate(event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;
  const errorDiv = document.querySelector("#passwordModal .error");

  // Validate current password (in a real app, this would be checked against the server)
  if (!currentPassword) {
    errorDiv.textContent = "Please enter your current password";
    return;
  }

  // Validate new password
  const criteria = validatePassword(newPassword);
  if (Object.values(criteria).some((criterion) => !criterion)) {
    errorDiv.textContent = "New password does not meet all requirements";
    return;
  }

  // Confirm passwords match
  if (newPassword !== confirmNewPassword) {
    errorDiv.textContent = "New passwords do not match";
    return;
  }

  // If all validations pass
  errorDiv.textContent = "";
  alert("Password updated successfully!");

  // Close the modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("passwordModal")
  );
  modal.hide();

  // Reset form
  event.target.reset();
}

// Initialize password fields when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializePasswordFields();

  // Add form submit handler
  const passwordForm = document.querySelector("#passwordModal form");
  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordUpdate);
  }
});
