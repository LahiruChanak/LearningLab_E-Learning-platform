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
            $(".otp-input").eq(index - 1).focus();
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

        const loginUrl = `http://localhost:8080/api/v1/auth/authenticate`;

        $.ajax({
            url: loginUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({email, password}),
            success: function (response) {
                localStorage.setItem("token", response.data.token);
                showAlert("success", "Login successful!");

                // Redirect to dashboard after 1.5 seconds
                setTimeout(function () {
                    window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
                }, 1500);
            },
            error: function (xhr) {
                showAlert("danger", "Login failed: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    /* ---------------------------------- Google through login ---------------------------------- */

    $("#google-login-btn").on("click", function (e) {
        e.preventDefault();
        window.location.href = "http://localhost:8080/api/v1/auth/google";
    });

    function handleGoogleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");

        if (token) {
            localStorage.setItem("token", token);
            showAlert("success", "Google login successful!");
            setTimeout(function () {
                window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
            }, 1500);
        } else if (error) {
            showAlert("danger", "Google login failed: " + error);
        }
    }

    handleGoogleCallback();

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

        const signupOtpUrl = `http://localhost:8080/api/v1/auth/send-otp`;

        $.ajax({
            url: signupOtpUrl,
            type: "POST",
            data: {email: email},
            success: function (response) {
                $("#otpModal").modal("show");
                localStorage.setItem("signupData", JSON.stringify({email, fullName, password}));
                showAlert("success", "OTP sent to your email. Please check your inbox!");
            },
            error: function (xhr) {
                showAlert("danger", "Error sending OTP: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // Main function -> handle OTP verification and registration
    $("#signupOtpForm").on("submit", function (e) {
        e.preventDefault();

        const signupData = JSON.parse(localStorage.getItem("signupData"));
        const otp = $(".otp-input").map(function () {
            return $(this).val();
        }).get().join("");

        const registerUrl = `http://localhost:8080/api/v1/auth/verify-otp?email=${encodeURIComponent(signupData.email)}&otp=${encodeURIComponent(otp)}`;

        $.ajax({
            url: registerUrl,
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
                    window.location.href = "../../../../frontend/index.html";
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
    $("#forgotPWForm").on("submit", function (e) {
        e.preventDefault();
        const email = $("#email").val();

        if (!email) {
            showAlert("warning", "Please enter your email!");
            return;
        }

        const resetOtpUrl = `http://localhost:8080/api/v1/auth/reset-pw-otp?email=${encodeURIComponent(email)}`;

        $.ajax({
            url: resetOtpUrl,
            type: "POST",
            data: {},
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Reset OTP sent to your email. Please check your inbox!");
                    $("#otpModal").modal("show");
                    localStorage.setItem("resetEmail", email);
                } else {
                    showAlert("danger", response.message || "Failed to send reset OTP. Please try again!");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON?.message || xhr.statusText);
            }
        });
    });

    // Main function -> handle reset password OTP verify and password reset
    $("#resetPWOtpForm").on("submit", function (e) {
        e.preventDefault();

        const email = localStorage.getItem("resetEmail");
        const otp = $(".otp-input").map(function () {
            return $(this).val();
        }).get().join("");
        const newPassword = $("#newPassword").val();
        const confirmPassword = $("#confirm-password").val();

        if (!otp || !newPassword || newPassword !== confirmPassword) {
            showAlert("warning", "Please fill all fields correctly!");
            return;
        }

        const resetPasswordUrl = `http://localhost:8080/api/v1/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`;

        $.ajax({
            url: resetPasswordUrl,
            type: "POST",
            data: {},
            success: function (response) {
                if (response.status === 200) {
                    showAlert("success", "Password reset successful!");
                    $("#otpModal").modal("hide");
                    localStorage.removeItem("resetEmail");
                    $("#forgotPWForm")[0].reset();

                    // Redirect to login page after 1.5 seconds
                    setTimeout(function () {
                        window.location.href = "../../index.html";
                    }, 1500);
                } else {
                    showAlert("danger", response.message || "Failed to reset password");
                }
            },
            error: function (xhr) {
                showAlert("danger", xhr.responseJSON?.message || xhr.statusText);
                $("#reset-otp").val("");
                $("#newPassword").val("");
                $("#confirm-new-password").val("");
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
