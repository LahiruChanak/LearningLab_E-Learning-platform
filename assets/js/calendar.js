$(document).ready(function () {
  const $calendarEl = $("#calendar");

  const calendar = new FullCalendar.Calendar($calendarEl[0], {
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
    buttonText: {
      prev: "",
      next: "",
    },
    buttonHints: {
      prev: (date) =>
        `Previous month (${date.toLocaleString("default", { month: "long" })})`,
      next: (date) =>
        `Next month (${date.toLocaleString("default", { month: "long" })})`,
    },
  });

  calendar.render();

  const $prevButton = $calendarEl.find(".fc-prev-button");
  const $nextButton = $calendarEl.find(".fc-next-button");

  $prevButton.tooltip({
    title: () => {
      const date = calendar.getDate();
      date.setMonth(date.getMonth() - 1);
      return `Previous month (${date.toLocaleString("default", {
        month: "long",
      })})`;
    },
    placement: "bottom",
    trigger: "hover",
  });

  $nextButton.tooltip({
    title: () => {
      const date = calendar.getDate();
      date.setMonth(date.getMonth() + 1);
      return `Next month (${date.toLocaleString("default", {
        month: "long",
      })})`;
    },
    placement: "bottom",
    trigger: "hover",
  });

  $prevButton.on("mouseleave", function () {
    $(this).tooltip("hide");
  });

  $nextButton.on("mouseleave", function () {
    $(this).tooltip("hide");
  });
});
