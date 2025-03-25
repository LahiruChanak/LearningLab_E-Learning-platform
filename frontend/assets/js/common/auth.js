$(document).ready(function () {

/* ----------------------------------------------- Utility Functions ------------------------------------------------ */

    // ------------ Move to next input field and auto submit form (2FA modal) ------------
    $(".code-input").on("input", function () {
        const $this = $(this);
        const index = $(".code-input").index(this);
        let allFilled = $(".code-input").toArray().every(input => $(input).val().trim());

        if ($this.val() && index < $(".code-input").length - 1) {
            $(".code-input")
                .eq(index + 1)
                .focus();
        }

        if (allFilled) {
            $("#verify2FA").click();
        }
    });

    // ------------ Move to previous input field (2FA modal) ------------
    $(".code-input").on("keydown", function (e) {
        const $this = $(this);
        const index = $(".code-input").index(this);

        if (e.key === "Backspace" && !$this.val() && index > 0) {
            $(".code-input").eq(index - 1).focus();
        }
    });

    // ------------ Focus first input field (2FA modal) ------------
    $("#twoFactorModal").on("shown.bs.modal", function () {
        $(".code-input.first").focus();
    });

    // -------- focus on next input when previous input is filled --------
    $(".otp-input").on("input", function () {
        const $this = $(this);
        const index = $(".otp-input").index(this);

        if ($this.val() && index < $(".otp-input").length - 1) {
            $(".otp-input")
                .eq(index + 1)
                .focus();
        }
    });

    // -------- focus to previous input on backspace when current input is empty --------
    $(".otp-input").on("keydown", function (e) {
        const $this = $(this);
        const index = $(".otp-input").index(this);

        if (e.key === "Backspace" && !$this.val() && index > 0) {
            $(".otp-input").eq(index - 1).focus();
        }
    });

    // -------- focus on first input when modal is shown --------
    $("#otpModal").on("shown.bs.modal", function () {
        $("#otp-input1").focus();
    });

    // -------- password toggle visibility --------
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

/* ----------------------------------------------------- Login ------------------------------------------------------ */

    // -------- Login with email and password --------
    $("#login-btn").on("click", function (e) {
        e.preventDefault();

        const email = $("#login-email").val().trim();
        const password = $("#login-password").val().trim();
        const loginUrl = `http://localhost:8080/api/v1/auth/authenticate`;

        $.ajax({
            url: loginUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email, password }),
            success: function (response) {
                if (response.status === 200) {
                    // Login successful, no 2FA required
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("role", response.data.role); // Store role
                    showAlert("success", "Login successful! Redirecting...");

                    setTimeout(() => {
                        if (response.data.role === "ADMIN") {
                            window.location.href = "../../../../frontend/pages/admin/admin-dashboard.html";
                        } else {
                            window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
                        }
                    }, 1500);
                } else if (response.status === 206) {
                    // 2FA required
                    $("#twoFactorModal").modal("show");
                    $("#twoFactorModal").data("email", email);
                } else {
                    showAlert("danger", "Login failed: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Login failed: " + (xhr.responseJSON?.message || xhr.statusText));
            }
        });
    });

    // ------------ verify 2fa login ------------
    $("#verify2FA").on("click", function (e) {
        const email = $("#twoFactorModal").data("email");
        const inputs = $(".code-input");
        let code = "";
        inputs.each(function () {
            code += $(this).val();
        });
        const errorContainer = $(".error")
        const errorMessage = $("#error-message");

        if (code.length !== 6) {
            errorMessage.text("Please enter a 6-digit code.");
            errorContainer.show();
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/2fa/verify",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email: email, code: code }),
            success: function (response) {
                if (response.status === 200) {
                    errorMessage.text("");
                    localStorage.setItem("token", response.data.token);
                    showAlert("success", "2FA verified, login successful!");
                    $("#twoFactorModal").modal("hide");
                    $(".code-input").val("");
                    setTimeout(() => {
                        window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
                    }, 1500);
                } else {
                    errorMessage.text(response.message || "Invalid 2FA code. Please try again.");
                    errorContainer.show();
                }
            },
            error: function (xhr) {
                errorMessage.text(xhr.responseJSON ? xhr.responseJSON.message : "Failed to verify 2FA.");
                errorContainer.show();
            }
        });
    });

/* ---------------------------------------------- Google through login ---------------------------------------------- */

    // // Add an AJAX interceptor to include the token in all requests
    // $.ajaxSetup({
    //     beforeSend: function (xhr) {
    //         const token = localStorage.getItem("token");
    //         if (token) {
    //             xhr.setRequestHeader("Authorization", "Bearer " + token);
    //         }
    //     },
    //     error: function (xhr, status, error) {
    //         if (xhr.status === 401) {
    //             // Handle unauthorized access (e.g., redirect to login)
    //             showAlert("danger", "Session expired. Please login again to continue.");
    //             setTimeout(() => {
    //                 window.location.href = "../../../../frontend/index.html";
    //             }, 1500);
    //         }
    //     }
    // });
    //
    // $("#google-login-btn").on("click", function (e) {
    //     e.preventDefault();
    //     window.location.href = "http://localhost:8080/api/v1/auth/google";
    // });
    //
    // // Handle Google OAuth2 callback
    // function handleGoogleCallback() {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const token = urlParams.get("token");
    //     const error = urlParams.get("error");
    //
    //     if (token) {
    //         localStorage.setItem("token", token);
    //         showAlert("success", "Google login successful!");
    //         setTimeout(() => {
    //             window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
    //         }, 1500);
    //     } else if (error) {
    //         showAlert("danger", "Google login failed: " + error);
    //     } else {
    //         // Fetch token from callback endpoint if not in URL
    //         $.ajax({
    //             url: "http://localhost:8080/api/v1/auth/google/callback",
    //             method: "GET",
    //             success: function (response) {
    //                 if (response.token) {
    //                     localStorage.setItem("token", response.token);
    //                     showAlert("success", "Google login successful!");
    //                     setTimeout(() => {
    //                         window.location.href = "../../../../frontend/pages/student/student-dashboard.html";
    //                     }, 1500);
    //                 }
    //             },
    //             error: function (xhr) {
    //                 showAlert("danger", "Google login failed: " + xhr.responseJSON.error);
    //             }
    //         });
    //     }
    // }
    //
    // // Call this on page load if on the callback page
    // if (window.location.pathname.includes("callback")) {
    //     handleGoogleCallback();
    // }

/* ----------------------------------------------------- Signup ----------------------------------------------------- */

    // -------- send otp for signup --------
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

    // -------- signup --------
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
                localStorage.setItem("role", response.data.role); // Store role
                showAlert("success", "Registration successful! Redirecting...");

                localStorage.removeItem("signupData");
                $("#signupForm")[0].reset();
                $(".password-strength-bar").css({ width: "0%", background: "#e0e0e0" });

                setTimeout(() => {
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

/* ------------------------------------------------ Forgot Password ------------------------------------------------- */

    // --------- send reset password OTP ---------
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

    // --------- reset password ---------
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
                    $(".password-strength-bar").css({width: "0%", background: "#e0e0e0"});

                    setTimeout(() => {
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

/* --------------------------------------------------- Resend OTP --------------------------------------------------- */

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
