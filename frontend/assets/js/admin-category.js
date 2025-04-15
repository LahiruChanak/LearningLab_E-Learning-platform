$(document).ready(function () {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    let allCategories = [];
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token && role !== "ADMIN") {
        showAlert("danger", "Please login as an admin to manage categories.");
        return;
    }

    fetchCategories();

    // Open modal for adding a new category
    $("#addCategoryBtn").on("click", function () {
        $("#categoryAddForm")[0].reset();
        $("#addCategoryModal").modal("show");
    });

    // Handle save category (Add)
    $("#saveCategoryBtn").on("click", function () {
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
        if (!token) {
            showAlert("danger", "Please login to view categories.");
            $("#categoryList").html('<tr><td colspan="3" class="text-center text-muted">Login required</td></tr>');
            console.log("No token found");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/category",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function(response) {
                console.log("Categories API Response:", response);
                if (response.status === 200 && Array.isArray(response.data)) {
                    allCategories = response.data;
                    renderCategories(allCategories);
                } else {
                    showAlert("danger", "Invalid categories data.");
                    $("#categoryList").html('<tr><td colspan="3" class="text-center text-muted">No categories available</td></tr>');
                }
            },
            error: function(xhr) {
                showAlert("danger", "Error fetching categories: " + (xhr.responseJSON?.message || xhr.statusText));
                $("#categoryList").html('<tr><td colspan="3" class="text-center text-muted">Failed to load categories</td></tr>');
            }
        });
    }

    // Render categories in the table
    function renderCategories(categories) {
        const $tbody = $("#categoryList");
        $tbody.empty();
        if (categories.length === 0) {
            $tbody.append('<tr><td colspan="3" class="text-center text-muted p-4">No categories found</td></tr>');
            return;
        }
        categories.forEach(category => {
            $tbody.append(`
        <tr>
          <td>${category.categoryId}</td>
          <td>${category.name}</td>
          <td>
            <button class="btn btn-action btn-edit edit-category me-2" data-id="${category.categoryId}" data-name="${category.name}" 
                    data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit">
              <i class="hgi hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
            </button>
            <button class="btn btn-action btn-delete delete-category" data-id="${category.categoryId}"
                    data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Delete">
              <i class="hgi hgi-stroke hgi-delete-01 fs-5 align-middle"></i>
            </button>
          </td>
        </tr>
      `);
        });
        $(".btn-action").tooltip({ trigger: "hover" });
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

    // Search handler
    $("#categorySearch").on("input", function() {
        const searchText = $(this).val().trim().toLowerCase();
        const filteredCategories = allCategories.filter(category =>
            category.name.toLowerCase().includes(searchText) ||
            category.categoryId.toString().includes(searchText)
        );
        renderCategories(filteredCategories);
    });
});