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
    let publishedQuiz = null;
    let currentQuizResult = null;
    let allQuizzes = null;
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

    function fetchInstructorDetails(courseId) {
        if (!token) {
            showAlert("danger", "Please login to the system to view instructor details.");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/instructor`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (response) {
                $("#authorName").text(response.fullName);
                $("#authorBio").text(response.bio || "No bio available");
                $("#authorImage").attr("src", response.profilePicture || "../assets/images/icons/placeholder.svg");
                $("#authorAvailability").text(response.availability || "Not specified");
                $("#authorExperience").text(`${response.yearsOfExperience + " years of experience" || "Not specified"}`);
            },
            error: function (xhr) {
                showAlert("danger", "Failed to load instructor details: " + (xhr.responseJSON?.message || "Unknown error"));
            }
        });
    }

    function updateCourseDetails(course) {
        $('#courseTitle').text(course.title);
        $('#courseLevel').text(course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase());
        $('#courseDescription').text(course.description);
        $('#learningObjectives').html(course.headingTitles.map(obj => `<li>${obj}</li>`).join(''));
    }

    function fetchPublishedQuiz() {
        return $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quiz`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200 && response.data) {
                    publishedQuiz = response.data.find(quiz => quiz.published) || null;
                    console.log("Published Quiz:", publishedQuiz);
                } else {
                    publishedQuiz = null;
                }
            },
            error: function (xhr) {
                console.error("Error fetching quizzes:", xhr.responseJSON?.message || "Unknown error");
                publishedQuiz = null;
            }
        });
    }

    // Function to render lessons
    function renderLessons(lessons) {
        // Sort lessons by lessonSequence in ascending order
        lessons.sort((a, b) => a.lessonSequence - b.lessonSequence);

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
        $('#chapter-count-badge').text(`${lessons.length} Lessons`);
        updateSectionProgress();

        // Fetch published quiz and render quiz accordion
        fetchPublishedQuiz().done(function () {
            if (publishedQuiz) {
                // Append Quiz Accordion Item
                const quizHtml = `
            <div class="accordion-item quiz-accordion-item locked" data-quiz-id="${publishedQuiz.quizId}">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseQuiz">
                        <div class="d-flex flex-column gap-2 w-100 me-3">
                            <span class="course-topic">Quiz: Course Assessment</span>
                            <span class="duration">Test your knowledge</span>
                        </div>
                    </button>
                </h2>
                <div id="collapseQuiz" class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
                    <div class="accordion-body d-flex flex-column gap-3 pb-1 quiz-body">
                        <div class="quiz-item d-flex align-items-center justify-content-between">
                            <i class="hgi hgi-stroke hgi-quiz-02 fs-5 align-middle me-3"></i>
                            <div class="flex-grow-1 d-flex flex-column gap-1">
                                <span>${publishedQuiz.title}</span>
                                <small class="text-muted unlock-text">Complete all lessons to unlock</small>
                            </div>
                            <i class="hgi-stroke hgi-square-lock-02 fs-5 align-middle text-muted"></i>
                        </div>
                    </div>
                </div>
            </div>`;
                $("#courseAccordion").append(quizHtml);
                checkQuizUnlock();
            }
        });
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
        checkQuizUnlock();
    }

    function checkQuizUnlock() {
        const totalLessons = $(".lesson-item").length;
        const completedLessons = $(".lesson-item .hgi-tick-01.d-block").length;
        const quizItem = $(".quiz-accordion-item");
        if (publishedQuiz && quizItem.length && totalLessons > 0 && completedLessons === totalLessons) {
            quizItem.removeClass("locked");
            quizItem.find(".hgi-square-lock-02").addClass("d-none");
            quizItem.find(".quiz-body").css("pointer-events", "auto");
            $(".unlock-text").addClass("d-none");
        }
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

    $("#courseAccordion").on("click", ".quiz-body .quiz-item", function (e) {
        const quizItem = $(this).closest(".quiz-accordion-item");
        if (quizItem.hasClass("locked")) {
            showAlert("warning", "Please complete all lessons to unlock the quiz!");
            e.preventDefault();
            return;
        }

        const quizId = quizItem.data("quiz-id");

        if (publishedQuiz) {
            $("#quizModalLabel").text(`Quiz: ${publishedQuiz.title}`);

            // Fetch previous answers and result
            $.ajax({
                url: `http://localhost:8080/api/v1/course/${courseId}/quiz/${quizId}/answers?userId=${studentId}`,
                type: "GET",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        // Check if answers exist
                        if (response.data.length > 0) {
                            // Fetch quiz result to determine pass/fail and retake eligibility
                            $.ajax({
                                url: `http://localhost:8080/api/v1/course/${courseId}/quiz/${quizId}/results?userId=${studentId}`,
                                type: "GET",
                                headers: { "Authorization": "Bearer " + token },
                                success: function (resultResponse) {
                                    if (resultResponse.status === 200) {
                                        currentQuizResult = resultResponse.data;
                                        populateQuestions("#quizForm", publishedQuiz.questions, response.data);
                                        $("#quizForm").find("input").prop("disabled", true); // Disable inputs
                                        $("#quizForm").find("button[type=submit]").hide();
                                        $("#quizForm").find("[data-bs-target='#quizResultModal']").show();
                                        if (currentQuizResult.canRetake) {
                                            $("#quizForm").find("#retakeQuiz").show();
                                        } else {
                                            $("#quizForm").find("#retakeQuiz").hide();
                                        }
                                        $("#quizModal").modal("show");
                                    } else {
                                        showAlert("danger", resultResponse.message || "Failed to fetch quiz result.");
                                    }
                                },
                                error: function (xhr) {
                                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error fetching quiz result.");
                                }
                            });
                        } else {
                            // No previous submission
                            populateQuestions("#quizForm", publishedQuiz.questions);
                            $("#quizForm").find("input").prop("disabled", false);
                            $("#quizForm").find("button[type=submit]").show();
                            $("#quizForm").find("[data-bs-target='#quizResultModal']").hide();
                            $("#quizForm").find("#retakeQuiz").hide();
                            $("#quizModal").modal("show");
                        }
                    } else {
                        showAlert("danger", response.message || "Failed to fetch answers.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error fetching answers.");
                }
            });
        } else {
            showAlert("danger", "No published quiz available.");
        }
    });

    function populateQuestions(formSelector, questions, submittedAnswers = null) {
        const $questionContainer = $(formSelector + " .questions-container").empty();
        let modalQuestionCount = 0;
        try {
            if (questions && questions.length > 0) {
                questions.forEach(q => {
                    const questionNumber = ++modalQuestionCount;
                    const questionText = q.questionText ? q.questionText.replace(/</g, "&lt;") : "No question text";
                    const answers = (q.answers || []).slice(0, 4);
                    let submittedAnswer = null;
                    if (submittedAnswers) {
                        submittedAnswer = submittedAnswers.find(sa => sa.questionId === q.questionId);
                    }

                    const questionHtml = `
                    <div class="question-group mb-3" data-question-id="${q.questionId || ''}">
                        <div class="d-flex align-items-baseline gap-2 mb-2">
                            <span class="form-label">${questionNumber})</span>
                            <span class="question-text">${questionText}</span>
                        </div>
                        <div class="answers-container mb-2 ms-4">
                            ${answers.map((a, i) => {
                        const answerText = a.answerText ? a.answerText.replace(/</g, "&lt;") : "No answer text";
                        let classes = "";
                        let icon = "";
                        let checked = "";
                        if (submittedAnswers && submittedAnswer && a.answerId === submittedAnswer.selectedAnswerId) {
                            checked = "checked";
                            classes = submittedAnswer.correct ? "text-success fw-bold" : "text-danger";
                            icon = submittedAnswer.correct
                                ? `<i class="hgi-stroke hgi-tick-01 fs-5 ms-2 align-middle"></i>`
                                : `<i class="hgi-stroke hgi-close fs-5 ms-2 align-middle"></i>`;
                        } else if (submittedAnswers && a.correct) {
                            classes = "text-success";
                            icon = `<i class="hgi-stroke hgi-tick-01 fs-5 ms-2 align-middle"></i>`;
                        }
                        return `
                                    <div class="answer-group mb-2 d-flex align-items-center gap-2" data-answer-id="${a.answerId || ''}">
                                        <input type="radio" name="answer-${q.questionId}" value="${a.answerId}" 
                                            ${checked} ${submittedAnswers ? "disabled" : "required"}>
                                        <span class="answer-text ${classes}">${answerText}${icon}</span>
                                    </div>
                                `;
                    }).join('')}
                        </div>
                    </div>`;
                    $questionContainer.append(questionHtml);
                });
            } else {
                $questionContainer.html('<p class="text-center text-muted">No questions available.</p>');
            }
        } catch (error) {
            showAlert("danger", "Error populating questions: " + error.message);
        }
    }

    $("#quizForm").on("submit", function (e) {
        e.preventDefault();
        const quizId = $(".quiz-accordion-item").data("quiz-id");
        const answers = [];
        $(this).find(".question-group").each(function () {
            const questionId = $(this).data("question-id");
            const selectedAnswerId = $(this).find(`input[name="answer-${questionId}"]:checked`).val();
            if (selectedAnswerId) {
                answers.push({ questionId: parseInt(questionId), answerId: parseInt(selectedAnswerId) });
            }
        });

        if (answers.length !== $("#quizForm .question-group").length) {
            showAlert("warning", "Please answer all questions before submitting.");
            return;
        }

        const submission = {
            quizId: parseInt(quizId),
            userId: parseInt(studentId),
            answers: answers
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quiz/submit`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            data: JSON.stringify(submission),
            contentType: "application/json",
            success: function (response) {
                if (response.status === 200) {
                    currentQuizResult = response.data;
                    showQuizResultModal(currentQuizResult);
                    $("#quizModal").modal("hide");
                    $("#quizForm").find("[data-bs-target='#quizResultModal']").show();
                } else {
                    showAlert("danger", response.message || "Failed to submit quiz.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error submitting quiz.");
            }
        });
    });

    function showQuizResultModal(result) {
        const $modal = $("#quizResultModal");
        const $status = $modal.find(".result-status");
        const $message = $modal.find(".result-message");
        const $passedImg = $modal.find("#passed-img");
        const $failedImg = $modal.find("#failed-img");
        const $actions = $modal.find(".result-actions");

        $actions.empty();

        const percentage = ((result.score / result.totalMarks) * 100).toFixed(1);
        if (!result.canRetake) {
            $status.text("Congratulations!");
            $message.text(`You passed with a score of ${result.score}/${result.totalMarks} (${percentage}%)!`);
            $passedImg.removeClass("d-none");
            $failedImg.addClass("d-none");
            $actions.append(`
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Continue</button>
        `);
        } else {
            $status.text("Try Again!");
            $message.text(`Your score is ${result.score}/${result.totalMarks} (${percentage}%). Retake the quiz to score 60% or higher!`);
            $failedImg.removeClass("d-none");
            $passedImg.addClass("d-none");
            $actions.append(`
            <button type="button" class="btn btn-primary retake-quiz" data-bs-dismiss="modal">Retake Quiz</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue</button>
        `);
        }

        $modal.modal("show");
    }

    $("#quizForm").on("click", "[data-bs-target='#quizResultModal']", function () {
        if (currentQuizResult) {
            showQuizResultModal(currentQuizResult);
            $("#quizModal").modal("hide");
        } else {
            showAlert("warning", "No quiz results available. Please submit the quiz first.");
        }
    });

    // Retake Quiz from Quiz Modal
    $("#retakeQuiz").on("click", function () {
        $("#quizForm")[0].reset();
        $("#quizForm .questions-container").empty();
        if (publishedQuiz) {
            populateQuestions("#quizForm", publishedQuiz.questions);
            $("#quizForm").find("input").prop("disabled", false);
            $("#quizForm").find("#submitQuiz").show();
            $("#quizForm").find("#retakeQuiz").hide();
            $("#quizForm").find("#viewResults").hide();
        }
    });

    // Retake Quiz from Result Modal
    $(document).on("click", ".retake-quiz", function () {
        $("#quizModal").modal("show");
        $("#retakeQuiz").trigger("click");
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

    fetchInstructorDetails(courseId);

// ---------------------------------------------------------------------------------------------------

    let resourcesData = [];

    // ----------- fetch resources -----------
    function fetchResources() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/resources`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    resourcesData = response.data;
                    renderResources(response.data);
                } else {
                    showAlert("danger", response.message || "Failed to load resources.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading resources.");
            }
        });
    }

    // ----------- render resources -----------
    function renderResources(resources) {
        const $list = $("#resourcesList").empty();
        if (resources.length === 0) {
            $list.html('<p class="text-center text-muted p-3">No resources available. Add a resource to get started.</p>');
            return;
        }
        resources.forEach(resource => {
            const iconClass = getResourceIcon(resource.type);
            const resourceHtml = `
                <div class="resource-item d-flex align-items-center p-3 border rounded-3" data-resource-id="${resource.resourceId}">
                    <i class="hgi hgi-stroke ${iconClass} fs-4 me-3"></i>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${resource.title}</h6>
                        <small class="text-muted">${resource.type}${resource.type !== 'LINK' ? ', Uploaded' : ''}</small>
                    </div>
                    <button class="btn text-primary btn-sm me-2 btn-download-resource">
                        <i class="hgi hgi-stroke hgi-file-download fs-5 align-middle"></i> Download
                    </button>
                </div>`;
            $list.append(resourceHtml);
        });
    }

    // ----------- get resource icon -----------
    function getResourceIcon(type) {
        switch (type.toUpperCase()) {
            case 'DOCUMENT': return 'hgi-book-edit text-danger';
            case 'IMAGE': return 'hgi-image-02 text-primary';
            case 'VIDEO': return 'hgi-video-02 text-success';
            case 'ARCHIVE': return 'hgi-file-zip text-warning';
            case 'LINK': return 'hgi-link-02 text-info';
            default: return 'hgi-file-01';
        }
    }

    // ----------- download resources -----------
    $(document).on("click", ".btn-download-resource", function () {
        const resourceId = $(this).closest(".resource-item").data("resource-id");
        const resource = resourcesData.find(r => r.resourceId === resourceId);

        if (resource && resource.url) {
            window.open(resource.url, "_blank");
        } else {
            showAlert("danger", "Resource URL not found for download.");
        }
    });

    fetchResources();

