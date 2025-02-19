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

  // Edit Section System
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const section = this.closest(".section");
      const inputs = section.querySelectorAll("input");

      // Toggle input disabled state
      inputs.forEach((input) => {
        input.disabled = !input.disabled;
      });

      // Change button text based on state
      if (inputs[0].disabled) {
        this.textContent = "✎ Edit";

        // Remove any previously added action buttons
        const actionButtons = section.querySelector(".action-buttons");
        if (actionButtons) {
          actionButtons.remove();
        }
      } else {
        this.textContent = "Cancel";

        // Add save button if not already present
        if (!section.querySelector(".action-buttons")) {
          const actionDiv = document.createElement("div");
          actionDiv.className =
            "action-buttons d-flex justify-content-end mt-3";
          actionDiv.innerHTML = `
            <button class="btn btn-primary save-changes-btn">Save Changes</button>
          `;
          section.appendChild(actionDiv);

          // Add event listener to the new save button
          const saveBtn = actionDiv.querySelector(".save-changes-btn");
          saveBtn.addEventListener("click", function () {
            // Here you would normally save the data to a server
            alert("Changes saved successfully!");

            // Disable inputs again
            inputs.forEach((input) => {
              input.disabled = true;
            });

            // Remove action buttons
            actionDiv.remove();

            // Reset edit button text
            button.textContent = "✎ Edit";
          });
        }
      }
    });
  });
});
