$(document).ready(function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    const token = localStorage.getItem("token");
    let currentCourseId = null;
    let lessons = [];
    let isDraggableMode = false;

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
            lessonList.append('<li class="text-center text-muted">No lessons yet</li>');
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
            videos: []
        };
        $("#newVideoList .video-item").each(function (index) {
            lessonData.videos.push({
                title: $(this).find(".video-title").val(),
                videoUrl: $(this).find(".video-url").val(),
                duration: parseInt($(this).find(".video-duration").val()) || 0,
                videoSequence: index + 1
            });
        });
        $.ajax({
            url: "http://localhost:8080/api/v1/instructor/lesson",
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(lessonData),
            success: function (lesson) {
                lessons.push(lesson);
                renderLessons();
                $("#newLessonModal").modal("hide");
                $("#newLessonForm")[0].reset();
                $("#newVideoList").empty();
                showAlert("success", "Lesson created successfully!");
            },
            error: function (xhr) {
                showAlert("danger", "Error creating lesson: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Update lesson
    $("#saveLessonBtn").on(("click"),() => {
        const lessonId = $("#lessonModal").data("current-lesson-id");
        const lessonData = {
            title: $("#lessonTitle").val(),
            isPublished: $("#isPublished").val() === "true",
            videos: []
        };
        $("#videoList .video-item").each(function (index) {
            lessonData.videos.push({
                videoId: $(this).data("video-id") || Date.now(),
                title: $(this).find(".video-title").val(),
                videoUrl: $(this).find(".video-url").val(),
                duration: parseInt($(this).find(".video-duration").val()) || 0,
                videoSequence: index + 1
            });
        });
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
                renderLessons();
                $("#deleteConfirmModal").modal("hide");
            },
            error: function (xhr) {
                alert("Error deleting lesson: " + (xhr.responseJSON?.message || xhr.statusText));
                $("#deleteConfirmModal").modal("hide");
            }
        });
    }

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
    });

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
        const sortableList = document.querySelector(listSelector);
        const items = sortableList.querySelectorAll(listSelector === "#lessonList" ? ".lesson-item" : ".video-item");

        if (enable) {
            items.forEach(item => {
                item.classList.add("draggable");
                item.setAttribute("draggable", "true");
                item.addEventListener("dragstart", () => {
                    setTimeout(() => item.classList.add("dragging"), 0);
                });
                item.addEventListener("dragend", () => {
                    item.classList.remove("dragging");
                    if (listSelector === "#lessonList") {
                        updateLessonSequence();
                    } else if (listSelector === "#videoList") {
                        updateVideoSequence();
                    } else if (listSelector === "#newVideoList") {
                        updateNewVideoSequence();
                    }
                });
            });

            sortableList.addEventListener("dragover", (e) => {
                e.preventDefault();
                const draggingItem = sortableList.querySelector(".dragging");
                const siblings = [...sortableList.querySelectorAll(`${listSelector === "#lessonList" ? ".lesson-item" : ".video-item"}:not(.dragging)`)];
                const nextSibling = siblings.find(sibling => {
                    const rect = sibling.getBoundingClientRect();
                    return e.clientY <= rect.top + rect.height / 2;
                });
                sortableList.insertBefore(draggingItem, nextSibling || null);
            });

            sortableList.addEventListener("dragenter", e => e.preventDefault());
        } else {
            items.forEach(item => {
                item.classList.remove("draggable");
                item.removeAttribute("draggable");
                item.replaceWith(item.cloneNode(true)); // Remove event listeners
            });
        }
    }

    $("#manageBtn").click(function() {
        isDraggableMode = !isDraggableMode;
        $(this).toggleClass("active");
        $(this).html(`
            ${isDraggableMode ? "Done" : `<i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 me-2 align-middle"></i> Manage`}
        `);
        toggleDraggableMode(isDraggableMode, "#lessonList");
        if ($("#lessonModal").is(":visible")) {
            toggleDraggableMode(isDraggableMode, "#videoList");
        }
        if ($("#newLessonModal").is(":visible")) {
            toggleDraggableMode(isDraggableMode, "#newVideoList");
        }
    });

    $(document).on("click", ".lesson-item:not(.draggable)", function() {
        const lessonId = $(this).data("lesson-id");
        populateLessonForm(lessonId);
        $("#lessonModal").modal("show");
    });

    $(document).on("click", ".btn-remove", function(e) {
        e.stopPropagation();
        const lessonId = $(this).data("id");
        const lesson = lessons.find(l => l.lessonId === lessonId);
        $("#deleteModalName").text(lesson.title);
        $("#deleteConfirmModal").data("lesson-id", lessonId);
        $("#deleteConfirmModal").modal("show");
    });

    $("#confirmDelete").click(function() {
        const lessonId = $("#deleteConfirmModal").data("lesson-id");
        deleteLesson(lessonId);
    });

    $(document).on("click", ".remove-video", function() {
        $(this).closest(".video-item").remove();
        if ($("#lessonModal").is(":visible")) {
            updateVideoSequence();
        } else {
            updateNewVideoSequence();
        }
    });
});