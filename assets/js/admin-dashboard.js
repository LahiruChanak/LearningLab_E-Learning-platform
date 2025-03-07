$(document).ready(function () {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // ------------------------ Calendar ------------------------
  document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev",
        center: "title",
        right: "next",
      },
      height: "auto",
      fixedWeekCount: false,
      showNonCurrentDates: true,
      dayHeaderFormat: {
        weekday: "short",
      },
    });

    calendar.render();
  });

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
      height: 350,
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
      course: "Web Development",
      progress: 75,
      status: "Active",
    },
    {
      name: "Emma Wilson",
      email: "emma@example.com",
      course: "UI/UX Design",
      progress: 60,
      status: "Active",
    },
  ];

  const mockCoordinators = [
    {
      name: "David Brown",
      email: "david@example.com",
      department: "Computer Science",
      courses: 5,
      status: "Active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      department: "Design",
      courses: 3,
      status: "Active",
    },
  ];

  // Populate Tables
  function populateStudentsTable() {
    const tbody = $("#studentsTableBody");
    tbody.empty();

    mockStudents.forEach((student) => {
      tbody.append(`
        <tr>
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
          <td>${student.course}</td>
          <td>
            <div class="progress" style="height: 5px;">
              <div class="progress-bar bg-primary" role="progressbar" style="width: ${
                student.progress
              }%"></div>
            </div>
          </td>
          <td><span class="badge bg-${
            student.status === "Active" ? "success" : "warning"
          }">${student.status}</span>
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <button class="btn btn-action btn-edit">
                <i class="hgi-stroke hgi-pencil-edit-02 fs-5"></i>
              </button>
              <button class="btn btn-action btn-delete">
                <i class="hgi-stroke hgi-delete-02 fs-5"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
    });
  }

  function populateCoordinatorsTable() {
    const tbody = $("#coordinatorsTableBody");
    tbody.empty();

    mockCoordinators.forEach((coordinator) => {
      tbody.append(`
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="avatar me-2">
                <img src="assets/images/user.jpg" alt="${
                  coordinator.name
                }" class="logo-img">
              </div>
              <div>${coordinator.name}</div>
            </div>
          </td>
          <td>${coordinator.email}</td>
          <td>${coordinator.department}</td>
          <td>${coordinator.courses}</td>
          <td><span class="badge bg-${
            coordinator.status === "Active" ? "success" : "warning"
          }">${coordinator.status}</span>
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <button class="btn btn-action btn-edit">
                <i class="hgi-stroke hgi-pencil-edit-02 fs-5"></i>
              </button>
              <button class="btn btn-action btn-delete">
                <i class="hgi-stroke hgi-delete-02 fs-5"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
    });
  }

  // Initial table population
  populateStudentsTable();
  populateCoordinatorsTable();
});
