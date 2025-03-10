$(document).ready(function () {
  // Initialize DataTable for course listing
  let courseTable;

  // Sample course data for testing
  const sampleCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      image: "../../assets/images/developer.png",
      duration: 12,
      category: "Development",
      instructor: "John Smith",
      instructorId: 1,
      students: 1250,
      status: "active",
      price: 99.99,
      description: "Master full-stack web development from scratch",
      level: "Intermediate",
    },
    {
      id: 2,
      title: "UI/UX Design Fundamentals",
      image: "../../assets/images/developer.png",
      duration: 8,
      category: "Design",
      instructor: "Sarah Johnson",
      instructorId: 2,
      students: 850,
      status: "active",
      price: 79.99,
      description: "Learn modern UI/UX design principles and tools",
      level: "Beginner",
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      image: "../../assets/images/developer.png",
      duration: 6,
      category: "Marketing",
      instructor: "Mike Wilson",
      instructorId: 3,
      students: 620,
      status: "draft",
      price: 69.99,
      description: "Create effective digital marketing campaigns",
      level: "Advanced",
    },
    {
      id: 4,
      title: "Business Analytics Essentials",
      image: "../../assets/images/developer.png",
      duration: 10,
      category: "Business",
      instructor: "Emily Brown",
      instructorId: 4,
      students: 430,
      status: "archived",
      price: 89.99,
      description: "Master data-driven business decision making",
      level: "Intermediate",
    },
  ];

  // Load course data
  function loadCourses() {
    // Using sample data instead of AJAX call for testing
    updateCourseTable(sampleCourses);
    /* Commented out AJAX call for future implementation */
    $.ajax({
      url: "/api/courses",
      method: "GET",
      success: function (response) {
        updateCourseTable(response);
      },
      error: function (xhr, status, error) {
        showAlert("danger", "Error loading courses: " + error);
      },
    });
  }

  // Update course table with data
  function updateCourseTable(courses) {
    const tableBody = $("#courseTableBody");
    tableBody.empty();

    courses.forEach((course) => {
      const row = `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${course.image}" alt="${
        course.title
      }" class="rounded me-3 course-thumbnail">
                            <div class="text-start">
                                <h6 class="mb-0">${course.title}</h6>
                                <small class="text-muted">${
                                  course.duration
                                } weeks</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-secondary-subtle rounded-pill text-dark">${
                      course.category
                    }</span></td>
                    <td>${course.instructor}</td>
                    <td>${course.students} students</td>
                    <td><span class="badge bg-${getStatusBadgeClass(
                      course.status
                    )}">${course.status}</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-action btn-view" onclick="editCourse(${
                              course.id
                            })">
                                <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5"></i>
                            </button>
                            <button class="btn btn-action btn-edit" onclick="deleteCourse(${
                              course.id
                            })">
                                <i class="hgi-stroke hgi-user-edit-01 fs-5"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
      tableBody.append(row);
    });
  }

  // Handle course search
  $("#courseSearch").on("keyup", function () {
    const searchTerm = $(this).val().toLowerCase();
    $("#courseTableBody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchTerm) > -1);
    });
  });

  // Handle category filter
  $("#categoryFilter").on("change", function () {
    const category = $(this).val().toLowerCase();
    if (category === "") {
      $("#courseTableBody tr").show();
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
      case "draft":
        return "warning text-dark";
      case "archived":
        return "secondary";
      default:
        return "primary";
    }
  }

  // Initialize
  loadCourses();
  loadInstructors();
});
