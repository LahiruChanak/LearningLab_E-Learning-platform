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
    let allUsers = [];
    let selectedUserId = null;

    if (role !== "ADMIN") {
        showAlert("danger", "Unauthorized access! Redirecting to login page...");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    }

    function fetchUsers() {
        if (!token) {
            showAlert("danger", "Please login to the system to view users.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/all",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function(response) {
                if (response.status === 200) {
                    allUsers = response.data;
                    applyFiltersAndUpdateTables();
                }
            },
            error: function(xhr) {
                showAlert("danger", "Error fetching users: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function fetchSkills(userId, selector) {
        $(selector).html('<span class="text-muted">Loading skills...</span>');

        $.ajax({
            url: `http://localhost:8080/api/v1/user/${userId}/skills`,
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (skillsResponse) {
                if (skillsResponse.status === 200) {
                    const skills = skillsResponse.data || [];
                    if (skills.length) {
                        const badges = skills.map(skill =>
                            `<span class="badge rounded-pill bg-primary-subtle text-primary">${skill}</span>`
                        ).join('');
                        $(selector).html(badges);
                    } else {
                        $(selector).html('<span class="text-muted">-</span>');
                    }
                } else {
                    $(selector).html('<span class="text-muted">-</span>');
                    console.warn('Skills fetch warning:', skillsResponse.message);
                }
            },
            error: function (xhr) {
                $(selector).html('<span class="text-muted">-</span>');
                console.error('Skills fetch error:', xhr.responseJSON?.message || xhr.statusText);
            }
        });
    }

    function populateStudentsTable(users) {
        const $tbody = $("#studentsTableBody");
        $tbody.empty();

        const students = users.filter(user => user.role === "STUDENT");
        if (students.length === 0) {
            $tbody.append('<tr><td colspan="7" class="text-center text-muted p-3">No students found</td></tr>');
            return;
        }

        students.forEach((student, index) => {
            const row = $(`
            <tr data-user-id="${student.userId}">
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="me-1">
                            <img src="${student.profilePicture || '../assets/images/icons/placeholder.svg'}" alt="profile picture" class="profile-picture">
                        </div>
                        <div>${student.fullName || 'N/A'}</div>
                    </div>
                </td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.contact || 'N/A'}</td>
                <td>${student.address || 'N/A'}</td>
                <td>${student.createdAt ? new Date(student.createdAt).toLocaleString() : 'N/A'}</td>
                <td><span class="badge rounded-pill ${student.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${student.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="d-flex justify-content-center align-items-center gap-2">
                        <button class="btn btn-action btn-view" data-bs-toggle="modal" data-bs-target="#studentViewModal">
                            <i class="hgi hgi-stroke hgi-property-view fs-5"></i>
                        </button>
                        <button class="btn btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#studentStatusModal">
                            <i class="hgi-stroke hgi-user-edit-01 fs-5"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);

            row.find(".btn-view").on("click", () => populateStudentModal(student));
            row.find(".btn-edit").on("click", () => {
                $("#userStatus").val(student.active ? "Active" : "Inactive");
                $("#studentStatusModal").data("userId", student.userId);
            });

            $tbody.append(row);
        });
    }

    // In populateInstructorsTable
    function populateInstructorsTable(users) {
        const $tbody = $("#instructorsTableBody");
        $tbody.empty();

        const instructors = users.filter(user => user.role === "INSTRUCTOR");
        if (instructors.length === 0) {
            $tbody.append('<tr><td colspan="8" class="text-center text-muted py-4">No instructors found</td></tr>');
            return;
        }

        instructors.forEach((instructor, index) => {
            const row = $(`
            <tr data-user-id="${instructor.userId}">
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="me-1">
                            <img src="${instructor.profilePicture || '../assets/images/icons/placeholder.svg'}" alt="profile picture" class="profile-picture">
                        </div>
                        <div>${instructor.fullName || 'N/A'}</div>
                    </div>
                </td>
                <td>${instructor.email || 'N/A'}</td>
                <td>${instructor.contact || 'N/A'}</td>
                <td>${instructor.address || 'N/A'}</td>
                <td>${instructor.createdAt ? new Date(instructor.createdAt).toLocaleString() : 'N/A'}</td>
                <td>${instructor.courseCount || 0}</td>
                <td><span class="badge rounded-pill ${instructor.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">${instructor.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="d-flex justify-content-center align-items-center gap-2">
                        <button class="btn btn-action btn-view" data-bs-toggle="modal" data-bs-target="#instructorViewModal">
                            <i class="hgi hgi-stroke hgi-property-view fs-5"></i>
                        </button>
                        <button class="btn btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#instructorStatusModal">
                            <i class="hgi-stroke hgi-user-edit-01 fs-5"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `);

            row.find(".btn-view").on("click", () => populateInstructorModal(instructor));
            row.find(".btn-edit").on("click", () => {
                $("#instructor-status").val(instructor.active ? "Active" : "Inactive");
                $("#instructorStatusModal").data("userId", instructor.userId);
            });

            $tbody.append(row);
        });
    }

    // Initialize filter listeners
    function initializeFilters() {
        // Search input
        $('#searchInput').on('input', debounce(applyFiltersAndUpdateTables, 300));

        // Status filter
        $('#filterActive').on('change', applyFiltersAndUpdateTables);
    }

    // Debounce function
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

    // Apply filters and update tables
    function applyFiltersAndUpdateTables() {
        let filteredUsers = [...allUsers];

        // Search filter
        const searchTerm = $('#searchInput').val().toLowerCase();
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.userId?.toString().includes(searchTerm) ||
                user.fullName?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter
        const activeStatus = $('#filterActive').val();
        if (activeStatus) {
            const active = activeStatus === 'true';
            filteredUsers = filteredUsers.filter(user => user.active === active);
        }

        // Update tables
        populateStudentsTable(filteredUsers);
        populateInstructorsTable(filteredUsers);
    }

    // Populate Student Modal (Quick and Full Views)
    function populateStudentModal(student) {
        // Quick View
        $('#studentNameQuick').text(student.fullName || '-');
        $('#studentEmailQuick').text(student.email || '-');
        $('#studentContactQuick').text(student.contact || '-');
        $('#studentStatusQuick').text(student.active ? 'Active' : 'Inactive');
        $('#studentCreatedAtQuick').text(student.createdAt ? new Date(student.createdAt).toLocaleString() : '-');
        $('#studentEnrollmentsQuick').text(student.enrollments?.length ? student.enrollments.map(e => e.course?.title).join(', ') : '-');

        // Full View
        $('#studentNameFull').text(student.fullName || '-');
        $('#studentEmailFull').text(student.email || '-');
        $('#studentContactFull').text(student.contact || '-');
        $('#studentAddressFull').text(student.address || '-');
        $('#studentProfilePictureFull').attr('src', student.profilePicture || '../assets/images/icons/placeholder.svg');
        $('#studentBioFull').text(student.bio || '-');
        $('#studentRoleFull').text(student.role || '-');
        $('#studentStatusFull').text(student.active ? 'Active' : 'Inactive');
        $('#studentCreatedAtFull').text(student.createdAt ? new Date(student.createdAt).toLocaleString() : '-');
        $('#studentDeactivatedAtFull').text(student.deactivatedAt ? new Date(student.deactivatedAt).toLocaleString() : '-');
        $('#studentPasswordUpdatedAtFull').text(student.passwordUpdatedAt ? new Date(student.passwordUpdatedAt).toLocaleString() : '-');
        $('#studentEmailUpdatedAtFull').text(student.emailUpdatedAt ? new Date(student.emailUpdatedAt).toLocaleString() : '-');
        $('#studentTwoFactorEnabledFull').text(student.twoFactorEnabled ? 'Yes' : 'No');
        $('#studentPreviousEmailsFull').text(student.previousEmail?.length ? student.previousEmail.join(', ') : '-');
        $('#studentGithubLinkFull').text(student.githubLink || '-');
        $('#studentLinkedinLinkFull').text(student.linkedinLink || '-');
        $('#studentStackOverflowLinkFull').text(student.stackOverflowLink || '-');
        $('#studentWebsiteLinkFull').text(student.websiteLink || '-');
        fetchSkills(student.userId, '#studentSkillsFull');
        $('#studentEnrollmentsFull').text(student.enrollments?.length ? student.enrollments.map(e => e.course?.title).join(', ') : '-');
    }

    // Populate Instructor Modal (Quick and Full Views)
    function populateInstructorModal(instructor) {
        // Quick View
        $('#instructorNameQuick').text(instructor.fullName || '-');
        $('#instructorEmailQuick').text(instructor.email || '-');
        $('#instructorContactQuick').text(instructor.contact || '-');
        $('#instructorStatusQuick').text(instructor.active ? 'Active' : 'Inactive');
        $('#instructorCreatedAtQuick').text(instructor.createdAt ? new Date(instructor.createdAt).toLocaleString() : '-');
        $('#instructorCoursesQuick').text(instructor.enrollments?.length ? instructor.enrollments.map(e => e.course?.title).join(', ') : '-');

        // Full View
        $('#instructorNameFull').text(instructor.fullName || '-');
        $('#instructorEmailFull').text(instructor.email || '-');
        $('#instructorContactFull').text(instructor.contact || '-');
        $('#instructorAddressFull').text(instructor.address || '-');
        $('#instructorProfilePictureFull').attr('src', instructor.profilePicture || '../assets/images/icons/placeholder.svg');
        $('#instructorBioFull').text(instructor.bio || '-');
        $('#instructorRoleFull').text(instructor.role || '-');
        $('#instructorStatusFull').text(instructor.active ? 'Active' : 'Inactive');
        $('#instructorCreatedAtFull').text(instructor.createdAt ? new Date(instructor.createdAt).toLocaleString() : '-');
        $('#instructorDeactivatedAtFull').text(instructor.deactivatedAt ? new Date(instructor.deactivatedAt).toLocaleString() : '-');
        $('#instructorPasswordUpdatedAtFull').text(instructor.passwordUpdatedAt ? new Date(instructor.passwordUpdatedAt).toLocaleString() : '-');
        $('#instructorEmailUpdatedAtFull').text(instructor.emailUpdatedAt ? new Date(instructor.emailUpdatedAt).toLocaleString() : '-');
        $('#instructorTwoFactorEnabledFull').text(instructor.twoFactorEnabled ? 'Yes' : 'No');
        $('#instructorPreviousEmailsFull').text(instructor.previousEmail?.length ? instructor.previousEmail.join(', ') : '-');
        $('#instructorGithubLinkFull').text(instructor.githubLink || '-');
        $('#instructorLinkedinLinkFull').text(instructor.linkedinLink || '-');
        $('#instructorStackOverflowLinkFull').text(instructor.stackOverflowLink || '-');
        $('#instructorWebsiteLinkFull').text(instructor.websiteLink || '-');
        fetchSkills(instructor.userId, '#instructorSkillsFull');
    }

    // View Student Details
    $('#studentsTableBody').on('click', '.btn-view', function() {
        const userId = $(this).data('id');
        const student = allUsers.find(user => user.userId === userId && user.role === 'STUDENT');

        if (student) {
            populateStudentModal(student);
            $('#studentQuickView').removeClass('d-none');
            $('#studentFullView').addClass('d-none');
            $('#studentToggleViewBtn').text('Show Full Details');
            $('#studentViewModal').modal('show');
        } else {
            showAlert("danger", "Student not found.");
        }
    });

    // View Instructor Details
    $('#instructorsTableBody').on('click', '.btn-view', function() {
        const userId = $(this).data('id');
        const instructor = allUsers.find(user => user.userId === userId && user.role === 'INSTRUCTOR');

        if (instructor) {
            populateInstructorModal(instructor);
            $('#instructorQuickView').removeClass('d-none');
            $('#instructorFullView').addClass('d-none');
            $('#instructorToggleViewBtn').text('Show Full Details');
            $('#instructorViewModal').modal('show');
        } else {
            showAlert("danger", "Instructor not found.");
        }
    });

    // Toggle Student View
    $('#studentToggleViewBtn').on('click', function() {
        if ($('#studentQuickView').hasClass('d-none')) {
            $('#studentQuickView').removeClass('d-none');
            $('#studentFullView').addClass('d-none');
            $(this).text('Show Full Details');
        } else {
            $('#studentQuickView').addClass('d-none');
            $('#studentFullView').removeClass('d-none');
            $(this).text('Show Quick View');
        }
    });

    // Toggle Instructor View
    $('#instructorToggleViewBtn').on('click', function() {
        if ($('#instructorQuickView').hasClass('d-none')) {
            $('#instructorQuickView').removeClass('d-none');
            $('#instructorFullView').addClass('d-none');
            $(this).text('Show Full Details');
        } else {
            $('#instructorQuickView').addClass('d-none');
            $('#instructorFullView').removeClass('d-none');
            $(this).text('Show Quick View');
        }
    });

    // Trigger status modal from table
    $('#studentsTableBody').on('click', '.btn-status', function() {
        selectedUserId = $(this).data('id');
        const user = allUsers.find(u => u.userId === selectedUserId);
        if (user) {
            // Set current status in the modal
            $('#userStatus').val(user.active ? 'Active' : 'Inactive');
            $('#studentStatusModal').modal('show');
        } else {
            showAlert("danger", "User not found.");
        }
    });

    // Handle "Update Status" button in the Student Status Modal
    $('#updateUserStatus').on('click', function () {
        const userId = $('#studentStatusModal').data('userId');
        const newStatus = $('#userStatus').val();
        const user = allUsers.find(u => u.userId === userId);

        if (!user) {
            showAlert("danger", "User not found.");
            return;
        }

        // If the status hasn't changed, no need to proceed
        if ((newStatus === 'Active' && user.active) || (newStatus === 'Inactive' && !user.active)) {
            $('#studentStatusModal').modal('hide');
            return;
        }

        // Update confirmation modal content
        $('#statusUpdateTitle').text(newStatus === 'Active' ? 'Activate User' : 'Deactivate User');
        $('#statusUpdateAction')
            .text(newStatus === 'Active' ? 'activate' : 'deactivate')
            .toggleClass('text-danger', newStatus === 'Inactive');
        $('#statusUpdateName').text(user.fullName || 'this user');
        $('#statusUpdateIcon')
            .removeClass('hgi-toggle-on text-success hgi-toggle-off text-danger')
            .addClass(newStatus === 'Active' ? 'hgi-toggle-on text-success' : 'hgi-toggle-off text-danger');
        $('#confirmStatusUpdate')
            .removeClass('btn-success btn-danger status-btn-active status-btn-deactive')
            .addClass(newStatus === 'Active' ? 'status-btn-active' : 'status-btn-deactive');

        // Store userId in confirmation modal
        $('#statusUpdateModal').data('userId', userId);

        // Show confirmation modal
        $('#studentStatusModal').modal('hide');
        $('#statusUpdateModal').modal('show');
    });

    // Handle "Confirm" button in the Status Confirmation Modal
    $('#confirmStatusUpdate').on('click', function () {
        if (!token) {
            showAlert("danger", "Please login to update status.");
            $('#statusUpdateModal').modal('hide');
            return;
        }

        const userId = $('#statusUpdateModal').data('userId');
        if (!userId) {
            showAlert("danger", "User ID is missing.");
            $('#statusUpdateModal').modal('hide');
            return;
        }

        const newStatus = $('#userStatus').val();
        const statusData = {
            isActive: newStatus === 'Active'
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/user/${userId}/status`,
            type: 'PUT',
            headers: { "Authorization": "Bearer " + token },
            contentType: 'application/json',
            data: JSON.stringify(statusData),
            success: function (response) {
                if (response.status === 200) {
                    const user = allUsers.find(u => u.userId === userId);
                    if (user) {
                        user.active = statusData.isActive;
                        user.deactivatedAt = statusData.isActive ? null : new Date().toISOString();
                        applyFiltersAndUpdateTables();
                    }
                    showAlert("success", `User status updated to ${newStatus} successfully.`);
                }
                $('#statusUpdateModal').modal('hide');
            },
            error: function (xhr) {
                showAlert("danger", "Error updating status: " + (xhr.responseJSON?.message || xhr.statusText));
                $('#statusUpdateModal').modal('hide');
            }
        });
    });

    // Reset variables when modals are closed
    $('#studentStatusModal, #statusUpdateModal').on('hidden.bs.modal', function() {
        selectedUserId = null;
    });

    fetchUsers();
    initializeFilters();
});