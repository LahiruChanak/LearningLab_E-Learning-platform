$(document).ready(function () {
  // Track current video
  let currentVideoId = "";

  // Handle lesson item clicks
  $(".lesson-item").on("click", function () {
    const videoId = $(this).data("video-id");
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      // Update iframe source
      $(".video-container iframe").attr(
        "src",
        `https://www.youtube.com/embed/${videoId}`
      );

      // Update lesson status
      $(".lesson-item i.hgi-check").remove(); // Remove all check marks
      $(this).append('<i class="hgi-stroke hgi-check text-success"></i>');

      // Update play icon to indicate current lesson
      $(".lesson-item i.hgi-play").removeClass("text-primary");
      $(this).find("i.hgi-play").addClass("text-primary");
    }
  });

  // Handle enrollment button
  $(".btn-enroll").on("click", function () {
    const $btn = $(this);
    $btn.prop("disabled", true);
    $btn.html(
      '<span class="spinner-border spinner-border-sm me-2"></span>Enrolling...'
    );

    // Simulate enrollment process
    setTimeout(function () {
      $btn.html(
        'Enrolled <i class="hgi-stroke hgi-tick-01 fs-5 align-middle"></i>'
      );
      $btn.removeClass("btn-primary").addClass("btn-success");
    }, 1500);
  });

  // Handle share button
  $(".btn-share").on("click", function () {
    // Create a temporary input element
    const tempInput = $("<input>");
    $("body").append(tempInput);
    tempInput.val(window.location.href);
    tempInput.select();
    document.execCommand("copy");
    tempInput.remove();

    // Show feedback
    const $btn = $(this);
    const originalText = $btn.html();
    $btn.html(
      '<i class="hgi-stroke hgi-copy-link fs-5 align-middle"></i> Copied!'
    );
    setTimeout(() => {
      $btn.html(originalText);
    }, 2000);
  });

  // Track section progress
  function updateSectionProgress() {
    $(".accordion-item").each(function () {
      const totalLessons = $(this).find(".lesson-item").length;
      const completedLessons = $(this).find(".hgi-check").length;
      const progress = Math.round((completedLessons / totalLessons) * 100);

      // Add progress info to section header
      const $header = $(this).find(".accordion-button");
      const $progressInfo = $header.find(".progress-info");

      if ($progressInfo.length === 0 && totalLessons > 0) {
        $header
          .find(".duration")
          .before(
            `<span class="progress-info text-success ms-2">${progress}% complete</span>`
          );
      } else {
        $progressInfo.text(`${progress}% complete`);
      }
    });
  }

  // Initial progress update
  updateSectionProgress();

  // Update progress when lessons are completed
  $(".lesson-item").on("click", function () {
    if (!$(this).find(".hgi-check").length) {
      $(this).append('<i class="hgi-stroke hgi-check text-success"></i>');
      updateSectionProgress();
    }
  });

  // Handle FAQ form submission
  $("#faqForm").on("submit", function (e) {
    e.preventDefault();
    const question = $("#questionText").val().trim();
    if (question) {
      alert("Thank you for your question! We'll respond shortly.");
      $("#questionText").val("");
    }
  });

  // Handle star rating
  let selectedRating = 0;
  $(".rating-input i").on("click", function () {
    selectedRating = $(this).data("rating");
    $(".rating-input i").removeClass("filled");
    $(this).prevAll().addBack().addClass("filled");
  });

  // Handle review form submission
  $("#reviewForm").on("submit", function (e) {
    e.preventDefault();
    const reviewText = $("#reviewText").val().trim();
    if (selectedRating === 0) {
      alert("Please select a rating");
      return;
    }
    if (reviewText) {
      // Add the new review to the list
      const newReview = `
        <div class="review-item mb-4">
          <div class="d-flex align-items-center mb-2">
            <img src="assets/images/user.jpg" alt="User" class="rounded-circle me-2" width="40" height="40">
            <div>
              <h6 class="mb-0">You</h6>
              <div class="stars">
                ${"<i class='hgi-stroke hgi-star fs-6 align-middle filled'></i>".repeat(selectedRating)}
                ${"<i class='hgi-stroke hgi-star fs-6 align-middle'></i>".repeat(5 - selectedRating)}
              </div>
            </div>
          </div>
          <p class="mb-0">${reviewText}</p>
        </div>
      `;
      $(".review-list").prepend(newReview);

      // Reset form
      $("#reviewText").val("");
      $(".rating-input i").removeClass("filled");
      selectedRating = 0;
    }
  });

  // Handle resource downloads
  $(".resource-item button").on("click", function () {
    const resourceName = $(this).closest(".resource-item").find("h6").text();
    alert(`Downloading ${resourceName}...`);
  });

  // Quiz functionality
  const quizAnswers = {
    q1: "b",
    q2: "b"
  };

  $("#quizForm").on("submit", function (e) {
    e.preventDefault();
    let score = 0;
    let totalQuestions = Object.keys(quizAnswers).length;

    // Calculate score
    for (let question in quizAnswers) {
      if ($(`input[name=${question}]:checked`).val() === quizAnswers[question]) {
        score++;
      }
    }

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    $("#quizScore").text(percentage);

    // Show results and feedback
    $("#quizResults").removeClass("d-none");
    if (percentage >= 75) {
      $("#quizFeedback").text("Congratulations! You've passed the quiz.");
      $("#retakeQuiz").addClass("d-none");
      $("#quizForm button[type=submit]").prop("disabled", true);
    } else {
      $("#quizFeedback").text("You need to score at least 75% to pass. Please try again.");
      $("#retakeQuiz").removeClass("d-none");
    }
  });

  // Handle quiz retake
  $("#retakeQuiz").on("click", function () {
    $("#quizForm")[0].reset();
    $("#quizResults").addClass("d-none");
    $(this).addClass("d-none");
  });
});
