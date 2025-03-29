$(document).ready(function () {
  // Revenue Chart
  const revenueCtx = document.getElementById("revenueChart").getContext("2d");
  
  new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: [
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
      datasets: [
        {
          label: "Course Visits",
          data: [30, 45, 35, 50, 40, 60, 45, 55, 45, 60, 50, 65],
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Course Sales",
          data: [20, 35, 25, 40, 30, 50, 35, 45, 35, 50, 40, 55],
          borderColor: "#FFA726",
          backgroundColor: "rgba(255, 167, 38, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  // Trend Line Charts
  const createTrendLine = (ctx, color, data) => {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: new Array(10).fill(""),
        datasets: [
          {
            data: data,
            borderColor: color,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
      },
    });
  };

  // Revenue Trend
  createTrendLine(
    document.getElementById("revenueTrend").getContext("2d"),
    "#4CAF50",
    [30, 40, 35, 45, 40, 50, 45, 55, 50, 60]
  );

  // Rating Trend
  createTrendLine(
    document.getElementById("ratingTrend").getContext("2d"),
    "#4CAF50",
    [4.2, 4.4, 4.3, 4.5, 4.4, 4.6, 4.5, 4.7, 4.6, 4.8]
  );

  // Students Trend
  createTrendLine(
    document.getElementById("studentsTrend").getContext("2d"),
    "#4CAF50",
    [1000, 2000, 1800, 2500, 2300, 3000, 2800, 3500, 3300, 4000]
  );

  // Course Stats Chart
  const courseStatsCtx = document
    .getElementById("courseStatsChart")
    .getContext("2d");
  new Chart(courseStatsCtx, {
    type: "doughnut",
    data: {
      labels: ["Course Sale", "Course Watched"],
      datasets: [
        {
          data: [40, 30],
          backgroundColor: ["#4CAF50", "#FFA726"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  // Counter Animation
  $(".counter").each(function () {
    $(this)
      .prop("Counter", 0)
      .animate(
        {
          Counter: $(this).text(),
        },
        {
          duration: 2000,
          easing: "swing",
          step: function (now) {
            $(this).text(Math.ceil(now));
          },
        }
      );
  });

  // Button Interactions
  $(".btn-filter").click(function () {
    $(".btn-filter").removeClass("active");
    $(this).addClass("active");
  });
});
