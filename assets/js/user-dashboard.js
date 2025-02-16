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

// progress of the course
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
