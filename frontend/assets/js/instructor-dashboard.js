$(document).ready(function () {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token && role !== "INSTRUCTOR") {
    showAlert("danger", "Please login as instructor to view dashboard.");
    return;
  }

/* --------------------------------------------------- Stat Cards --------------------------------------------------- */

  function fetchInstructorStats() {
    if (!token) {
      showAlert("danger", "Please login to view your stats.");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/instructor/stats",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
      success: function (response) {

        const stats = response.data || response;

        if (!stats || typeof stats.studentCount === "undefined") {
          showAlert("danger", "Invalid stats data received.");
          return;
        }

        renderStatsChart(stats);

        // Update "Students Count"
        $("#student-count").text(stats.studentCount.toLocaleString().padStart(2, '0'));
        renderTrendChart("studentsTrend", [50, 120, 200, 250, 500, stats.studentCount]);

        // Update "Total Earnings"
        const totalEarnings = stats.totalEarnings.toFixed(1);
        $("#total-earnings").text(`$${totalEarnings.padStart(4, '0')}`);
        renderTrendChart("revenueTrend", [150, 100, 160, 165, 270, stats.totalEarnings]);

        // Pending and In-Review Earnings
        const pendingEarnings = (stats.totalEarnings * 0.75).toFixed(1);
        const inReviewEarnings = (stats.totalEarnings * 0.25).toFixed(1);
        $("#pending-earnings").text(`$${pendingEarnings.padStart(4, '0')}`);
        $("#in-review-earnings").text(`$${inReviewEarnings.padStart(4, '0')}`);

        // Update "Course Count"
        $("#course-count").text(stats.courseCount.toString().padStart(2, '0'));
        renderTrendChart("coursesTrend", [10, 20, 30, 40, 50, stats.courseCount]);

        // Update "Average Rating"
        const avgRating = stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A";
        $("#rating-count").text(avgRating !== "N/A" ? `${avgRating}/5` : "N/A");
        renderTrendChart("ratingTrend", [4.5, 4.6, 4.7, 4.7, 4.8, stats.averageRating || 0]);
      },
      error: function (xhr) {
        console.error("Error fetching stats:", xhr);
        showAlert("danger", "Error fetching stats: " + (xhr.responseJSON?.message || xhr.statusText));
      }
    });
  }

  // Stat cards charts
  function renderTrendChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas element with id "${canvasId}" not found.`);
      return;
    }

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["5d ago", "4d ago", "3d ago", "2d ago", "Today"],
        datasets: [{
          data: data,
          borderColor: "#007bff",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  // Stats Overview bar chart
  function renderStatsChart(stats) {
    const ctx = document.getElementById("statsChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Students", "Courses", "Earnings ($)", "Rating (out of 5)"],
        datasets: [{
          label: "Instructor Stats",
          data: [
            stats.studentCount,
            stats.courseCount,
            stats.totalEarnings,
            stats.averageRating
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)"
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Value"
            }
          },
          x: {
            title: {
              display: true,
              text: "Metrics"
            }
          }
        }
      }
    });
  }

  fetchInstructorStats();
});
