$(document).ready(function () {
    const role = localStorage.getItem("role");

    // Role-based navigation mapping
    const navRoutes = {
        ADMIN: {
            dashboard: "admin-dashboard.html",
            users: "admin-user-manage.html",
            categories: "admin-category.html",
            requests: "admin-instructor-request.html",
            courses: "admin-course.html",
            messages: "messages.html",
            leaderboard: "leaderboard.html",
            schedule: "schedule.html",
            logout: "../index.html"
        },
        STUDENT: {
            dashboard: "student-dashboard.html",
            courses: "student-course.html",
            messages: "messages.html",
            leaderboard: "leaderboard.html",
            schedule: "schedule.html",
            settings: "user-profile.html",
            logout: "../index.html"
        },
        INSTRUCTOR: {
            dashboard: "instructor-dashboard.html",
            courses: "admin-course.html",
            messages: "messages.html",
            leaderboard: "leaderboard.html",
            schedule: "schedule.html",
            settings: "user-profile.html",
            logout: "../index.html"
        }
    };

    // Update sidebar navigation based on the role
    function updateSidebarNavigation() {
        const routes = navRoutes[role.toUpperCase()] || navRoutes.STUDENT;

        $("#sidebar .nav-link").each(function () {
            const link = $(this);
            const title = link.data("bs-title").toLowerCase().replace(/\s+/g, "-");
            if (routes[title]) {
                link.attr("href", routes[title]);
            } else {
                link.hide();
            }
        });
    }

    // Handle logout function
    $(".logout").on("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        localStorage.setItem("role", "STUDENT");
        showAlert("success", "Logged out successfully! Redirecting...");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1000);
    });

    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");
    const logoContainer = document.getElementById("logo-container");
    const logo = document.getElementById("logo");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        sidebar.classList.toggle("show");

        // Logo and menu button
        if (sidebar.classList.contains("collapsed")) {
            logoContainer.style.flexDirection = "column-reverse";
            logo.setAttribute("src", "../assets/images/logo-mini.png");
        } else {
            logoContainer.style.flexDirection = "row";
            logo.setAttribute("src", "../assets/images/logo-full.png");
        }

        // Update tooltips based on sidebar state
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

    // Close the sidebar when clicking outside on mobile
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

    updateSidebarNavigation();

    // Active current page
    const currentPage = window.location.pathname.split("/").pop();
    $(".nav-link").removeClass("active");
    $(`.nav-link[href="${currentPage}"]`).addClass("active");

/* ------------------------------------------------ Role Base Action ------------------------------------------------ */

    if (role === "INSTRUCTOR" || role === "ADMIN") {
        $("#sidebar").removeClass("sidebar-collapsed");
        $("#logo-container img").attr("src", "../assets/images/logo-full.png");
        $("#logo-container button").removeClass("d-none");
        $("#sidebar .nav-link span").removeClass("d-none");
    }
});