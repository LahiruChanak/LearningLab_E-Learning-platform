$(document).ready(function () {

    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    let courseId = getCourseIdFromUrl();
    let isEnrolled = false;
    let allCourses = [];
    let studentId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (courseId) {
        fetchCourseDetails(courseId);
    }

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
    // function updateSectionProgress() {
    //   const $accordion = $(".accordion");
    //   const totalLessons = $accordion.find(".lesson-item").length;
    //   const completedLessons = $accordion.find(".hgi-check").length;
    //   const progress = Math.round((completedLessons / totalLessons) * 100);
    //
    //   // Update the main progress info
    //   $("#progress").text(progress);
    //
    //   // Update individual section progress
    //   $accordion.each(function () {
    //     const sectionTotalLessons = $(this).find(".lesson-item").length;
    //     const sectionCompletedLessons = $(this).find(".hgi-check").length;
    //     const sectionProgress = Math.round(
    //       (sectionCompletedLessons / sectionTotalLessons) * 100
    //     );
    //   });
    // }

    // Update progress when lessons are completed
    // $(".lesson-item").on("click", function () {
    //   if ($(this).hasClass("locked") || !isEnrolled) {
    //     return;
    //   }
    //   if (!$(this).find(".hgi-check").length) {
    //     $(this).append('<i class="hgi-stroke hgi-check"></i>');
    //     updateSectionProgress();
    //   }
    // });

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

    // Handle quiz submission
    let isQuizSubmitted = false;

    $("#quizForm").on("submit", function (e) {
        e.preventDefault();

        let score = 0;
        let totalQuestions = Object.keys(quizAnswers).length;
        let unansweredQuestions = [];

        for (let question in quizAnswers) {
            if ($(`input[name=${question}]:checked`).length === 0) {
                unansweredQuestions.push(question);
            }
        }

        if (unansweredQuestions.length > 0) {
            showAlert("warning", "Please answer all questions before submitting.");
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

        // Hide the quiz modal
        const $quizModal = $("#quizModal");
        if ($quizModal.length) {
            $quizModal.modal("hide");
        }

        // Show results in modal
        const $quizResultModal = $("#quizResultModal");
        const quizResultModal = new bootstrap.Modal($quizResultModal[0]);
        const $passedImg = $quizResultModal.find("#passed-img");
        const $failedImg = $quizResultModal.find("#failed-img");

        if (percentage >= 60) {
            $passedImg.removeClass("d-none");
            $failedImg.addClass("d-none");

            $("#retakeQuiz").addClass("d-none");
            $("#quizForm button[type=submit]").prop("disabled", true);
            $(".result-status").text("Congratulations...!");
            $(".result-message").text("You got " + percentage + "% score. Good job!");
        } else {
            $passedImg.addClass("d-none");
            $failedImg.removeClass("d-none");

            $("#retakeQuiz").removeClass("d-none");
            $("#quizForm button[type=submit]").prop("disabled", true);
            $(".result-status").text("Try Again...!");
            $(".result-message").text(
                "You got " + percentage + "% score. Better luck next time!"
            );
        }

        // Mark quiz as submitted and show "View Results" button
        isQuizSubmitted = true;
        $(".btn-outline-success[data-bs-target='#quizResultModal']").removeClass(
            "d-none"
        );

        quizResultModal.show();
    });

    // Handle quiz retake
    $("#retakeQuiz").on("click", function () {
        $("#quizForm")[0].reset();
        $("#quizResults").addClass("d-none");
        $(this).addClass("d-none");
        $("#quizForm button[type=submit]").prop("disabled", false);
        $(".btn-outline-success[data-bs-target='#quizResultModal']").addClass(
            "d-none"
        );
        isQuizSubmitted = false;
    });

    // Initially hide the "View Results" button
    $(".btn-outline-success[data-bs-target='#quizResultModal']").addClass(
        "d-none"
    );

///////////////////////////////////////////////////////////////
    function getCourseIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('courseId');
    }

    function fetchCourseDetails(courseId) {
        if (!token) {
            showAlert("danger", "Please login to the system to view course details.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {

                if (response.status === 200 && Array.isArray(response.data)) {
                    allCourses = response.data;

                    const numericCourseId = Number(courseId);
                    const course = allCourses.find(course => course.courseId === numericCourseId);

                    if (course) {
                        updateCourseDetails(course);
                        fetchLessons(courseId);
                    } else {
                        showAlert("danger", `Course with ID ${courseId} not found in the course list.`);
                    }
                } else {
                    showAlert("danger", "Invalid response format from server.");
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function fetchLessons(courseId) {
        if (!token) {
            showAlert("danger", "Please login to the system to load lessons.");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/lesson/course/${courseId}`,
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                renderLessons(response);
                if (studentId && courseId && token) {
                    checkEnrollment(studentId, courseId, token);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching lessons: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function updateCourseDetails(course) {
        $('#courseTitle').text(course.title);
        $('#courseLevel').text(course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase());
        $('#courseDescription').text(course.description);
        $('#authorName').text(course.instructorId);
        $('#authorTitle').text(course.title + " Specialist");
        $('#authorBio').text(course.instructorId);

        // Update course metadata
        $('.course-meta').html(`
            <span><i class="hgi-stroke hgi-user-circle-02 me-1"></i>${course.enrollments ? course.enrollments.length : 0} Enrollments</span>
            <span class="ms-3"><i class="hgi-stroke hgi-comment-01 me-1"></i>${course.comments || 0} Comments</span>
            <span class="ms-3"><i class="hgi-stroke hgi-favourite me-1"></i>${course.likes || 0} Likes</span>
        `);

        $('.d-flex.align-items-center.gap-2').html(`
            <span class="badge rounded-pill bg-primary-subtle text-primary"></span>
            <span class="badge rounded-pill bg-success-subtle text-success" id="progress-badge"></span>
        `);
    }

    // Function to render lessons
    function renderLessons(lessons) {
        let html = '';
        lessons.forEach((lesson, lessonIndex) => {
            let totalDuration = 0;
            const videos = lesson.videos || [lesson];
            videos.forEach(video => {
                totalDuration += parseInt(video.duration) || 0;
            });

            html += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${lessonIndex}">
                        <div class="d-flex justify-content-between w-100 me-3">
                            <span class="course-topic">0${lessonIndex + 1}: ${lesson.title}</span>
                            <span class="duration">${totalDuration} min</span>
                        </div>
                    </button>
                </h2>
                <div id="collapse${lessonIndex}" class="accordion-collapse collapse ${lessonIndex === 0 ? 'show' : ''}" data-bs-parent="#courseAccordion">
                    <div class="accordion-body d-flex flex-column gap-3 pb-1">`;
            lesson.videos.forEach((video, videoIndex) => {
                const isFirstLesson = lessonIndex === 0 && videoIndex === 0;
                html += `
                <div class="lesson-item d-flex align-items-center ${isFirstLesson ? '' : 'locked'}" 
                     data-video-id="${video.videoId}" data-video-url="${video.videoUrl}">
                    <i class="hgi-stroke hgi-play fs-5 align-middle me-3"></i>
                    <div class="flex-grow-1 d-flex flex-column gap-1">
                        <span>${video.title}</span>
                        <small class="text-muted">${parseInt(video.duration) || 0} min</small>
                    </div>
                    <i class="hgi-stroke hgi-square-lock-02 fs-5 align-middle text-muted ${isFirstLesson ? 'd-none' : ''}"></i>
                    <i class="hgi-stroke hgi-tick-01 fs-4 align-middle d-none"></i>
                </div>`;
            });
            html += `
                    </div>
                </div>
            </div>`;
        });

        $("#courseAccordion").html(html);
        $('.badge.bg-primary-subtle').text(`${lessons.length} Lessons`);
        updateSectionProgress();
    }

    // Function to initialize lessons after enrollment
    function initializeLessons() {
        const firstVideo = $(".lesson-item").first();
        if (firstVideo.length && !firstVideo.find(".hgi-tick-01").hasClass("d-block")) {
            unlockLesson(firstVideo);
        }
    }

    // Function to unlock a lesson video
    function unlockLesson(lessonElement) {
        lessonElement.removeClass("locked");
        lessonElement.find(".hgi-square-lock-02").addClass("d-none");
        lessonElement.css("pointer-events", "auto");
    }

    // Function to lock a lesson video
    function lockLesson(lessonElement) {
        lessonElement.addClass("locked");
        lessonElement.find(".hgi-square-lock-02").removeClass("d-none");
        lessonElement.css("pointer-events", "none");
    }

    // Function to mark a lesson as watched
    function markAsWatched(lessonElement) {
        console.log("Marking as watched:", lessonElement.data("video-id"));
        lessonElement.find(".hgi-tick-01").removeClass("d-none").addClass("d-block");
        lessonElement.find(".hgi-square-lock-02").addClass("d-none");
    }

    // Function to unlock the next lesson video
    function unlockNextLesson(currentLesson) {
        const nextLesson = currentLesson.next(".lesson-item");
        if (nextLesson.length) {
            unlockLesson(nextLesson);
        } else {
            const currentSection = currentLesson.closest(".accordion-item");
            const nextSection = currentSection.next(".accordion-item");
            if (nextSection.length) {
                const firstLessonInNextSection = nextSection.find(".lesson-item").first();
                if (firstLessonInNextSection.length) {
                    unlockLesson(firstLessonInNextSection);
                }
            }
        }
    }

    function updateSectionProgress() {
        const totalLessons = $(".lesson-item").length;
        const completedLessons = $(".lesson-item .hgi-tick-01.d-block").length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        $("#progress-badge").text(`${progress}% Completed`);
    }

    // Handle lesson item clicks
    $("#courseAccordion").on("click", ".lesson-item", function (e) {
        if (!isEnrolled || $(this).hasClass("locked")) {
            if (!isEnrolled) {
                showAlert("warning", "Please enroll in this course to access the content!");
            }
            e.preventDefault();
            return;
        }

        const videoId = $(this).data("video-id");
        const enrollmentId = $("#enrollButton").data("enrollment-id");
        const videoUrl = $(this).data("video-url");

        if (videoId && enrollmentId) {
            $(".video-container iframe").attr("src", videoUrl);
            $(".video-container").removeClass("pe-none").addClass("pe-auto");

            markAsWatched($(this));
            unlockNextLesson($(this));

            $.ajax({
                url: `http://localhost:8080/api/v1/enrollment/${enrollmentId}/complete-video`,
                method: "PUT",
                data: {videoId: videoId},
                headers: {"Authorization": `Bearer ${token}`},
                success: function (response) {
                    console.log("Video completion saved:", response);
                    updateSectionProgress();
                },
                error: function (xhr) {
                    showAlert("danger", "Failed to save video completion: " + (xhr.responseJSON?.message || "Unknown error"));
                }
            });
        }
    });

    // Check enrollment status and update UI
    function checkEnrollment(studentId, courseId, token) {
        $.ajax({
            url: `http://localhost:8080/api/v1/enrollment/check?studentId=${studentId}&courseId=${courseId}`,
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`},
            success: function (response) {
                if (response.status === 200) {
                    console.log("Completed video IDs from DB:", response.data.completedVideoIds);
                    isEnrolled = true;
                    $("#enrollButton")
                        .html('Enrolled <i class="hgi-stroke hgi-tick-01 text-white fs-5 align-middle"></i>')
                        .removeClass("btn-primary")
                        .addClass("btn-success")
                        .prop("disabled", true)
                        .data("enrollment-id", response.data.enrollmentId);

                    const completedVideoIds = response.data.completedVideoIds || [];
                    $(".lesson-item").each(function () {
                        const videoId = Number($(this).data("video-id"));
                        if (completedVideoIds.map(Number).includes(videoId)) {
                            markAsWatched($(this));
                            unlockNextLesson($(this));
                        }
                    });

                    updateSectionProgress();
                    initializeLessons();
                }
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    console.log("Student not enrolled yet.");
                } else {
                    showAlert("danger", "Failed to check enrollment: " + (xhr.responseJSON?.message || "Unknown error"));
                }
            }
        });
    }

    // Handle enrollment button
    $("#enrollButton").on("click", function () {
        const $btn = $(this);
        $btn.prop("disabled", true);
        $btn.html('<span class="spinner-border spinner-border-sm me-2"></span>Enrolling...');

        if (!studentId || !token) {
            $btn.prop("disabled", false);
            $btn.html("Enroll Now");
            showAlert("danger", "Please login to enroll in this course.");
        } else {
            enroll($btn, studentId, courseId);
        }
    });

    // Enrollment logic extracted for clarity
    function enroll($btn, studentId, courseId) {
        $.ajax({
            url: "http://localhost:8080/api/v1/enrollment/enroll",
            method: "POST",
            data: {studentId: studentId, courseId: courseId},
            headers: {"Authorization": `Bearer ${token}`},
            success: function (response) {
                showAlert("success", "Successfully enrolled in the course!");
                $btn.html('Enrolled <i class="hgi-stroke hgi-tick-01 text-white fs-5 align-middle"></i>');
                $btn.removeClass("btn-primary").addClass("btn-success");
                $btn.data("enrollment-id", response.enrollmentId);
                isEnrolled = true;
                initializeLessons();
                updateSectionProgress();
            },
            error: function (xhr) {
                $btn.prop("disabled", false);
                $btn.html("Enroll Now");
                const errorMsg = xhr.responseJSON?.message || "Enrollment failed. Please try again.";
                showAlert("danger", errorMsg);
            }
        });
    }
});
