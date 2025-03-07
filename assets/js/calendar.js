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
