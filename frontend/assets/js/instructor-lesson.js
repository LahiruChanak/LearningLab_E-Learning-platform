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

        if (!token) {
            showAlert("danger", "Please login to the system to load courses.");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/course`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    const course = response.data.find(c => c.courseId === courseId);
                    if (course) {
                        $("#courseDetails").show();
                        $("#courseImage").attr("src",course.thumbnail || "../assets/images/icons/placeholder.svg");
                        $("#courseTitle").text(course.title);
                        $("#courseLevel").attr("class", `badge rounded-pill px-2 
                            ${course.level === 'BEGINNER' ? 'bg-warning-subtle text-warning' :
                            course.level === 'INTERMEDIATE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`)
                            .text(course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase());
                        $("#courseStatus").attr("class", `badge rounded-pill px-2
                            ${course.isPublished ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`)
                            .text(course.isPublished ? "Published" : "Draft");
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

        if (!token) {
            showAlert("danger", "Please login to the system to load lessons.");
            return;
        }

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
            lessonList.append('<li class="text-center text-muted list-unstyled p-3">No lessons yet. Please add some lessons.</li>');
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

        if (lessonData.videos.length > 0 && (lessonData.videos.title === "" || lessonData.videos.videoUrl === "" || lessonData.videos.duration === 0)) {
            showAlert("warning", "Please fill in all the required video fields.");
            return;
        }

        if (!token) {
            showAlert("danger", "Please login to the system to create new lessons.");
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

        if (lessonData.videos.length > 0 && (lessonData.videos.title === "" || lessonData.videos.videoUrl === "" || lessonData.videos.duration === 0)) {
            showAlert("warning", "Please fill in all the required video fields.");
            return;
        }

        if (!token) {
            showAlert("danger", "Please login to the system to update existing lessons.");
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

        if (!token) {
            showAlert("danger", "Please login to the system to delete lessons.");
            return;
        }

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

        if (!token) {
            showAlert("danger", "Please login to the system to update lessons sequence.");
            return;
        }

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
            showAlert("warning", "No element found for selector: " + listSelector);
            return;
        }

        const itemSelector = listSelector === "#lessonList" ? ".lesson-item" : ".video-item";
        const $items = $sortableList.find(itemSelector);

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
                    e.originalEvent.dataTransfer.setData("text/plain", "dragging");
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
                e.preventDefault();
            });
        } else {
            $items.each(function () {
                const $item = $(this);
                $item.removeClass("draggable").removeAttr("draggable");
                const $clone = $item.clone();
                $item.replaceWith($clone);
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

/* --------------------------------------------- Course Resources Codes --------------------------------------------- */

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
                <div class="resource-item d-flex align-items-center p-3 border rounded" data-resource-id="${resource.resourceId}">
                    <i class="hgi hgi-stroke ${iconClass} fs-4 me-3"></i>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${resource.title}</h6>
                        <small class="text-muted">${resource.type}${resource.type !== 'LINK' ? ', Uploaded' : ''}</small>
                    </div>
                    <button class="btn text-warning btn-sm me-2 btn-edit-resource">
                        <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i> Edit
                    </button>
                    <button class="btn text-danger btn-sm btn-delete-resource">
                        <i class="hgi hgi-stroke hgi-delete-01 fs-5 align-middle"></i> Delete
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

    // Dynamic input toggle for add modal
    $("#resourceType").change(function () {
        const type = $(this).val();
        if (type === 'LINK') {
            $("#fileInputContainer").addClass("d-none");
            $("#urlInputContainer").removeClass("d-none");
            $("#resourceFile").prop("required", false);
            $("#resourceUrl").prop("required", true);
        } else {
            $("#fileInputContainer").removeClass("d-none");
            $("#urlInputContainer").addClass("d-none");
            $("#resourceFile").prop("required", true);
            $("#resourceUrl").prop("required", false);
        }
    });

    // Dynamic input toggle for edit modal
    $("#editResourceType").change(function () {
        const type = $(this).val();
        if (type === 'LINK') {
            $("#editFileInputContainer").addClass("d-none");
            $("#editUrlInputContainer").removeClass("d-none");
            $("#editResourceFile").prop("required", false);
            $("#editResourceUrl").prop("required", true);
        } else {
            $("#editFileInputContainer").removeClass("d-none");
            $("#editUrlInputContainer").addClass("d-none");
            $("#editResourceFile").prop("required", false);
            $("#editResourceUrl").prop("required", false);
        }
    });

    // Save resource
    $("#saveResourceBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const formData = new FormData();
        const resourceDTO = {
            title: $("#addResourceForm input[name='title']").val(),
            type: $("#addResourceForm select[name='type']").val(),
            lessonId: $("#addResourceForm select[name='lessonId']").val() || null,
            url: $("#addResourceForm input[name='url']").val()
        };

        formData.append("resourceDTO", new Blob([JSON.stringify(resourceDTO)], { type: "application/json" }));
        const file = $("#resourceFile")[0].files[0];
        if (file) {
            formData.append("file", file);
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/resources`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Resource added successfully!");
                    $("#addResourceModal").modal("hide");
                    $("#addResourceForm")[0].reset();
                    fetchResources();
                } else {
                    showAlert("danger", response.message || "Failed to add resource.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding resource.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Edit resource
    $(document).on("click", ".btn-edit-resource", function () {
        const resourceId = $(this).closest(".resource-item").data("resource-id");
        const resource = resourcesData.find(r => r.resourceId === resourceId);

        if (resource) {
            $("#editResourceForm input[name='resourceId']").val(resource.resourceId);
            $("#editResourceForm input[name='title']").val(resource.title);
            $("#editResourceForm select[name='type']").val(resource.type);
            $("#editResourceForm select[name='lessonId']").val(resource.lessonId || "");
            $("#editResourceForm input[name='url']").val(resource.type === 'LINK' ? resource.url : '');
            $("#editResourceType").trigger("change");
            $("#resourceUploadDate").text(new Date(resource.uploadDate).toLocaleString("en-CA", { hour12: false }));
            $("#editResourceModal").modal("show");
        } else {
            showAlert("danger", "Resource not found.");
        }
    });

    // Update resource
    $("#updateResourceBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const resourceId = $("#editResourceForm input[name='resourceId']").val();
        const formData = new FormData();
        const resourceDTO = {
            title: $("#editResourceForm input[name='title']").val(),
            type: $("#editResourceForm select[name='type']").val(),
            lessonId: $("#editResourceForm select[name='lessonId']").val() || null,
            url: $("#editResourceForm input[name='url']").val()
        };

        formData.append("resourceDTO", new Blob([JSON.stringify(resourceDTO)], { type: "application/json" }));
        const file = $("#editResourceFile")[0].files[0];
        if (file) {
            formData.append("file", file);
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/resources/${resourceId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Resource updated successfully!");
                    $("#editResourceModal").modal("hide");
                    $("#editResourceForm")[0].reset();
                    fetchResources();
                } else {
                    showAlert("danger", response.message || "Failed to update resource.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating resource.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Delete resource
    $(document).on("click", ".btn-delete-resource", function () {
        const resourceId = $(this).closest(".resource-item").data("resource-id");
        const resourceTitle = $(this).closest(".resource-item").find("h6").text();
        $("#deleteResourceName").text(resourceTitle).addClass("text-danger");
        $("#deleteResourceModal").modal("show");

        $("#confirmResourceDelete").off("click").on("click", function () {
            $.ajax({
                url: `http://localhost:8080/api/v1/course/${courseId}/resources/${resourceId}`,
                type: "DELETE",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "Resource deleted successfully!");
                        $("#deleteResourceModal").modal("hide");
                        fetchResources();
                    } else {
                        showAlert("danger", response.message || "Failed to delete resource.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting resource.");
                }
            });
        });
    });

    fetchResources();

/* ----------------------------------------------- Announcement Codes ----------------------------------------------- */

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
                <div class="announcement-item d-flex align-items-center p-3 border rounded" data-announcement-id="${announcement.announcementId}">
                    <i class="hgi hgi-stroke hgi-megaphone-02 fs-4 me-3 text-primary align-self-start"></i>
                    <div class="flex-grow-1 me-3">
                        <h6 class="mb-1">${announcement.title}</h6>
                        <small class="text-muted">Posted on ${dateFormatted}</small>
                        <p class="mb-0 mt-1">${announcement.description}</p>
                    </div>
                    <button class="btn text-warning btn-sm me-2 btn-edit-announcement text-nowrap">
                        <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i> Edit
                    </button>
                    <button class="btn text-danger btn-sm btn-delete-announcement text-nowrap">
                        <i class="hgi hgi-stroke hgi-delete-01 fs-5 align-middle"></i> Delete
                    </button>
                </div>`;
            $list.append(announcementHtml);
        });
    }

    // Add Announcement
    $("#saveAnnouncementBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const announcementDTO = {
            title: $("#addAnnouncementForm input[name='title']").val(),
            description: $("#addAnnouncementForm textarea[name='description']").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/announcements`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(announcementDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Announcement added successfully!");
                    $("#addAnnouncementModal").modal("hide");
                    $("#addAnnouncementForm")[0].reset();
                    fetchAnnouncements();
                } else {
                    showAlert("danger", response.message || "Failed to add announcement.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding announcement.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Edit Announcement
    $(document).on("click", ".btn-edit-announcement", function () {
        const announcementId = $(this).closest(".announcement-item").data("announcement-id");
        const announcement = announcementsData.find(a => a.announcementId === announcementId);
        if (announcement) {
            $("#editAnnouncementForm input[name='announcementId']").val(announcement.announcementId);
            $("#editAnnouncementForm input[name='title']").val(announcement.title);
            $("#editAnnouncementForm textarea[name='description']").val(announcement.description);
            $("#editAnnouncementModal").modal("show");
        } else {
            showAlert("danger", "Announcement not found.");
        }
    });

    // Update Announcement
    $("#updateAnnouncementBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const announcementId = $("#editAnnouncementForm input[name='announcementId']").val();
        const announcementDTO = {
            title: $("#editAnnouncementForm input[name='title']").val(),
            description: $("#editAnnouncementForm textarea[name='description']").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/announcements/${announcementId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(announcementDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Announcement updated successfully!");
                    $("#editAnnouncementModal").modal("hide");
                    $("#editAnnouncementForm")[0].reset();
                    fetchAnnouncements();
                } else {
                    showAlert("danger", response.message || "Failed to update announcement.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating announcement.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Delete Announcement
    $(document).on("click", ".btn-delete-announcement", function () {
        const announcementId = $(this).closest(".announcement-item").data("announcement-id");
        const announcementTitle = $(this).closest(".announcement-item").find("h6").text();
        $("#deleteAnnouncementName").text(announcementTitle).addClass("text-danger");
        $("#deleteAnnouncementModal").modal("show");

        $("#confirmAnnouncementDelete").off("click").on("click", function () {
            $.ajax({
                url: `http://localhost:8080/api/v1/course/${courseId}/announcements/${announcementId}`,
                type: "DELETE",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "Announcement deleted successfully!");
                        $("#deleteAnnouncementModal").modal("hide");
                        fetchAnnouncements();
                    } else {
                        showAlert("danger", response.message || "Failed to delete announcement.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting announcement.");
                }
            });
        });
    });

    fetchAnnouncements();

/* --------------------------------------------------- FAQ Codes ---------------------------------------------------- */

    let faqsData = [];

    // Fetch FAQs
    function fetchFAQs() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/faqs`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    faqsData = response.data;
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
                <div class="accordion-item" data-faq-id="${faq.faqId}">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${faq.faqId}">
                            ${faq.question}
                        </button>
                    </h2>
                    <div id="faq${faq.faqId}" class="accordion-collapse collapse ${isFirst}" data-bs-parent="#faqAccordion">
                        <div class="accordion-body pb-1">
                            ${faq.answer ? faq.answer : '<em>Waiting for instructor response...</em>'}
                            <div class="d-flex justify-content-end align-items-center mt-2">
                                <button class="btn text-primary btn-sm btn-edit-faq me-2">
                                    <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i> Edit
                                </button>
                                <button class="btn text-danger btn-sm btn-delete-faq">
                                    <i class="hgi hgi-stroke hgi-delete-01 fs-5 align-middle"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            $accordion.append(faqHtml);
        });
    }

    // Add FAQ
    $("#saveFAQBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const faqDTO = {
            question: $("#addFAQForm input[name='question']").val(),
            answer: $("#addFAQForm textarea[name='answer']").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/faqs`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(faqDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "FAQ added successfully!");
                    $("#addFAQModal").modal("hide");
                    $("#addFAQForm")[0].reset();
                    fetchFAQs();
                } else {
                    showAlert("danger", response.message || "Failed to add FAQ.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding FAQ.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Edit FAQ
    $(document).on("click", ".btn-edit-faq", function () {
        const faqId = $(this).closest(".accordion-item").data("faq-id");
        const faq = faqsData.find(f => f.faqId === faqId);
        if (faq) {
            $("#editFAQForm input[name='faqId']").val(faq.faqId);
            $("#editFAQForm input[name='question']").val(faq.question);
            $("#editFAQForm textarea[name='answer']").val(faq.answer || "");
            $("#editFAQModal").modal("show");
        } else {
            showAlert("danger", "FAQ not found.");
        }
    });

    // Update FAQ
    $("#updateFAQBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const faqId = $("#editFAQForm input[name='faqId']").val();
        const faqDTO = {
            question: $("#editFAQForm input[name='question']").val(),
            answer: $("#editFAQForm textarea[name='answer']").val()
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/faqs/${faqId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(faqDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "FAQ updated successfully!");
                    $("#editFAQModal").modal("hide");
                    $("#editFAQForm")[0].reset();
                    fetchFAQs();
                } else {
                    showAlert("danger", response.message || "Failed to update FAQ.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating FAQ.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Delete FAQ
    $(document).on("click", ".btn-delete-faq", function () {
        const faqId = $(this).closest(".accordion-item").data("faq-id");
        const faqQuestion = $(this).closest(".accordion-item").find(".accordion-button").text().trim();
        $("#deleteFAQName").text(faqQuestion).addClass("text-danger");
        $("#deleteFAQModal").modal("show");

        $("#confirmFAQDelete").off("click").on("click", function () {
            $.ajax({
                url: `http://localhost:8080/api/v1/course/${courseId}/faqs/${faqId}`,
                type: "DELETE",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "FAQ deleted successfully!");
                        $("#deleteFAQModal").modal("hide");
                        fetchFAQs();
                    } else {
                        showAlert("danger", response.message || "Failed to delete FAQ.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting FAQ.");
                }
            });
        });
    });

    fetchFAQs();

/* --------------------------------------------------- Quiz Codes --------------------------------------------------- */

    let quizzesData = [];

    // Dynamic question and answer fields
    $(document).on("click", "#addQuestionBtn", function () {
        const questionHtml = `
        <div class="question-group mb-3">
            <div class="mb-2">
                <label class="form-label">Question</label>
                <textarea class="form-control question-text" rows="2"></textarea>
            </div>
            <div class="answers-container mb-2">
                <div class="answer-group mb-2 d-flex align-items-center">
                    <input type="text" class="form-control answer-text me-2" placeholder="Answer">
                    <input type="checkbox" class="answer-correct me-2">
                    <label>Correct</label>
                </div>
            </div>
            <button type="button" class="btn btn-outline-secondary btn-sm add-answer-btn">Add Answer</button>
        </div>`;
        $(this).siblings(".questions-container").append(questionHtml);
    });

    // Add answer field
    $(document).on("click", ".add-answer-btn", function () {
        const answerHtml = `
        <div class="answer-group mb-2 d-flex align-items-center">
            <input type="text" class="form-control answer-text me-2" placeholder="Answer">
            <input type="checkbox" class="answer-correct me-2">
            <label>Correct</label>
        </div>`;
        $(this).siblings(".answers-container").append(answerHtml);
    });

    // Fetch Quizzes
    function fetchQuizzes() {
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quizzes`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    quizzesData = response.data;
                    renderQuizzes(response.data);
                } else {
                    showAlert("danger", response.message || "Failed to load quizzes.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error loading quizzes.");
            }
        });
    }

    // Render Quizzes
    function renderQuizzes(quizzes) {
        const $list = $("#quizList").empty();
        if (quizzes.length === 0) {
            $list.html('<p class="text-center text-muted p-3">No quizzes available. Add a quiz to get started.</p>');
            return;
        }
        quizzes.forEach(quiz => {
            const createdAt = new Date(quiz.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
            const quizHtml = `
                <div class="quiz-item d-flex align-items-start p-3 border rounded mb-3" data-quiz-id="${quiz.quizId}">
                    <i class="hgi hgi-stroke hgi-quiz fs-4 me-3 text-primary"></i>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${quiz.title}</h6>
                        <small class="text-muted">Created on ${createdAt}</small>
                        <p class="mb-0 mt-1">${quiz.description || 'No description'}</p>
                        <small class="text-muted">Total Marks: ${quiz.totalMarks} | Passing Marks: ${quiz.passingMarks}</small>
                        <p class="mt-1">Status: <span class="${quiz.isPublished ? 'text-success' : 'text-warning'}">
                            ${quiz.isPublished ? 'Published' : 'Draft'}</span></p>
                    </div>
                    <button class="btn text-primary btn-sm me-2 btn-toggle-publish">
                        <i class="hgi hgi-stroke hgi-${quiz.isPublished ? 'eye-off' : 'eye-on'} fs-5"></i>
                        ${quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button class="btn text-primary btn-sm me-2 btn-edit-quiz">
                        <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5"></i> Edit
                    </button>
                    <button class="btn text-danger btn-sm btn-delete-quiz">
                        <i class="hgi hgi-stroke hgi-delete-01 fs-5"></i> Delete
                    </button>
                </div>`;
            $list.append(quizHtml);
        });
    }

    // Add Quiz
    $("#saveQuizBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const quizDTO = {
            title: $("#addQuizForm input[name='title']").val(),
            description: $("#addQuizForm textarea[name='description']").val(),
            totalMarks: parseInt($("#addQuizForm input[name='totalMarks']").val()) || 0,
            passingMarks: parseInt($("#addQuizForm input[name='passingMarks']").val()) || 0,
            questions: collectQuestions("#addQuizForm")
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quizzes`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(quizDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Quiz added successfully!");
                    $("#addQuizModal").modal("hide");
                    $("#addQuizForm")[0].reset();
                    fetchQuizzes();
                } else {
                    showAlert("danger", response.message || "Failed to add quiz.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding quiz.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Edit Quiz
    $(document).on("click", ".btn-edit-quiz", function () {
        const quizId = $(this).closest(".quiz-item").data("quiz-id");
        const quiz = quizzesData.find(q => q.quizId === quizId);
        if (quiz) {
            $("#editQuizForm input[name='quizId']").val(quiz.quizId);
            $("#editQuizForm input[name='title']").val(quiz.title);
            $("#editQuizForm textarea[name='description']").val(quiz.description);
            $("#editQuizForm input[name='totalMarks']").val(quiz.totalMarks);
            $("#editQuizForm input[name='passingMarks']").val(quiz.passingMarks);
            populateQuestions("#editQuizForm", quiz.questions);
            $("#editQuizModal").modal("show");
        } else {
            showAlert("danger", "Quiz not found.");
        }
    });

    // Update Quiz
    $("#updateQuizBtn").click(function () {
        const $btn = $(this);
        $btn.find("span").removeClass("d-none");
        $btn.prop("disabled", true);

        const quizId = $("#editQuizForm input[name='quizId']").val();
        const quizDTO = {
            title: $("#editQuizForm input[name='title']").val(),
            description: $("#editQuizForm textarea[name='description']").val(),
            totalMarks: parseInt($("#editQuizForm input[name='totalMarks']").val()) || 0,
            passingMarks: parseInt($("#editQuizForm input[name='passingMarks']").val()) || 0,
            questions: collectQuestions("#editQuizForm")
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quizzes/${quizId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(quizDTO),
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Quiz updated successfully!");
                    $("#editQuizModal").modal("hide");
                    $("#editQuizForm")[0].reset();
                    fetchQuizzes();
                } else {
                    showAlert("danger", response.message || "Failed to update quiz.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating quiz.");
            },
            complete: function () {
                $btn.find("span").addClass("d-none");
                $btn.prop("disabled", false);
            }
        });
    });

    // Toggle Quiz Publication
    $(document).on("click", ".btn-toggle-publish", function () {
        const quizId = $(this).closest(".quiz-item").data("quiz-id");
        $.ajax({
            url: `http://localhost:8080/api/v1/course/${courseId}/quizzes/${quizId}/publish`,
            type: "PATCH",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", response.data.isPublished ? "Quiz published!" : "Quiz unpublished!");
                    fetchQuizzes();
                } else {
                    showAlert("danger", response.message || "Failed to toggle quiz publication.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error toggling quiz publication.");
            }
        });
    });

    // Delete Quiz
    $(document).on("click", ".btn-delete-quiz", function () {
        const quizId = $(this).closest(".quiz-item").data("quiz-id");
        const quizTitle = $(this).closest(".quiz-item").find("h6").text();
        $("#deleteQuizName").text(quizTitle);
        $("#deleteQuizModal").modal("show");

        $("#confirmQuizDelete").off("click").on("click", function () {
            $.ajax({
                url: `http://localhost:8080/api/v1/course/${courseId}/quizzes/${quizId}`,
                type: "DELETE",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "Quiz deleted successfully!");
                        $("#deleteQuizModal").modal("hide");
                        fetchQuizzes();
                    } else {
                        showAlert("danger", response.message || "Failed to delete quiz.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting quiz.");
                }
            });
        });
    });

    // Helper to collect questions and answers from form
    function collectQuestions(formSelector) {
        const questions = [];
        $(`${formSelector} .question-group`).each(function () {
            const question = {
                questionId: $(this).data("question-id") ? parseInt($(this).data("question-id")) : null,
                questionText: $(this).find(".question-text").val(),
                answers: []
            };
            $(this).find(".answer-group").each(function () {
                question.answers.push({
                    answerId: $(this).data("answer-id") ? parseInt($(this).data("answer-id")) : null,
                    answerText: $(this).find(".answer-text").val(),
                    isCorrect: $(this).find(".answer-correct").is(":checked")
                });
            });
            if (question.questionText) {
                questions.push(question);
            }
        });
        return questions;
    }

    // Helper to populate questions and answers in edit form
    function populateQuestions(formSelector, questions) {
        const $questionContainer = $(`${formSelector} .questions-container`).empty();
        if (questions && questions.length > 0) {
            questions.forEach(q => {
                const questionHtml = `
                <div class="question-group mb-3" data-question-id="${q.questionId || ''}">
                    <div class="mb-2">
                        <label class="form-label">Question</label>
                        <textarea class="form-control question-text" rows="2">${q.questionText}</textarea>
                    </div>
                    <div class="answers-container">
                        ${q.answers.map(a => `
                            <div class="answer-group mb-2 d-flex align-items-center" data-answer-id="${a.answerId || ''}">
                                <input type="text" class="form-control answer-text me-2" value="${a.answerText}">
                                <input type="checkbox" class="answer-correct me-2" ${a.isCorrect ? 'checked' : ''}>
                                <label>Correct</label>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
                $questionContainer.append(questionHtml);
            });
        }
    }

    fetchQuizzes();

/* -------------------------------------------------- Admin Codes --------------------------------------------------- */

    // check the user role and show admin-only features
    if (role === "ADMIN") {
        $("#addLessonBtn, #manageBtn, #addVideoBtn, #updateModalManageBtn, #saveLessonBtn").hide();

        $("#newLessonModal, #lessonModal").find(".form-control, .form-select").prop("disabled", true);
        $("#videoList, #newVideoList").addClass("disabled");
    }

});