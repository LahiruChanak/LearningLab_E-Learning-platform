// --------------------------- OTP modal ---------------------------

// focus on next input when when previous input is filled
const otpInputs = document.querySelectorAll(".otp-input");
otpInputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    if (e.target.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// focus on first input
const otpModal = document.getElementById("otpModal");
otpModal.addEventListener("shown.bs.modal", () => {
  document.getElementById("otp-input1").focus();
});
