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
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/user/current",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
      success: function (response) {
        if (response.status === 200) {
          const userData = response.data;

          // Update UI with user data
          $("#fullName").val(userData.fullName || "");
          $("#email").val(userData.email || "");
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

  // Handle Edit Icon Click
  $("#editRequestBtn").on("click", function () {
    $("#instructorRequestForm input:not(#fullName, #email), #instructorRequestForm textarea").prop("disabled", false);
    $("#submitRequestBtn").prop("disabled", false).show();
    $(this).hide();
    $("#cancelRequestBtn").show();
  });

  // Handle Cancel Icon Click
  $("#cancelRequestBtn").on("click", function () {
    $("#instructorRequestForm input:not(#fullName, #email), #instructorRequestForm textarea").prop("disabled", true);
    $("#submitRequestBtn").prop("disabled", true).hide();
    $(this).hide();
    $("#editRequestBtn").show();
    fetchUserRequest();
  });

  // Handle Instructor Request Submission
  $("#submitRequestBtn").on("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("danger", "Please login to the system to submit your request.");
      return;
    }

    const $button = $(this);
    $button.prop("disabled", true);
    $(".loader").show();

    const fullName = $("#fullName").val().trim();
    const email = $("#email").val().trim();
    const message = $("#message").val().trim();
    const qualifications = $("#qualifications").val().trim();
    const certificates = $("#certificates")[0].files;
    const experience = $("#experience").val().trim();
    const additionalDetails = $("#additionalDetails").val().trim();

    if (!message || !qualifications || !experience) {
      showAlert("danger", "Please fill in all the required fields.");
      $button.prop("disabled", false);
      $(".loader").hide();
      return;
    }

    const formData = new FormData();
    formData.append("message", message);
    formData.append("qualifications", qualifications);
    formData.append("experience", experience);
    formData.append("additionalDetails", additionalDetails || "");

    // Append existing certificates (if any) to preserve them
    const existingCertificates = [];
    $(".certificate-item").each(function () {
      existingCertificates.push($(this).data("url"));
    });

    if (existingCertificates.length > 0) {
      formData.append("existingCertificates", JSON.stringify(existingCertificates));
    }

    // Append new certificates
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
        $button.prop("disabled", false);
        if (response.status === 200) {
          const action = response.message.includes("updated") ? "updated" : "submitted";
          showAlert("success", `Request ${action} successfully by ${fullName} (${email})`);
          $("#instructorRequestModal").modal("hide");
          $("#instructorRequestForm")[0].reset();
          $("#certificatesPreview").empty();
          fetchUserRequest();
        } else if (response.status === 400) {
          showAlert("warning", response.message);
          fetchUserRequest();
        } else {
          showAlert("danger", response.message || "Failed to process request.");
        }

        setTimeout(() => {
          window.location.reload();
        },1500);
      },
      error: function (xhr) {
        $button.prop("disabled", false);
        showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error processing request.");
      },
      complete: function () {
        $(".loader").hide();
      }
    });
  });

  // Fetch and display user's request
  function fetchUserRequest() {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("danger", "Please login to view your request.");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/user/instructor/request",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
      success: function (response) {
        if (response.status === 200) {
          populateRequestForm(response.data);
        } else if (response.status === 404) {
          $("#requestDetails").html("<p>No request submitted yet.</p>");
        } else {
          showAlert("danger", "Failed to load your request: " + response.message);
        }
      },
      error: function (xhr) {
        showAlert("danger", "Error fetching your request: " + (xhr.responseJSON?.message || xhr.statusText));
      }
    });
  }

  // Populate the form with existing request data
  function populateRequestForm(request) {
    $("#message").val(request.message || "");
    $("#qualifications").val(request.qualifications || "");
    $("#experience").val(request.experience || "");
    $("#additionalDetails").val(request.additionalDetails || "");

    // Display certificates in preview
    $("#certificatesPreview").empty();
    if (request.certificates && Array.isArray(request.certificates)) {
      request.certificates.forEach((url, index) => {
        $("#certificatesPreview").append(
            `<a href="#" class="certificate-link" data-bs-toggle="modal" data-bs-target="#certificateModal" data-url="${url}">Certificate ${index + 1}</a> `
        );
      });
    }

    // Disable form fields and submit button if request exists
    $("#instructorRequestForm input, #instructorRequestForm textarea").prop("disabled", true);
    $("#submitRequestBtn").prop("disabled", true).show();

    // Add status and timestamps below the form
    $("#formStatus").remove();
    $("#formTimestamps").remove();
    $("#instructorRequestForm").after(`
      <div id="formStatus">
        <strong>Status:</strong> ${request.requestStatus}
      </div>
      <div id="formTimestamps">
        <strong>Created At:</strong> ${request.requestCreatedAt ? new Date(request.requestCreatedAt).toLocaleString('en-CA', { hour12: false }).replace(',', '') : 'N/A'} <br>
        <strong>Last Updated At:</strong> ${request.requestUpdatedAt ? new Date(request.requestUpdatedAt).toLocaleString('en-CA', { hour12: false }).replace(',', '') : 'N/A'}
      </div>
    `);

    // Handle certificate preview
    $(".certificate-link").on("click", function (e) {
      e.preventDefault();
      const certificateUrl = $(this).data("url");
      $("#certificatePreview").attr("src", certificateUrl);
    });
  }

  $("#certificateModal .btn-close").on("click", function () {
    $("#instructorRequestModal").modal("show");
  })

  fetchUserRequest();
  fetchUserData();
});
