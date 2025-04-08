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
      height: 285,
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
});
