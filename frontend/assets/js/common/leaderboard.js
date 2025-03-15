$(document).ready(function () {
  // Time filter interaction
  $(".time-filter select").change(function () {
    const selectedTime = $(this).val();
    $(".leaders-grid").fadeOut(200, function () {
      // Here you would typically update the data
      $(this).fadeIn(200);
    });
  });

  // Filter buttons interaction
  $(".filter-btn").click(function () {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    $(".ranking-table tbody").fadeOut(200, function () {
      // Here you would typically update the table data
      $(this).fadeIn(200);
    });
  });

  // Animate progress bars on scroll
  function animateProgressBars() {
    $(".progress-bar").each(function () {
      const width = $(this)
        .attr("style")
        .match(/width: (\d+)%/)[1];
      $(this)
        .css("width", "0%")
        .animate(
          {
            width: width + "%",
          },
          1000
        );
    });
  }

  // Trigger animation when element comes into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateProgressBars();
        observer.unobserve(entry.target);
      }
    });
  });

  $(".progress").each(function () {
    observer.observe(this);
  });
});
