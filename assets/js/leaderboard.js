const leaderboardData = {
    "all-time": [
      {
        name: "Complete Python Bootcamp",
        category: "Development",
        categoryTag: "Development",
        icon: "💻",
        ranking: "01",
        impressions: "24,523",
        clicks: "4,200",
        purchases: "25",
      },
      {
        name: "UI/UX Design Masterclass",
        category: "Design",
        categoryTag: "Design",
        icon: "🎨",
        ranking: "02",
        impressions: "20,560",
        clicks: "3,590",
        purchases: "19",
      },
      {
        name: "Advanced Video Editing",
        category: "Photography",
        categoryTag: "Photography",
        icon: "🎥",
        ranking: "03",
        impressions: "15,480",
        clicks: "3,150",
        purchases: "15",
      },
    ],
    "this-month": [
      {
        name: "Digital Marketing Essentials",
        category: "Marketing",
        categoryTag: "Marketing",
        icon: "📱",
        ranking: "01",
        impressions: "12,345",
        clicks: "2,100",
        purchases: "18",
      },
      {
        name: "Web Development Bootcamp",
        category: "Development",
        categoryTag: "Development",
        icon: "🌐",
        ranking: "02",
        impressions: "10,890",
        clicks: "1,890",
        purchases: "15",
      },
      {
        name: "Photography Fundamentals",
        category: "Photography",
        categoryTag: "Photography",
        icon: "📸",
        ranking: "03",
        impressions: "8,760",
        clicks: "1,450",
        purchases: "12",
      },
    ],
    "this-week": [
      {
        name: "JavaScript Mastery",
        category: "Development",
        categoryTag: "Development",
        icon: "⚡",
        ranking: "01",
        impressions: "5,678",
        clicks: "980",
        purchases: "8",
      },
      {
        name: "Social Media Strategy",
        category: "Marketing",
        categoryTag: "Marketing",
        icon: "🎯",
        ranking: "02",
        impressions: "4,590",
        clicks: "820",
        purchases: "6",
      },
      {
        name: "Graphic Design Essentials",
        category: "Design",
        categoryTag: "Design",
        icon: "✏️",
        ranking: "03",
        impressions: "3,450",
        clicks: "650",
        purchases: "5",
      },
    ],
  };

  function initializeTrendCharts() {
    const options = {
      chart: {
        type: "line",
        height: 30,
        sparkline: { enabled: true },
        animations: { enabled: true },
      },
      stroke: { width: 2, curve: "smooth" },
      colors: ["#6C5DD3"],
      tooltip: { enabled: false },
    };

    document.querySelectorAll(".trend-chart").forEach((chart) => {
      const data = Array.from({ length: 10 }, () =>
        Math.floor(Math.random() * 100)
      );
      new ApexCharts(chart, {
        ...options,
        series: [{ data }],
      }).render();
    });
  }

  function updateLeaderboard(period) {
    const tableContainer = document.getElementById("leaderboardTable");
    const tbody = document.getElementById("leaderboardBody");

    tableContainer.classList.add("fade");

    setTimeout(() => {
      tbody.innerHTML = "";

      leaderboardData[period].forEach((course) => {
        tbody.innerHTML += `
          <tr>
            <td>
              <div class="d-flex align-items-center text-start">
                <div class="course-thumbnail">${course.icon}</div>
                <div class="course-info">
                  <h6>${course.name}</h6>
                  <small>${course.category}</small>
                </div>
              </div>
            </td>
            <td><span class="category-tag">${course.categoryTag}</span></td>
            <td class="ranking">${course.ranking}</td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-2">
                ${course.impressions}
                <div class="trend-chart"></div>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-2">
                ${course.clicks}
                <div class="trend-chart"></div>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-2">
                ${course.purchases}
                <div class="trend-chart"></div>
              </div>
            </td>
          </tr>
        `;
      });

      initializeTrendCharts();
      tableContainer.classList.remove("fade");
    }, 300);
  }

  document.querySelectorAll(".filter-tabs .btn").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelector(".filter-tabs .btn.active")
        .classList.remove("active");
      button.classList.add("active");
      updateLeaderboard(button.dataset.period);
    });
  });

  // Initialize with all-time data
  updateLeaderboard("all-time");

  // Add refresh functionality
  document.querySelector(".btn-primary").addEventListener("click", () => {
    const activePeriod = document.querySelector(".filter-tabs .btn.active")
      .dataset.period;
    updateLeaderboard(activePeriod);
  });

  // Add export functionality
  document
    .querySelector(".btn-outline-primary")
    .addEventListener("click", () => {
      const activePeriod = document.querySelector(
        ".filter-tabs .btn.active"
      ).dataset.period;
      const data = leaderboardData[activePeriod];
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Course Name,Category,Ranking,Impressions,Clicks,Purchases\n" +
        data
          .map((row) =>
            [
              row.name,
              row.category,
              row.ranking,
              row.impressions,
              row.clicks,
              row.purchases,
            ].join(",")
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `leaderboard-${activePeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });