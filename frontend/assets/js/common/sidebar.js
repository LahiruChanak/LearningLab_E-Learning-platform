document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleBtn");
  const toggleIcon = toggleBtn.querySelector("i");
  const logoContainer = document.getElementById("logo-container");
  const logo = document.getElementById("logo");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebar.classList.toggle("show");

    // logo and menu button
    if (sidebar.classList.contains("collapsed")) {
      logoContainer.style.flexDirection = "column-reverse";
      logo.setAttribute("src", "../../assets/images/logo-mini.png");
    } else {
      logoContainer.style.flexDirection = "row";
      logo.setAttribute("src", "../../assets/images/logo-full.png");
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

  // handle logout function
  $(".logout").on("click", function () {
    localStorage.removeItem("token");
    showAlert("success", "Logged out successfully! Redirecting...");
    setTimeout( () => {
      window.location.href = "../../../../frontend/index.html";
    }, 3000);
  });
});
