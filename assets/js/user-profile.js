document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Initialize all required elements
  const tabItems = document.querySelectorAll(".sub-navigation-menu li");
  const pages = document.querySelectorAll(".page");
  const profileModal = new bootstrap.Modal(
    document.getElementById("profileModal")
  );
  const profileImage = document.getElementById("profileImage");
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const profilePreview = document.getElementById("profilePreview");
  let currentFile = null;

  // Password and Email Modal Initialization
  const passwordModal = new bootstrap.Modal(
    document.getElementById("passwordModal")
  );
  const emailModal = new bootstrap.Modal(document.getElementById("emailModal"));
  const passwordForm = document.getElementById("passwordUpdateForm");
  const emailForm = document.getElementById("emailUpdateForm");

  // Password Strength Elements
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

  // Navigation System
  function showPage(pageName) {
    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Deactivate all tab items
    tabItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageName);
    if (selectedPage) {
      selectedPage.classList.add("active");
    }

    // Activate the corresponding tab
    const selectedTab = document.querySelector(
      `.sub-navigation-menu li[data-page="${pageName}"]`
    );
    if (selectedTab) {
      selectedTab.classList.add("active");
    }
  }

  // Add click event listeners to each tab item
  tabItems.forEach((item) => {
    item.addEventListener("click", function () {
      const pageName = this.getAttribute("data-page");
      if (pageName) {
        showPage(pageName);
      }
    });
  });

  // Function to handle hash and show tab
  function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash) {
      // Prevent browser from scrolling to hash
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
      showPage(hash);
      window.scrollTo(0, 0);
    } else if (tabItems.length > 0) {
      const initialPage = tabItems[0].getAttribute("data-page");
      showPage(initialPage);
    }
  }

  // Handle initial page load
  handleHashChange();

  // Listen for hash changes (ex:-, clicking notification icon on same page)
  window.addEventListener("hashchange", handleHashChange);

  // lock scroll position on load
  window.addEventListener("load", () => {
    window.scrollTo(0, 0);
  });

  // Profile Modal System
  if (profileImage) {
    profileImage.onclick = function () {
      profileModal.style.display = "block";
    };
  }

  // Profile Picture System
  if (imageUpload) {
    imageUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          currentFile = file;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle save changes for profile picture
  window.saveChanges = function () {
    if (currentFile) {
      // Update the main profile picture
      profilePreview.src = imagePreview.src;

      // Also update the header profile image
      const headerImage = document.querySelector(".header-image");
      if (headerImage) {
        headerImage.src = imagePreview.src;
      }

      // Close the modal
      if (profileModal) {
        profileModal.hide();
      }
    }
  };

  // Camera capture functionality
  window.takePhoto = function () {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          const video = document.createElement("video");
          const canvas = document.createElement("canvas");
          video.srcObject = stream;
          video.play();

          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);

            canvas.toBlob(function (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              currentFile = file;
              imagePreview.src = canvas.toDataURL("image/jpeg");

              stream.getTracks().forEach((track) => track.stop());
            }, "image/jpeg");
          }, 500);
        })
        .catch(function (error) {
          alert("Error accessing camera: " + error.message);
        });
    } else {
      alert("Camera not supported on this device/browser");
    }
  };

  // Edit button functionality
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const section = this.closest(".section");
      const inputs = section.querySelectorAll("input");

      inputs.forEach((input) => {
        input.disabled = !input.disabled;
      });

      if (inputs[0].disabled) {
        this.innerHTML = `
          <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
          Edit
        `;

        // Remove action buttons
        const actionButtons = section.querySelector(".action-buttons");
        if (actionButtons) {
          actionButtons.remove();
        }

        inputs.forEach((input) => {
          input.value = input.dataset.originalValue || input.value;
        });
      } else {
        this.innerHTML = '<span class="text-body-tertiary">Cancel</span>';

        inputs.forEach((input) => {
          input.dataset.originalValue = input.value;
        });

        if (!section.querySelector(".action-buttons")) {
          const actionDiv = document.createElement("div");
          actionDiv.className =
            "action-buttons d-flex justify-content-end mt-3";
          actionDiv.innerHTML = `
            <button class="btn btn-primary save-changes-btn">Save Changes</button>
          `;
          section.appendChild(actionDiv);

          const saveBtn = actionDiv.querySelector(".save-changes-btn");
          saveBtn.addEventListener("click", function () {
            alert("Changes saved successfully!");

            inputs.forEach((input) => {
              input.disabled = true;
            });

            actionDiv.remove();

            button.innerHTML = `
              <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
              Edit
            `;
          });
        }
      }
    });
  });

  // Skill tag system
  const editSkillsBtn = document.querySelector(".edit-btn");
  const skillTagsContainer = document.querySelector(".skill-tags");

  editSkillsBtn.addEventListener("click", function () {
    const isEditMode = editSkillsBtn.getAttribute("data-state") === "edit";

    if (isEditMode) {
      editSkillsBtn.innerHTML = `<span class="text-body-tertiary">Done</span>`;
      editSkillsBtn.setAttribute("data-state", "done");

      // Add "x" mark to each existing tag
      const skillTags = skillTagsContainer.querySelectorAll(
        ".skill-tag:not(.empty-skill)"
      );
      skillTags.forEach((tag) => {
        tag.classList.add("edit-mode");
        if (!tag.querySelector(".remove-skill")) {
          const removeIcon = document.createElement("span");
          removeIcon.className = "remove-skill";
          removeIcon.innerHTML = "&times;";
          removeIcon.addEventListener("click", function () {
            tag.remove(); // Remove the skill tag
          });
          tag.appendChild(removeIcon);
        }
      });

      // Add an empty skill tag for new skills
      const emptySkillTag = document.createElement("span");
      emptySkillTag.className = "skill-tag empty-skill";
      emptySkillTag.innerHTML = `
        <input type="text" placeholder="Add skill" />
        <i class="hgi-stroke hgi-tick-01 save-tick-input"></i>
      `;
      skillTagsContainer.appendChild(emptySkillTag);

      // Handle saving a new skill
      const inputField = emptySkillTag.querySelector("input");
      const saveTick = emptySkillTag.querySelector(".save-tick-input");

      saveTick.addEventListener("click", function () {
        if (inputField.value.trim() !== "") {
          const newSkillTag = document.createElement("span");
          newSkillTag.className = "skill-tag edit-mode"; // Ensure "x" mark is visible
          newSkillTag.textContent = inputField.value.trim();

          // Add "x" mark for the new skill
          const removeIcon = document.createElement("span");
          removeIcon.className = "remove-skill";
          removeIcon.innerHTML = "&times;";
          removeIcon.addEventListener("click", function () {
            newSkillTag.remove();
          });
          newSkillTag.appendChild(removeIcon);

          // Insert the new skill before the empty skill tag
          skillTagsContainer.insertBefore(newSkillTag, emptySkillTag);

          // Clear the input field
          inputField.value = "";
        }
      });
    } else {
      // Switch back to Edit state
      editSkillsBtn.innerHTML = `
        <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
        Edit
      `;
      editSkillsBtn.setAttribute("data-state", "edit");

      // Remove "x" marks from tags
      const skillTags = skillTagsContainer.querySelectorAll(".skill-tag");
      skillTags.forEach((tag) => {
        tag.classList.remove("edit-mode");
        const removeIcon = tag.querySelector(".remove-skill");
        if (removeIcon) {
          removeIcon.remove();
        }
      });

      // Remove the empty skill tag
      const emptySkillTag = skillTagsContainer.querySelector(".empty-skill");
      if (emptySkillTag) {
        emptySkillTag.remove();
      }
    }
  });
});

