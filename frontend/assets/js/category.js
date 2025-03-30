$(document).ready(function () {
    // Load categories on page load
    fetchCategories();

    // Open modal for adding a new category
    $("#addCategoryBtn").on("click", function () {
        $("#categoryModalLabel").text("Add Category");
        $("#categoryForm")[0].reset();
        $("#categoryId").val(""); // Clear ID for new category
    });

    // Handle save category
    $("#saveCategoryBtn").on("click", function () {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as an admin to manage categories.");
            return;
        }

        const $button = $(this);
        $button.prop("disabled", true);

        const categoryId = $("#categoryId").val();
        const name = $("#categoryName").val().trim();

        if (!name) {
            showAlert("danger", "Category name is required.");
            $button.prop("disabled", false);
            return;
        }

        const url = categoryId ? `http://localhost:8080/api/v1/admin/category/${categoryId}` : "http://localhost:8080/api/v1/admin/category";
        const method = categoryId ? "PUT" : "POST";

        $.ajax({
            url: url,
            type: method,
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify({ name: name }),
            success: function (response) {
                $button.prop("disabled", false);
                if (response.status === 200) {
                    showAlert("success", `Category ${categoryId ? "updated" : "added"} successfully!`);
                    $("#categoryModal").modal("hide");
                    fetchCategories();
                } else {
                    showAlert("danger", response.message || "Failed to save category.");
                }
            },
            error: function (xhr) {
                $button.prop("disabled", false);
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error saving category.");
            }
        });
    });

    // Fetch and display categories
    function fetchCategories() {
        const token = localStorage.getItem("token");
        $.ajax({
            url: "http://localhost:8080/api/v1/category",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    const $tbody = $("#categoryTableBody");
                    $tbody.empty();
                    response.data.forEach(category => {
                        $tbody.append(`
                            <tr>
                                <td>${category.categoryId}</td>
                                <td>${category.name}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning edit-category me-2" data-id="${category.categoryId}" data-name="${category.name}">
                                        <i class="bi bi-pencil-square"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-category" data-id="${category.categoryId}">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching categories: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    }

    // Edit category
    $(document).on("click", ".edit-category", function () {
        const id = $(this).data("id");
        const name = $(this).data("name");
        $("#categoryModalLabel").text("Edit Category");
        $("#categoryId").val(id);
        $("#categoryName").val(name);
        $("#categoryModal").modal("show");
    });

    // Delete category
    $(document).on("click", ".delete-category", function () {
        const token = localStorage.getItem("token");
        const id = $(this).data("id");

        if (confirm("Are you sure you want to delete this category?")) {
            $.ajax({
                url: `http://localhost:8080/api/v1/admin/category/${id}`,
                type: "DELETE",
                headers: { "Authorization": "Bearer " + token },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "Category deleted successfully!");
                        fetchCategories();
                    } else {
                        showAlert("danger", response.message || "Failed to delete category.");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting category.");
                }
            });
        }
    });
});