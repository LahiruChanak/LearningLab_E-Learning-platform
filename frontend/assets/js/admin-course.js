$(document).ready(function () {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (role !== "ADMIN" && role !== "INSTRUCTOR") {
        showAlert("danger", "Unauthorized access! Redirecting to login page...");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    }

    let allCourses = [];
    fetchCategories();
    fetchCourses();

    // Add a heading input field
    $("#addHeadingBtn, #updateHeadingBtn").click(function () {
        const headingInput = `
            <div class="heading-container position-relative">
                <input type="text" class="form-control rounded" name="headingTitles" placeholder="Enter heading title" required>
                <button type="button" class="d-none remove-heading">
                    <i class="hgi hgi-stroke hgi-multiplication-sign align-middle"></i>
                </button>
            </div>`;
        $(".headingTitlesContainer").append(headingInput);
    });

    // manage btn click show remove btn
    $("#manageHeadingBtnAdd, #manageHeadingBtnUpdate").on("click", function () {
        const $btn = $(this);

        if ($btn.text().trim() === "Manage") {
            $(".remove-heading").removeClass("d-none").addClass("d-flex");
            $btn.text("Done").attr("class", "btn btn-sm border-0 text-secondary");
        } else {
            $(".remove-heading").removeClass("d-flex").addClass("d-none");
            $btn.html('<i class="hgi hgi-stroke hgi-pencil-edit-02 align-middle"></i> Manage')
                .attr("class", "btn btn-sm border-0 text-warning");
        }
    });

    // Remove a heading input field
    $(".headingTitlesContainer").on("click", ".remove-heading", function () {
        $(this).closest(".heading-container").remove();
    });

    // Preview thumbnail in save modal
    $("#add-course-img").on("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#coursePreview").attr("src", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Preview thumbnail in edit modal
    $("#edit-course-img").on("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#editCoursePreview").attr("src", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // ---------------- Fetch categories ----------------
    function fetchCategories(formId = null) {
        $.ajax({
            url: "http://localhost:8080/api/v1/category",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    const $categorySelect = formId
                        ? $(`#${formId} select[name='categoryId']`)
                        : $("select[name='categoryId']");
                    $categorySelect.empty();
                    $categorySelect.append('<option value="">Select Category</option>');
                    response.data.forEach(category => {
                        $categorySelect.append(`<option value="${category.categoryId}">${category.name}</option>`);
                    });
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching categories: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // ---------------- Fetch courses ----------------
    function fetchCourses() {
        $.ajax({
            url: "http://localhost:8080/api/v1/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    allCourses = response.data;
                    applyFilters();
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function renderCourses(courses) {
        const $tbody = $("#courseTableBody");
        $tbody.empty();
        const userRole = getUserRole();

        if (courses.length === 0) {
            $tbody.append('<tr><td colspan="7" class="text-center align-middle" style="height: 100px;">No courses found</td></tr>');
        } else {
            courses.forEach(course => {
                const editButton = userRole !== "ADMIN" ? `
                <button class="btn btn-action btn-edit" data-course='${JSON.stringify(course)}' data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit">
                    <i class="hgi hgi-stroke hgi-pencil-edit-02 align-middle fs-5"></i>
                </button>
            ` : '';

                const deleteButton = userRole !== "ADMIN" ? `
                <button class="btn btn-action btn-delete" data-id="${course.courseId}" data-title="${course.title}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Delete">
                    <i class="hgi hgi-stroke hgi-delete-02 align-middle fs-5"></i>
                </button>
            ` : '';

                const viewButton = `
                <button class="btn btn-action btn-view" data-id="${course.courseId}" data-title="${course.title}" data-bs-toggle="tooltip" data-bs-placement="bottom" 
                        data-bs-title="${userRole === 'ADMIN' ? 'View' : 'Manage Content'}" onclick="window.location.href='instructor-lesson.html?courseId=${course.courseId}'">
                    <i class="hgi hgi-stroke hgi-left-to-right-list-bullet align-middle fs-5"></i>
                </button>
            `;

                const statusButton = userRole === "ADMIN" ? `
                <button class="btn border-0 btn-status bg-transparent ${course.isPublished ? 'active' : 'inactive'}" data-id="${course.courseId}" data-status="${course.isPublished}" 
                            data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="${course.isPublished ? 'Published' : 'Draft'}">
                    <i class="hgi hgi-stroke ${course.isPublished ? 'hgi-toggle-on' : 'hgi-toggle-off'} fs-4 align-middle"></i>
                </button>
            ` : '';

                $tbody.append(`
                <tr>
                    <td class="text-start"><img src="${course.thumbnail}" class="img-fluid course-thumbnail me-3" alt="thumbnail">${course.title}</td>
                    <td>LMS-100${course.courseId}</td>
                    <td>${course.description}</td>
                    <td>${course.price}</td>
                    <td>
                        <span class="badge rounded-pill bg px-2 ${course.level === 'BEGINNER' ? 'bg-warning-subtle text-warning' :
                    course.level === 'INTERMEDIATE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                            ${course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
                        </span>
                    </td>
                    <td>
                        <span class="badge rounded-pill px-2 ${course.isPublished ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                            ${course.isPublished ? "Published" : "Draft"}
                        </span>
                    </td>
                    <td class="action-column">
                        ${editButton}
                        ${deleteButton}
                        ${viewButton}
                        ${statusButton}
                    </td>
                </tr>
            `);
            });

            $('[data-bs-toggle="tooltip"]').tooltip(); // Initialize tooltips
        }
    }

    function getUserRole() {
        const role = localStorage.getItem("role");
        if (role) {
            return role === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
        }
        return "INSTRUCTOR";
    }

/* -------------------------------------------------- Save Course --------------------------------------------------- */

    // ------------ save course ------------
    $("#saveCourseBtn").on("click", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as an instructor to add a course.");
            return;
        }

        const headingTitles = [];
        $("#headingTitlesContainer input[name='headingTitles']").each(function () {
            const value = $(this).val().trim();
            if (value) headingTitles.push(value);
        });

        const courseDTO = {
            title: $("#addCourseForm input[name='title']").val(),
            description: $("#addCourseForm textarea[name='description']").val(),
            categoryId: $("#addCourseForm select[name='categoryId']").val(),
            price: $("#addCourseForm input[name='price']").val(),
            level: $("#addCourseForm select[name='level']").val(),
            isPublished: $("#addCourseForm input[name='isPublished']").is(":checked"),
            headingTitles: headingTitles
        };

        if (!courseDTO.title || !courseDTO.description || !courseDTO.categoryId || !courseDTO.price || !courseDTO.level) {
            showAlert("danger", "Please fill in all the required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("courseDTO", new Blob([JSON.stringify(courseDTO)], {type: "application/json"}));
        const thumbnail = $("#add-course-img")[0].files[0];

        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        $("#saveCourseBtn span").removeClass("d-none");

        $.ajax({
            url: "http://localhost:8080/api/v1/instructor/course",
            type: "POST",
            headers: {"Authorization": "Bearer " + token},
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Course added successfully!");
                    $("#addCourseModal").modal("hide");
                    $("#addCourseForm")[0].reset();
                    $("#headingTitlesContainer").empty();
                    $("#saveCourseBtn span").addClass("d-none");
                    $("#coursePreview").attr("src", "../assets/images/icons/placeholder.svg");
                    fetchCourses();
                } else {
                    showAlert("danger", response.message || "Failed to add course.");
                }
            },
            error: function (xhr) {
                $("#saveCourseBtn span").addClass("d-none");
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding course.");
            }
        });
    });

    // Load categories when modal is shown
    $("#addCourseModal").on("shown.bs.modal", function () {
        fetchCategories("addCourseForm");
    });

/* -------------------------------------------------- Edit Course --------------------------------------------------- */

    // ---------------- Edit button click ----------------
    $(document).on("click", ".btn-action.btn-edit", function () {
        const course = $(this).data("course");

        $("#editCourseForm input[name='thumbnail']").val("");
        $("#editCourseForm input[name='courseId']").val(course.courseId);
        $("#editCourseForm input[name='title']").val(course.title);
        $("#editCourseForm textarea[name='description']").val(course.description);
        $("#editCourseForm input[name='price']").val(course.price);
        $("#editCourseForm select[name='level']").val(course.level);
        $("#editCourseForm input[name='isPublished']").prop("checked", course.isPublished);
        $("#editCoursePreview").attr("src", course.thumbnail || "../assets/images/icons/placeholder.svg");

        $("#updateCourseModal .headingTitlesContainer").empty();

        if (course.headingTitles && Array.isArray(course.headingTitles)) {
            course.headingTitles.forEach(title => {
                const headingInput = `
                <div class="heading-container position-relative">
                    <input type="text" class="form-control rounded" name="headingTitles" value="${title}" placeholder="Enter heading title">
                    <button type="button" class="d-none remove-heading">
                        <i class="hgi hgi-stroke hgi-multiplication-sign align-middle"></i>
                    </button>
                </div>`;
                $("#updateCourseModal .headingTitlesContainer").append(headingInput);
            });
        }

        fetchCategories("editCourseForm");
        setTimeout(() => {
            $("#editCourseForm select[name='categoryId']").val(course.categoryId);
            $("#updateCourseModal").modal("show");
        }, 50);
    });

    // ---------------- Update course ----------------
    $("#updateCourseBtn").on("click", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as an instructor to update a course.");
            return;
        }

        const courseId = $("#editCourseForm input[name='courseId']").val();
        const headingTitles = [];
        $(".headingTitlesContainer input[name='headingTitles']").each(function () {
            const value = $(this).val().trim();
            if (value) headingTitles.push(value);
        });

        const courseDTO = {
            title: $("#editCourseForm input[name='title']").val(),
            description: $("#editCourseForm textarea[name='description']").val(),
            categoryId: $("#editCourseForm select[name='categoryId']").val(),
            price: $("#editCourseForm input[name='price']").val(),
            level: $("#editCourseForm select[name='level']").val(),
            isPublished: $("#editCourseForm input[name='isPublished']").is(":checked"),
            headingTitles: headingTitles
        };

        if (!courseDTO.title || !courseDTO.description || !courseDTO.categoryId || !courseDTO.price || !courseDTO.level) {
            showAlert("danger", "Please fill in all the required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("courseDTO", new Blob([JSON.stringify(courseDTO)], { type: "application/json" }));
        const thumbnail = $("#edit-course-img")[0].files[0];
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        $("#updateCourseBtn span").removeClass("d-none");

        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/course/${courseId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Course updated successfully!");
                    $("#updateCourseBtn span").addClass("d-none");
                    $("#updateCourseModal").modal("hide");
                    $("#editCourseForm")[0].reset();
                    $(".headingTitlesContainer").empty();
                    $("#coursePreview").attr("src", "../assets/images/icons/placeholder.svg");
                    fetchCourses();
                } else {
                    showAlert("danger", response.message || "Failed to update course.");
                    $("#updateCourseBtn span").addClass("d-none");
                }
            },
            error: function (xhr) {
                $("#updateCourseBtn span").addClass("d-none");
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating course.");
            }
        });
    });

/* ------------------------------------------------- Delete Course -------------------------------------------------- */

    // ------------ Delete button click ------------
    $(document).on("click", ".btn-action.btn-delete", function () {
        const courseId = $(this).data("id");
        const courseTitle = $(this).data("title");

        if (!token) {
            showAlert("danger", "Please login as an instructor to delete courses.");
            return;
        }

        // Update modal content
        $("#deleteModalTitle").text("Delete Course");
        $("#deleteModalName").text(`${courseTitle || 'Unnamed Course'}`);
        $("#confirmDelete").data("id", courseId);
        $("#deleteConfirmModal").modal("show");
    });

    // ------------ Confirm delete action ------------
    $("#confirmDelete").on("click", function () {
        const courseId = $(this).data("id");

        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/course/${courseId}`,
            type: "DELETE",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Course deleted successfully!");
                    fetchCourses();
                } else {
                    showAlert("danger", response.message || "Failed to delete course.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting course.");
            },
            complete: function () {
                $("#deleteConfirmModal").modal("hide");
            }
        });
    });

    /* ----------------------------------------------- Filters and Search ----------------------------------------------- */

    $("#searchInput").on("input", debounce(function () {
        applyFilters();
    }, 300));

    $("#filterCategory, #filterLevel, #filterPublished").on("change", function () {
        applyFilters();
    });

    function applyFilters() {
        const searchTerm = $("#searchInput").val().trim().toLowerCase();
        const filterCategory = $("#filterCategory").val();
        const filterLevel = $("#filterLevel").val();
        const filterPublished = $("#filterPublished").val();

        const filteredCourses = allCourses.filter(course => {
            const displayCourseId = `lms-100${course.courseId}`;
            const numericSearch = parseCourseId(searchTerm);

            // Match title or courseId
            const matchesSearch = !searchTerm ||
                course.title.toLowerCase().includes(searchTerm) ||
                displayCourseId.includes(searchTerm) ||
                (numericSearch !== null && course.courseId === numericSearch);

            const matchesCategory = !filterCategory || course.categoryId.toString() === filterCategory;
            const matchesLevel = !filterLevel || course.level === filterLevel;
            const matchesPublished = filterPublished === "" || course.isPublished.toString() === filterPublished;

            return matchesSearch && matchesCategory && matchesLevel && matchesPublished;
        });

        renderCourses(filteredCourses);
    }

    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function parseCourseId(searchTerm) {
        const match = searchTerm.match(/lms-100(\d*)/i) || searchTerm.match(/^\d+$/);
        if (match) {
            const numericId = match[1] !== undefined ? parseInt(match[1], 10) : parseInt(match[0], 10);
            return isNaN(numericId) ? null : numericId;
        }
        return null;
    }

/* --------------------------------------------- Course Resources Codes --------------------------------------------- */



/* -------------------------------------------------- Admin Codes --------------------------------------------------- */

    // check the user role and show admin-only features
    if (role === "ADMIN") {
        $("#addNewCourse").hide();
        $(".btn-view").attr("data-bs-title", "View")
    }

    // show modal for updating status
    $(document).on("click", ".btn-status", function () {
        const $button = $(this);
        const courseId = $button.data("id");
        const newStatus = !($(this).data("status") === true || $(this).data("status") === "true");
        $("#confirmStatusUpdate").removeClass(newStatus ? "status-btn-off" : "status-btn-on")
            .addClass(newStatus ? "status-btn-on" : "status-btn-off");
        $("#statusUpdateIcon").removeClass(newStatus ? "hgi-toggle-off text-danger" : "hgi-toggle-on text-success")
            .addClass(newStatus ? "hgi-toggle-on text-success" : "hgi-toggle-off text-danger");
        $("#statusUpdateTitle").text(newStatus ? "Publish Course" : "Draft Course");
        $("#statusUpdateAction").text(newStatus ? "publish" : "draft");
        $("#statusUpdateName").text($button.closest("tr").find("td:first").text());
        $("#statusUpdateModal").data("course-id", courseId);
        $("#statusUpdateModal").data("new-status", newStatus);
        $("#statusUpdateModal").data("button", $button[0]);

        $("#statusUpdateModal").modal("show");
    });

    $("#confirmStatusUpdate").click(function () {
        const courseId = $("#statusUpdateModal").data("course-id");
        const newStatus = $("#statusUpdateModal").data("new-status");
        const $button = $($("#statusUpdateModal").data("button"));
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("courseDTO", new Blob([JSON.stringify({
            courseId: courseId,
            isPublished: newStatus
        })], {type: "application/json"}));

        $.ajax({
            url: `http://localhost:8080/api/v1/instructor/course/${courseId}`,
            type: "PUT",
            headers: {"Authorization": "Bearer " + token},
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 200) {
                    $button.removeClass(newStatus ? "inactive" : "active")
                        .addClass(newStatus ? "active" : "inactive");
                    $button.data("status", newStatus);
                    $button.tooltip("dispose");
                    showAlert("success", `Course ${newStatus ? "published" : "unpublished"} successfully!`);
                    $("#statusUpdateModal").modal("hide");
                    fetchCourses();
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error updating course status: " + (xhr.responseJSON?.message || xhr.statusText));
                $("#statusUpdateModal").modal("hide");
            }
        });
    });
});
