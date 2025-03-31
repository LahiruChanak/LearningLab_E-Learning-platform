function getStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "danger";
    case "draft":
      return "warning";
    case "archived":
      return "secondary";
    default:
      return "primary";
  }
}

$(document).ready(function () {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  const token = localStorage.getItem("token");
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
          const $tbody = $("#courseTableBody");
          $tbody.empty();
          response.data.forEach(course => {
            $tbody.append(`
                <tr>
                    <td class="text-start"><img src="${course.thumbnail}" class="img-fluid course-thumbnail me-3" alt="${course.title}">${course.title}</td>
                    <td>LMS-100${course.courseId}</td>
                    <td>${course.categoryId}</td>
                    <td>${course.price}</td>
                    <td>${course.level}</td>
                    <td>${course.isPublished ? "Yes" : "No"}</td>
                    <td>
                        <button class="btn btn-action btn-edit me-2" data-course='${JSON.stringify(course)}' data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">
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
      },
      error: function (xhr) {
        showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
      }
    });
  }

  // Handle form submission
  $("#saveCourseBtn").on("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("danger", "Please login as an instructor to add a course.");
      return;
    }

    const $button = $(this);
    $button.prop("disabled", true);

    const formData = new FormData();
    const courseDTO = {
      title: $("input[name='title']").val(),
      description: $("textarea[name='description']").val(),
      categoryId: $("select[name='categoryId']").val(),
      price: $("input[name='price']").val(),
      level: $("select[name='level']").val(),
      isPublished: $("input[name='isPublished']").is(":checked")
    };

    formData.append("courseDTO", new Blob([JSON.stringify(courseDTO)], { type: "application/json" }));
    const thumbnail = $("#add-course-img")[0].files[0];

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/instructor/course",
      type: "POST",
      headers: { "Authorization": "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        $button.prop("disabled", false);
        if (response.status === 200) {
          showAlert("success", "Course added successfully!");
          $("#addCourseModal").modal("hide");
          $("#addCourseForm")[0].reset();
          $("#coursePreview").attr("src", "../assets/images/icons/placeholder.svg");
        } else {
          showAlert("danger", response.message || "Failed to add course.");
        }
      },
      error: function (xhr) {
        $button.prop("disabled", false);
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
});
