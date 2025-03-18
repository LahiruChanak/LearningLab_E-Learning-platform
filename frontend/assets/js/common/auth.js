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

    // Main function -> handle login form submission
    $("#login-btn").on("click", function (e) {
        e.preventDefault();

        const email = $("#login-email").val();
        const password = $("#login-password").val();

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/authenticate",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({email, password}),
            success: function (response) {
                localStorage.setItem("token", response.data.token);
                showAlert("success", "Login successful!");

                // Redirect to dashboard after 1.5 seconds
                setTimeout(function () {
                    window.location.href = "../../../pages/student/student-dashboard.html";
                }, 1500);
            },
            error: function (xhr) {
                showAlert("danger", "Login failed: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
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
                $("#otpModal").modal("show");
                localStorage.setItem("signupData", JSON.stringify({email, fullName, password}));
            },
            error: function (xhr) {
                showAlert("danger", "Error sending OTP: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Main function -> handle OTP verification and registration
    $(".otp-Form").on("submit", function (e) {
        e.preventDefault();
        const signupData = JSON.parse(localStorage.getItem("signupData"));
        const otp = $(".otp-input").map(function () {
            return $(this).val();
        }).get().join("");

        const encodeEmail = encodeURIComponent(signupData.email);
        const encodeOtp = encodeURIComponent(otp);

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/verify-otp?email=" + encodeEmail + "&otp=" + encodeOtp,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                fullName: signupData.fullName,
                email: signupData.email,
                password: signupData.password
            }),
            success: function (response) {
                $("#otpModal").modal("hide");
                localStorage.setItem("token", response.data.token);
                showAlert("success", "Registration successful! You can now login.");
                localStorage.removeItem("signupData");
                $("#signupForm")[0].reset();

                // Redirect to dashboard after 1.5 seconds
                setTimeout(function () {
                    window.location.href = "../../../index.html";
                }, 1500);
            },
            error: function (xhr) {
                showAlert("danger", "Error: " + (xhr.responseJSON?.message || xhr.statusText));
                $(".otp-input").val("");
                $("#otp-input1").focus();
            }
        });
    });

    // Main function -> handle forgot password form submission
    // $("#forgot-btn").on("click", function (e) {
    //     e.preventDefault();
    //
    //     const email = $("#email").val();
    //
    //     $.ajax({
    //         url: "http://localhost:8080/api/v1/auth/send-otp",
    //         type: "POST",
    //         data: {email: email},
    //         success: function (response) {
    //             $("#otpModal").modal("show");
    //             localStorage.setItem("forgotData", JSON.stringify({email}));
    //         },
    //         error: function (xhr) {
    //             showAlert("danger", "Error sending OTP: " + (xhr.responseJSON?.message || xhr.statusText));
    //         }
    //     });
    // });

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
