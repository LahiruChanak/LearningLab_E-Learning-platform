const viewAllBtn = $("#viewAllBtn");
const hiddenAchievements = $(".hidden");
const achievementCount = $("#achievement-count");
let showingAllAchieve = false;

viewAllBtn.on("click", function () {
    showingAllAchieve = !showingAllAchieve;
    hiddenAchievements.each(function () {
        $(this).css("display", showingAllAchieve ? "flex" : "none");
    });
    viewAllBtn.text(showingAllAchieve ? "Show Less" : "View All");
});