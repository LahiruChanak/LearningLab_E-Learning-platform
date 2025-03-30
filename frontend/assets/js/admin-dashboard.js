$(document).ready(function () {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Check the user role and redirect if not admin
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") {
    showAlert("danger", "Unauthorized access! Redirecting to login page...");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  }

  // Attendance Chart
  const attendanceChartOptions = {
    series: [
      {
        name: "Attendance",
        data: [],
      },
    ],
    chart: {
      type: "area",
      height: 310,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: [],
    },
    colors: ["#7269ef"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "%";
        },
      },
    },
  };

  const attendanceChart = new ApexCharts(
    document.querySelector("#salesChart"),
    attendanceChartOptions
  );
  attendanceChart.render();

  // Function to fetch attendance data
  function fetchAttendanceData(period) {
    // Show loading state
    attendanceChart.updateOptions({
      chart: {
        animations: {
          enabled: true,
        },
      },
    });

    // API endpoints for different periods
    const endpoints = {
      weekly: "/api/attendance/weekly",
      monthly: "/api/attendance/monthly",
      yearly: "/api/attendance/yearly",
    };

    $.ajax({
      url: endpoints[period],
      method: "GET",
      success: function (response) {
        // Update chart with new data
        attendanceChart.updateOptions({
          xaxis: {
            categories: response.categories,
          },
          chart: {
            animations: {
              enabled: true,
            },
          },
        });

        attendanceChart.updateSeries([
          {
            data: response.data,
          },
        ]);
      },
      error: function (xhr, status, error) {
        console.error("Error fetching attendance data:", error);
        // Fallback to mock data in case of error
        const mockData = {
          weekly: {
            categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [67, 85, 75, 90, 67, 85, 75],
          },
          monthly: {
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            data: [70, 82, 78, 85, 75, 88, 80, 82, 78, 85, 75, 88],
          },
          yearly: {
            categories: [
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
            ],
            data: [75, 80, 85, 88, 82, 85, 90],
          },
        };

        attendanceChart.updateOptions({
          xaxis: {
            categories: mockData[period].categories,
          },
          chart: {
            animations: {
              enabled: true,
            },
          },
        });

        attendanceChart.updateSeries([
          {
            data: mockData[period].data,
          },
        ]);
      },
    });
  }

  // Chart Period Buttons
  $(".btn-group .btn").click(function () {
    $(".btn-group .btn").removeClass("active");
    $(this).addClass("active");

    const period = $(this).data("period");
    fetchAttendanceData(period);
  });

  // Initial data fetch (weekly by default)
  fetchAttendanceData("weekly");

  // Mock data for tables
  const mockStudents = [
    {
      name: "John Smith",
      email: "john@example.com",
      contact: "123-456-7890",
      address: "123 Main St, Anytown, USA",
      joinedAt: "2022-01-01 10:00:00",
      status: "Active",
    },
    {
      name: "Emma Wilson",
      email: "emma@example.com",
      contact: "987-654-3210",
      address: "456 Oak St, Anytown, USA",
      joinedAt: "2022-02-15 14:30:00",
      status: "Inactive",
    },
  ];

  const mockInstructors = [
    {
      name: "David Brown",
      email: "david@example.com",
      contact: "555-555-5555",
      address: "789 Pine St, Anytown, USA",
      joinedAt: "2022-03-01 12:00:00",
      courses: "Figma" + ", " + "Photoshop" + ", " + "Illustrator",
      status: "Active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      contact: "111-111-1111",
      address: "321 Maple St, Anytown, USA",
      joinedAt: "2022-04-15 09:30:00",
      courses: "HTML" + ", " + "CSS" + ", " + "JavaScript" + ", " + "React",
      status: "Inactive",
    },
  ];

  // Populate Tables
  // Function to populate student modal with data
  function populateStudentModal(studentData) {
    $("#studentName").val(studentData.name);
    $("#studentEmail").val(studentData.email);
    $("#studentContact").val(studentData.contact);
    $("#studentAddress").val(studentData.address);
    $("#studentJoinedDate").val(studentData.joinedAt);
    $("#studentStatus").val(studentData.status);
  }

  // Function to populate instructor modal with data
  function populateInstructorModal(instructorData) {
    $("#instructorName").val(instructorData.name);
    $("#instructorEmail").val(instructorData.email);
    $("#instructorContact").val(instructorData.contact);
    $("#instructorAddress").val(instructorData.address);
    $("#instructorJoinedDate").val(instructorData.joinedAt);
    $("#instructor-status").val(instructorData.status);
    $("#instructorCourses").val(instructorData.courses);
  }

  function populateStudentsTable() {
    const tbody = $("#studentsTableBody");
    tbody.empty();

    mockStudents.forEach((student, index) => {
      const row = $(`
        <tr data-student-index="${index}">
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="avatar">
                <img src="assets/images/user.jpg" alt="${
                  student.name
                }" class="logo-img">
              </div>
              <div>${student.name}</div>
            </div>
          </td>
          <td>${student.email}</td>
          <td>${student.contact}</td>
          <td>${student.address}</td>
          <td>${student.joinedAt}</td>
          <td><span class="badge bg-${
            student.status === "Active" ? "success" : "danger"
          }">${student.status}</span></td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <button class="btn btn-action btn-view" data-bs-toggle="modal" data-bs-target="#studentViewModal">
                <i class="hgi hgi-stroke hgi-property-view fs-5"></i>
              </button>
              <button class="btn btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#studentStatusModal">
                <i class="hgi-stroke hgi-user-edit-01 fs-5"></i>
              </button>
            </div>
          </td>
        </tr>
      `);

      // Add click handler for view button
      row.find(".btn-view").on("click", () => populateStudentModal(student));

      // Add click handler for edit button
      row.find(".btn-edit").on("click", () => {
        $("#userStatus").val(student.status);
        $("#studentStatusModal").data("studentIndex", index);
      });

      tbody.append(row);
    });
  }

  function populateInstructorsTable() {
    const tbody = $("#instructorsTableBody");
    tbody.empty();

    mockInstructors.forEach((instructor) => {
      const row = $(`
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="avatar me-2">
                <img src="assets/images/user.jpg" alt="${
                  instructor.name
                }" class="logo-img">
              </div>
              <div>${instructor.name}</div>
            </div>
          </td>
          <td>${instructor.email}</td>
          <td>${instructor.contact}</td>
          <td>${instructor.address}</td>
          <td>${instructor.joinedAt}</td>
          <td>${instructor.courses}</td>
          <td><span class="badge bg-${
            instructor.status === "Active" ? "success" : "danger"
          }">${instructor.status}</span></td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <button class="btn btn-action btn-view" data-bs-toggle="modal" data-bs-target="#instructorViewModal">
                <i class="hgi hgi-stroke hgi-property-view fs-5"></i>
              </button>
              <button class="btn btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#instructorStatusModal">
                <i class="hgi-stroke hgi-user-edit-01 fs-5"></i>
              </button>
            </div>
          </td>
        </tr>
      `);

      // Add click handler for view button
      row
        .find(".btn-view")
        .on("click", () => populateInstructorModal(instructor));

      // Add click handler for edit button
      row.find(".btn-edit").on("click", () => {
        $("#instructor-status").val(instructor.status);
        $("#instructorStatusModal").data("instructorIndex", index);
      });

      tbody.append(row);
    });
  }

  // Initial table population
  populateStudentsTable();
  populateInstructorsTable();

  // Handle status update
  $("#updateUserStatus").on("click", function () {
    const studentIndex = $("#studentStatusModal").data("studentIndex");
    const newStatus = $("#userStatus").val();

    // Update mock data
    mockStudents[studentIndex].status = newStatus;

    showAlert("success", "Status updated successfully!");
    populateStudentsTable();

    // Close modal
    $("#studentStatusModal").modal("hide");
  });

  // Handle instructor status update
  $("#updateInstructorStatus").on("click", function () {
    const instructorIndex = $("#instructorStatusModal").data("instructorIndex");
    const newStatus = $("#instructor-status").val();

    // Update mock data
    mockInstructors[instructorIndex].status = newStatus;

    showAlert("success", "Status updated successfully!");
    populateInstructorsTable();

    // Close modal
    $("#instructorStatusModal").modal("hide");
  });
});
