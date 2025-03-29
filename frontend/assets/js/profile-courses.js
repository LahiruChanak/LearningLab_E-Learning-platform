const viewAll = $("#viewAll");
const hiddenCourse = $(".hidden");
const progressCircles = $(".progress");
let showingAllCourses = false;

viewAll.on("click", function () {
    showingAllCourses = !showingAllCourses;
    hiddenCourse.each(function () {
        $(this).css("display", showingAllCourses ? "flex" : "none");
    });
    viewAll.text(showingAllCourses ? "Show Less" : "View All");
});

progressCircles.each(function () {
    const progress = $(this).attr("data-progress");
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;

    $(this).css({
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset: offset,
    });
});