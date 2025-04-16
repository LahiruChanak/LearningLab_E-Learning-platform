$(document).ready(function () {
    const viewAll = $("#viewAll");
    const hiddenCourse = $(".hidden");
    const progressCircles = $(".progress");
    let showingAllCourses = false;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    viewAll.on("click", function () {
        showingAllCourses = !showingAllCourses;
        hiddenCourse.each(function () {
            $(this).css("display", showingAllCourses ? "flex" : "none");
        });
        viewAll.text(showingAllCourses ? "Show Less" : "View All");
    });

    progressCircles.each(function () {
        const progress = $(this).attr("data-progress");
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;

        $(this).css({
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: offset,
        });
    });

    function loadMyCourses() {
        if (!token) {
            showAlert("danger", "Please login to view your courses.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/student/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {

                const data = response.data || response;

                if (!data || !data.enrolledCourses) {
                    showAlert("danger", "No enrolled courses found.");
                    return;
                }

                const enrolledCourses = data.enrolledCourses;
                const tbody = $(".courses-table tbody");
                tbody.empty();

                enrolledCourses.forEach(course => {
                    const startDate = new Date(course.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    const levelClass = course.level === 'BEGINNER' ? 'bg-warning-subtle text-warning' :
                        course.level === 'INTERMEDIATE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
                    const formattedLevel = course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase();

                    const row = `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="course-icon">
                                        <i class="huge-icon">${course.thumbnail}</i>
                                    </div>
                                    <div class="text-start">
                                        <h6 class="mb-0">${course.title}</h6>
                                    </div>
                                </div>
                            </td>
                            <td>${startDate}</td>
                            <td></td>
                            <td>
                                <span class="badge rounded-pill px-2 ${levelClass}">
                                    ${formattedLevel}
                                </span>
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });

                const courseListContainer = $(".course-list");
                courseListContainer.empty();

                enrolledCourses.forEach(course => {
                    const courseItem = `
                        <div class="course-item">
                            <h3>${course.title}</h3>
                            <button class="btn btn-outline-primary rounded-3" onclick="window.location.href='course-content.html?courseId=${course.courseId}'">Continue</button>
                        </div>
                    `;
                    courseListContainer.append(courseItem);
                });
            },
            error: function (xhr) {
                console.error("Error fetching courses:", xhr);
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    if (role === "STUDENT") {
        loadMyCourses();
    } else if (role === "INSTRUCTOR") {
        $('li[data-page="courses"], li[data-page="billing"], li[data-page="achievements"]').addClass("d-none");
    }
});