$(document).ready(function () {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (role !== "ADMIN" && !token) {
        showAlert("danger", "Unauthorized access! Redirecting to login page...");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    }

    function fetchNewStudentsData(period) {
        if (!token) {
            showAlert("danger", "Please login to the system to view data.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/all",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    const students = response.data.filter(user => user.role === "STUDENT");
                    const instructors = response.data.filter(user => user.role === "INSTRUCTOR");
                    let categories = [];
                    let studentData = [];
                    let instructorData = [];

                    const today = new Date();

                    if (period === "weekly") {
                        categories = ["Week-3", "Week-2", "Week-1", "This Week"];
                        studentData = [0, 0, 0, 0];
                        instructorData = [0, 0, 0, 0];

                        students.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const weeksDiff = Math.floor((today - createdAt) / (7 * 24 * 60 * 60 * 1000));
                            if (weeksDiff >= 0 && weeksDiff < 4) {
                                studentData[3 - weeksDiff]++;
                            }
                        });

                        instructors.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const weeksDiff = Math.floor((today - createdAt) / (7 * 24 * 60 * 60 * 1000));
                            if (weeksDiff >= 0 && weeksDiff < 4) {
                                instructorData[3 - weeksDiff]++;
                            }
                        });
                    } else if (period === "monthly") {
                        // Last 6 months
                        categories = [];
                        studentData = [];
                        instructorData = [];
                        for (let i = 5; i >= 0; i--) {
                            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                            categories.push(date.toLocaleString("default", {month: "short"}));
                            studentData.push(0);
                            instructorData.push(0);
                        }

                        students.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const monthDiff =
                                (today.getFullYear() - createdAt.getFullYear()) * 12 +
                                today.getMonth() - createdAt.getMonth();
                            if (monthDiff >= 0 && monthDiff < 6) {
                                studentData[5 - monthDiff]++;
                            }
                        });

                        instructors.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const monthDiff =
                                (today.getFullYear() - createdAt.getFullYear()) * 12 +
                                today.getMonth() - createdAt.getMonth();
                            if (monthDiff >= 0 && monthDiff < 6) {
                                instructorData[5 - monthDiff]++;
                            }
                        });
                    } else if (period === "yearly") {
                        // Last 3 years
                        categories = [];
                        studentData = [];
                        instructorData = [];
                        for (let i = 2; i >= 0; i--) {
                            const year = today.getFullYear() - i;
                            categories.push(year.toString());
                            studentData.push(0);
                            instructorData.push(0);
                        }

                        students.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const yearDiff = today.getFullYear() - createdAt.getFullYear();
                            if (yearDiff >= 0 && yearDiff < 3) {
                                studentData[2 - yearDiff]++;
                            }
                        });

                        instructors.forEach(user => {
                            const createdAt = new Date(user.createdAt);
                            const yearDiff = today.getFullYear() - createdAt.getFullYear();
                            if (yearDiff >= 0 && yearDiff < 3) {
                                instructorData[2 - yearDiff]++;
                            }
                        });
                    }

                    // ApexCharts options
                    const options = {
                        chart: {
                            type: "bar",
                            height: 300,
                            toolbar: {show: false}
                        },
                        series: [
                            {
                                name: "Students",
                                data: studentData
                            },
                            {
                                name: "Instructors",
                                data: instructorData
                            }
                        ],
                        xaxis: {
                            categories: categories,
                            title: {
                                text: period.charAt(0).toUpperCase() + period.slice(1)
                            }
                        },
                        yaxis: {
                            title: {
                                text: "Number of Users"
                            },
                            min: 0,
                            forceNiceScale: true
                        },
                        colors: ["#007bff", "#28a745"],
                        dataLabels: {
                            enabled: true,
                            formatter: val => val.toString().padStart(2, "0")
                        },
                        plotOptions: {
                            bar: {
                                columnWidth: "50%",
                                borderRadius: 5,
                                borderRadiusApplication: 'end',
                                distributed: false
                            }
                        },
                        grid: {
                            borderColor: "#e9ecef"
                        }
                    };

                    // Render or update chart
                    const chart = new ApexCharts(document.querySelector("#newStudentsChart"), options);
                    chart.render();

                    // Clean up previous chart (ApexCharts handles this internally, but ensure no overlap)
                    $("#newStudentsChart").data("chart", chart);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching users: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    $(".btn-group .btn").click(function () {
        $(".btn-group .btn").removeClass("active");
        $(this).addClass("active");

        const period = $(this).data("period");

        // Destroy previous chart if exists
        const prevChart = $("#newStudentsChart").data("chart");
        if (prevChart) {
            prevChart.destroy();
        }

        fetchNewStudentsData(period);
    });

    fetchNewStudentsData("weekly");

    /* --------------------------------------------------- Stats Card --------------------------------------------------- */

    function fetchUserCount() {
        if (!token) {
            showAlert("danger", "Please login to the system to view users.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/all",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    const users = response.data;
                    const studentCount = users.filter(user => user.role === "STUDENT").length;
                    const instructorCount = users.filter(user => user.role === "INSTRUCTOR").length;

                    $("#student-count").text(studentCount.toString().padStart(2, '0'));
                    $("#instructor-count").text(instructorCount.toString().padStart(2, '0'));
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching users: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function fetchCourseCount() {
        if (!token) {
            showAlert("danger", "Please login to the system to view users.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    const courses = response.data;
                    const courseCount = courses.length;
                    const totalEarnings = courses.reduce((sum, course) => sum + (course.price || 0), 0);

                    $("#course-count").text(courseCount.toString().padStart(2, '0'));
                    $("#earning-count").text(`$${Math.floor(totalEarnings).toString().padStart(2, '0')}`);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    fetchUserCount();
    fetchCourseCount();
});
