$(document).ready(function () {
  // ------------------------- Tooltip -------------------------
  $('[data-bs-toggle="tooltip"]').each(function () {
    new bootstrap.Tooltip(this);
  });

  // ------------------------ progress card ------------------------
  const $circle = $(".progress");
  const $text = $(".progress-text");
  const circumference = 2 * Math.PI * 45;

  // Set initial stroke-dasharray and stroke-dashoffset
  $circle.css({
    strokeDasharray: circumference,
    strokeDashoffset: circumference,
  });

  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    $circle.css("strokeDashoffset", offset);
    $text.html(`${Math.round(percent)}%`);
  }

  // Demo: Animate progress from 0 to 75%
  let progress = 0;
  const targetProgress = 75;
  const duration = 1500; // 1.5 seconds
  const steps = 60; // 60 steps for smooth animation
  const increment = targetProgress / steps;
  const stepDuration = duration / steps;

  const interval = setInterval(function () {
    progress += increment;
    if (progress >= targetProgress) {
      progress = targetProgress;
      clearInterval(interval);
    }
    setProgress(progress);
  }, stepDuration);

  //////////////////////////////////////////////////////////////////////

  // Fetch User Data
  function fetchUserData() {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("danger", "Please login to the system to submit your request.");
      window.location.href = "../../../../frontend/index.html";
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/user/current",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
      success: function (response) {
        if (response.status === 200) {
          $("#fullName").val(response.data.fullName);
          $("#email").val(response.data.email);
        } else {
          showAlert("danger", "Failed to load user data: " + response.message);
        }
      },
      error: function (xhr) {
        showAlert("danger", "Error fetching user data: " + (xhr.responseJSON?.message || xhr.statusText));
      }
    });
  }

  // Preview Selected Files
  $("#certificates").on("change", function () {
    const files = this.files;
    const preview = $("#certificatesPreview");
    preview.empty();
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        preview.append(`<div>${file.name} (${(file.size / 1024).toFixed(2)} KB)</div>`);
      });
    }
  });

  // Handle Instructor Request Submission
  $("#submitRequestBtn").on("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("danger", "Please login to the system to submit your request.");
      window.location.href = "../../../../frontend/index.html";
      return;
    }

    const $button = $(this);
    $button.prop("disabled", true);

    const message = $("#message").val().trim();
    const qualifications = $("#qualifications").val().trim();
    const certificates = $("#certificates")[0].files;
    const experience = $("#experience").val().trim();
    const additionalDetails = $("#additionalDetails").val().trim();

    // Reset error messages
    $("#messageError, #qualificationsError, #experienceError, #certificatesError, #additionalDetailsError").text("");

    if (!message || !qualifications || !experience) {
      showAlert("danger", "Please fill in all the required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("message", message);
    formData.append("qualifications", qualifications);
    formData.append("experience", experience);
    formData.append("additionalDetails", additionalDetails || "");
    Array.from(certificates).forEach(file => {
      formData.append("certificates", file);
    });

    $.ajax({
      url: "http://localhost:8080/api/v1/user/instructor/request",
      type: "POST",
      headers: { "Authorization": "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === 200) {
          showAlert("success", `Request submitted successfully by ${response.data.fullName} (${response.data.email})`);
          $("#instructorRequestModal").modal("hide");
          $("#instructorRequestForm")[0].reset();
          $("#certificatesPreview").empty();
        } else {
          showAlert("danger", response.message || "Failed to submit request.");
        }
      },
      error: function (xhr) {
        showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error submitting request.");
      }
    });
  });

  fetchUserData();
});