// ---------------------------------------------------------------------------------------------------

    let announcementsData = [];

    // Fetch Announcements
    function fetchAnnouncements() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/announcements`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    announcementsData = response.data;
                    renderAnnouncements(response.data);
                } else {
                    showAlert("danger", response.message || "Failed to load announcements.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading announcements.");
            }
        });
    }

    // Render Announcements
    function renderAnnouncements(announcements) {
        const $list = $("#announcementsList").empty();
        if (announcements.length === 0) {
            $list.html('<p class="text-center text-muted p-3">No announcements available. Add an announcement to get started.</p>');
            return;
        }
        announcements.forEach(announcement => {
            const dateFormatted = new Date(announcement.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const announcementHtml = `
                <div class="announcement-item d-flex align-items-center p-3 border rounded-3" data-announcement-id="${announcement.announcementId}">
                    <i class="hgi hgi-stroke hgi-megaphone-02 fs-4 me-3 text-primary align-self-start"></i>
                    <div class="flex-grow-1 me-3">
                        <h6 class="mb-1">${announcement.title}</h6>
                        <small class="text-muted">Posted on ${dateFormatted}</small>
                        <p class="mb-0 mt-1">${announcement.description}</p>
                    </div>
                </div>`;
            $list.append(announcementHtml);
        });
    }

    fetchAnnouncements();

// ---------------------------------------------------------------------------------------------------

    // Fetch and display reviews and stats
    function fetchReviewsAndStats() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/reviews/stats`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    const stats = response.data;
                    renderReviewStats(stats.averageRating, stats.reviewCount);
                } else {
                    showAlert("danger", response.message || "Failed to load review stats.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading review stats.");
            }
        });

        // Fetch reviews
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/reviews`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    renderReviews(response.data);
                } else {
                    showAlert("danger", response.message || "Failed to load reviews.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading reviews.");
            }
        });
    }

    // Render average rating and count
    function renderReviewStats(averageRating, reviewCount) {
        const $ratingContainer = $(".course-rating");
        $ratingContainer.find("h5").text(`${averageRating.toFixed(1)} out of 5`);

        const $stars = $ratingContainer.find(".stars");
        $stars.empty();
        const fullStars = Math.floor(averageRating);
        const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;

        for (let i = 0; i < fullStars; i++) {
            $stars.append('<i class="hgi-stroke hgi-star fs-5 align-middle filled"></i>');
        }
        if (halfStar) {
            $stars.append('<i class="hgi-stroke hgi-star fs-5 align-middle half-filled"></i>');
        }
        for (let i = fullStars + halfStar; i < 5; i++) {
            $stars.append('<i class="hgi-stroke hgi-star fs-5 align-middle"></i>');
        }

        $ratingContainer.find("p.text-muted").text(`Based on ${reviewCount} reviews`);
    }

    // Render review list
    function renderReviews(reviews) {
        const $list = $("#reviewsList").empty();

        if (reviews.length === 0) {
            $list.append('<p class="text-muted text-center">No reviews yet.</p>');
            return;
        }
        reviews.forEach(review => {
            const starsHtml = Array(review.rating).fill('<i class="hgi-stroke hgi-star align-middle filled"></i>').join("") +
                Array(5 - review.rating).fill('<i class="hgi-stroke hgi-star align-middle"></i>').join("");

            const reviewHtml = `
                <div class="review-item">
                    <div class="d-flex align-items-center gap-1">
                        <img src="${review.studentProfileImage || '../assets/images/icons/placeholder.svg'}" 
                             alt="User" class="rounded-circle me-2 align-self-start" width="40" height="40"/>
                        <div>
                            <h6 class="mb-0">${review.studentName}</h6>
                            <div class="stars">${starsHtml}</div>
                            <p class="mb-0 mt-2 text-muted">${review.comment}</p>
                        </div>
                    </div>
                </div>`;
            $list.append(reviewHtml);
        });
    }

    // Rating input interaction
    let selectedRating = 0;
    const ratingStars = $(".rating-input .hgi-star");

    ratingStars.on("click", function () {
        const clickedRating = $(this).data("rating");
        if (selectedRating === clickedRating) {
            selectedRating = 0;
            ratingStars.removeClass("filled");
        } else {
            selectedRating = clickedRating;
            ratingStars.removeClass("filled");
            $(this).prevAll().addBack().addClass("filled");
        }
    });

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

    // Submit review
    $("#reviewForm").on("submit", function (e) {
        e.preventDefault();
        if (!selectedRating) {
            showAlert("danger", "Please select a rating.");
            return;
        }

        const reviewDTO = {
            rating: selectedRating,
            comment: $("#reviewText").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/reviews`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(reviewDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Review submitted successfully!");
                    $("#reviewForm")[0].reset();
                    selectedRating = 0;
                    $(".rating-input .hgi-star").removeClass("filled");
                    fetchReviewsAndStats();
                } else {
                    showAlert("danger", response.message || "Failed to submit review.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error submitting review.");
            }
        });
    });

    fetchReviewsAndStats();

