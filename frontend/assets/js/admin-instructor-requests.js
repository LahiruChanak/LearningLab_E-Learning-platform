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

    if (!token && role !== "ADMIN") {
        showAlert("danger", "Please login as admin to view requests.");
        return;
    }

    fetchInstructorRequests();

    // Fetch all instructor requests
    function fetchInstructorRequests() {
        if (!token) {
            showAlert("danger", "Please login as admin to view requests.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/admin/instructor/requests",
            type: "GET",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    displayRequests(response.data);
                } else {
                    showAlert("danger", "Failed to load requests: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching requests: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Display requests in the table
    function displayRequests(requests) {
        const tbody = $("#requestsTable tbody");
        tbody.empty();

        requests.forEach(request => {
            const statusClass = {
                'PENDING': 'bg-warning-subtle text-warning status-pending',
                'APPROVED': 'bg-success-subtle text-success status-approved',
                'REJECTED': 'bg-danger-subtle text-danger status-rejected'
            }[request.requestStatus] || 'status-pending';
            const statusBadge = `<span class="badge rounded-pill user-status ${statusClass}">${request.requestStatus}</span>`;

            const certificates = (request.certificates && Array.isArray(request.certificates))
                ? request.certificates.map((url, index) =>
                    `<a href="#" class="certificate-link" data-bs-toggle="modal" data-bs-target="#certificateModal" data-url="${url}">Certificate ${index + 1}</a>`
                ).join(" | ")
                : 'None';

            tbody.append(`
                <tr data-request-updated-at="${new Date(request.requestCreatedAt).getTime()}">
                    <td>${request.userEmail}</td>
                    <td>${request.message}</td>
                    <td>${request.qualifications}</td>
                    <td>${request.experience}</td>
                    <td>${certificates}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#manageRequestModal" data-request-id="${request.id}">
                            <i class="hgi hgi-stroke hgi-pencil-edit-02 align-middle fs-5"></i>
                        </button>
                    </td>
                </tr>
            `);

            $(".btn-edit").tooltip({toggle: "tooltip", placement: "bottom", title: "Change Status", trigger: "hover"});
        });

        // Certificate preview handler
        $(".certificate-link").on("click", function (e) {
            e.preventDefault();
            const certificateUrl = $(this).data("url");
            $("#certificatePreview").attr("src", certificateUrl);
        });

        $(".btn-edit").on("click", function () {
            const row = $(this).closest("tr");
            const requestId = $(this).data("request-id");
            $("#modalUserEmail").text(row.find("td:eq(0)").text());
            $("#modalMessage").text(row.find("td:eq(1)").text());
            $("#modalQualifications").text(row.find("td:eq(2)").text());
            $("#modalExperience").text(row.find("td:eq(3)").text());
            $("#modalCreatedAt").text(new Date(requests.find(r => r.id === requestId).requestCreatedAt).toLocaleString('sv-SE').replace(/-/g, '/'));
            $("#modalUpdatedAt").text(new Date(requests.find(r => r.id === requestId).requestUpdatedAt).toLocaleString('sv-SE').replace(/-/g, '/'));
            $("#modalStatus").text(row.find("td:eq(5) .user-status").text());
            $("#requestStatus").val(row.find("td:eq(5) .user-status").text());
            $("#saveRequestAction").data("request-id", requestId);
        });
    }

    // Update request status
    function updateRequestStatus(requestId, status) {

        if (!token) {
            showAlert("danger", "Please login as admin to view requests.");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/admin/instructor/requests/${requestId}/status?status=${encodeURIComponent(status)}`,
            type: "PUT",
            headers: {"Authorization": "Bearer " + token},
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Status updated successfully");
                    fetchInstructorRequests();
                } else {
                    showAlert("danger", "Failed to update status: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error updating status: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Save action from modal
    $("#saveRequestAction").on("click", function () {
        const requestId = $(this).data("request-id");
        const newStatus = $("#requestStatus").val();
        updateRequestStatus(requestId, newStatus);
        $("#manageRequestModal").modal("hide");
    });

    // Filter logic
    $("#searchInput").on("input", function () {
        const searchTerm = $(this).val().toLowerCase();
        $("#requestsTable tbody tr").each(function () {
            const userEmail = $(this).find("td:eq(0)").text().toLowerCase();
            $(this).toggle(userEmail.includes(searchTerm));
        });
    });

    $("#filterStatus").on("change", function () {
        const filterStatus = $(this).val();
        $("#requestsTable tbody tr").each(function () {
            const status = $(this).find(".user-status").text();
            $(this).toggle(filterStatus === "" || status === filterStatus);
        });
    });

    $("#sort").on("change", function () {
        const sortValue = $(this).val();
        const tbody = $("#requestsTable tbody");
        const rows = tbody.find("tr").get();

        rows.sort(function (a, b) {
            const experienceA = parseInt($(a).find("td:eq(3)").text()) || 0;
            const experienceB = parseInt($(b).find("td:eq(3)").text()) || 0;

            if (sortValue === "newest" || sortValue === "oldest") {
                const timeA = $(a).data("request-updated-at") || 0;
                const timeB = $(b).data("request-updated-at") || 0;
                return sortValue === "newest" ? timeB - timeA : timeA - timeB;
            } else if (sortValue === "experience") {
                return experienceB - experienceA;
            } else if (sortValue === "noExperience") {
                return experienceA - experienceB;
            }
        });

        tbody.empty();
        $.each(rows, function (index, row) {
            tbody.append(row);
        });
    });
});