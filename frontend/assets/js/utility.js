$(document).ready(function () {
    const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
    const tooltipList = tooltipTriggerList
        .map(function () {
            return new bootstrap.Tooltip(this);
        })
        .get();

    $(".sub-navigation-menu li").on("click", function () {
        const pageName = $(this).attr("data-page");
        if (pageName) {
            showPage(pageName);
        }
    });

    // Navigation System inside the profile page
    function showPage(pageName) {
        // Hide all pages
        $(".page").each(function () {
            $(this).removeClass("active");
        });

        // Deactivate all tab items
        $(".sub-navigation-menu li").each(function () {
            $(this).removeClass("active");
        });

        // Show the selected page
        const selectedPage = $("#" + pageName);
        if (selectedPage.length) {
            selectedPage.addClass("active");
        }

        // Activate the corresponding tab
        const selectedTab = $(`.sub-navigation-menu li[data-page="${pageName}"]`);
        if (selectedTab.length) {
            selectedTab.addClass("active");
        }
    }
});