// Two Factor Authentication
function moveToNext(currentInput) {
  const inputs = document.querySelectorAll(".code-input");
  const currentIndex = Array.from(inputs).indexOf(currentInput);

  if (currentInput.value.length === 1 && currentIndex < inputs.length - 1) {
    inputs[currentIndex + 1].focus();
  }
}

// Enable 2FA functionality
function enable2FA() {
  const inputs = document.querySelectorAll(".code-input");
  let code = "";
  inputs.forEach((input) => {
    code += input.value;
  });

  const errorMessage = document.getElementById("error-message");

  // Simulated valid code (e.g., "123456")
  if (code === "123456") {
    errorMessage.textContent = "";
    alert("2FA has been successfully enabled!");
    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("twoFactorModal")
    );
    modal.hide();
  } else {
    errorMessage.textContent = "Invalid verification code. Please try again.";
  }
}

// Function to copy the code to clipboard
function copyCode() {
  const codeInput = document.getElementById("codeInput");
  const code = codeInput.value;

  // Use the Clipboard API to copy the text
  navigator.clipboard
    .writeText(code)
    .then(() => {
      alert("Code copied to clipboard.");
    })
    .catch((error) => {
      console.error("Failed to copy code:", error);
      alert("Failed to copy code. Please try again.");
    });
}

// -------------------------- Achievements --------------------------
document.addEventListener("DOMContentLoaded", () => {
  const viewAllBtn = document.getElementById("viewAllBtn");
  const hiddenItems = document.querySelectorAll(".achievement-item.hidden");
  const achievementCount = document.getElementById("achievement-count");
  let showingAll = false;

  viewAllBtn.addEventListener("click", () => {
    showingAll = !showingAll;
    hiddenItems.forEach((item) => {
      item.style.display = showingAll ? "flex" : "none";
    });
    viewAllBtn.textContent = showingAll ? "Show Less" : "View All";
  });
});

