document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Sidebar toggle functionality
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggleBtn");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    toggleBtn.classList.toggle("rotate");
  });

  // Initialize FullCalendar
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: false,
    height: "auto",
    dayMaxEvents: 2,
    events: [
      {
        title: "3D Design",
        start: "2023-03-19",
        backgroundColor: "#6C5DD3",
        borderColor: "#6C5DD3",
      },
      {
        title: "UI Design",
        start: "2023-03-23",
        backgroundColor: "#6C5DD3",
        borderColor: "#6C5DD3",
      },
    ],
    eventClick: function (info) {
      // Handle event click
      console.log("Event clicked:", info.event.title);
    },
  });

  calendar.render();

  // Handle calendar navigation
  const prevMonthBtn = document.querySelector(
    ".calendar-nav button:first-child"
  );
  const nextMonthBtn = document.querySelector(
    ".calendar-nav button:last-child"
  );

  prevMonthBtn.addEventListener("click", () => {
    calendar.prev();
    updateCalendarTitle();
  });

  nextMonthBtn.addEventListener("click", () => {
    calendar.next();
    updateCalendarTitle();
  });

  function updateCalendarTitle() {
    const calendarTitle = document.querySelector(".calendar-header h5");
    const date = calendar.getDate();
    const monthYear = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    calendarTitle.textContent = monthYear;
  }

  // Initialize progress bars animation
  const progressBars = document.querySelectorAll(".progress-bar");
  progressBars.forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";
    setTimeout(() => {
      bar.style.width = width;
      bar.style.transition = "width 1s ease-in-out";
    }, 100);
  });

  // Task item hover effect
  const taskItems = document.querySelectorAll(".task-item");
  taskItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateX(5px)";
      item.style.transition = "transform 0.3s ease";
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateX(0)";
    });
  });
});
