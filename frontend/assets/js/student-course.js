$(document).ready(function () {
    let activeFilters = {};
    let currentSort = 'name-asc';
    let allCourses = [];
    let allCategories = [];
    let allInstructors = [];
    const token = localStorage.getItem("token");

    // fetch courses
    function fetchCourses(viewType = 'grid') {
        if (!token) {
            showAlert("danger", "Please login to the system to view courses.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/course",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    allCourses = response.data;
                    renderCourses(response.data, viewType);
                    applyFiltersAndSort();
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching courses: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function fetchCategories() {
        $.ajax({
            url: "http://localhost:8080/api/v1/category",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    allCategories = response.data;
                    populateCategoryFilter();
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching categories: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // New function to fetch instructors
    function fetchInstructors() {
        return $.ajax({
            url: "http://localhost:8080/api/v1/instructor",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    allInstructors = response.data;
                    populateInstructorFilter();
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching instructors: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Render Courses function
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

            const instructor = allInstructors.find(inst => inst.instructorId === course.instructorId);
            const instructorName = instructor?.fullName || "Unknown Instructor";

            const category = allCategories.find(cat => cat.categoryId === course.categoryId);
            const categoryName = category?.name || "Uncategorized";

            const courseContent = `
            <img src="${course.thumbnail || 'assets/images/default-thumbnail.jpg'}" alt="${course.title}" class="course-thumbnail mb-3">
            <div class="course-details">
                <h5 class="course-title">${displayTitle}</h5>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <small class="badge rounded-pill bg-primary-subtle text-primary">${instructorName}</small>
                    <small class="badge rounded-pill bg-success-subtle text-success">${categoryName}</small>
                    <small class="badge rounded-pill bg-warning-subtle text-warning">${course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}</small>
                </div>
                <div class="course-footer mt-3">
                    <strong class="price">$${course.price.toFixed(2)}</strong>
                    <button class="btn btn-light view-course" data-id="${course.courseId}">
                        <i class="hgi-stroke hgi-arrow-right-01 fs-5 align-middle"></i>
                    </button>
                </div>
            </div>
        `;

            let courseHtml = viewType === 'grid' ? `
            <div class="col-md-5 col-lg-3 mb-4">
                <div class="course-card grid-view">
                    ${courseContent}
                </div>
            </div>
        ` : `
            <div class="col-6 mb-4">
                <div class="course-card list-view d-flex">
                    ${courseContent}
                </div>
            </div>
        `;

            $coursesContainer.append(courseHtml);
        });

        // Add click event handler for view course buttons
        $('.view-course').on('click', function () {
            const courseId = $(this).data('id');
            window.location.href = `course-content.html?courseId=${courseId}`;
        });
    }

    $('.layout-btn').on('click', function () {
        const viewType = $(this).data('view');

        $('.layout-btn').removeClass('active');
        $(this).addClass('active');

        fetchCourses(viewType);
    });

    fetchCourses('grid');
    fetchCategories();
    fetchInstructors();

    /* ----------------------------------------------- Search and Filters ----------------------------------------------- */

    // Initialize event listeners
    function initializeFilterAndSort() {
        // Search input
        $('#courseSearch').on('input', debounce(applyFiltersAndSort, 300));

        // Sort dropdown
        $('.dropdown-item[data-sort]').on('click', function (e) {
            e.preventDefault();
            currentSort = $(this).data('sort');
            applyFiltersAndSort();
        });

        // Filter checkboxes
        $('.filter-options .form-check-input').on('change', function () {
            updateActiveFilters();
            applyFiltersAndSort();
        });

        const $stars = $('.rating-input .hgi-star');

        // Star click effect
        $stars.on('click', function () {
            const rating = $(this).data('rating');
            activeFilters.rating = rating;
            $stars.removeClass('active hover');
            $stars.each(function () {
                if ($(this).data('rating') <= rating) {
                    $(this).addClass('active');
                }
            });
            updateActiveFilters();
            applyFiltersAndSort();
        });

        // Price inputs
        $('#minPrice, #maxPrice').on('input', debounce(function () {
            updateActiveFilters();
            applyFiltersAndSort();
        }, 300));

        // Apply filters button
        $('#applyFilters').on('click', applyFiltersAndSort);

        // Clear filters button
        $('#clearFilters').on('click', function () {
            resetFilters();
            applyFiltersAndSort();
        });

        // View toggle
        $('.layout-btn').on('click', function () {
            const viewType = $(this).data('view');
            $('.layout-btn').removeClass('active');
            $(this).addClass('active');
            renderCourses(allCourses, viewType);
        });
    }

    // Debounce function to limit frequent calls
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

    function populateCategoryFilter() {
        const $categorySection = $('.filter-section').filter(function () {
            return $(this).find('.filter-heading').text() === 'Course Category';
        });
        const $categoryOptions = $categorySection.find('.filter-options');
        $categoryOptions.empty();

        allCategories.forEach(category => {
            const categoryHtml = `
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    value="${category.name}"
                    id="category${category.categoryId}"
                    data-category-id="${category.categoryId}"
                />
                <label class="form-check-label" for="category${category.categoryId}">
                    ${category.name}
                </label>
            </div>
        `;
            $categoryOptions.append(categoryHtml);
        });

        // Re-bind change event for category checkboxes
        $categoryOptions.find('.form-check-input').on('change', function () {
            updateActiveFilters();
            applyFiltersAndSort();
        });
    }

    // New function to populate instructor filter options
    function populateInstructorFilter() {
        const $instructorSection = $('.filter-section').filter(function() {
            return $(this).find('.filter-heading').text() === 'Instructor';
        });
        const $instructorOptions = $instructorSection.find('.filter-options');
        $instructorOptions.empty();

        allInstructors.forEach(instructor => {
            const instructorHtml = `
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    value="${instructor.fullName}"
                    id="instructor${instructor.instructorId}"
                    data-instructor-id="${instructor.instructorId}"
                />
                <label class="form-check-label" for="instructor${instructor.instructorId}">
                    ${instructor.fullName}
                </label>
            </div>
        `;
            $instructorOptions.append(instructorHtml);
        });

        // Bind change event for new instructor checkboxes
        $instructorOptions.find('.form-check-input').on('change', function() {
            updateActiveFilters();
            applyFiltersAndSort();
        });
    }

    // Update active filters display
    function updateActiveFilters() {
        const $activeFilters = $('#activeFilters');
        $activeFilters.empty();
        activeFilters = {};

        // Course Level
        const levels = [];
        $('#levelBeginner:checked, #levelIntermediate:checked, #levelAdvanced:checked').each(function () {
            levels.push($(this).val());
            addFilterChip($activeFilters, 'level', $(this).val(), $(this).siblings('label').text());
        });
        if (levels.length) activeFilters.level = levels;

        // Course Type
        const types = [];
        $('#typeFree:checked, #typePaid:checked').each(function () {
            types.push($(this).val());
            addFilterChip($activeFilters, 'type', $(this).val(), $(this).siblings('label').text());
        });
        if (types.length) activeFilters.type = types;

        // Duration
        const durations = [];
        $('#duration1:checked, #duration2:checked, #duration3:checked').each(function () {
            durations.push($(this).val());
            addFilterChip($activeFilters, 'duration', $(this).val(), $(this).siblings('label').text());
        });
        if (durations.length) activeFilters.duration = durations;

        // Rating
        if (activeFilters.rating) {
            addFilterChip($activeFilters, 'rating', activeFilters.rating, `${activeFilters.rating} Star${activeFilters.rating > 1 ? 's' : ''}`);
        }

        // Price
        const minPrice = $('#minPrice').val();
        const maxPrice = $('#maxPrice').val();
        if (minPrice || maxPrice) {
            activeFilters.price = {min: parseFloat(minPrice) || 0, max: parseFloat(maxPrice) || Infinity};
            addFilterChip($activeFilters, 'price', `${minPrice}-${maxPrice}`, `$${minPrice || 0} - $${maxPrice || '∞'}`);
        }

        // Instructor
        const instructors = [];
        $('.filter-section').filter(function() {
            return $(this).find('.filter-heading').text() === 'Instructor';
        }).find('.form-check-input:checked').each(function() {
            instructors.push($(this).val()); // Collect fullName
            addFilterChip($activeFilters, 'instructor', $(this).val(), $(this).siblings('label').text());
        });
        if (instructors.length) activeFilters.instructor = instructors;

        // Category
        const categories = [];
        $('.filter-section').filter(function () {
            return $(this).find('.filter-heading').text() === 'Course Category';
        }).find('.form-check-input:checked').each(function () {
            categories.push($(this).val());  // Collect category names
            addFilterChip($activeFilters, 'category', $(this).val(), $(this).siblings('label').text());
        });
        if (categories.length) activeFilters.category = categories;
    }

    // Add filter chip to active filters display
    function addFilterChip($container, filterType, filterValue, displayText) {
        const chip = `
        <span class="badge rounded-pill bg-light text-dark me-2 mb-2 d-inline-flex align-items-center">
            ${displayText}
            <i class="hgi-stroke hgi-multiplication-sign ms-2 remove-chip" style="cursor: pointer; font-size: 14px; opacity: 0.7;"
               data-filter-type="${filterType}" 
               data-filter-value="${filterValue}"></i>
        </span>
    `;
        $container.append(chip);

        // Remove filter chip
        $container.find('.remove-chip').last().on('click', function () {
            const type = $(this).data('filter-type');
            const value = $(this).data('filter-value');

            if (type === 'rating') {
                delete activeFilters.rating;
                $('.rating-input .hgi-star').removeClass('active');
            } else if (type === 'price') {
                $('#minPrice, #maxPrice').val('');
                delete activeFilters.price;
            } else {
                $(`#${type}${value.replace(/[^a-zA-Z0-9]/g, '')}`).prop('checked', false);
            }

            updateActiveFilters();
            applyFiltersAndSort();
        });
    }

    // Reset all filters
    function resetFilters() {
        $('.filter-options .form-check-input').prop('checked', false);
        $('#minPrice, #maxPrice').val('');
        $('.rating-input .hgi-star').removeClass('active');
        $('#courseSearch').val('');
        activeFilters = {};
        currentSort = 'name-asc';
        $('#activeFilters').empty();
    }

    // Main filter and sort function
    function applyFiltersAndSort() {
        let filteredCourses = [...allCourses];

        // Search filter
        const searchTerm = $('#courseSearch').val().toLowerCase();
        if (searchTerm) {
            filteredCourses = filteredCourses.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            );
        }

        // Level filter
        if (activeFilters.level) {
            filteredCourses = filteredCourses.filter(course =>
                activeFilters.level.includes(course.level.toLowerCase())
            );
        }

        // Type filter
        if (activeFilters.type) {
            filteredCourses = filteredCourses.filter(course => {
                if (activeFilters.type.includes('free') && course.price === 0) return true;
                if (activeFilters.type.includes('paid') && course.price > 0) return true;
                return false;
            });
        }

        // Duration filter
        if (activeFilters.duration) {
            filteredCourses = filteredCourses.filter(course => {
                const duration = course.duration || 0;
                return activeFilters.duration.some(range => {
                    if (range === '0-2') return duration <= 2;
                    if (range === '2-5') return duration > 2 && duration <= 5;
                    if (range === '5+') return duration > 5;
                    return false;
                });
            });
        }

        // Rating filter
        if (activeFilters.rating) {
            filteredCourses = filteredCourses.filter(course =>
                course.rating >= activeFilters.rating
            );
        }

        // Price filter
        if (activeFilters.price) {
            filteredCourses = filteredCourses.filter(course =>
                course.price >= activeFilters.price.min &&
                course.price <= activeFilters.price.max
            );
        }

        // Instructor filter
        if (activeFilters.instructor) {
            filteredCourses = filteredCourses.filter(course => {
                const courseInstructor = allInstructors.find(inst => inst.instructorId === course.instructorId);
                return courseInstructor && activeFilters.instructor.includes(courseInstructor.fullName);
            });
        }

        // Category filter
        if (activeFilters.category) {
            filteredCourses = filteredCourses.filter(course => {
                const courseCategory = allCategories.find(cat => cat.categoryId === course.categoryId);
                return courseCategory && activeFilters.category.includes(courseCategory.name);
            });
        }

        // Sort courses
        filteredCourses.sort((a, b) => {
            switch (currentSort) {
                case 'name-asc':
                    return a.title.localeCompare(b.title);
                case 'name-desc':
                    return b.title.localeCompare(a.title);
                case 'date-new':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-old':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'enrolled-high':
                    return (b.enrollments?.length || 0) - (a.enrollments?.length || 0);
                case 'enrolled-low':
                    return (a.enrollments?.length || 0) - (b.enrollments?.length || 0);
                default:
                    return 0;
            }
        });

        renderCourses(filteredCourses, $('.layout-btn.active').data('view') || 'grid');
    }

    // Function to get URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name) || '';
    }

    // Get the search query from the URL
    const searchQuery = getUrlParameter('search');

    // Populate the course page search bar with the search query
    if (searchQuery) {
        $('#courseSearch').val(decodeURIComponent(searchQuery));

        // Clear the URL by removing the query parameter
        const cleanUrl = window.location.pathname;
        history.replaceState(null, '', cleanUrl);
    }

    initializeFilterAndSort();

});
