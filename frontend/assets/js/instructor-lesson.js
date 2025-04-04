$(document).ready(function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    let currentCourseId = null;
    let lessons = [];
    let isDraggableMode = false;
    let tempModal = null;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("courseId");
    if (courseId) {
        loadCourseLessons(parseInt(courseId));
    }

    // Fetch course details and lessons
    function loadCourseLessons(courseId) {
        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/course`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    const course = response.data.find(c => c.courseId === courseId);
                    if (course) {
                        $("#courseDetails").show();
                        $("#courseTitle").text(course.title);
                        $("#courseDescription").text(course.description);
                        $("#coursePrice").text(course.price.toFixed(2));
                        currentCourseId = courseId;
                        fetchLessons(courseId);
                    }
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching course: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Fetch and render lessons
    function fetchLessons(courseId) {
        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/lesson/course/${courseId}`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                lessons = response;
                renderLessons();
                $("#addLessonBtn").prop("disabled", false);
                $("#manageBtn").prop("disabled", false);
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching lessons: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function renderLessons() {
        const lessonList = $("#lessonList");
        lessonList.empty();
        if (lessons.length === 0) {
            lessonList.append('<li class="text-center text-muted list-unstyled">No lessons yet. Please add some lessons.</li>');
        } else {
            lessons.sort((a, b) => a.lessonSequence - b.lessonSequence);
            lessons.forEach(lesson => {
                lessonList.append(`
                    <li class="lesson-item" data-lesson-id="${lesson.lessonId}" data-published="${lesson.isPublished}">
                        <div class="details">
                            <span>${lesson.title} (Sequence: ${lesson.lessonSequence}) - ${lesson.isPublished ? "Published" : "Draft"}</span>
                        </div>
                        <i class="uil uil-draggabledots"></i>
                        <button type="button" class="btn-remove" data-id="${lesson.lessonId}">
                            <i class="hgi hgi-stroke hgi-multiplication-sign"></i>
                        </button>
                    </li>
                `);
            });
            toggleDraggableMode(isDraggableMode);
        }
    }

    // Create a new lesson
    $("#saveNewLessonBtn").on("click",() => {
        const lessonData = {
            courseId: currentCourseId,
            title: $("#newLessonTitle").val(),
            isPublished: $("#newIsPublished").val() === "true",
            lessonSequence: null,
            videos: []
        };

        if (!lessonData.title) {
            showAlert("warning", "Please fill in all the required fields to create new lessons.");
            return;
        }

        $("#newVideoList .video-item").each(function (index) {
            lessonData.videos.push({
                videoId: null,
                title: $(this).find(".video-title").val(),
                videoUrl: $(this).find(".video-url").val(),
                duration: parseInt($(this).find(".video-duration").val()) || 0,
                videoSequence: index + 1
            });
        });

        if (lessonData.videos.length > 0 && (!lessonData.videos.title || !lessonData.videos.videoUrl || !lessonData.videos.duration)) {
            showAlert("warning", "Please fill in all the required video fields.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/instructor/lesson",
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(lessonData),
            success: function (lesson) {
                lessons.push(lesson);
                showAlert("success", "Lesson created successfully!");
                renderLessons();
                $("#newLessonModal").modal("hide");
                $("#newLessonForm")[0].reset();
                $("#newVideoList").empty();

                setTimeout(() => {
                    window.location.reload();
                },1500);
            },
            error: function (xhr) {
                showAlert("danger", "Error creating lesson: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Update lesson
    $("#saveLessonBtn").on("click", () => {
        const lessonId = $("#lessonModal").data("current-lesson-id");
        const lessonData = {
            title: $("#lessonTitle").val(),
            isPublished: $("#isPublished").val() === "true",
            lessonSequence: null,
            videos: []
        };

        if (!lessonData.title) {
            showAlert("warning", "Please fill in all the required fields to update existing lessons.");
            return;
        }

        $("#videoList .video-item").each(function (index) {
            const videoId = $(this).data("video-id");
            lessonData.videos.push({
                videoId: (videoId && typeof videoId === "number" && videoId > 0) ? videoId : null,
                title: $(this).find(".video-title").val(),
                videoUrl: $(this).find(".video-url").val(),
                duration: parseInt($(this).find(".video-duration").val()) || 0,
                videoSequence: index + 1
            });
        });

        if (lessonData.videos.length > 0 && (!lessonData.videos.title || !lessonData.videos.videoUrl || !lessonData.videos.duration)) {
            showAlert("warning", "Please fill in all the required video fields.");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/lesson/${lessonId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(lessonData),
            success: function (updatedLesson) {
                const index = lessons.findIndex(l => l.lessonId === lessonId);
                lessons[index] = updatedLesson;
                renderLessons();
                $("#lessonModal").modal("hide");
                showAlert("success", "Lesson updated successfully!");

                setTimeout(() => {
                    window.location.reload();
                },1500);
            },
            error: function (xhr) {
                showAlert("danger", "Error updating lesson: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Delete lesson
    function deleteLesson(lessonId) {
        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/lesson/${lessonId}`,
            type: "DELETE",
            headers: { "Authorization": "Bearer " + token },
            success: function () {
                lessons = lessons.filter(l => l.lessonId !== lessonId);
                showAlert("success", "Lesson deleted successfully!");
                renderLessons();
                fetchLessons();
                $("#deleteConfirmModal").modal("hide");
            },
            error: function (xhr) {
                showAlert("danger", "Error deleting lesson: " + (xhr.responseJSON?.message || xhr.statusText));
                $("#deleteConfirmModal").modal("hide");
            }
        });
    }

    $(document).on("click", ".delete-lesson", function () {
        deleteLesson();
    });

    // Update lesson sequence
    function updateLessonSequence() {
        const items = $("#lessonList .lesson-item");
        const updatedLessons = [];
        items.each((index, item) => {
            const lessonId = $(item).data("lesson-id");
            updatedLessons.push({ lessonId, lessonSequence: index + 1 });
            $(item).find(".details span").text(`${$(item).find(".details span").text().split(" (")[0]} (Sequence: ${index + 1}) - ${$(item).data("published") ? "Published" : "Draft"}`);
        });
        $.ajax({
            url: "http://localhost:8080/api/v1/instructor/lesson/sequence",
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(updatedLessons),
            success: function () {
                showAlert("success", "Lesson sequence updated successfully!");
            },
            error: function (xhr) {
                showAlert("danger", "Error updating sequence: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Populate video list (edit modal)
    function populateVideoList(lesson) {
        const videoList = $("#videoList");
        videoList.empty();
        lesson.videos.sort((a, b) => a.videoSequence - b.videoSequence);
        lesson.videos.forEach((video) => {
            videoList.append(`
                <li class="video-item" data-video-id="${video.videoId}">
                    <div class="details d-flex align-items-center w-100">
                        <input type="text" class="form-control video-title me-2" value="${video.title}" placeholder="Video Title" required>
                        <input type="url" class="form-control video-url me-2" value="${video.videoUrl}" placeholder="Video URL" required>
                        <input type="number" class="form-control video-duration me-2" value="${video.duration}" placeholder="Duration (min)" min="0" required>
                        <button type="button" class="remove-video"><i class="hgi hgi-stroke hgi-multiplication-sign"></i></button>
                    </div>
                    <i class="uil uil-draggabledots"></i>
                </li>
            `);
        });
        toggleDraggableMode(isDraggableMode, "#videoList");
        toggleDeleteButtons("#videoList", false);
    }

    // Add new video (edit modal)
    $("#addVideoBtn").on("click",() => {
        const videoList = $("#videoList");
        videoList.append(`
                <li class="video-item" data-video-id="${Date.now()}">
                    <div class="details d-flex w-100">
                        <input type="text" class="form-control video-title me-2" placeholder="Video Title" required>
                        <input type="url" class="form-control video-url me-2" placeholder="Video URL" required>
                        <input type="number" class="form-control video-duration me-2" placeholder="Duration (min)" min="0" required>
                        <button type="button" class="remove-video"><i class="hgi hgi-stroke hgi-multiplication-sign"></i></button>
                    </div>
                    <i class="uil uil-draggabledots"></i>
                </li>
            `);
        toggleDraggableMode(isDraggableMode, "#videoList");
        toggleDeleteButtons("#videoList", false);
    });

    // Add new video (new lesson modal)
    $("#addNewVideoBtn").on("click",() => {
        const videoList = $("#newVideoList");
        videoList.append(`
                <li class="video-item">
                    <div class="details d-flex w-100">
                        <input type="text" class="form-control video-title me-2" placeholder="Video Title" required>
                        <input type="url" class="form-control video-url me-2" placeholder="Video URL" required>
                        <input type="number" class="form-control video-duration me-2" placeholder="Duration (min)" min="0" required>
                        <button type="button" class="remove-video"><i class="hgi hgi-stroke hgi-multiplication-sign"></i></button>
                    </div>
                    <i class="uil uil-draggabledots"></i>
                </li>
            `);
        toggleDraggableMode(isDraggableMode, "#newVideoList");
        toggleDeleteButtons("#newVideoList", false);
    });

    // Toggle delete buttons visibility
    function toggleDeleteButtons(listSelector, show) {
        $(listSelector).find(".remove-video").css("display", show ? "flex" : "none");
    }

    // Update video sequence (edit modal)
    function updateVideoSequence() {
        const items = $("#videoList .video-item");
        items.each((index, item) => {
            // Sequence updated on save
        });
    }

    // Update the new video sequence (new lesson modal)
    function updateNewVideoSequence() {
        const items = $("#newVideoList .video-item");
        items.each((index, item) => {
            // Sequence updated on save
        });
    }

    // Populate lesson form (edit modal)
    function populateLessonForm(lessonId) {
        const lesson = lessons.find(l => l.lessonId === lessonId);
        if (lesson) {
            $("#lessonModal").data("current-lesson-id", lessonId);
            $("#lessonTitle").val(lesson.title);
            $("#isPublished").val(lesson.isPublished.toString());
            populateVideoList(lesson);
        }
    }

    // Toggle draggable mode
    function toggleDraggableMode(enable, listSelector = "#lessonList") {
        const $sortableList = $(listSelector);
        if ($sortableList.length === 0) {
            console.error(`No element found for selector: ${listSelector}`);
            return;
        }

        const itemSelector = listSelector === "#lessonList" ? ".lesson-item" : ".video-item";
        const $items = $sortableList.find(itemSelector);

        console.log(`Toggling draggable mode: ${enable} for ${listSelector}, found ${$items.length} items`);

        if (enable) {
            $items.each(function () {
                const $item = $(this);
                $item.addClass("draggable").attr("draggable", true);

                // Remove any existing listeners to avoid duplicates
                $item.off("dragstart.drag dragend.drag dragover.drag dragenter.drag");

                // Add drag event listeners
                $item.on("dragstart.drag", function (e) {
                    console.log(`Drag started on item: ${$item.data("video-id") || $item.data("lesson-id")}`);
                    $(this).addClass("dragging");
                    e.originalEvent.dataTransfer.setData("text/plain", "dragging"); // Optional for better compatibility
                }).on("dragend.drag", function () {
                    console.log(`Drag ended on item: ${$item.data("video-id") || $item.data("lesson-id")}`);
                    $(this).removeClass("dragging");
                    if (listSelector === "#lessonList") {
                        updateLessonSequence();
                    } else if (listSelector === "#videoList") {
                        updateVideoSequence();
                    } else if (listSelector === "#newVideoList") {
                        updateNewVideoSequence();
                    }
                });
            });

            // Handle dragover and dragenter on the list
            $sortableList.off("dragover.drag dragenter.drag drop.drag");
            $sortableList.on("dragover.drag", function (e) {
                e.preventDefault();
                const $draggingItem = $sortableList.find(".dragging");
                const $siblings = $sortableList.find(`${itemSelector}:not(.dragging)`);
                let $nextSibling = null;

                $siblings.each(function () {
                    const $sibling = $(this);
                    const rect = $sibling[0].getBoundingClientRect();
                    if (e.originalEvent.clientY <= rect.top + rect.height / 2) {
                        $nextSibling = $sibling;
                        return false;
                    }
                });

                if ($draggingItem.length) {
                    if ($nextSibling && $nextSibling.length) {
                        $draggingItem.insertBefore($nextSibling);
                    } else {
                        $sortableList.append($draggingItem);
                    }
                }
            }).on("dragenter.drag", function (e) {
                e.preventDefault();
            }).on("drop.drag", function (e) {
                e.preventDefault(); // Ensure drop works smoothly
            });
        } else {
            $items.each(function () {
                const $item = $(this);
                $item.removeClass("draggable").removeAttr("draggable");
                const $clone = $item.clone();
                $item.replaceWith($clone); // Remove listeners by replacing
            });
            $sortableList.off("dragover.drag dragenter.drag drop.drag");
        }
    }

    function dragButton(button) {
        const $button = $(button);
        const isCurrentlyDraggable = $button.hasClass("active");
        const newDraggableMode = !isCurrentlyDraggable;

        // Determine the target list based on button ID
        let listSelector;
        if ($button.attr("id") === "manageBtn") {
            listSelector = "#lessonList";
        } else if ($button.attr("id") === "addModalManageBtn") {
            listSelector = "#newVideoList";
        } else if ($button.attr("id") === "updateModalManageBtn") {
            listSelector = "#videoList";
        }

        if (!listSelector) {
            showAlert("danger", "No valid list selector found for button:", $button.attr("id"));
            return;
        }

        const $sortableList = $(listSelector);
        const itemSelector = listSelector === "#lessonList" ? ".lesson-item" : ".video-item";
        const $items = $sortableList.find(itemSelector);

        // prevent toggling if the list is empty
        if ($items.length === 0) {
            showAlert("warning", "No items to manage. Please add items first.");
            return;
        }

        $button.toggleClass("active");
        $button.html(`
        ${newDraggableMode ? "Done" : `<i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 me-2 align-middle"></i> Manage`}
    `);
        toggleDraggableMode(newDraggableMode, listSelector);
    }

    $("#manageBtn").on("click", function () {
        dragButton(this);
    });

    $("#addModalManageBtn").on("click", function () {
        dragButton(this);
    });

    $("#updateModalManageBtn").on("click", function () {
        dragButton(this);
    });

    $(document).on("click", ".lesson-item:not(.draggable)", function() {
        const lessonId = $(this).data("lesson-id");
        populateLessonForm(lessonId);
        $("#lessonModal").modal("show");
    });

    $(document).on("click",".btn-remove",function (e) {
        e.stopPropagation();
        const lessonId = $(this).data("id");
        const lesson = lessons.find(l => l.lessonId === lessonId);

        $("#deleteModalTitle").text("Delete Lesson");
        $("#deleteModalName").text(lesson.title);
        $("#deleteConfirmModal").data("lesson-id", lessonId);
        $("#deleteConfirmModal").data("delete-type", "lesson");

        // Clear video data to avoid conflicts
        $("#deleteConfirmModal").removeData("video-id").removeData("video-item");

        $("#deleteConfirmModal").modal("show");
    });

    $("#confirmDelete").click(function () {
        const deleteType = $("#deleteConfirmModal").data("delete-type");

        if (!token && role !== "INSTRUCTOR") {
            showAlert("danger", "Please log in as an instructor to perform this action.");
        }

        if (deleteType === "lesson") {
            const lessonId = $("#deleteConfirmModal").data("lesson-id");
            deleteLesson(lessonId);
        } else if (deleteType === "video") {
            const videoId = $("#deleteConfirmModal").data("video-id");
            const $videoItem = $($("#deleteConfirmModal").data("video-item"));

            if (videoId && typeof videoId === "number" && videoId > 0) {
                $.ajax({
                    url: `http://localhost:8080/api/v1/instructor/lesson/video/${videoId}`,
                    type: "DELETE",
                    headers: { "Authorization": "Bearer " + token },
                    success: function () {
                        $videoItem.remove();
                        showAlert("success", "Video deleted successfully!");
                        const $manageVideoBtn = $("#lessonModal").is(":visible") ? $("#updateModalManageBtn") : $("#addModalManageBtn");
                        toggleDraggableMode($manageVideoBtn.hasClass("active"), $manageVideoBtn);
                        updateVideoSequence();
                        updateNewVideoSequence();

                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    },
                    error: function (xhr) {
                        showAlert("danger", "Error deleting video: " + (xhr.responseJSON?.message || xhr.statusText));
                    },
                    complete: function () {
                        $("#deleteConfirmModal").modal("hide");
                        tempModal.modal("show");
                    }
                });
            } else {
                $videoItem.remove();
                showAlert("success", "Video removed from list!");
                const $manageVideoBtn = $("#lessonModal").is(":visible") ? $("#updateModalManageBtn") : $("#addModalManageBtn");
                toggleDraggableMode($manageVideoBtn.hasClass("active"), $manageVideoBtn);
                if ($("#lessonModal").is(":visible")) updateVideoSequence();
                else updateNewVideoSequence();
                $("#deleteConfirmModal").modal("hide");
            }
        } else {
            showAlert("danger", "Unknown delete type: " + deleteType);
            $("#deleteConfirmModal").modal("hide");
        }
    });

    $(document).on("click", ".remove-video", function () {
        const $videoItem = $(this).closest(".video-item");
        const videoId = $videoItem.data("video-id");
        const videoTitle = $videoItem.find(".video-title").val() || "Untitled Video";

        // Set modal content for video
        $("#deleteModalTitle").text("Delete Video");
        $("#deleteModalName").text(videoTitle);
        $("#deleteConfirmModal").data("video-id", videoId);
        $("#deleteConfirmModal").data("video-item", $videoItem[0]);
        $("#deleteConfirmModal").data("delete-type", "video");

        // Clear lesson data to avoid conflicts
        $("#deleteConfirmModal").removeData("lesson-id");

        // get active modal to hide
        const $activeModal = $(".modal.show");
        if ($activeModal.length) {
            const activeModalId = $activeModal.attr("id");
            tempModal = $("#" + activeModalId);
        }

        tempModal.modal("hide");
        $("#deleteConfirmModal").modal("show");
    });

    $(".cancelBtn, .btn-close").on("click", function () {
        // If delete modal is visible, hide it and show previous modal
        if ($("#deleteConfirmModal").is(":visible")) {
            $("#deleteConfirmModal").modal("hide");

            if (typeof tempModal !== "undefined" && tempModal) {
                tempModal.modal("show");
            } else {
                console.warn("tempModal is not defined or initialized");
            }
        }
        // If any manage button is active, toggle off manage mode
        else if ($(".manageVideoBtn.active").length > 0) {
            $(".manageVideoBtn.active").each(function () {
                $(this).removeClass("text-secondary, active").addClass("text-warning");
                $(this).html('<i class="hgi hgi-stroke hgi-pencil-edit-02 me-2 align-middle"></i>Manage');
            });
        } else {
            $(".modal.show").modal("hide");
        }
    });

    // Manage video button click handler
    $(".manageVideoBtn").on("click", function() {
        const targetList = $(this).data("target");
        const $videoList = $(targetList);
        const isVisible = $videoList.find(".remove-video").first().is(":visible");
        const hasItems = $videoList.find(".video-item").length > 0;

        toggleDeleteButtons(targetList, !isVisible);

        // Only toggle button text and class if the list has items
        if (hasItems) {
            if (!isVisible) {
                $(this).html('<i class="hgi hgi-stroke hgi-check-circle me-2 align-middle"></i>Done');
                $(this).removeClass("text-warning").addClass("text-secondary");
            } else {
                $(this).html('<i class="hgi hgi-stroke hgi-pencil-edit-02 me-2 align-middle"></i>Manage');
                $(this).removeClass("text-secondary").addClass("text-warning");
            }
        }
    });
});