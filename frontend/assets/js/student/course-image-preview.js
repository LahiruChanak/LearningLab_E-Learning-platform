// Initialize profile picture handlers
function initializeProfilePicture() {
  // Prevent event propagation on file inputs
  $('input[type="file"]').on("click", function (e) {
    e.stopPropagation();
  });

  // Handle course image preview in both add and update modals
  $("#course-img").on("change", function (e) {
    const modalId = $(this).closest(".modal").attr("id");
    const previewId =
      modalId === "updateCourseModal" ? "updateCoursePreview" : "coursePreview";
    handleImageSelection(e, previewId);
  });

  // Remove course image
  $(".remove-image-btn").on("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    const modalId = $(this).closest(".modal").attr("id");
    const previewId =
      modalId === "updateCourseModal" ? "coursePreview" : "coursePreview";
    const previewImg = $(`#${previewId}`);
    const fileInput = $("#course-img");

    // Add removing animation
    previewImg.fadeOut(200, function () {
      previewImg.attr("src", "../../assets/images/placeholder.svg").fadeIn(200);
      fileInput.val("");
      $(".remove-image-btn").hide();
    });
  });
}

// Handle image selection with validation and preview
function handleImageSelection(event, previewId) {
  const file = event.target.files[0];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (file) {
    if (!allowedTypes.includes(file.type)) {
      showAlert(
        "danger",
        "Please select a valid image file (JPEG, PNG, JPG or GIF)"
      );
      event.target.value = "";
      $(".remove-image-btn").hide();
      return;
    }

    if (file.size > maxSize) {
      showAlert("danger", "Image size should not exceed 5MB");
      event.target.value = "";
      $(".remove-image-btn").hide();
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        $(`#${previewId}`).fadeOut(200, function () {
          $(this).attr("src", e.target.result).fadeIn(200);
        });
        $(".remove-image-btn").fadeIn(200);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      showAlert("danger", "Error reading the image file");
      event.target.value = "";
      $(".remove-image-btn").hide();
    };
    reader.readAsDataURL(file);
  }
}

// Initialize when DOM is ready
$(document).ready(function () {
  initializeProfilePicture();

  // prevent file choose disable.
  $("#course-img").on("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      $("#course-img").prop("disabled", true);
    }
  });
});
