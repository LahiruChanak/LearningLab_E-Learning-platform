document.addEventListener("DOMContentLoaded", function () {
  const courseSearch = document.getElementById("courseSearch");
  const sortDropdown = document.getElementById("sortDropdown");
  const filterDropdown = document.getElementById("filterDropdown");
  const activeFilters = document.getElementById("activeFilters");
  const viewToggleBtns = document.querySelectorAll("[data-view]");
  const coursesContainer = document.querySelector(".row.g-4");

  // State Management
  let currentState = {
    searchTerm: "",
    levels: [],
    durations: [],
    sortType: "date-new",
    view: "grid",
  };

  // Course Data (Sample data - would typically come from a backend API)
  let courses = [
    {
      id: 1,
      name: "Free Sketch from A to Z: Become an UX UI Designer",
      sales: 150,
      comments: 15,
      likes: 242,
      level: "beginner",
      duration: "2-5",
      date: "2024-03-01",
      image: "assets/images/courses/sketch.jpg",
      category: "UI Design",
    },
    {
      id: 2,
      name: "Android UI-UX Design And Material Design Clone",
      sales: 150,
      comments: 15,
      likes: 242,
      level: "intermediate",
      duration: "5+",
      date: "2024-02-28",
      image: "assets/images/courses/android.jpg",
      category: "UI Design",
    },
    {
      id: 3,
      name: "Photography for Beginner - Complete Guide 2021",
      sales: 150,
      comments: 15,
      likes: 242,
      level: "beginner",
      duration: "0-2",
      date: "2024-02-27",
      image: "assets/images/courses/photography.jpg",
      category: "Photography",
    },
  ];

  // Event Listeners
  courseSearch.addEventListener(
    "input",
    debounce(function (e) {
      currentState.searchTerm = e.target.value.toLowerCase();
      updateUI();
    }, 300)
  );

  document.querySelectorAll(".dropdown-item[data-sort]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      currentState.sortType = this.dataset.sort;
      updateUI();
    });
  });

  // Filter checkboxes
  document
    .querySelectorAll('input[id^="level"], input[id^="duration"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const type = this.id.startsWith("level") ? "levels" : "durations";
        if (this.checked) {
          currentState[type] = [...currentState[type], this.value];
        } else {
          currentState[type] = currentState[type].filter(
            (val) => val !== this.value
          );
        }
        updateUI();
      });
    });

  // View toggle
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      currentState.view = this.dataset.view;
      updateUI();
    });
  });

  function updateUI() {
    try {
      const filteredAndSortedCourses = filterAndSortCourses();
      updateActiveFilters();
      setView(currentState.view);
      renderCourses(filteredAndSortedCourses);
    } catch (error) {
      console.error("Error updating UI:", error);
    }
  }

  function filterAndSortCourses() {
    // Filter courses
    let filtered = courses.filter((course) => {
      const matchesSearch = course.name
        .toLowerCase()
        .includes(currentState.searchTerm);
      const matchesLevel =
        currentState.levels.length === 0 ||
        currentState.levels.includes(course.level);
      const matchesDuration =
        currentState.durations.length === 0 ||
        currentState.durations.includes(course.duration);
      return matchesSearch && matchesLevel && matchesDuration;
    });

    // Sort courses
    return filtered.sort((a, b) => {
      switch (currentState.sortType) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-new":
          return new Date(b.date) - new Date(a.date);
        case "date-old":
          return new Date(a.date) - new Date(b.date);
        case "enrolled-high":
          return b.sales - a.sales;
        case "enrolled-low":
          return a.sales - b.sales;
        default:
          return 0;
      }
    });
  }

  function updateActiveFilters() {
    activeFilters.innerHTML = "";

    // Search filter
    if (currentState.searchTerm) {
      addFilterChip(`Search: ${currentState.searchTerm}`, () => {
        courseSearch.value = "";
        currentState.searchTerm = "";
        updateUI();
      });
    }

    // Level filters
    currentState.levels.forEach((level) => {
      addFilterChip(`Level: ${level}`, () => {
        const checkbox = document.querySelector(`input[value="${level}"]`);
        if (checkbox) checkbox.checked = false;
        currentState.levels = currentState.levels.filter((l) => l !== level);
        updateUI();
      });
    });

    // Duration filters
    currentState.durations.forEach((duration) => {
      addFilterChip(`Duration: ${duration} hours`, () => {
        const checkbox = document.querySelector(`input[value="${duration}"]`);
        if (checkbox) checkbox.checked = false;
        currentState.durations = currentState.durations.filter(
          (d) => d !== duration
        );
        updateUI();
      });
    });
  }

  function addFilterChip(text, removeCallback) {
    const chip = document.createElement("span");
    chip.className =
      "badge rounded-pill bg-light text-dark me-2 mb-2 d-inline-flex align-items-center";
    chip.innerHTML = `${text} <i class="hgi-stroke hgi-multiplication-sign ms-2" style="cursor: pointer; font-size: 14px; opacity: 0.7;"></i>`;
    const closeIcon = chip.querySelector("i");
    closeIcon.addEventListener("click", removeCallback);
    closeIcon.addEventListener(
      "mouseover",
      () => (closeIcon.style.opacity = "1")
    );
    closeIcon.addEventListener(
      "mouseout",
      () => (closeIcon.style.opacity = "0.7")
    );
    activeFilters.appendChild(chip);
  }

  function setView(view) {
    viewToggleBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    coursesContainer.classList.toggle("list-view", view === "list");
  }

  function renderCourses(coursesToRender) {
    coursesContainer.innerHTML = "";

    if (coursesToRender.length === 0) {
      coursesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h5 class="text-muted">No courses found matching your criteria</h5>
                </div>
            `;
      return;
    }

    coursesToRender.forEach((course) => {
      const courseElement = document.createElement("div");
      courseElement.className = "col-md-6";

      // Highlight the searched text if there is a search term
      let displayName = course.name;
      if (currentState.searchTerm) {
        const regex = new RegExp(`(${currentState.searchTerm})`, "gi");
        displayName = course.name.replace(
          regex,
          '<span class="highlight">$1</span>'
        );
      }

      courseElement.innerHTML = `
                <div class="course-card">
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <p class="mb-1">${displayName}</p>
                            <div class="d-flex align-items-center">
                                <i class="hgi-stroke hgi-user-circle-02 me-1"></i>
                                <span>${course.sales} Sales</span>
                                <i class="hgi-stroke hgi-comment-01 ms-3 me-1"></i>
                                <span>${course.comments} Comments</span>
                                <i class="hgi-stroke hgi-favourite ms-3 me-1"></i>
                                <span>${course.likes} Likes</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="avatar-group">
                            <img src="assets/images/user.jpg" alt="Student" class="avatar">
                            <img src="assets/images/user.jpg" alt="Student" class="avatar">
                            <img src="assets/images/user.jpg" alt="Student" class="avatar">
                        </div>
                        <button class="btn btn-light">
                            <i class="hgi-stroke hgi-arrow-right-01"></i>
                        </button>
                    </div>
                </div>
            `;
      coursesContainer.appendChild(courseElement);
    });
  }

  // Debounce function for search input
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initial render
  updateUI();
});