// ------------------------------------------------------------------------

    // Fetch FAQs
    function fetchFAQs() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/faqs`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    renderFAQs(response.data);
                } else {
                    showAlert("danger", response.message || "Failed to load FAQs.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading FAQs.");
            }
        });
    }

    // Render FAQs
    function renderFAQs(faqs) {
        const $accordion = $("#faqAccordion").empty();
        if (faqs.length === 0) {
            $accordion.append('<p class="text-muted text-center p-3">No FAQs available. Add an FAQ to get started.</p>');
            return;
        }
        faqs.forEach((faq, index) => {
            const isFirst = index === 0 ? "show" : "";
            const collapsed = index === 0 ? "" : "collapsed";
            const faqHtml = `
                <div class="accordion-item shadow-none p-0 mb-2" data-faq-id="${faq.faqId}">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${faq.faqId}">
                            ${faq.question}
                        </button>
                    </h2>
                    <div id="faq${faq.faqId}" class="accordion-collapse collapse ${isFirst}" data-bs-parent="#faqAccordion">
                        <div class="accordion-body">
                            ${faq.answer ? faq.answer : '<em>Waiting for instructor response...</em>'}
                        </div>
                    </div>
                </div>`;
            $accordion.append(faqHtml);
        });
    }

    // Student question submission (for student-side FAQ tab)
    $("#faqForm").on("submit", function (e) {
        e.preventDefault();
        const $btn = $(this).find("button[type='submit']");
        $btn.prop("disabled", true);

        const faqDTO = {
            question: $("#questionText").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/faqs/questions`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(faqDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Question submitted successfully! We'll get back to you soon.");
                    $("#faqForm")[0].reset();
                } else {
                    showAlert("danger", response.message || "Failed to submit question.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error submitting question.");
            },
            complete: function () {
                $btn.prop("disabled", false);
            }
        });
    });

    fetchFAQs();
});
