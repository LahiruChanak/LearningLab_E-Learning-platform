// Alert management functions
function showAlert(type, message) {
  $(".alert").remove();
  const icon =
    type === "success"
      ? "hgi-information-circle"
      : "danger"
      ? "hgi-alert-02"
      : "warning"
      ? "hgi-alert-circle"
      : "";

  const alertHtml = `
      <div class="alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3" role="alert">
        <i class="hgi hgi-stroke ${icon} align-middle fs-4 me-2"></i>
        ${message}
        <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;

  $("body").append(alertHtml);

  //   setTimeout(
  //     () =>
  //       $(".alert").fadeOut("slow", function () {
  //         $(this).remove();
  //       }),
  //     5000
  //   );
}
