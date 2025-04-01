$(document).ready(function () {

  const token = localStorage.getItem("token");
  let allCourses = [];
  fetchCategories();
  fetchCourses();

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
      headers: { "Authorization": "Bearer " + token },
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
      url: "http://localhost:8080/api/v1/instructor/course",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
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
    if (courses.length === 0) {
      $tbody.append('<tr><td colspan="7" class="text-center align-middle" style="height: 100px;">No courses found</td></tr>');
    } else {
      courses.forEach(course => {
        $tbody.append(`
            <tr>
                <td class="text-start"><img src="${course.thumbnail}" class="img-fluid course-thumbnail me-3" alt="${course.title}">${course.title}</td>
                <td>LMS-100${course.courseId}</td>
                <td>${course.description}</td>
                <td>${course.price}</td>
                <td>
                    <span class="badge rounded-pill px-2 ${course.level === 'BEGINNER' ? 'bg-warning' :
            course.level === 'INTERMEDIATE' ? 'bg-success' : 'bg-danger'}">
                          ${course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
                    </span>
                </td>
                <td>
                    <span class="badge rounded-pill px-2 ${course.isPublished ? 'bg-success' : 'bg-danger'}">
                        ${course.isPublished ? "Active" : "Inactive"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-action btn-edit" data-course='${JSON.stringify(course)}' data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">
                        <i class="hgi hgi-stroke hgi-pencil-edit-02 align-middle fs-5"></i>
                    </button>
                    <button class="btn btn-action btn-delete" data-id="${course.courseId}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Delete">
                        <i class="hgi hgi-stroke hgi-delete-02 align-middle fs-5"></i>
                    </button>
                </td>
            </tr>
        `);
      });
    }
  }

  // Handle form submission
  $("#saveCourseBtn").on("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("danger", "Please login as an instructor to add a course.");
      return;
    }

    const formData = new FormData();
    const courseDTO = {
      title: $("input[name='title']").val(),
      description: $("textarea[name='description']").val(),
      categoryId: $("select[name='categoryId']").val(),
      price: $("input[name='price']").val(),
      level: $("select[name='level']").val(),
      isPublished: $("input[name='isPublished']").is(":checked")
    };

    if (!courseDTO.title || !courseDTO.description || !courseDTO.categoryId || !courseDTO.price || !courseDTO.level) {
      showAlert("danger", "Please fill in all the required fields.");
      return;
    }

    formData.append("courseDTO", new Blob([JSON.stringify(courseDTO)], { type: "application/json" }));
    const thumbnail = $("#add-course-img")[0].files[0];

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    $("#saveCourseBtn span").removeClass("d-none");

    $.ajax({
      url: "http://localhost:8080/api/v1/instructor/course",
      type: "POST",
      headers: { "Authorization": "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === 200) {
          showAlert("success", "Course added successfully!");
          $("#addCourseModal").modal("hide");
          $("#addCourseForm")[0].reset();
          $("#saveCourseBtn span").addClass("d-none");
          $("#coursePreview").attr("src", "../assets/images/icons/placeholder.svg");
        } else {
          showAlert("danger", response.message || "Failed to add course.");
        }
      },
      error: function (xhr) {
        showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error adding course.");
      }
    });
  });

  // Load categories when modal is shown
  $("#addCourseModal").on("shown.bs.modal", function () {
    fetchCategories();
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

    fetchCategories("editCourseForm");
    setTimeout(() => {
      $("#editCourseForm select[name='categoryId']").val(course.categoryId);
      $("#updateCourseModal").modal("show");
    }, 50);
  });

  // ---------------- Update course ----------------
  $("#updateCourseBtn").on("click", function (e) {
    e.preventDefault();
    if (!token) {
      showAlert("danger", "Please login as an instructor to update a course.");
      return;
    }

    const courseId = $("#editCourseForm input[name='courseId']").val();
    const formData = new FormData();
    const courseDTO = {
      title: $("#editCourseForm input[name='title']").val(),
      description: $("#editCourseForm textarea[name='description']").val(),
      categoryId: $("#editCourseForm select[name='categoryId']").val(),
      price: $("#editCourseForm input[name='price']").val(),
      level: $("#editCourseForm select[name='level']").val(),
      isPublished: $("#editCourseForm input[name='isPublished']").is(":checked")
    };
    formData.append("courseDTO", new Blob([JSON.stringify(courseDTO)], { type: "application/json" }));
    const thumbnail = $("#edit-course-img")[0].files[0];
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

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
          fetchCourses();
        } else {
          showAlert("danger", response.message || "Failed to update course.");
        }
      },
      error: function (xhr) {
        showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating course.");
      },
      complete: function () {
        $("#updateCourseModal").modal("hide");
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
    $("#deleteModalName").text(`"${courseTitle}"`);
    $("#confirmDelete").data("id", courseId);
    $("#deleteConfirmModal").modal("show");
  });

  // ------------ Confirm delete action ------------
  $("#confirmDelete").on("click", function () {
    const courseId = $(this).data("id");

    $.ajax({
      url: `http://localhost:8080/api/v1/instructor/course/${courseId}`,
      type: "DELETE",
      headers: { "Authorization": "Bearer " + token },
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

});
