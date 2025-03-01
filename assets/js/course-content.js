$(document).ready(function () {
  // Bootstrap Tooltip
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Track current video
  let currentVideoId = "";

  // Initialize the first lesson as unlocked
  initializeLessons();

  // Function to initialize lessons
  function initializeLessons() {
    // Unlock the first lesson in each section
    $(".accordion-item").each(function () {
      const firstLesson = $(this).find(".lesson-item").first();
      if (firstLesson.length) {
        unlockLesson(firstLesson);
      }
    });
  }

  // Function to unlock a lesson
  function unlockLesson(lessonElement) {
    lessonElement.removeClass("locked");
    lessonElement.find(".hgi-square-lock-02").remove();
  }

  // Function to unlock the next lesson
  function unlockNextLesson(currentLesson) {
    const nextLesson = currentLesson.next(".lesson-item");
    if (nextLesson.length) {
      unlockLesson(nextLesson);
    } else {
      // If this is the last lesson in a section, unlock the first lesson in the next section
      const currentSection = currentLesson.closest(".accordion-item");
      const nextSection = currentSection.next(".accordion-item");
      if (nextSection.length) {
        // Unlock the section header first
        const sectionHeader = nextSection.find(".accordion-button");
        if (sectionHeader.hasClass("locked")) {
          sectionHeader.removeClass("locked");
          sectionHeader.find(".hgi-square-lock-02").remove();
        }

        // Then unlock the first lesson
        const firstLessonInNextSection = nextSection
          .find(".lesson-item")
          .first();
        if (firstLessonInNextSection.length) {
          unlockLesson(firstLessonInNextSection);
        }
      }
    }
  }

  // Function to check if all beginner lessons are completed
  function areAllBeginnerLessonsCompleted() {
    const beginnerSections = $(".accordion-item[data-level='beginner']");
    let allCompleted = true;

    beginnerSections.each(function () {
      const totalLessons = $(this).find(".lesson-item").length;
      const completedLessons = $(this).find(".hgi-check").length;
      if (completedLessons < totalLessons) {
        allCompleted = false;
        return false; // Break the loop
      }
    });

    return allCompleted;
  }

  // Handle lesson item clicks
  $(".lesson-item").on("click", function () {
    // Check if the lesson is locked
    if ($(this).hasClass("locked")) {
      return; // Prevent interaction with locked lessons
    }

    // Check if this is an intermediate lesson and beginner content isn't completed
    const sectionLevel = $(this).closest(".accordion-item").data("level");
    if (sectionLevel === "intermediate" && !areAllBeginnerLessonsCompleted()) {
      alert("Please complete all beginner lessons first!");
      return;
    }
    const videoId = $(this).data("video-id");
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      // Update iframe source
      $(".video-container iframe").attr(
        "src",
        `https://www.youtube.com/embed/${videoId}`
      );

      // Update lesson status immediately
      $(this).find("i.hgi-check").remove(); // Remove existing check mark if any
      $(this).find("i.hgi-tick-01").removeClass("d-none").addClass("d-block");

      // Check if all beginner lessons are completed
      if (areAllBeginnerLessonsCompleted()) {
        // Unlock all intermediate sections
        $(".accordion-item[data-level='intermediate']").each(function () {
          const sectionHeader = $(this).find(".accordion-button");
          if (sectionHeader.hasClass("locked")) {
            sectionHeader.removeClass("locked");
            sectionHeader.find(".hgi-square-lock-02").remove();
          }
        });
      }

      // Update play icon to indicate current lesson
      $(".lesson-item i.hgi-play").removeClass("text-primary");
      $(this).find("i.hgi-play").addClass("text-primary");
      // Unlock the next lesson when this one is completed
      unlockNextLesson($(this));

      // Update section progress
      updateSectionProgress();
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
        'Enrolled <i class="hgi-stroke hgi-tick-01 text-white fs-5 align-middle"></i>'
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
            `<span class="progress-info ms-2">${progress}% complete</span>`
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
    // Skip if lesson is locked
    if ($(this).hasClass("locked")) {
      return;
    }
    if (!$(this).find(".hgi-check").length) {
      $(this).append('<i class="hgi-stroke hgi-check"></i>');
      updateSectionProgress();
    }
  });

  // Initialize Bootstrap tabs and set initial state
  $(".tab-pane").hide();
  $("#overview").show();

  $('button[data-bs-toggle="tab"]').on("click", function (e) {
    e.preventDefault();
    const targetId = $(this).attr("data-bs-target");

    // Hide all tabs and remove active class
    $(".tab-pane").hide();
    $(".nav-link").removeClass("active");

    // Show selected tab and add active class
    $(targetId).show();
    $(this).addClass("active");
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

  // Handle star rating with hover effects
  let selectedRating = 0;
  const ratingStars = $(".rating-input i.hgi-star");

  // Add hover effects
  ratingStars.hover(
    function () {
      const hoverRating = $(this).data("rating");
      ratingStars.removeClass("filled");
      $(this).prevAll().addBack().addClass("filled");
    },
    function () {
      ratingStars.removeClass("filled");
      if (selectedRating > 0) {
        ratingStars.slice(0, selectedRating).addClass("filled");
      }
    }
  );

  // Handle click events
  ratingStars.on("click", function () {
    selectedRating = $(this).data("rating");
    ratingStars.removeClass("filled");
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
        <div class="review-item">
          <div class="d-flex align-items-center mb-2">
            <img src="assets/images/user.jpg" alt="User" class="rounded-circle me-2" width="40" height="40">
            <div class="flex-grow-1">
              <h6 class="mb-0">You</h6>
              <div class="stars">
                ${"<i class='hgi-stroke hgi-star align-middle filled'></i>".repeat(
                  selectedRating
                )}
                ${"<i class='hgi-stroke hgi-star align-middle'></i>".repeat(
                  5 - selectedRating
                )}
              </div>
            </div>
            <div class="dropdown">
              <button class="btn border-0 p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="hgi-stroke hgi-more-vertical-circle-01 align-middle"></i>
              </button>
              <ul class="dropdown-menu p-0">
                <li>
                  <button class="dropdown-item edit-review text-warning" type="button">
                    <i class="hgi-stroke hgi-pencil-edit-02 me-2 align-middle"></i>Edit
                  </button>
                </li>
                <li>
                  <button class="dropdown-item delete-review text-danger" type="button">
                    <i class="hgi-stroke hgi-delete-02 me-2 align-middle"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <p class="mb-0 review-text">${reviewText}</p>
          <div class="edit-form d-none mt-2">
            <textarea class="form-control edit-review-text">${reviewText}</textarea>
            <div class="d-flex align-items-center mt-2">
              <button class="btn border-0 text-success btn-sm save-edit">✔</button>
              <button class="btn border-0 text-secondary btn-sm cancel-edit">✘</button>
            </div>
          </div>
        </div>
      `;
      const $newReview = $(newReview);

      // Append the new review to the review container
      $(".reviews-container").append($newReview);

      // Reinitialize Bootstrap tooltips for dynamically added elements
      $newReview.find('[data-bs-toggle="tooltip"]').tooltip();

      // Handle edit review
      $newReview.find(".edit-review").on("click", function () {
        const $reviewItem = $(this).closest(".review-item");
        $reviewItem.find(".review-text").addClass("d-none");
        $reviewItem.find(".edit-form").removeClass("d-none");
      });

      // Handle save edit
      $newReview.find(".save-edit").on("click", function () {
        const $reviewItem = $(this).closest(".review-item");
        const newText = $reviewItem.find(".edit-review-text").val().trim();
        if (newText) {
          $reviewItem.find(".review-text").text(newText).removeClass("d-none");
          $reviewItem.find(".edit-form").addClass("d-none");
        }
      });

      // Handle cancel edit
      $newReview.find(".cancel-edit").on("click", function () {
        const $reviewItem = $(this).closest(".review-item");
        $reviewItem.find(".review-text").removeClass("d-none");
        $reviewItem.find(".edit-form").addClass("d-none");
      });

      // Handle delete review
      $newReview.find(".delete-review").on("click", function () {
        if (confirm("Are you sure you want to delete this review?")) {
          $(this).closest(".review-item").remove();
        }
      });
      $(".review-list").prepend($newReview);

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
    q1: "a",
    q2: "b",
    q3: "c",
    q4: "a",
    q5: "b",
  };

  $("#quizForm").on("submit", function (e) {
    e.preventDefault();
    let score = 0;
    let totalQuestions = Object.keys(quizAnswers).length;

    // Check if all questions have an answer selected
    let unansweredQuestions = [];
    for (let question in quizAnswers) {
      if ($(`input[name=${question}]:checked`).length === 0) {
        unansweredQuestions.push(question);
      }
    }

    if (unansweredQuestions.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    // Calculate score
    for (let question in quizAnswers) {
      if (
        $(`input[name=${question}]:checked`).val() === quizAnswers[question]
      ) {
        score++;
      }
    }

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    $("#quizScore").text(percentage);

    // Show results and feedback
    $("#quizResults").removeClass("d-none");
    if (percentage >= 60) {
      $("#quizResults .alert-color")
        .removeClass("alert-danger")
        .addClass("alert-success");
      $("#quizFeedback").text("Congratulations! You've passed the quiz.");
      $("#retakeQuiz").addClass("d-none");
      $("#quizForm button[type=submit]").prop("disabled", true);
    } else {
      $("#quizResults .alert-color")
        .removeClass("alert-success")
        .addClass("alert-danger");
      $("#quizFeedback").text(
        "You need to score at least 75% to pass. Please try again."
      );
      $("#retakeQuiz").removeClass("d-none");
      $("#quizForm button[type=submit]").prop("disabled", true);
    }
  });

  // Handle quiz retake
  $("#retakeQuiz").on("click", function () {
    $("#quizForm")[0].reset();
    $("#quizResults").addClass("d-none");
    $(this).addClass("d-none");
  });
});
