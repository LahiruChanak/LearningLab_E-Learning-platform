$(document).ready(function () {
    const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
    const tooltipList = tooltipTriggerList
        .map(function () {
            return new bootstrap.Tooltip(this);
        })
        .get();

    // Initialize all required elements
    const tabItems = $(".sub-navigation-menu li");
    const pages = $(".page");
    const profileModal =
        bootstrap.Modal.getInstance($("#profileModal")[0]) ||
        new bootstrap.Modal($("#profileModal")[0]);
    let currentFile = null;

    // Password and Email Modal Initialization
    const passwordModal = new bootstrap.Modal($("#passwordModal")[0]);
    const emailModal = new bootstrap.Modal($("#emailModal")[0]);
    const passwordForm = $("#passwordUpdateForm");
    const emailForm = $("#emailUpdateForm");

    // Password visibility toggle
    $(".password-toggle").on("click", function () {
        const $input = $(this).closest(".position-relative").find("input");
        const $icon = $(this).find("i");

        if ($input.attr("type") === "password") {
            $input.attr("type", "text");
            $icon.removeClass("hgi-view").addClass("hgi-view-off-slash");
        } else {
            $input.attr("type", "password");
            $icon.removeClass("hgi-view-off-slash").addClass("hgi-view");
        }
    });

    // Navigation System
    function showPage(pageName) {
        // Hide all pages
        pages.each(function () {
            $(this).removeClass("active");
        });

        // Deactivate all tab items
        tabItems.each(function () {
            $(this).removeClass("active");
        });

        // Show the selected page
        const selectedPage = $("#" + pageName);
        if (selectedPage.length) {
            selectedPage.addClass("active");
        }

        // Activate the corresponding tab
        const selectedTab = $(`.sub-navigation-menu li[data-page="${pageName}"]`);
        if (selectedTab.length) {
            selectedTab.addClass("active");
        }
    }

    // Add click event listeners to each tab item
    tabItems.on("click", function () {
        const pageName = $(this).attr("data-page");
        if (pageName) {
            showPage(pageName);
        }
    });

    // Function to handle hash and show tab
    function handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove the '#'
        if (hash) {
            // Prevent browser from scrolling to hash
            history.pushState(
                "",
                document.title,
                window.location.pathname + window.location.search
            );
            showPage(hash);
            $(window).scrollTop(0);
        } else if (tabItems.length > 0) {
            const initialPage = tabItems.eq(0).attr("data-page");
            showPage(initialPage);
        }
    }

    handleHashChange();

    // Listen for hash changes (ex:-, clicking notification icon on the same page)
    $(window).on("hashchange", handleHashChange);

    // lock scroll position on load
    $(window).on("load", function () {
        $(window).scrollTop(0);
    });

    // retrieve user profile details
    function retrieveUserProfile() {
        const token = localStorage.getItem("token");

        if (!token) {
            showAlert(
                "danger",
                "You are not logged in. Please login to view your profile."
            );
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/profile",
            type: "GET",
            headers: {
                Authorization: "Bearer " + token,
            },
            success: function (response) {
                if (response.status === 200) {
                    const userData = response.data;

                    $(".profile-info #fullName").text(userData.fullName);
                    $(".profile-info #role").text(
                        userData.role
                            ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase()
                            : "-"
                    );
                    $(".profile-info #bio").text(userData.bio || "No bio provided");

                    if (userData.profilePicture) {
                        $("#profilePreview").attr("src", userData.profilePicture);
                    }

                    // Populate all sections
                    $(".section").each(function () {
                        const section = $(this);
                        const [firstName, ...lastName] = (userData.fullName || "").trim().split(" ");
                        section.find("[data-field='firstName']").val(firstName || "").data("originalValue", firstName || "");
                        section.find("[data-field='lastName']").val(lastName.join(" ") || "").data("originalValue", lastName.join(" ") || "");
                        section.find("[data-field='contact']").val(userData.contact || "").data("originalValue", userData.contact || "");
                        section.find("[data-field='bio']").val(userData.bio || "").data("originalValue", userData.bio || "");
                        section.find("[data-field='address']").val(userData.address || "").data("originalValue", userData.address || "");
                        section.find("[data-field='githubLink']").val(userData.githubLink || "").data("originalValue", userData.githubLink || "");
                        section.find("[data-field='linkedinLink']").val(userData.linkedinLink || "").data("originalValue", userData.linkedinLink || "");
                        section.find("[data-field='stackOverflowLink']").val(userData.stackOverflowLink || "").data("originalValue", userData.stackOverflowLink || "");
                        section.find("[data-field='websiteLink']").val(userData.websiteLink || "").data("originalValue", userData.websiteLink || "");
                    });

                } else {
                    showAlert("danger", "Failed to load profile: " + response.message);
                }
            },
            error: function (xhr) {
                showAlert("danger", "Error fetching profile: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
            },
        });
    }

    // Update user profile details
    $(".edit-btn").on("click", function () {
        const button = this;
        const section = $(this).closest(".section");
        const inputs = section.find("input, textarea");

        inputs.each(function () {
            $(this).prop("disabled", !$(this).prop("disabled"));
        });

        if (inputs.eq(0).prop("disabled")) {
            $(this).html(`
                <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
                Edit
            `);

            const actionButtons = section.find(".action-buttons");
            if (actionButtons.length) {
                actionButtons.remove();
            }

            inputs.each(function () {
                $(this).val($(this).data("originalValue") || $(this).val());
            });
        } else {
            $(this).html('<span class="text-body-tertiary">Cancel</span>');

            inputs.each(function () {
                $(this).data("originalValue", $(this).val());
            });

            if (!section.find(".action-buttons").length) {
                const actionDiv = $('<div class="action-buttons d-flex justify-content-end mt-3"></div>');
                actionDiv.html(`
                    <button class="btn btn-primary save-changes-btn">Save Changes</button>
                `);
                section.append(actionDiv);

                const saveBtn = actionDiv.find(".save-changes-btn");
                saveBtn.on("click", function () {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        showAlert("danger", "Please log in to save changes.");
                        return;
                    }

                    // Collect only the fields in this section
                    const updatedProfile = {};
                    inputs.each(function () {
                        const field = $(this).data("field");
                        if (field) {
                            updatedProfile[field] = $(this).val();
                        }
                    });

                    // Special case for fullName if split into first/last
                    if (section.find("[data-field='firstName']").length && section.find("[data-field='lastName']").length) {
                        updatedProfile.fullName = section.find("[data-field='firstName']").val() + " " + section.find("[data-field='lastName']").val();
                        delete updatedProfile.firstName;
                        delete updatedProfile.lastName;
                    }

                    $.ajax({
                        url: "http://localhost:8080/api/v1/user/profile",
                        type: "PUT",
                        headers: {
                            "Authorization": "Bearer " + token
                        },
                        contentType: "application/json",
                        data: JSON.stringify(updatedProfile),
                        success: function (response) {
                            if (response.status === 200) {
                                showAlert("success", "Profile details updated successfully!");
                                inputs.each(function () {
                                    $(this).prop("disabled", true);
                                });
                                actionDiv.remove();
                                $(button).html(`
                                    <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
                                    Edit
                                `);
                                retrieveUserProfile();
                            } else {
                                showAlert("danger", "Failed to update profile: " + response.message);
                            }
                        },
                        error: function (xhr) {
                            showAlert("danger", "Error updating profile: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
                        }
                    });
                });
            }
        }
    });

    retrieveUserProfile();

    // Word counter for bio textarea
    const MAX_WORDS = 50;

    function countWords(text) {
        const trimmedText = text.trim();
        if (!trimmedText) return 0;
        return trimmedText.split(/\s+/).length;
    }

    function updateWordCounter() {
        const $textarea = $("textarea[data-field='bio']");
        const wordCount = countWords($textarea.val());
        const remainingWords = MAX_WORDS - wordCount;
        const $counter = $(".count");

        $counter.text(`${remainingWords}`);

        if (remainingWords < 10 && remainingWords > 5) {
            $counter.removeClass("danger").addClass("warning");
        } else if (remainingWords <= 5 && remainingWords >= 0) {
            $counter.removeClass("warning").addClass("danger");
        } else {
            $counter.removeClass("warning danger");
        }

        // Truncate if limit exceeded
        if (remainingWords < 0) {
            $textarea.val($textarea.val().split(/\s+/).slice(0, MAX_WORDS).join(" "));
            $counter.text("0");
            $counter.removeClass("warning").addClass("danger");
        }
    }

    updateWordCounter();
    $("textarea[data-field='bio']").on("input", updateWordCounter);

    // Update modal preview with current profile picture
    $("#profileModal").on("show.bs.modal", function () {
        const currentProfileSrc = $("#profilePreview").attr("src");
        $("#imagePreview").attr("src", currentProfileSrc);
    });

    // Profile Picture System
    $("#imageUpload").on("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showAlert("warning", "File size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                $("#imagePreview").attr("src", e.target.result);
                currentFile = file;
            };
            reader.readAsDataURL(file);
        }
    });

    // Profile picture upload using file chooser
    window.saveChanges = function () {
        if (currentFile) {
            const formData = new FormData();
            formData.append("image", currentFile);
            const token = localStorage.getItem("token");

            $.ajax({
                url: "http://localhost:8080/api/v1/user/profile/image",
                type: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                },
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.status === 200) {
                        $("#profilePreview").attr("src", response.data);
                        showAlert("success", "Profile image updated successfully!");
                        profileModal.hide();

                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showAlert("danger", "Failed to upload image: " + response.message);
                    }
                },
                error: function (xhr) {
                    showAlert(
                        "danger",
                        "Error uploading image: " +
                        (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText)
                    );
                },
            });
        }
    };

    // Camera capture functionality for profile picture
    window.takePhoto = function () {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({video: true})
                .then(function (stream) {
                    const $video = $("<video>").attr("srcObject", stream).get(0);
                    const $canvas = $("<canvas>").get(0);
                    $video.play();

                    setTimeout(function () {
                        $canvas.width = $video.videoWidth;
                        $canvas.height = $video.videoHeight;
                        $canvas.getContext("2d").drawImage($video, 0, 0);

                        $canvas.toBlob(function (blob) {
                            const file = new File([blob], "camera-photo.jpg", {
                                type: "image/jpeg",
                            });
                            currentFile = file;
                            $("#imagePreview").attr("src", $canvas.toDataURL("image/jpeg"));

                            stream.getTracks().forEach(function (track) {
                                track.stop();
                            });
                        }, "image/jpeg");
                    }, 1500);
                })
                .catch(function (error) {
                    showAlert("danger", "Error accessing camera: " + error.message);
                });
        } else {
            showAlert("danger", "Camera not supported on this device/browser.");
        }
    };

    // Function to update remove-image visibility based on image source (remove-btn show when the image isn't the default image)
    function updateRemoveImageVisibility() {
        const defaultImage = "../../assets/images/icons/placeholder.svg";
        if ($("#profilePreview").attr("src") === defaultImage) {
            $(".profile-preview-container .remove-image").hide();
        } else {
            $(".profile-preview-container .remove-image").css("display", "");
        }
    }

    updateRemoveImageVisibility();
    $("#profilePreview").on("load", updateRemoveImageVisibility);

    // Remove profile image
    $(".remove-image").on("click", function () {
        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("danger", "Please log in to the system to remove your profile image.");
            return;
        }

        $("#profileModal").modal("hide");
        $("#deleteConfirmModal").modal("show");

        $("#confirmDelete").off("click").on("click", function () {
            $.ajax({
                url: "http://localhost:8080/api/v1/user/profile/image",
                type: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {
                    if (response.status === 200) {
                        showAlert("success", "Profile image removed successfully!");
                        $("#deleteConfirmModal").modal("hide");

                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showAlert("danger", "Failed to remove image: " + response.message);
                        $("#deleteConfirmModal").modal("hide");
                    }
                },
                error: function (xhr) {
                    showAlert("danger", "Error removing image: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
                    $("#deleteConfirmModal").modal("hide");
                }
            });
        });

        $("#cancelDelete").off("click").on("click", function () {
            $("#deleteConfirmModal").modal("hide");
            $("#profileModal").modal("show");
        });
    });

