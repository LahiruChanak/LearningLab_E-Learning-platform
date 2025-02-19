document.addEventListener("DOMContentLoaded", function () {
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

  // Set initial active page
  if (tabItems.length > 0) {
    const initialPage = tabItems[0].getAttribute("data-page");
    showPage(initialPage);
  }

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
      editSkillsBtn.innerHTML = `<span class="text-body-tertiary">Cancel</span>`;
      editSkillsBtn.setAttribute("data-state", "cancel");

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
