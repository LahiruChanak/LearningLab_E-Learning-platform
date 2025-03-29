$(document).ready(function() {
    fetchInstructorRequests();
});

    // Fetch all instructor requests
    function fetchInstructorRequests() {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as admin to view requests.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/admin/instructor/requests",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function(response) {
                if (response.status === 200) {
                    displayRequests(response.data);
                } else {
                    showAlert("danger", "Failed to load requests: " + response.message);
                }
            },
            error: function(xhr) {
                showAlert("danger", "Error fetching requests: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Display requests in a table
    function displayRequests(requests) {
        const tbody = $("#requestsTable tbody");
        tbody.empty();

        requests.forEach(request => {
            const statusOptions = `
                <select class="status-select" data-request-id="${request.id}">
                    <option value="PENDING" ${request.requestStatus === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="APPROVED" ${request.requestStatus === 'APPROVED' ? 'selected' : ''}>Approved</option>
                    <option value="REJECTED" ${request.requestStatus === 'REJECTED' ? 'selected' : ''}>Rejected</option>
                </select>
            `;

            const certificates = (request.certificateUrls && Array.isArray(request.certificateUrls))
                ? request.certificateUrls.map(url =>
                    `<a href="${url}" target="_blank">View</a>`
                ).join(", ")
                : 'None';

            tbody.append(`
                <tr>
                    <td>${request.userEmail}</td>
                    <td>${request.message}</td>
                    <td>${request.qualifications}</td>
                    <td>${request.experience}</td>
                    <td>${certificates}</td>
                    <td>${statusOptions}</td>
                </tr>
            `);
        });

        // Handle status change
        $(".status-select").on("change", function() {
            const requestId = $(this).data("request-id");
            const newStatus = $(this).val();
            updateRequestStatus(requestId, newStatus);
        });
    }

    // Update request status
    function updateRequestStatus(requestId, status) {
        const token = localStorage.getItem("token");

        $.ajax({
            url: `http://localhost:8080/api/v1/admin/instructor/requests/${requestId}/status`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            data: { status: status },
            success: function(response) {
                if (response.status === 200) {
                    showAlert("success", "Status updated successfully");
                    fetchInstructorRequests(); // Refresh the list
                } else {
                    showAlert("danger", "Failed to update status: " + response.message);
                }
            },
            error: function(xhr) {
                showAlert("danger", "Error updating status: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }