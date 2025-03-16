$(document).ready(function () {

    // OTP modal -> focus on next input when previous input is filled
    $(".otp-input").on("input", function () {
        const $this = $(this);
        const index = $(".otp-input").index(this);

        if ($this.val() && index < $(".otp-input").length - 1) {
            $(".otp-input")
                .eq(index + 1)
                .focus();
        }
    });

    // OTP modal -> focus to previous input on backspace when current input is empty
    $(".otp-input").on("keydown", function (e) {
        const $this = $(this);
        const index = $(".otp-input").index(this);

        if (e.key === "Backspace" && !$this.val() && index > 0) {
            $(".otp-input")
                .eq(index - 1)
                .focus();
        }
    });

    // OTP modal -> focus on first input when modal is shown
    $("#otpModal").on("shown.bs.modal", function () {
        $("#otp-input1").focus();
    });

    // Optional function -> password toggle visibility
    $(".password-toggle").on("click", function () {
        const $input = $(this).closest(".input-container").find("input");
        const $icon = $(this).find("i");

        if ($input.attr("type") === "password") {
            $input.attr("type", "text");
            $icon.removeClass("hgi-view-off-slash").addClass("hgi-view");
            $(this).attr("aria-label", "Hide password");
        } else {
            $input.attr("type", "password");
            $icon.removeClass("hgi-view").addClass("hgi-view-off-slash");
            $(this).attr("aria-label", "Show password");
        }
    });

    // Main function -> handle signup form submission
    $("#signup-btn").on("click", function (e) {
        e.preventDefault();

        const email = $("#email").val();
        const fullName = $("#fullName").val();
        const password = $("#password").val();
        const confirmPassword = $("#confirm-password").val();

        if (!email || !fullName || !password || password !== confirmPassword) {
            showAlert("warning", "Please fill all fields correctly!");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/send-otp",
            type: "POST",
            data: {email: email},
            success: function (response) {
                console.log("OTP sent:", response);
                $("#otpModal").modal("show");
            },
            error: function (xhr) {
                console.error("Error:", xhr);
                showAlert("danger", "Error sending OTP: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Main function -> handle OTP verification
    $(".otp-Form").on("submit", function (e) {
        e.preventDefault();
        const email = $("#email").val();
        const otp = $(".otp-input").map(function () {
            return $(this).val();
        }).get().join("");

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/verify-otp",
            type: "POST",
            data: {email: email, otp: otp},
            success: function (response) {
                $("#otpModal").modal("hide");
                showAlert("success", "Registration successful!");
            },
            error: function (xhr) {
                showAlert("danger", "Error verifying OTP: " + xhr.responseJSON.message || xhr.statusText);
                $(".otp-input").val("");
                $("#otp-input1").focus();
            }
        });
    });

    // Main function -> handle resend OTP
    $(".resendBtn").on("click", function (e) {
        e.preventDefault();
        const email = $("#email").val();

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/send-otp",
            type: "POST",
            data: {email: email},
            success: function (response) {
                showAlert("success", "OTP resent successfully!");
                $(".otp-input").val("");
                $("#otp-input1").focus();
            },
            error: function (xhr) {
                showAlert("danger", "Error resending OTP: " + xhr.responseJSON.message || xhr.statusText);
            }
        });
    });
});
