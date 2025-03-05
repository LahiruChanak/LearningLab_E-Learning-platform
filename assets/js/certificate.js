$(document).ready(function () {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Initialize jsPDF
  window.jsPDF = window.jspdf.jsPDF;

  // Mock user data (in real app, this would come from the backend)
  const userData = {
    name: "John Johnson",
    course: "Figma A to Z",
    completionDate: "March 02, 2025",
    certificateId: "LW-20250302-789",
  };

  // Function to populate certificate with user data
  function populateCertificate(data) {
    // Update certificate content with user data
    $("#certificateFrame").find("h2.display-5").text(data.name);
    $("#certificateFrame").find("h3.display-6").text(data.course);
    $("#certificateFrame")
      .find("p.fs-5")
      .eq(2)
      .text(`with distinction on ${data.completionDate}`);
    $("#certificateFrame")
      .find("p.small.text-muted")
      .first()
      .text(`Certificate ID: ${data.certificateId}`);
  }

  // Populate certificate when modal is shown
  $("#certificateModal").on("shown.bs.modal", function () {
    populateCertificate(userData);
  });

  // Download button click handler
  $("#downloadBtn").on("click", function () {
    downloadCertificate();
  });

  // Function to download certificate as PDF
  function downloadCertificate() {
    // Get the certificate element
    const element = document.getElementById("certificateFrame");

    // Use html2canvas to capture the certificate as an image
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("landscape", "mm", "a4");

      // Calculate dimensions to fit the image properly
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      // Save the PDF using user data
      pdf.save(`${userData.name}_${userData.course}_Certificate.pdf`);
    });
  }
});
