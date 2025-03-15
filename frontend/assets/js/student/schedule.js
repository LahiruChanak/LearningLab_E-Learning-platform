$(document).ready(function () {
  // Bootstrap Tooltip
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Mock data
  let currentDate = new Date("2025-03-12");
  let currentView = "month";
  let events = {
    "2025-03-13": [
      {
        title: "English Lesson",
        time: "08:30",
        duration: 2,
        type: "lecture",
        recurrence: "weekly",
        description: "Zoom: english.zoom.us",
      },
      {
        title: "English Lesson",
        time: "11:30",
        duration: 1,
        type: "lecture",
        recurrence: "none",
        description: "Classroom 4",
      },
      {
        title: "English Lesson",
        time: "15:30",
        duration: 1.5,
        type: "lecture",
        recurrence: "none",
        description: "Zoom: english.zoom.us",
      },
    ],
    "2025-03-15": [
      {
        title: "Math Quiz",
        time: "10:00",
        duration: 1,
        type: "quiz",
        recurrence: "none",
        description: "Online quiz portal",
      },
    ],
  };

  function renderMonthSelector(date) {
    const monthSelector = $("#monthSelector");
    monthSelector.empty();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    for (let i = -2; i <= 2; i++) {
      const monthDate = new Date(date);
      monthDate.setMonth(date.getMonth() + i);
      const monthName = months[monthDate.getMonth()];
      const isActive =
        monthDate.getMonth() === date.getMonth() &&
        monthDate.getFullYear() === date.getFullYear();
      monthSelector.append(
        `<span class="${
          isActive ? "active" : ""
        }" data-month="${monthDate.getMonth()}" data-year="${monthDate.getFullYear()}">${monthName}</span>`
      );
    }
  }

  function renderMonthView(date) {
    const calendarView = $("#calendarView");
    calendarView.empty();
    calendarView.removeClass("week-view").addClass("calendar-grid");

    const month = date.getMonth();
    const year = date.getFullYear();
    $("#monthYear").text(
      date.toLocaleString("default", { month: "long", year: "numeric" })
    );

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      calendarView.append(`<div class="day-header">${day}</div>`);
    });

    // Empty cells for days from the previous month
    for (let i = 0; i < startingDay; i++) {
      const prevMonthLastDay = new Date(year, month, 0);
      const prevDay = prevMonthLastDay.getDate() - startingDay + i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;

      // Format the date string
      const prevYearStr = prevYear.toString();
      const prevMonthStr = (prevMonth + 1).toString().padStart(2, "0");
      const prevDayStr = prevDay.toString().padStart(2, "0");
      const prevDateStr = `${prevYearStr}-${prevMonthStr}-${prevDayStr}`;

      let dayHtml = `<div class="day prev-month-day" data-date="${prevDateStr}">`;
      dayHtml += `<div class="day-number prev-month-number">${prevDay}</div>`;

      // Check if there are events for this day
      if (events[prevDateStr]) {
        events[prevDateStr].sort((a, b) => a.time.localeCompare(b.time));
        dayHtml += `<div class="events-container">`;
        events[prevDateStr].forEach((event, index) => {
          const endTime = calculateEndTime(event.time, event.duration);
          const summary = `Time: ${event.time}-${endTime} <br/> Type: ${
            event.type.charAt(0).toUpperCase() + event.type.slice(1)
          } <br/> Description: ${event.description || "No description"}`;

          dayHtml += `<div class="event event-${event.type}" data-date="${prevDateStr}" data-index="${index}">
                        ${event.time}-${endTime} ${event.title}
                        <span class="delete-btn" data-date="${prevDateStr}" data-index="${index}">×</span>
                        <div class="event-tooltip">${summary}</div>
                      </div>`;
        });
        dayHtml += `</div>`;
      }

      dayHtml += "</div>";
      calendarView.append(dayHtml);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      // Format date as YYYY-MM-DD string directly
      const yearStr = year.toString();
      const monthStr = (month + 1).toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const isToday =
        new Date(year, month, day).toDateString() === new Date().toDateString();
      let dayHtml = `<div class="day ${
        isToday ? "today" : ""
      }" data-date="${dateStr}">`;
      dayHtml += `<div class="day-number">${day}</div>`;

      if (events[dateStr]) {
        events[dateStr].sort((a, b) => a.time.localeCompare(b.time));
        dayHtml += `<div class="events-container">`;
        events[dateStr].forEach((event, index) => {
          const endTime = calculateEndTime(event.time, event.duration);
          const summary = `Time: ${event.time}-${endTime} <br/> Type: ${
            event.type.charAt(0).toUpperCase() + event.type.slice(1)
          } <br/> Description: ${event.description || "No description"}`;

          dayHtml += `<div class="event event-${event.type}" data-date="${dateStr}" data-index="${index}">
                        ${event.time}-${endTime} ${event.title}
                        <span class="delete-btn" data-date="${dateStr}" data-index="${index}">×</span>
                        <div class="event-tooltip">${summary}</div>
                      </div>`;
        });
        dayHtml += `</div>`;
      }
      dayHtml += "</div>";
      calendarView.append(dayHtml);
    }

    // Fill in days from next month if needed
    const totalDaysShown = startingDay + daysInMonth;
    const remainingCells = 42 - totalDaysShown;

    if (remainingCells > 0) {
      for (let i = 1; i <= remainingCells; i++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;

        // Format the date string
        const nextYearStr = nextYear.toString();
        const nextMonthStr = (nextMonth + 1).toString().padStart(2, "0");
        const nextDayStr = i.toString().padStart(2, "0");
        const nextDateStr = `${nextYearStr}-${nextMonthStr}-${nextDayStr}`;

        let dayHtml = `<div class="day next-month-day" data-date="${nextDateStr}">`;
        dayHtml += `<div class="day-number next-month-number">${i}</div>`;

        // Check if there are events for this day
        if (events[nextDateStr]) {
          events[nextDateStr].sort((a, b) => a.time.localeCompare(b.time));
          dayHtml += `<div class="events-container">`;
          events[nextDateStr].forEach((event, index) => {
            const endTime = calculateEndTime(event.time, event.duration);
            const summary = `Time: ${event.time}-${endTime} <br/> Type: ${
              event.type.charAt(0).toUpperCase() + event.type.slice(1)
            } <br/> Description: ${event.description || "No description"}`;

            dayHtml += `<div class="event event-${event.type}" data-date="${nextDateStr}" data-index="${index}">
                          ${event.time}-${endTime} ${event.title}
                          <span class="delete-btn" data-date="${nextDateStr}" data-index="${index}">×</span>
                          <div class="event-tooltip">${summary}</div>
                        </div>`;
          });
          dayHtml += `</div>`;
        }

        dayHtml += "</div>";
        calendarView.append(dayHtml);
      }
    }

    // Apply animation
    setTimeout(() => calendarView.addClass("active"), 50);
  }

  function renderWeekView(date) {
    const calendarView = $("#calendarView");
    calendarView.empty();
    calendarView.removeClass("calendar-grid").addClass("week-view");

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    let weekHeader = '<div class="week-header">';
    weekDays.forEach((day) => {
      const isToday = day.toDateString() === new Date().toDateString();
      const dayName = day.toLocaleString("default", { weekday: "short" });
      weekHeader += `<div class="${
        isToday ? "today" : ""
      }">${day.getDate()} ${dayName}</div>`;
    });
    weekHeader += "</div>";
    calendarView.append(weekHeader);

    // Show all 24 hours
    const timeSlots = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
    let weekBody = '<div class="week-body">';
    timeSlots.forEach((time) => {
      weekBody += `<div class="time-slot"><div class="time-label">${time}</div><div class="time-events">`;
      weekDays.forEach((day) => {
        const dateStr = day.toISOString().split("T")[0];
        let eventsHtml = "";
        if (events[dateStr]) {
          events[dateStr].forEach((event, index) => {
            const eventStartHour = parseInt(event.time.split(":")[0]);
            const slotHour = parseInt(time.split(":")[0]);
            if (eventStartHour === slotHour) {
              const endTime = calculateEndTime(event.time, event.duration);
              const summary = `Time: ${event.time}-${endTime} <br/> Type: ${
                event.type.charAt(0).toUpperCase() + event.type.slice(1)
              } <br/> Description: ${event.description || "No description"}`;

              eventsHtml += `<div class="event event-${event.type}" data-date="${dateStr}" data-index="${index}">
                              ${event.time}-${endTime} ${event.title}
                              <span class="delete-btn" data-date="${dateStr}" data-index="${index}">×</span>
                              <div class="event-tooltip">${summary}</div>
                            </div>`;
            }
          });
        }
        weekBody += `<div class="week-event">${eventsHtml}</div>`;
      });
      weekBody += "</div></div>";
    });
    weekBody += "</div>";
    calendarView.append(weekBody);

    // Apply animation
    setTimeout(() => calendarView.addClass("active"), 50);
  }

  function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + Math.floor(duration);
    const endMinutes = minutes + (duration % 1) * 60;
    return `${endHours
      .toString()
      .padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  }

  function addRecurringEvents(dateStr, eventData) {
    if (eventData.recurrence === "none") return;

    // Create date object only for calculation purposes
    // Use UTC methods to avoid timezone issues
    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2]);

    const startDate = new Date(Date.UTC(year, month, day));

    let interval;
    if (eventData.recurrence === "weekly") interval = 7;
    else if (eventData.recurrence === "biweekly") interval = 14;
    else if (eventData.recurrence === "monthly") interval = 30;

    for (let i = 1; i <= 4; i++) {
      const nextDate = new Date(startDate);
      if (eventData.recurrence === "monthly") {
        nextDate.setUTCMonth(nextDate.getUTCMonth() + i);
      } else {
        nextDate.setUTCDate(nextDate.getUTCDate() + i * interval);
      }

      // Format as YYYY-MM-DD
      const nextYear = nextDate.getUTCFullYear();
      const nextMonth = (nextDate.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0");
      const nextDay = nextDate.getUTCDate().toString().padStart(2, "0");
      const nextDateStr = `${nextYear}-${nextMonth}-${nextDay}`;

      if (!events[nextDateStr]) events[nextDateStr] = [];
      events[nextDateStr].push({ ...eventData });

      // For debugging
      console.log("Recurring event added to:", nextDateStr);
    }
  }

  function renderCalendar() {
    // Fade out before rendering
    $(".calendar").addClass("fade-out");
    setTimeout(() => {
      renderMonthSelector(currentDate);
      $("#calendarView").empty();
      if (currentView === "month") {
        renderMonthView(currentDate);
      } else {
        renderWeekView(currentDate);
      }
      // Fade in after rendering
      $(".calendar").removeClass("fade-out").addClass("fade-in");
    }, 300);
  }

  // Initial render
  renderCalendar();

  // View toggle
  $("#viewSelect").change(function () {
    currentView = $(this).val();
    renderCalendar();
  });

  // Navigation
  $("#prevMonth").click(function () {
    if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 7);
    }
    renderCalendar();
  });

  $("#nextMonth").click(function () {
    if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }
    renderCalendar();
  });

  // Month selector
  $(document).on("click", ".month-selector span", function () {
    const month = parseInt($(this).data("month"));
    const year = parseInt($(this).data("year"));
    currentDate.setMonth(month);
    currentDate.setFullYear(year);
    renderCalendar();
  });

  // Add event
  $("#addEventBtn").click(function () {
    $("#modalTitle").text("Add New Course Event");
    $("#eventDate").val(currentDate.toISOString().split("T")[0]);
    $("#eventTitle").val("");
    $("#eventTime").val("08:00");
    $("#eventDuration").val("1");
    $("#eventType").val("lecture");
    $("#eventRecurrence").val("none");
    $("#eventDescription").val("");
    $("#eventIndex").val("");
    $("#eventModal").modal("show");
  });

  // Edit event or show details
  $(document).on("click", ".event", function (e) {
    if (!$(e.target).hasClass("delete-btn")) {
      const date = $(this).data("date");
      const index = $(this).data("index");
      const event = events[date][index];

      if (e.ctrlKey) {
        $("#detailTitle").text(event.title);
        $("#detailDate").text(date);
        $("#detailTime").text(
          `${event.time} - ${calculateEndTime(event.time, event.duration)}`
        );
        $("#detailDuration").text(
          `${event.duration} Hour${event.duration > 1 ? "s" : ""}`
        );
        $("#detailType").text(
          event.type.charAt(0).toUpperCase() + event.type.slice(1)
        );
        $("#detailRecurrence").text(
          event.recurrence.charAt(0).toUpperCase() + event.recurrence.slice(1)
        );
        $("#detailDescription").text(event.description || "No description");
        $("#eventDetailsModal").modal("show");
      } else {
        $("#modalTitle").text("Edit Course Event");
        $("#eventDate").val(date);
        $("#eventTitle").val(event.title);
        $("#eventTime").val(event.time);
        $("#eventDuration").val(event.duration);
        $("#eventType").val(event.type);
        $("#eventRecurrence").val(event.recurrence);
        $("#eventDescription").val(event.description);
        $("#eventIndex").val(index);
        $("#eventModal").modal("show");
      }
    }
  });

  // Delete event
  $(document).on("click", ".delete-btn", function () {
    const date = $(this).data("date");
    const index = $(this).data("index");
    events[date].splice(index, 1);
    if (events[date].length === 0) delete events[date];
    renderCalendar();
  });

  // Save event
  $("#saveEvent").click(function () {
    const dateStr = $("#eventDate").val(); // Format: YYYY-MM-DD
    const title = $("#eventTitle").val();
    const time = $("#eventTime").val();
    const duration = parseFloat($("#eventDuration").val());
    const type = $("#eventType").val();
    const recurrence = $("#eventRecurrence").val();
    const description = $("#eventDescription").val();
    const index = $("#eventIndex").val();

    if (title && dateStr) {
      // Create event data
      const eventData = {
        title,
        time,
        duration,
        type,
        recurrence,
        description,
      };

      // Ensure the dateStr is used directly without any date object conversion
      if (!events[dateStr]) events[dateStr] = [];

      if (index === "") {
        // Adding new event
        events[dateStr].push(eventData);
        if (recurrence !== "none") {
          addRecurringEvents(dateStr, eventData);
        }
      } else {
        // Editing existing event
        const oldDate = $('.event[data-index="' + index + '"]').data("date");
        if (oldDate === dateStr) {
          events[dateStr][index] = eventData;
        } else {
          // Event date changed
          events[oldDate].splice(index, 1);
          if (events[oldDate].length === 0) delete events[oldDate];
          events[dateStr].push(eventData);
          if (recurrence !== "none") {
            addRecurringEvents(dateStr, eventData);
          }
        }
      }

      // For debugging
      console.log("Event saved to date:", dateStr);
      console.log("Current events:", JSON.stringify(events));

      renderCalendar();
      $("#eventModal").modal("hide");
    }
  });

  // rotate custom arrow when select menu focus
  $("#viewSelect").on("focus", function () {
    $(".custom-arrow i")
      .removeClass("hgi-arrow-down-01")
      .addClass("hgi-arrow-up-01");
  });

  $("#viewSelect").on("blur", function () {
    $(".custom-arrow i")
      .removeClass("hgi-arrow-up-01")
      .addClass("hgi-arrow-down-01");
  });
});
