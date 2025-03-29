function showAlert(type, message) {
  $(".alert").remove();

  type = type.toLowerCase();

  let icon;

  switch (type) {
    case "success":
      color = "alert-success";
      icon = "hgi-information-circle";
      break;
    case "danger":
      color = "alert-danger";
      icon = "hgi-alert-02";
      break;
    case "warning":
      color = "alert-warning";
      icon = "hgi-alert-circle";
      break;
    default:
      color = "alert-info";
      icon = "hgi-information-circle";
  }

  const alertHtml = `
      <div class="alert ${color} alert-dismissible fade show position-fixed bottom-0 end-0 me-3 mb-3" role="alert">
        <i class="hgi hgi-stroke ${icon} align-middle fs-4 me-2"></i>
        <span class="align-middle">${message}</span>
        <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close">
          <i class="hgi hgi-stroke hgi-multiplication-sign"></i>
        </button>
      </div>`;

  $("body").append(alertHtml);

  setTimeout(() => {
    $(".alert").animate(
      {
        right: "-100%",
      },
      1000,
      function () {
        $(this).remove();
      }
    );
  }, 5000);
}
