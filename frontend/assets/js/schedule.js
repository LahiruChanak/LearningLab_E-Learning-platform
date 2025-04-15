$(document).ready(function () {
    // Bootstrap Tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    let currentDate = new Date();
    let currentView = "month";
    const token = localStorage.getItem('token');

    if (!token) {
        showAlert("danger", "Please login to the system to submit your request.");

        setTimeout( () => {
            window.location.href = "../index.html";
        }, 2000);
    }

    // Fetch courses for modal
    function fetchCourses() {
        $.ajax({
            url: "http://localhost:8080/api/v1/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                const courseSelect = $('#eventCourse');
                courseSelect.empty().append('<option value="">-- Select Course --</option>');
                response.data.forEach(course => {
                    courseSelect.append(`<option value="${course.courseId}">${course.courseId} - ${course.title}</option>`);
                });
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function renderMonthSelector(date) {
        const monthSelector = $("#monthSelector");
        monthSelector.empty();
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (let i = -2; i <= 2; i++) {
            const monthDate = new Date(date);
            monthDate.setMonth(date.getMonth() + i);
            const monthName = months[monthDate.getMonth()];
            const isActive = monthDate.getMonth() === date.getMonth() &&
                monthDate.getFullYear() === date.getFullYear();
            monthSelector.append(
                `<span class="${isActive ? "active" : ""}" data-month="${monthDate.getMonth()}" data-year="${monthDate.getFullYear()}">${monthName}</span>`
            );
        }
    }

    function renderMonthView(date) {
        const calendarView = $("#calendarView");
        calendarView.empty();
        calendarView.removeClass("week-view").addClass("calendar-grid");
        calendarView.html('<div class="loading">Loading schedules...</div>');

        const month = date.getMonth();
        const year = date.getFullYear();
        $("#monthYear").text(
            date.toLocaleString("default", { month: "long", year: "numeric" })
        );

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(year, month, 1);
        startDate.setDate(1 - firstDay.getDay());
        const endDate = new Date(year, month + 1, 0);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        // Fetch all schedules
        $.ajax({
            url: `http://localhost:8080/api/v1/schedule`,
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (events) {
                calendarView.empty();

                const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                weekdays.forEach((day) => {
                    calendarView.append(`<div class="day-header">${day}</div>`);
                });

                // Render days
                let currentDay = new Date(startDate);
                while (currentDay <= endDate) {
                    const dateStr = currentDay.toISOString().split('T')[0];
                    const isCurrentMonth = currentDay.getMonth() === month;
                    const isToday = currentDay.toDateString() === new Date().toDateString();
                    let dayHtml = `<div class="day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" data-date="${dateStr}">`;
                    dayHtml += `<div class="day-number">${currentDay.getDate()}</div>`;

                    // Filter events for this day
                    const dayEvents = events.filter(event =>
                        new Date(event.startTime).toISOString().split('T')[0] === dateStr
                    ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                    if (dayEvents.length > 0) {
                        dayHtml += `<div class="events-container">`;
                        dayEvents.forEach((event) => {
                            const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const summary = `Course ID: ${event.courseId} <br/> Time: ${startTime}-${endTime} <br/> Type: ${
                                event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
                            } <br/> Description: ${event.description || "No description"}`;

                            dayHtml += `<div class="event event-${event.eventType}" data-id="${event.scheduleId}">
                                    ${startTime}-${endTime} ${event.title}
                                    <span class="delete-btn" data-id="${event.scheduleId}">×</span>
                                    <div class="event-tooltip">${summary}</div>
                                  </div>`;
                        });
                        dayHtml += `</div>`;
                    }
                    dayHtml += "</div>";
                    calendarView.append(dayHtml);
                    currentDay.setDate(currentDay.getDate() + 1);
                }

                // Apply animation
                setTimeout(() => calendarView.addClass("active"), 50);
            },
            error: function (xhr) {
                calendarView.html('<div class="error">Failed to load schedules. Please try again.</div>');
                if (xhr.status === 401) {
                    showAlert("danger", "Session expired. Please login again.");
                } else {
                    showAlert("danger", "Failed to load schedules: " + xhr.responseText);
                }
            }
        });
    }

    function renderWeekView(date) {
        const calendarView = $("#calendarView");
        calendarView.empty();
        calendarView.removeClass("calendar-grid").addClass("week-view");
        calendarView.html('<div class="loading">Loading schedules...</div>');

        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }

        // Fetch all schedules
        $.ajax({
            url: `http://localhost:8080/api/v1/schedule`,
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (events) {
                calendarView.empty();

                let weekHeader = '<div class="week-header">';
                weekDays.forEach((day) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayName = day.toLocaleString("default", { weekday: "short" });
                    weekHeader += `<div class="${isToday ? "today" : ""}">${day.getDate()} ${dayName}</div>`;
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
                        const dayEvents = events.filter(event =>
                            new Date(event.startTime).toISOString().split('T')[0] === dateStr &&
                            new Date(event.startTime).getHours() === parseInt(time.split(':')[0])
                        ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                        if (dayEvents.length > 0) {
                            dayEvents.forEach((event) => {
                                const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const summary = `Course ID: ${event.courseId} <br/> Time: ${startTime}-${endTime} <br/> Type: ${
                                    event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
                                } <br/> Description: ${event.description || "No description"}`;

                                eventsHtml += `<div class="event event-${event.eventType}" data-id="${event.scheduleId}">
                                            ${startTime}-${endTime} ${event.title}
                                            <span class="delete-btn" data-id="${event.scheduleId}">×</span>
                                            <div class="event-tooltip">${summary}</div>
                                          </div>`;
                            });
                        } else {
                            eventsHtml += `<div class="no-events"></div>`;
                        }
                        weekBody += `<div class="week-event">${eventsHtml}</div>`;
                    });
                    weekBody += "</div></div>";
                });
                weekBody += "</div>";
                calendarView.append(weekBody);

                // Apply animation
                setTimeout(() => calendarView.addClass("active"), 50);
            },
            error: function (xhr) {
                calendarView.html('<div class="error">Failed to load schedules. Please try again.</div>');
                if (xhr.status === 401) {
                    showAlert("danger", "Session expired. Please login again.");
                } else {
                    showAlert("danger", "Failed to load schedules: " + xhr.responseText);
                }
            }
        });
    }

    function renderCalendar() {
        $(".calendar").addClass("fade-out");
        setTimeout(() => {
            renderMonthSelector(currentDate);
            $("#calendarView").empty();
            if (currentView === "month") {
                renderMonthView(currentDate);
            } else {
                renderWeekView(currentDate);
            }
            $(".calendar").removeClass("fade-out").addClass("fade-in");
        }, 300);
    }

    // Initial setup
    fetchCourses();
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
        $("#eventId").val("");
        $("#eventCourse").val("");
        $("#eventTitle").val("");
        $("#eventDate").val(currentDate.toISOString().split("T")[0]);
        $("#eventTime").val("08:00");
        $("#eventDuration").val("1");
        $("#eventType").val("lecture");
        $("#eventRecurrence").val("none");
        $("#eventDescription").val("");
        $("#eventModal").modal("show");
    });

    // Edit event or show details
    $(document).on("click", ".event", function (e) {
        if (!$(e.target).hasClass("delete-btn")) {
            const id = $(this).data("id");
            $.ajax({
                url: `http://localhost:8080/api/v1/schedule/${id}`,
                type: "GET",
                headers: {"Authorization": "Bearer " + token},
                success: function (event) {
                    if (e.ctrlKey) {
                        $("#detailCourse").text(event.courseId);
                        $("#detailTitle").text(event.title);
                        $("#detailDate").text(new Date(event.startTime).toISOString().split('T')[0]);
                        $("#detailTime").text(
                            `${new Date(event.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })} - ` +
                            `${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
                        );
                        const duration = (new Date(event.endTime) - new Date(event.startTime)) / 3600000;
                        $("#detailDuration").text(`${duration} Hour${duration > 1 ? "s" : ""}`);
                        $("#detailType").text(event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1));
                        $("#detailRecurrence").text(event.recurrence.charAt(0).toUpperCase() + event.recurrence.slice(1));
                        $("#detailDescription").text(event.description || "No description");
                        $("#eventDetailsModal").modal("show");
                    } else {
                        $("#modalTitle").text("Edit Course Event");
                        $("#eventId").val(event.scheduleId);
                        $("#eventCourse").val(event.courseId);
                        $("#eventTitle").val(event.title);
                        $("#eventDate").val(new Date(event.startTime).toISOString().split('T')[0]);
                        $("#eventTime").val(new Date(event.startTime).toTimeString().slice(0, 5));
                        const duration = (new Date(event.endTime) - new Date(event.startTime)) / 3600000;
                        $("#eventDuration").val(duration.toString());
                        $("#eventType").val(event.eventType);
                        $("#eventRecurrence").val(event.recurrence);
                        $("#eventDescription").val(event.description);
                        $("#eventModal").modal("show");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", "Failed to fetch event: " + xhr.responseText);
                }
            });
        }
    });

    // Delete event
    $(document).on("click", ".delete-btn", function () {
        const id = $(this).data("id");
        $.ajax({
            url: `http://localhost:8080/api/v1/schedule/${id}`,
            type: "DELETE",
            headers: {"Authorization": "Bearer " + token},
            success: function () {
                renderCalendar();
            },
            error: function (xhr) {
                showAlert("danger", "Failed to delete event: " + xhr.responseText);
            }
        });
    });

    // Save event
    $("#saveEvent").click(function () {
        const id = $("#eventId").val();
        const courseId = $("#eventCourse").val();
        const title = $("#eventTitle").val();
        const date = $("#eventDate").val();
        const time = $("#eventTime").val();
        const duration = parseFloat($("#eventDuration").val());
        const eventType = $("#eventType").val();
        const recurrence = $("#eventRecurrence").val();
        const description = $("#eventDescription").val();

        if (title && date && courseId) {
            const startTime = new Date(`${date}T${time}:00`);
            const endTime = new Date(startTime.getTime() + duration * 3600000);

            const eventData = {
                scheduleId: id ? parseInt(id) : null,
                courseId: parseInt(courseId),
                title,
                description,
                startTime: startTime,
                endTime: endTime,
                eventType,
                recurrence
            };

            $.ajax({
                url: id ? `http://localhost:8080/api/v1/schedule/${id}` : 'http://localhost:8080/api/v1/schedule',
                type: id ? 'PUT' : 'POST',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(eventData),
                success: function () {
                    $("#eventModal").modal("hide");
                    renderCalendar();
                },
                error: function (xhr) {
                    showAlert("danger", "Failed to save event: " + xhr.responseText);
                }
            });
        } else {
            showAlert("warning", "Please fill in all required fields.");
        }
    });

    // Select arrow animation
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