//     // Function to get token from URL query parameter
//     function getTokenFromUrl() {
//         const urlParams = new URLSearchParams(window.location.search);
//         return urlParams.get("token");
//     }
//
// // Store token in localStorage after login
//     const tokenFromUrl = getTokenFromUrl();
//     if (tokenFromUrl) {
//         localStorage.setItem("token", tokenFromUrl); // Changed to "token"
//         console.log("Token stored:", tokenFromUrl);
//     }

// Skill tag system
    const editSkillsBtn = $(".skills-section .edit-skill-btn");
    const skillTagsContainer = $(".skill-tags");

    function loadUserSkills() {
        const token = localStorage.getItem("token"); // Changed to "token"
        if (!token) {
            console.error("No token found. Redirecting to login...");
            window.location.href = "/login";
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/user/skills",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                if (response.status === 200) {
                    skillTagsContainer.empty();
                    response.data.forEach(skill => {
                        const skillTag = $('<span class="skill-tag"></span>').text(skill);
                        skillTagsContainer.append(skillTag);
                    });
                }
            },
            error: function(xhr) {
                console.error("Error loading skills:", xhr.responseText);
                if (xhr.status === 401 || xhr.status === 403) {
                    window.location.href = "/login";
                }
            }
        });
    }

// Load skills on page load
    loadUserSkills();

    editSkillsBtn.on("click", function () {
        const token = localStorage.getItem("token"); // Changed to "token"
        const isEditMode = editSkillsBtn.attr("data-state") === "edit";

        if (isEditMode) {
            editSkillsBtn.html(`<span class="text-body-tertiary">Done</span>`);
            editSkillsBtn.attr("data-state", "done");

            const skillTags = skillTagsContainer.find(".skill-tag:not(.empty-skill)");
            skillTags.each(function () {
                $(this).addClass("edit-mode");
                if (!$(this).find(".remove-skill").length) {
                    const removeIcon = $('<span class="remove-skill">×</span>');
                    removeIcon.on("click", function () {
                        const skillName = $(this).parent().text().replace('×', '').trim();
                        $.ajax({
                            url: "http://localhost:8080/api/v1/user/skills",
                            method: "DELETE",
                            contentType: "application/json",
                            headers: {
                                "Authorization": "Bearer " + token
                            },
                            data: JSON.stringify({ skillName: skillName }),
                            success: function(response) {
                                if (response.status === 200) {
                                    $(this).parent().remove();
                                }
                            }.bind(this),
                            error: function(xhr) {
                                console.error("Error removing skill:", xhr.responseText);
                            }
                        });
                    });
                    $(this).append(removeIcon);
                }
            });

            const emptySkillTag = $('<span class="skill-tag empty-skill"></span>');
            emptySkillTag.html(`
            <input type="text" placeholder="Add skill" />
            <i class="hgi-stroke hgi-tick-01 save-tick-input"></i>
        `);
            skillTagsContainer.append(emptySkillTag);

            const inputField = emptySkillTag.find("input");
            const saveTick = emptySkillTag.find(".save-tick-input");

            saveTick.on("click", function () {
                if (inputField.val().trim() !== "") {
                    const skillName = inputField.val().trim();
                    $.ajax({
                        url: "http://localhost:8080/api/v1/user/skills",
                        method: "POST",
                        contentType: "application/json",
                        headers: {
                            "Authorization": "Bearer " + token
                        },
                        data: JSON.stringify({ skillName: skillName }),
                        success: function(response) {
                            if (response.status === 200) {
                                const newSkillTag = $('<span class="skill-tag edit-mode"></span>');
                                newSkillTag.text(skillName);

                                const removeIcon = $('<span class="remove-skill">×</span>');
                                removeIcon.on("click", function () {
                                    $.ajax({
                                        url: "http://localhost:8080/api/v1/user/skills",
                                        method: "DELETE",
                                        contentType: "application/json",
                                        headers: {
                                            "Authorization": "Bearer " + token
                                        },
                                        data: JSON.stringify({ skillName: skillName }),
                                        success: function(response) {
                                            if (response.status === 200) {
                                                newSkillTag.remove();
                                            }
                                        },
                                        error: function(xhr) {
                                            console.error("Error removing skill:", xhr.responseText);
                                        }
                                    });
                                });
                                newSkillTag.append(removeIcon);

                                skillTagsContainer.find(".empty-skill").before(newSkillTag);
                                inputField.val("");
                            }
                        },
                        error: function(xhr) {
                            console.error("Error adding skill:", xhr.responseText);
                        }
                    });
                }
            });
        } else {
            editSkillsBtn.html(`
            <i class="hgi-stroke hgi-pencil-edit-02 fs-5 align-middle"></i>
            Edit
        `);
            editSkillsBtn.attr("data-state", "edit");

            const skillTags = skillTagsContainer.find(".skill-tag");
            skillTags.each(function () {
                $(this).removeClass("edit-mode");
                const removeIcon = $(this).find(".remove-skill");
                if (removeIcon.length) {
                    removeIcon.remove();
                }
            });

            const emptySkillTag = skillTagsContainer.find(".empty-skill");
            if (emptySkillTag.length) {
                emptySkillTag.remove();
            }
        }
    });

    // Two-Factor Authentication
    function moveToNext(currentInput) {
        const inputs = $(".code-input");
        const currentIndex = inputs.index(currentInput);

        if (
            $(currentInput).val().length === 1 &&
            currentIndex < inputs.length - 1
        ) {
            inputs.eq(currentIndex + 1).focus();
        }
    }

    // Enable 2FA functionality
    function enable2FA() {
        const inputs = $(".code-input");
        let code = "";
        inputs.each(function () {
            code += $(this).val();
        });

        const errorMessage = $("#error-message");

        // Simulated valid code (e.g., "123456")
        if (code === "123456") {
            errorMessage.text("");
            showAlert("success", "2FA has been successfully enabled!");
            // Close the modal
            const modal = bootstrap.Modal.getInstance($("#twoFactorModal")[0]);
            modal.hide();
        } else {
            errorMessage.text("Invalid verification code. Please try again.");
        }
    }

    // Function to copy the code to clipboard
    function copyCode() {
        const codeInput = $("#codeInput");
        const code = codeInput.val();

        // Use the Clipboard API to copy the text
        navigator.clipboard
            .writeText(code)
            .then(() => {
                showAlert("info", "Code copied to clipboard.");
            })
            .catch((error) => {
                console.error("Failed to copy code:", error);
                showAlert("danger", "Failed to copy code. Please try again.");
            });
    }

    /* -------------------------- Achievements -------------------------- */

    const viewAllBtn = $("#viewAllBtn");
    const hiddenAchievements = $(".hidden");
    const achievementCount = $("#achievement-count");
    let showingAllAchieve = false;

    viewAllBtn.on("click", function () {
        showingAllAchieve = !showingAllAchieve;
        hiddenAchievements.each(function () {
            $(this).css("display", showingAllAchieve ? "flex" : "none");
        });
        viewAllBtn.text(showingAllAchieve ? "Show Less" : "View All");
    });

    /* -------------------------- Courses -------------------------- */

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

    /* -------------------------- Billing -------------------------- */

    const viewHistoryBtn = $("#viewHistory");
    const billingInfo = $("#billingInfo");
    const billingHistory = $("#billingHistory");
    const cardNumber = $("#card-number");
    const cvvCode = $("#cvv-code");
    let isHistoryVisible = false;

    // Mask card number
    const cardOriginal = cardNumber.attr("data-original");
    const cardParts = cardOriginal.split(" ");
    const maskedParts = cardParts.map((part, index) =>
        index < 3 ? "****" : part
    );
    cardNumber.text(maskedParts.join(" "));

    // Mask CVV
    const cvvOriginal = cvvCode.attr("data-original");
    cvvCode.text("*".repeat(cvvOriginal.length));

    // Initially hide billing history
    billingHistory.css("display", "none");

    viewHistoryBtn.on("click", function () {
        isHistoryVisible = !isHistoryVisible;

        if (isHistoryVisible) {
            billingInfo.css("display", "none");
            billingHistory.css("display", "block");
            viewHistoryBtn.text("Back");
            viewHistoryBtn.addClass("me-5");
        } else {
            billingInfo.css("display", "block");
            billingHistory.css("display", "none");
            viewHistoryBtn.text("Payment history");
            viewHistoryBtn.removeClass("me-5");
        }
    });

    // Toggle Manage Mode
    $("#manageCards").on("click", function () {
        const isManageMode = $(this).text() === "Done";

        $(this).css("transition", "none");

        if (!isManageMode) {
            // Enter manage mode
            const removeButtons = $(".remove-card-btn");
            removeButtons.each(function () {
                $(this).css("display", "block");
            });

            // Disable card flip for all cards
            const flipCardInners = $(".flip-card-inner");
            flipCardInners.each(function () {
                $(this).css({
                    transform: "rotateY(0deg)",
                    transition: "none",
                });
            });

            // Show Add Card button
            const addCardBtn = $("#addCard");
            addCardBtn.css("display", "block");

            $(this).text("Done");
            $(this).attr("class", "text-secondary border-0 bg-transparent");
        } else {
            // Exit manage mode
            const removeButtons = $(".remove-card-btn");
            removeButtons.each(function () {
                $(this).css("display", "none");
            });

            // Restore card flip for all cards
            const flipCardInners = $(".flip-card-inner");
            flipCardInners.each(function () {
                $(this).css({
                    transition: "",
                    transform: "",
                });
            });

            // Hide Add Card button
            const addCardBtn = $("#addCard");
            addCardBtn.css("display", "none");

            $(this).text("Manage Cards");
            $(this).attr("class", "text-primary border-0 bg-transparent");
        }

        void this.offsetWidth;
        $(this).css("transition", "");
    });

    // Add new card functionality
    $("#saveCardBtn").on("click", function () {
        const cardNumber = $("#newCardNumber").val();
        const cardName = $("#newCardName").val();
        const expDate = $("#newExpDate").val();
        const cvvCode = $("#newCvvCode").val();

        if (!cardNumber || !cardName || !expDate || !cvvCode) {
            showAlert("warning", "Please fill in all card details.");
            return;
        }

        const newCard = $(
            '<div class="flip-card d-flex flex-row align-items-center"></div>'
        );
        newCard.html(`
    <div class="flip-card-inner flex-grow-1">
        <div class="flip-card-front">
            <div class="card-content">
                <div class="flex-row top-row">
                  <img
                    src="/assets/images/chip.svg"
                    alt="Card Chip"
                    class="chip mt-3"
                  />
                  <p class="card-heading">MASTERCARD</p>
                </div>
                <div class="flex-row middle-row">
                  <p
                    class="card-number"
                    id="card-number"
                    data-original="${cardNumber}"
                  >
                    ${cardNumber}
                  </p>
                  <img
                    src="assets/images/contactless.svg"
                    alt="Contactless"
                    class="contactless"
                  />
                </div>
                <div class="flex-row bottom-row">
                  <p class="card-name" data-original="${cardName}">${cardName}</p>
                  <div class="validity">
                    <p class="valid-thru">
                      VALID <br />
                      THRU
                    </p>
                    <p class="exp-date" data-original="${expDate}">${expDate}</p>
                  </div>
                  <img
                    src="assets/images/mastercard.svg"
                    alt="Mastercard logo"
                    class="card-logo"
                  />
                </div>
              </div>
            <button class="remove-card-btn" style="display: none;">
                <i class="hgi hgi-stroke hgi-cancel-01 fw-bold small"></i>
            </button>
        </div>
        <div class="flip-card-back">
            <div class="strip"></div>
            <div class="mstrip"></div>
            <div class="sstrip">
                <p class="code" data-original="${cvvCode}">${cvvCode}</p>
            </div>
        </div>
    </div>
`);

        // Append new card to the card container div
        const cardContainer = $("#cardContainer");
        if (cardContainer.length) {
            cardContainer.append(newCard);
        } else {
            console.error("Card container not found!");
            $("#paymentMethod").append(newCard);
        }
    });

    // Add event listener to new remove button
    const newRemoveBtn = newCard.find(".remove-card-btn");
    newRemoveBtn.on("click", function (e) {
        e.stopPropagation();
        const card = $(this).closest(".flip-card");
        card.remove();
    });

    // If no cards remain, exit manage mode
    const remainingCards = $(".flip-card");
    const manageBtn = $("#manageCards");
    if (
        !remainingCards.length &&
        manageBtn.length &&
        manageBtn.text() === "Done"
    ) {
        manageBtn.css("transition", "none");
        manageBtn.text("Manage Cards");
        manageBtn.attr("class", "text-primary border-0 bg-transparent");
        const addCardBtn = $("#addCard");
        addCardBtn.css("display", "none");
        // Hide all remove buttons
        const removeButtons = $(".remove-card-btn");
        removeButtons.each(function () {
            $(this).css("display", "none");
        });
        // Restore all card flips
        const flipCardInners = $(".flip-card-inner");
        flipCardInners.each(function () {
            $(this).css({
                transition: "",
                transform: "",
            });
        });
        void manageBtn[0].offsetWidth;
        manageBtn.css("transition", "");
    }

    // Check if in manage mode and show remove button immediately
    const manageBtnCheck = $("#manageCards");
    if (manageBtnCheck.length && manageBtnCheck.text() === "Done") {
        newRemoveBtn.css("display", "block");

        // Disable flip for new card same as others
        const newFlipCardInner = newCard.find(".flip-card-inner");
        if (newFlipCardInner.length) {
            newFlipCardInner.css({
                transform: "rotateY(0deg)",
                transition: "none",
            });
        }
    }

    // Clear form and close modal
    $("#newCardNumber").val("");
    $("#newCardName").val("");
    $("#newExpDate").val("");
    $("#newCvvCode").val("");
    const modal = bootstrap.Modal.getInstance($("#addCardModal")[0]);
    modal.hide();

    // Card flip for new card modal
    $("#flipCardBtn").on("click", function () {
        const newCardInner = $("#newCardInner");
        const isFlipped = newCardInner.css("transform") === "rotateY(180deg)";
        newCardInner.css(
            "transform",
            isFlipped ? "rotateY(0deg)" : "rotateY(180deg)"
        );
    });

    // Handle expiry date input formatting
    $("#newExpDate").on("input", function (e) {
        let value = $(e.target).val().replace(/\D/g, "");
        if (value.length >= 2) {
            const month = parseInt(value.substring(0, 2));
            if (month > 12) value = "12" + value.substring(2);
            value = value.substring(0, 2) + "/" + value.substring(2);
        }
        $(e.target).val(value.substring(0, 5));
    });
});
