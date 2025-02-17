// ------------------------- Tooltip -------------------------
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
    // Remove initialDate and set to current date
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

// ------------------------ progress card ------------------------
const circle = document.querySelector(".progress");
const text = document.querySelector(".progress-text");
const circumference = 2 * Math.PI * 45; // 45 is the radius

// Set initial stroke-dasharray and stroke-dashoffset
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  text.innerHTML = `${Math.round(percent)}%`;
}

// Demo: Animate progress from 0 to 75%
let progress = 0;
const targetProgress = 75;
const duration = 1500; // 1.5 seconds
const steps = 60; // 60 steps for smooth animation
const increment = targetProgress / steps;
const stepDuration = duration / steps;

const interval = setInterval(() => {
  progress += increment;
  if (progress >= targetProgress) {
    progress = targetProgress;
    clearInterval(interval);
  }
  setProgress(progress);
}, stepDuration);

// ------------------------ Sidebar ------------------------
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = toggleBtn.querySelector("i");
const logo = document.getElementById("logo");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  sidebar.classList.toggle("show");

  // logo hide or show
  if (sidebar.classList.contains("collapsed")) {
    logo.style.visibility = "hidden";
  } else {
    logo.style.visibility = "visible";
  }

  // Destroy tooltips when sidebar is expanded
  if (!sidebar.classList.contains("collapsed")) {
    tooltipList.forEach((tooltip) => tooltip.disable());
  } else {
    tooltipList.forEach((tooltip) => tooltip.enable());
  }

  // Toggle icon rotation
  if (sidebar.classList.contains("collapsed")) {
    toggleBtn.classList.remove("rotate");
  } else {
    toggleBtn.classList.add("rotate");
  }
});

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
    }
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("show");
  }
});
