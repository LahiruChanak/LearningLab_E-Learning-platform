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
                    populateStudentsTable(allUsers);
                    populateInstructorsTable(allUsers);

                    console.log(allUsers);
                }
            },
            error: function(xhr) {
                showAlert("danger", "Error fetching users: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    function populateStudentsTable(users) {

        const $tbody = $("#studentsTableBody");
        $tbody.empty();

        const students = users.filter(user => user.role === "STUDENT");
        if (students.length === 0) {
            $tbody.append('<tr><td colspan="7" class="text-center text-muted">No students found</td></tr>');
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
                            <div>${student.fullName}</div>
                        </div>
                    </td>
                    <td>${student.email}</td>
                    <td>${student.contact || 'N/A'}</td>
                    <td>${student.address || 'N/A'}</td>
                    <td>${new Date(student.createdAt).toLocaleString()}</td>
                    <td><span class="badge rounded-pill ${student.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}">${student.isActive ? 'Inactive' : 'Active'}</span></td>
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
                $("#userStatus").val(student.isActive ? "Active" : "Inactive");
                $("#studentStatusModal").data("userId", student.userId);
            });

            $tbody.append(row);
        });
    }

    function populateInstructorsTable(users) {
        const $tbody = $("#instructorsTableBody");
        $tbody.empty();

        const instructors = users.filter(user => user.role === "INSTRUCTOR");
        if (instructors.length === 0) {
            $tbody.append('<tr><td colspan="8" class="text-center text-muted">No instructors found</td></tr>');
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
                            <div>${instructor.fullName}</div>
                        </div>
                    </td>
                    <td>${instructor.email}</td>
                    <td>${instructor.contact || 'N/A'}</td>
                    <td>${instructor.address || 'N/A'}</td>
                    <td>${new Date(instructor.createdAt).toLocaleString() || 'N/A'}</td>
                    <td>${instructor.courseCount || 0}</td>
                    <td><span class="badge rounded-pill ${instructor.isActive ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}">${instructor.isActive ? 'Inactive' : 'Active'}</span></td>
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
                $("#instructor-status").val(instructor.isActive ? "Active" : "Inactive");
                $("#instructorStatusModal").data("userId", instructor.userId);
            });

            $tbody.append(row);
        });
    }

    // Populate Student Modal (Quick and Full Views)
    function populateStudentModal(student) {
        // Quick View
        $('#studentNameQuick').text(student.fullName || '-');
        $('#studentEmailQuick').text(student.email || '-');
        $('#studentContactQuick').text(student.contact || '-');
        $('#studentStatusQuick').text(student.isActive ? 'Inactive' : 'Active');
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
        $('#studentStatusFull').text(student.isActive ? 'Inactive' : 'Active');
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
        $('#studentSkillsFull').text(student.skills?.length ? student.skills.join(', ') : '-');
        $('#studentEnrollmentsFull').text(student.enrollments?.length ? student.enrollments.map(e => e.course?.title).join(', ') : '-');
        $('#studentCertificatesFull').text(student.certificates?.length ? student.certificates.map(c => c.title).join(', ') : '-');
        $('#studentQuizAttemptsFull').text(student.quizAttempts?.length ? student.quizAttempts.map(q => `${q.quiz?.title}: ${q.score}`).join(', ') : '-');
        $('#studentOrdersFull').text(student.orders?.length ? student.orders.map(o => `Order #${o.orderId}`).join(', ') : '-');
    }

    // Populate Instructor Modal (Quick and Full Views)
    function populateInstructorModal(instructor) {
        // Quick View
        $('#instructorNameQuick').text(instructor.fullName || '-');
        $('#instructorEmailQuick').text(instructor.email || '-');
        $('#instructorContactQuick').text(instructor.contact || '-');
        $('#instructorStatusQuick').text(instructor.isActive ? 'Inactive' : 'Active');
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
        $('#instructorStatusFull').text(instructor.isActive ? 'Inactive' : 'Active');
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
        $('#instructorSkillsFull').text(instructor.skills?.length ? instructor.skills.join(', ') : '-');
        $('#instructorCoursesFull').text(instructor.enrollments?.length ? instructor.enrollments.map(e => e.course?.title).join(', ') : '-');
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
            $('#userStatus').val(user.isActive ? 'Active' : 'Inactive');
            $('#studentStatusModal').modal('show');
        } else {
            showAlert("danger", "User not found.");
        }
    });

    // Handle "Update Status" button in the Student Status Modal
    $('#updateUserStatus').on('click', function() {
        const newStatus = $('#userStatus').val(); // Get selected status
        const user = allUsers.find(u => u.userId === selectedUserId);

        if (!user) {
            showAlert("danger", "User not found.");
            return;
        }

        // If status hasn't changed, no need to proceed
        if ((newStatus === 'Active' && user.isActive) || (newStatus === 'Inactive' && !user.isActive)) {
            $('#studentStatusModal').modal('hide');
            return;
        }

        // Update confirmation modal content
        $('#statusUpdateTitle').text('Confirm Status Update');
        $('#statusUpdateAction').text(newStatus === 'Active' ? 'activate' : 'deactivate');
        $('#statusUpdateName').text(user.fullName || 'this user');
        $('#statusUpdateIcon')
            .removeClass('hgi-toggle-on text-success hgi-toggle-off text-danger')
            .addClass(newStatus === 'Active' ? 'hgi-toggle-on text-success' : 'hgi-toggle-off text-danger');
        $('#confirmStatusUpdate')
            .removeClass('btn-success btn-danger')
            .addClass(newStatus === 'Active' ? 'btn-success' : 'btn-danger');

        // Show confirmation modal
        $('#studentStatusModal').modal('hide');
        $('#statusUpdateModal').modal('show');
    });

    // Handle "Confirm" button in the Status Confirmation Modal
    $('#confirmStatusUpdate').on('click', function() {
        if (!token) {
            showAlert("danger", "Please login to update status.");
            $('#statusUpdateModal').modal('hide');
            return;
        }

        const newStatus = $('#userStatus').val();
        const statusData = {
            isActive: newStatus === 'Active'
        };

        // Send update request to backend
        $.ajax({
            url: `http://localhost:8080/api/v1/user/${selectedUserId}/status`,
            type: 'PUT',
            headers: { "Authorization": "Bearer " + token },
            contentType: 'application/json',
            data: JSON.stringify(statusData),
            success: function(response) {
                if (response.status === 200) {
                    // Update local data
                    const user = allUsers.find(u => u.userId === selectedUserId);
                    if (user) {
                        user.isActive = statusData.isActive;
                        user.deactivatedAt = statusData.isActive ? null : new Date().toISOString();
                        populateStudentsTable(allUsers); // Refresh table
                        populateInstructorsTable(allUsers);
                    }
                    showAlert("success", `User status updated to ${newStatus} successfully.`);
                }
                $('#statusUpdateModal').modal('hide');
            },
            error: function(xhr) {
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
});