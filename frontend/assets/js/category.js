$(document).ready(function () {
    // Load categories on page load
    fetchCategories();

    // Open modal for adding a new category
    $("#addCategoryBtn").on("click", function () {
        $("#categoryAddForm")[0].reset(); // Reset the add form
        $("#addCategoryModal").modal("show");
    });

    // Handle save category (Add)
    $("#saveCategoryBtn").on("click", function () {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as an admin to manage categories.");
            return;
        }

        const $button = $(this);
        $button.prop("disabled", true);

        const name = $("#categoryNameInput").val().trim();

        if (!name) {
            showAlert("danger", "Category name is required.");
            $button.prop("disabled", false);
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/admin/category",
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify({ name: name }),
            success: function (response) {
                $button.prop("disabled", false);
                if (response.status === 200) {
                    showAlert("success", "Category added successfully!");
                    $("#addCategoryModal").modal("hide");
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

    // Handle update category
    $("#updateCategoryBtn").on("click", function () {
        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("danger", "Please login as an admin to manage categories.");
            return;
        }

        const $button = $(this);
        $button.prop("disabled", true);

        const categoryId = $("#updateCategoryIdInput").val();
        const name = $("#updateCategoryNameInput").val().trim();

        if (!name) {
            showAlert("danger", "Category name is required.");
            $button.prop("disabled", false);
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/v1/admin/category/${categoryId}`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify({ name: name }),
            success: function (response) {
                $button.prop("disabled", false);
                if (response.status === 200) {
                    showAlert("success", "Category updated successfully!");
                    $("#updateCategoryModal").modal("hide");
                    fetchCategories();
                } else {
                    showAlert("danger", response.message || "Failed to update category.");
                }
            },
            error: function (xhr) {
                $button.prop("disabled", false);
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error updating category.");
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
                    const $tbody = $("#categoryList");
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

    // Edit category - Open update modal
    $(document).on("click", ".edit-category", function () {
        const id = $(this).data("id");
        const name = $(this).data("name");
        $("#updateCategoryIdInput").val(id);
        $("#updateCategoryNameInput").val(name);
        $("#updateCategoryModal").modal("show");
    });

    // Delete category - Open delete modal
    $(document).on("click", ".delete-category", function () {
        const id = $(this).data("id");
        const name = $(this).closest("tr").find("td:eq(1)").text(); // Get name from table
        $("#deleteCategoryName").text(name);
        $("#confirmDeleteCategoryBtn").data("id", id);
        $("#deleteCategoryModal").modal("show");
    });

    // Confirm delete category
    $("#confirmDeleteCategoryBtn").on("click", function () {
        const token = localStorage.getItem("token");
        const id = $(this).data("id");

        $.ajax({
            url: `http://localhost:8080/api/v1/admin/category/${id}`,
            type: "DELETE",
            headers: { "Authorization": "Bearer " + token },
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Category deleted successfully!");
                    $("#deleteCategoryModal").modal("hide");
                    fetchCategories();
                } else {
                    showAlert("danger", response.message || "Failed to delete category.");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON ? xhr.responseJSON.message : "Error deleting category.");
            }
        });
    });
});