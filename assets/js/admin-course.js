// Initialize tooltips
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// Sample course data for demonstration
let courses = [
  {
    id: 1,
    title: "Figma from A to Z",
    category: "Design",
    instructor: "John Doe",
    students: 150,
    status: "Active",
    price: 49.99,
    description: "Learn Figma from basics to advanced level",
    duration: 8,
    level: "intermediate",
    image: "developer.png",
  },
  {
    id: 2,
    title: "Sketch from A to Z",
    category: "Development",
    instructor: "Jane Smith",
    students: 100,
    status: "Inactive",
    price: 39.99,
    description: "Learn Sketch from basics to advanced level",
    duration: 6,
    level: "beginner",
    image: "developer.png",
  },
];

// Function to load courses into the table
function loadCourses() {
  const tableBody = document.getElementById("courseTableBody");
  tableBody.innerHTML = "";

  courses.forEach((course) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="../../assets/images/${course.image}" alt="${
      course.title
    }" class="course-thumbnail" />
          <div>
            <h6 class="mb-0">${course.title}</h6>
            <small class="text-muted">${course.level}</small>
          </div>
        </div>
      </td>
      <td>${course.category}</td>
      <td>${course.instructor}</td>
      <td>${course.students} students</td>
      <td><span class="badge bg-${getStatusBadgeClass(
        course.status
      )}-subtle text-${getStatusBadgeClass(course.status)}">${
      course.status
    }</span></td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-action btn-edit rounded-end-0" data-course-id="${
            course.id
          }">
            <i class="hgi-stroke hgi-pencil-edit-02 fs-5"></i>
          </button>
          <button class="btn btn-action btn-delete rounded-start-0" data-course-id="${
            course.id
          }">
            <i class="hgi-stroke hgi-delete-01 fs-5"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners for edit and delete buttons
  attachEventListeners();
}

// Function to attach event listeners to buttons
function attachEventListeners() {
  // Edit course buttons
  document.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", () => {
      const courseId = button.getAttribute("data-course-id");
      openUpdateModal(courseId);
    });
  });

  // Delete course buttons
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", () => {
      const courseId = button.getAttribute("data-course-id");
      openDeleteModal(courseId);
    });
  });

  // Edit field buttons in update modal
  document.querySelectorAll("#updateCourseForm .edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const inputGroup = this.closest(".input-group");
      const input = inputGroup
        ? inputGroup.querySelector("input, textarea")
        : null;

      if (input) {
        input.disabled = !input.disabled;
        this.classList.toggle("active");
        if (!input.disabled) {
          input.focus();
        }
      }
    });
  });
}

// Function to open update modal with course data
function openUpdateModal(courseId) {
  const course = courses.find((c) => c.id === parseInt(courseId));
  if (!course) return;

  const form = document.getElementById("updateCourseForm");

  // Reset all fields to disabled state
  form.querySelectorAll("input, textarea").forEach((input) => {
    if (!input.closest("select")) {
      input.disabled = true;
    }
  });

  form.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Fill form fields with course data
  form.querySelector(
    "#updateCoursePreview"
  ).src = `../../assets/images/${course.image}`;
  form.querySelector('[name="title"]').value = course.title;
  form.querySelector('[name="category"]').value = course.category;
  form.querySelector('[name="instructor"]').value = course.instructor;
  form.querySelector('[name="price"]').value = course.price;
  form.querySelector('[name="description"]').value = course.description;
  form.querySelector('[name="duration"]').value = course.duration;
  form.querySelector('[name="level"]').value = course.level;

  // Store course ID in the form
  form.setAttribute("data-course-id", courseId);

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("updateCourseModal")
  );
  modal.show();
}

// Function to open delete confirmation modal
function openDeleteModal(courseId) {
  const course = courses.find((c) => c.id === parseInt(courseId));
  if (!course) return;

  // Update modal content
  document.getElementById("deleteModalTitle").textContent = "Delete Course";
  document.getElementById("deleteModalName").textContent = course.title;

  // Store course ID for delete confirmation
  document
    .getElementById("confirmDelete")
    .setAttribute("data-course-id", courseId);

  // Show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();
}