// -------------------------- Courses --------------------------
document.addEventListener("DOMContentLoaded", () => {
  const progressCircles = document.querySelectorAll(".progress");

  progressCircles.forEach((circle) => {
    const progress = circle.getAttribute("data-progress");
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  });
});

// -------------------------- Notifications --------------------------
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
      const notification = button.closest(".notification-item");
      notification.remove();
      // Check if list is empty
      if (!notificationList.children.length) {
        notificationList.innerHTML =
          '<p class="no-notifications">No notifications available.</p>';
      }
    });
  });
});

// -------------------------- Billing --------------------------
document.addEventListener("DOMContentLoaded", () => {
  const viewHistoryBtn = document.getElementById("viewHistory");
  const billingInfo = document.getElementById("billingInfo");
  const billingHistory = document.getElementById("billingHistory");
  const cardNumber = document.getElementById("card-number");
  const cvvCode = document.getElementById("cvv-code");
  let isHistoryVisible = false;

  // Mask card number
  const cardOriginal = cardNumber.getAttribute("data-original");
  const cardParts = cardOriginal.split(" ");
  const maskedParts = cardParts.map((part, index) =>
    index < 3 ? "****" : part
  );
  cardNumber.textContent = maskedParts.join(" ");

  // Mask CVV
  const cvvOriginal = cvvCode.getAttribute("data-original");
  cvvCode.textContent = "*".repeat(cvvOriginal.length);

  // Initially hide billing history
  billingHistory.style.display = "none";

  viewHistoryBtn.addEventListener("click", () => {
    isHistoryVisible = !isHistoryVisible;

    if (isHistoryVisible) {
      billingInfo.style.display = "none";
      billingHistory.style.display = "block";
      viewHistoryBtn.textContent = "Back";
      viewHistoryBtn.classList.add("me-5");
    } else {
      billingInfo.style.display = "block";
      billingHistory.style.display = "none";
      viewHistoryBtn.textContent = "Payment history";
      viewHistoryBtn.classList.remove("me-5");
    }
  });

  // Toggle Manage Mode
  document.getElementById("manageCards").addEventListener("click", function () {
    const isManageMode = this.textContent === "Done";

    this.style.transition = "none";

    if (!isManageMode) {
      // Enter manage mode
      const removeButtons = document.querySelectorAll(".remove-card-btn");
      removeButtons.forEach((button) => (button.style.display = "block"));

      // Disable card flip for all cards
      const flipCardInners = document.querySelectorAll(".flip-card-inner");
      flipCardInners.forEach((inner) => {
        inner.style.transform = "rotateY(0deg)";
        inner.style.transition = "none";
      });

      // Show Add Card button
      const addCardBtn = document.getElementById("addCard");
      addCardBtn.style.display = "block";

      this.textContent = "Done";
      this.className = "text-secondary border-0 bg-transparent";
    } else {
      // Exit manage mode
      const removeButtons = document.querySelectorAll(".remove-card-btn");
      removeButtons.forEach((button) => (button.style.display = "none"));

      // Restore card flip for all cards
      const flipCardInners = document.querySelectorAll(".flip-card-inner");
      flipCardInners.forEach((inner) => {
        inner.style.transition = "";
        inner.style.transform = "";
      });

      // Hide Add Card button
      const addCardBtn = document.getElementById("addCard");
      addCardBtn.style.display = "none";

      this.textContent = "Manage Cards";
      this.className = "text-primary border-0 bg-transparent";
    }

    void this.offsetWidth;
    this.style.transition = "";
  });

  // Add new card functionality
  document.getElementById("saveCardBtn").addEventListener("click", function () {
    const cardNumber = document.getElementById("newCardNumber").value;
    const cardName = document.getElementById("newCardName").value;
    const expDate = document.getElementById("newExpDate").value;
    const cvvCode = document.getElementById("newCvvCode").value;

    if (!cardNumber || !cardName || !expDate || !cvvCode) {
      showAlert("warning", "Please fill in all card details.");
      return;
    }

    const newCard = document.createElement("div");
    newCard.className = "flip-card d-flex flex-row align-items-center";
    newCard.innerHTML = `
        <div class="flip-card-inner flex-grow-1">
            <div class="flip-card-front">
                <div class="card-content">
                              <div class="flex-row top-row">
                                <img
                                  src="/assets/images/chip.svg"
                                  alt="Card Chip"
                                  class="chip mt-3"
                                />
                                <p class="card-heading">MASTERCARD</p>
                              </div>
                              <div class="flex-row middle-row">
                                <p
                                  class="card-number"
                                  id="card-number"
                                  data-original="${cardNumber}"
                                >
                                  ${cardNumber}
                                </p>
                                <img
                                  src="assets/images/contactless.svg"
                                  alt="Contactless"
                                  class="contactless"
                                />
                              </div>
                              <div class="flex-row bottom-row">
                                <p class="card-name" data-original="${cardName}">${cardName}</p>
                                <div class="validity">
                                  <p class="valid-thru">
                                    VALID <br />
                                    THRU
                                  </p>
                                  <p class="exp-date" data-original="${expDate}">${expDate}</p>
                                </div>
                                <img
                                  src="assets/images/mastercard.svg"
                                  alt="Mastercard logo"
                                  class="card-logo"
                                />
                              </div>
                            </div>
                <button class="remove-card-btn" style="display: none;">
                    <i class="hgi-stroke hgi-cancel-01 fw-bold small"></i>
                </button>
            </div>
            <div class="flip-card-back">
                <div class="strip"></div>
                <div class="mstrip"></div>
                <div class="sstrip">
                    <p class="code" data-original="${cvvCode}">${cvvCode}</p>
                </div>
            </div>
        </div>
    `;

    // Append new card to the card container div
    const cardContainer = document.getElementById("cardContainer");
    if (cardContainer) {
      cardContainer.appendChild(newCard);
    } else {
      console.error("Card container not found!");
      document.getElementById("paymentMethod").appendChild(newCard);
    }

    // Add event listener to new remove button
    const newRemoveBtn = newCard.querySelector(".remove-card-btn");
    newRemoveBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const card = this.closest(".flip-card");
      card.remove();

      // If no cards remain, exit manage mode
      const remainingCards = document.querySelector(".flip-card");
      const manageBtn = document.getElementById("manageCards");
      if (!remainingCards && manageBtn && manageBtn.textContent === "Done") {
        manageBtn.style.transition = "none";
        manageBtn.textContent = "Manage Cards";
        manageBtn.className = "text-primary border-0 bg-transparent";
        const addCardBtn = document.getElementById("addCard");
        addCardBtn.style.display = "none";
        // Hide all remove buttons
        const removeButtons = document.querySelectorAll(".remove-card-btn");
        removeButtons.forEach((button) => (button.style.display = "none"));
        // Restore all card flips
        const flipCardInners = document.querySelectorAll(".flip-card-inner");
        flipCardInners.forEach((inner) => {
          inner.style.transition = "";
          inner.style.transform = "";
        });
        void manageBtn.offsetWidth;
        manageBtn.style.transition = "";
      }
    });

    // Check if in manage mode and show remove button immediately
    const manageBtn = document.getElementById("manageCards");
    if (manageBtn && manageBtn.textContent === "Done") {
      newRemoveBtn.style.display = "block";

      // Disable flip for new card same as others
      const newFlipCardInner = newCard.querySelector(".flip-card-inner");
      if (newFlipCardInner) {
        newFlipCardInner.style.transform = "rotateY(0deg)";
        newFlipCardInner.style.transition = "none";
      }
    }

    // Clear form and close modal
    document.getElementById("newCardNumber").value = "";
    document.getElementById("newCardName").value = "";
    document.getElementById("newExpDate").value = "";
    document.getElementById("newCvvCode").value = "";
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addCardModal")
    );
    modal.hide();
  });

  // Card flip for new card modal
  document.getElementById("flipCardBtn").addEventListener("click", function () {
    const newCardInner = document.getElementById("newCardInner");
    const isFlipped = newCardInner.style.transform === "rotateY(180deg)";
    newCardInner.style.transform = isFlipped
      ? "rotateY(0deg)"
      : "rotateY(180deg)";
  });
});

// // Password visibility toggle functionality
// const passwordFields = document.querySelectorAll(
//   '.password-container input[type="password"]'
// );
// const toggleButtons = document.querySelectorAll(".password-container .btn");

// toggleButtons.forEach((button, index) => {
//   button.addEventListener("click", () => {
//     const passwordField = passwordFields[index];
//     const icon = button.querySelector("i");

//     if (passwordField.type === "password") {
//       button.setAttribute("data-bs-title", "Hide Password");
//       passwordField.type = "text";
//       icon.className = "hgi-stroke hgi-view-off-slash fs-5 align-middle";
//     } else {
//       button.setAttribute("data-bs-title", "Show Password");
//       passwordField.type = "password";
//       icon.className = "hgi-stroke hgi-view fs-5 align-middle";
//     }

//     // Update the tooltip
//     const tooltip = bootstrap.Tooltip.getInstance(button);
//     if (tooltip) {
//       tooltip.dispose();
//       new bootstrap.Tooltip(button);
//     }
//   });
// });
