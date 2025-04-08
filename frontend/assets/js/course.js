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
    rating: 0,
    instructors: [],
    categories: [],
    contentType: "all",
    minPrice: null,
    maxPrice: null,
  };

  // Course Data (Sample data - would typically come from a backend API)
  // let courses = [
  //   {
  //     id: 1,
  //     name: "Free Sketch from A to Z: Become an UX UI Designer",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "beginner",
  //     duration: "2-5",
  //     date: "2024-03-01",
  //     image: "assets/images/courses/sketch.jpg",
  //     category: "UI Design",
  //     rating: 4.5,
  //     instructor: "John Doe",
  //     price: 0,
  //   },
  //   {
  //     id: 2,
  //     name: "Android UI-UX Design And Material Design Clone",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "intermediate",
  //     duration: "5+",
  //     date: "2024-02-28",
  //     image: "assets/images/courses/android.jpg",
  //     category: "UI Design",
  //     rating: 3.8,
  //     instructor: "Jane Smith",
  //     price: 19.99,
  //   },
  //   {
  //     id: 3,
  //     name: "Photography for Beginner - Complete Guide 2021",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "beginner",
  //     duration: "0-2",
  //     date: "2024-02-27",
  //     image: "assets/images/courses/photography.jpg",
  //     category: "Photography",
  //     rating: 5.0,
  //     instructor: "John Doe",
  //     price: 0,
  //   },
  //   {
  //     id: 4,
  //     name: "Complete Python BootCamp: Go from zero to hero in Python",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "beginner",
  //     duration: "2-5",
  //     date: "2024-02-26",
  //     image: "assets/images/courses/python.jpg",
  //     category: "Development",
  //     rating: 4.3,
  //     instructor: "Jane Smith",
  //     price: 19.99,
  //   },
  //   {
  //     id: 5,
  //     name: "Complete Web Development BootCamp: Go from zero to hero in Web",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "beginner",
  //     duration: "2-5",
  //     date: "2024-02-25",
  //     image: "assets/images/courses/web.jpg",
  //     category: "Development",
  //     rating: 2.0,
  //     instructor: "Lisa Johnson",
  //     price: 19.99,
  //   },
  //   {
  //     id: 6,
  //     name: "Complete Web Development BootCamp: Go from zero to hero in Web",
  //     sales: 150,
  //     comments: 15,
  //     likes: 242,
  //     level: "beginner",
  //     duration: "2-5",
  //     date: "2024-02-24",
  //     image: "assets/images/courses/web.jpg",
  //     category: "Marketing",
  //     rating: 1.0,
  //     instructor: "Lisa Johnson",
  //     price: 19.99,
  //   },
  // ];

  function fetchCourses(viewType = 'grid') {
    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("danger", "Please login to the system to view courses.");
      return;
    }

    $.ajax({
      url: "http://localhost:8080/api/v1/course",
      type: "GET",
      headers: { "Authorization": "Bearer " + token },
      success: function (response) {
        if (response.status === 200) {
          renderCourses(response.data, viewType);
        }
      },
      error: function (xhr) {
        showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
      }
    });
  }

  // Star Rating Event Listeners
  const stars = $(".stars i.hgi-star");

  // Add hover effects
  stars.hover(
    function () {
      const hoverRating = $(this).data("rating");
      stars.removeClass("filled");
      $(this).prevAll().addBack().addClass("filled");
    },
    function () {
      stars.removeClass("filled");
      if (currentState.rating > 0) {
        stars.slice(0, currentState.rating).addClass("filled");
      }
    }
  );

  // Handle click events
  stars.on("click", function () {
    const rating = parseInt($(this).data("rating"));
    currentState.rating = currentState.rating === rating ? 0 : rating;
    stars.removeClass("filled");
    if (currentState.rating > 0) {
      stars.slice(0, currentState.rating).addClass("filled");
    }
    updateUI();
  });

  // Add CSS for star rating
  $("<style>")
    .text(
      `.stars i.filled { color: #ffc107; }
    .stars i.hgi-star:hover { color: #ffd700; }
    `
    )
    .appendTo("head");

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
    .querySelectorAll(
      'input[id^="level"], input[id^="duration"], input[id^="instructor"], input[id^="category"]'
    )
    .forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const type = this.id.startsWith("level")
          ? "levels"
          : this.id.startsWith("duration")
          ? "durations"
          : this.id.startsWith("instructor")
          ? "instructors"
          : "categories";
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

  // Price range inputs
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  minPriceInput.addEventListener(
    "input",
    debounce(function (e) {
      currentState.minPrice =
        e.target.value === "" ? null : parseFloat(e.target.value);
      updateUI();
    }, 300)
  );

  maxPriceInput.addEventListener(
    "input",
    debounce(function (e) {
      currentState.maxPrice =
        e.target.value === "" ? null : parseFloat(e.target.value);
      updateUI();
    }, 300)
  );

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
      const matchesRating =
        currentState.rating === 0 ||
        Math.floor(course.rating) >= currentState.rating;
      const matchesInstructor =
        currentState.instructors.length === 0 ||
        currentState.instructors.includes(course.instructor);
      const matchesCategory =
        currentState.categories.length === 0 ||
        currentState.categories.includes(course.category);
      const matchesContentType =
        currentState.contentType === "all" ||
        (currentState.contentType === "free" && course.price === 0) ||
        (currentState.contentType === "premium" && course.price > 0);
      const matchesPrice =
        (currentState.minPrice === null ||
          course.price >= currentState.minPrice) &&
        (currentState.maxPrice === null ||
          course.price <= currentState.maxPrice);

      return (
        matchesSearch &&
        matchesLevel &&
        matchesDuration &&
        matchesRating &&
        matchesInstructor &&
        matchesCategory &&
        matchesContentType &&
        matchesPrice
      );
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

    // Rating filter
    if (currentState.rating > 0) {
      addFilterChip(`Rating: ${currentState.rating}+ stars`, () => {
        currentState.rating = 0;
        stars.removeClass("filled");
        updateUI();
      });
    }

    // Instructor filters
    currentState.instructors.forEach((instructor) => {
      addFilterChip(`Instructor: ${instructor}`, () => {
        const checkbox = document.querySelector(`input[value="${instructor}"]`);
        if (checkbox) checkbox.checked = false;
        currentState.instructors = currentState.instructors.filter(
          (i) => i !== instructor
        );
        updateUI();
      });
    });

    // Category filters
    currentState.categories.forEach((category) => {
      addFilterChip(`Category: ${category}`, () => {
        const checkbox = document.querySelector(`input[value="${category}"]`);
        if (checkbox) checkbox.checked = false;
        currentState.categories = currentState.categories.filter(
          (c) => c !== category
        );
        updateUI();
      });
    });

    // Price filter
    currentState.contentType !== "all" &&
      addFilterChip(
        `Price: ${currentState.contentType === "free" ? "Free" : "Premium"}`,
        () => {
          currentState.contentType = "all";
          document.getElementById("typeFree").checked = false;
          document.getElementById("typePaid").checked = false;
          updateUI();
        }
      );

    // Price range filter
    currentState.minPrice !== null &&
      currentState.maxPrice !== null &&
      addFilterChip(
        `Price: (${currentState.minPrice} - ${currentState.maxPrice} $)`,
        () => {
          currentState.minPrice = null;
          currentState.maxPrice = null;
          minPriceInput.value = "";
          maxPriceInput.value = "";

          updateUI();
        }
      );

    // Course Type filter
    document.querySelectorAll("#typeFree, #typePaid").forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        if (this.id === "typeFree" && this.checked) {
          currentState.contentType = "free";
          document.getElementById("typePaid").checked = false;
        } else if (this.id === "typePaid" && this.checked) {
          currentState.contentType = "premium";
          document.getElementById("typeFree").checked = false;
        } else {
          currentState.contentType = "all";
        }
        updateUI();
      });
    });

    $clearFilterBtn.on("click", function () {
      $('input[type="checkbox"]').prop("checked", false);
      currentState.rating = 0;
      stars.removeClass("filled");
      $("select").prop("selectedIndex", 0);
      currentState.levels = [];
      currentState.durations = [];
      currentState.contentType = "all";
      currentState.instructors = [];
      currentState.categories = [];
      updateUI();
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

  function renderCourses(coursesToRender, viewType = 'grid') {
    const $coursesContainer = $("#coursesContainer");
    $coursesContainer.empty();

    if (coursesToRender.length === 0) {
      $coursesContainer.html(`
            <div class="col-12 text-center py-5">
                <h5 class="text-muted">No courses found matching your criteria</h5>
            </div>
        `);
      return;
    }

    coursesToRender.forEach(course => {
      let displayTitle = course.title;
      if (currentState.searchTerm) {
        const regex = new RegExp(`(${currentState.searchTerm})`, "gi");
        displayTitle = course.title.replace(regex, '<span class="highlight">$1</span>');
      }

      // Common content for both views
      const courseContent = `
            <img src="${course.thumbnail || 'assets/images/default-thumbnail.jpg'}" alt="${course.title}" class="course-thumbnail mb-3">
            <div class="course-details">
                <h5 class="course-title">${displayTitle}</h5>
                <div class="course-meta d-flex align-items-center flex-wrap">
                    <span><i class="hgi-stroke hgi-user-circle-02 me-1"></i>${course.enrollments ? course.enrollments.length : 0} Enrollments</span>
                    <span class="ms-3"><i class="hgi-stroke hgi-comment-01 me-1"></i>${course.comments || 0} Comments</span>
                    <span class="ms-3"><i class="hgi-stroke hgi-favourite me-1"></i>${course.likes || 0} Likes</span>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <small class="badge rounded-pill bg-primary-subtle text-primary">${course.instructor?.fullName || course.instructor?.email || "Unknown Instructor"}</small>
                    <small class="badge rounded-pill bg-success-subtle text-success">${course.category?.name || "Uncategorized"}</small>
                    <small class="badge rounded-pill bg-warning-subtle text-warning">${course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}</small>
                </div>
                <div class="course-footer mt-3">
                    <strong class="price">$${course.price.toFixed(2)}</strong>
                    <button class="btn btn-light view-course" data-id="${course.courseId}">
                        <i class="hgi-stroke hgi-arrow-right-01"></i>
                    </button>
                </div>
            </div>
        `;

      let courseHtml = '';
      if (viewType === 'grid') {
        courseHtml = `
                <div class="col-md-5 col-lg-3 mb-4">
                    <div class="course-card grid-view">
                        ${courseContent}
                    </div>
                </div>
            `;
      } else {
        courseHtml = `
                <div class="col-6 mb-4">
                    <div class="course-card list-view d-flex">
                        ${courseContent}
                    </div>
                </div>
            `;
      }
      $coursesContainer.append(courseHtml);
    });
  }

  $('.layout-btn').on('click', function() {
    const viewType = $(this).data('view');

    $('.layout-btn').removeClass('active');
    $(this).addClass('active');

    fetchCourses(viewType);
  });

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

  const $applyFilterBtn = $("#applyFilters");
  const $clearFilterBtn = $("#clearFilters");

  $applyFilterBtn.on("click", function () {
    const $dropdownToggle = $("#filterDropdown");
    bootstrap.Dropdown.getInstance($dropdownToggle[0]).hide();
    updateUI();
  });

  $clearFilterBtn.on("click", function () {
    $("input[type='checkbox']").prop("checked", false);

    currentState.rating = 0;
    stars.removeClass("filled");

    $("select").prop("selectedIndex", 0);

    currentState.levels = [];
    currentState.durations = [];

    updateUI();
  });

  fetchCourses();
  updateUI();
});