// Function to validate form data
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add("is-invalid");
    } else {
      $("#courseTableBody tr").filter(function () {
        const courseCategory = $(this)
          .find("td:nth-child(2)")
          .text()
          .toLowerCase();
        $(this).toggle(courseCategory === category);
      });
    }
  });
}

// Handle course form submission
$("#saveCourseBtn").on("click", function () {
  const formData = new FormData($("#addCourseForm")[0]);

  // Simulated AJAX call to save course
  // Replace with actual API endpoint
  $.ajax({
    url: "/api/courses",
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      $("#addCourseModal").modal("hide");
      showAlert("success", "Course Successfully Saved!");
      loadCourses();
    },
    error: function (xhr, status, error) {
      showAlert("danger", "Error saving course: " + error);
    },
  });
});

// Load instructors for dropdown
function loadInstructors() {
  // Simulated AJAX call to fetch instructors
  // Replace with actual API endpoint
  $.ajax({
    url: "/api/instructors",
    method: "GET",
    success: function (response) {
      const select = $('select[name="instructor"]');
      response.forEach((instructor) => {
        select.append(
          `<option value="${instructor.id}">${instructor.name}</option>`
        );
      });
    },
    error: function (xhr, status, error) {
      showAlert("danger", "Error loading instructors: " + error);
    },
  });
}

// Delete course
window.deleteCourse = function (courseId) {
  if (confirm("Are you sure you want to delete this course?")) {
    // Simulated AJAX call to delete course
    // Replace with actual API endpoint
    $.ajax({
      url: `/api/courses/${courseId}`,
      method: "DELETE",
      success: function (response) {
        showAlert("success", "Course Successfully Deleted!");
        loadCourses();
      },
      error: function (xhr, status, error) {
        showAlert("danger", "Error deleting course: " + error);
      },
    });
  }
};

// Edit course
window.editCourse = function (courseId) {
  // Simulated AJAX call to fetch course details
  // Replace with actual API endpoint
  $.ajax({
    url: `/api/courses/${courseId}`,
    method: "GET",
    success: function (course) {
      $("#addCourseModal").modal("show");
      // Populate form with course data
      $('input[name="title"]').val(course.title);
      $('select[name="category"]').val(course.category);
      $('select[name="instructor"]').val(course.instructorId);
      $('input[name="price"]').val(course.price);
      $('textarea[name="description"]').val(course.description);
      $('input[name="duration"]').val(course.duration);
      $('select[name="level"]').val(course.level);
    },
    error: function (xhr, status, error) {
      showAlert("danger", "Error loading course details: " + error);
    },
  });
};

// Helper function for status badge colors
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

// Initialize
// Handle course deletion
document.getElementById("confirmDelete").addEventListener("click", () => {
  const courseId = parseInt(
    document.getElementById("confirmDelete").getAttribute("data-course-id")
  );

  // Remove course from array
  courses = courses.filter((c) => c.id !== courseId);

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("deleteConfirmModal")
  );
  modal.hide();

  // Reload courses table
  loadCourses();

  // Show success message
  showAlert("Course deleted successfully", "success");
});

document.addEventListener("DOMContentLoaded", function () {
  // Function to add edit buttons to input fields
  function addEditButtons() {
    const updateForm = document.getElementById("updateCourseForm");
    const inputs = updateForm.querySelectorAll(
      'input[type="text"], input[type="number"], textarea'
    );

    inputs.forEach((input) => {
      const inputGroup = input.closest(".input-group");
      if (inputGroup && !inputGroup.querySelector(".edit-btn")) {
        const editBtn = document.createElement("button");
        editBtn.className = "btn text-warning border-0 w-auto edit-btn";
        editBtn.type = "button";
        editBtn.innerHTML = '<i class="hgi-stroke hgi-pencil-edit-01"></i>';

        editBtn.addEventListener("click", function () {
          input.disabled = !input.disabled;
          editBtn.classList.toggle("active");
          if (!input.disabled) {
            input.focus();
          }
        });

        inputGroup.appendChild(editBtn);
      }
    });
  }

  // Call the function when update modal is shown
  const updateModal = document.getElementById("updateCourseModal");
  updateModal.addEventListener("shown.bs.modal", addEditButtons);

  // Load initial courses
  loadCourses();
});
