$(document).ready(function () {

    retrieveUserProfile();

    updateRemoveImageVisibility();
    $("#profilePreview").on("load", updateRemoveImageVisibility);

    updateWordCounter();
    $("textarea[data-field='bio']").on("input", updateWordCounter);
});

const profileModal =
    bootstrap.Modal.getInstance($("#profileModal")[0]) ||
    new bootstrap.Modal($("#profileModal")[0]);
let currentFile = null;
let videoStream = null;

// ------------ retrieve user profile and skills -------------
function retrieveUserProfile() {

    const token = localStorage.getItem("token");

    // Token validation
    if (!token) {
        showAlert("danger", "You are not logged in. Please login to view your profile and skills.");
        // window.location.href = "../../../../frontend/index.html"; // Adjust path as needed
        return;
    }

    // Fetch user profile
    $.ajax({
        url: "http://localhost:8080/api/v1/user/profile",
        type: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function (response) {
            if (response.status === 200) {
                const userData = response.data;
                const isAdmin = userData.isAdmin === true;
                localStorage.setItem("isAdmin", isAdmin.toString());

                // Fetch user skills
                $.ajax({
                    url: "http://localhost:8080/api/v1/user/skills",
                    type: "GET",
                    headers: { "Authorization": "Bearer " + token },
                    success: function (skillsResponse) {
                        if (skillsResponse.status === 200) {

                            // Header details
                            $("#header-name").text(userData.fullName);
                            $("#header-role").text(
                                userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase() : "-"
                            );

                            if (userData.profilePicture) {
                                $("#header-profile-image").attr("src", userData.profilePicture);
                            }

                            // --- Profile UI Updates ---
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

                            // Populate form fields
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

                            // Password and email last changed dates
                            if (userData.passwordUpdatedAt || userData.emailUpdatedAt) {
                                ["passwordUpdatedAt", "emailUpdatedAt"].forEach((key) => {
                                    if (userData[key]) {
                                        const lastChanged = new Date(userData[key].replace(" ", "T") + "Z");
                                        const now = new Date();
                                        const diffMs = now - lastChanged;
                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                        const diffMonths = Math.floor(diffDays / 30);

                                        let displayText = diffDays < 1
                                            ? "Today"
                                            : diffDays < 30
                                                ? diffDays + " day" + (diffDays > 1 ? "s" : "") + " ago"
                                                : diffMonths + " month" + (diffMonths > 1 ? "s" : "") + " ago";

                                        $("#" + (key === "passwordUpdatedAt" ? "lastPasswordChange" : "lastEmailChange")).text(displayText);
                                    } else {
                                        $("#" + (key === "passwordUpdatedAt" ? "lastPasswordChange" : "lastEmailChange")).text("Never");
                                    }
                                });
                            }

                            $("#userEmail").text(userData.email || "No email provided");

                            // Email modal setup
                            $("#emailModal").on("show.bs.modal", function () {
                                $("#currentEmail").val(userData.email || "");
                            });

                            // 2FA status
                            const is2FAEnabled = userData.twoFactorEnabled;
                            if (is2FAEnabled === true) {
                                $("#setup2FAButton").hide();
                                $("#disable2FAButton").show();
                                $("#twoFactorStatus").text("On").css({"color": "#22c55e", "background-color": "#c0ffd0"});
                            } else {
                                $("#setup2FAButton").show();
                                $("#disable2FAButton").hide();
                                $("#twoFactorStatus").text("Off").css({"color": "#ef4444", "background-color": "#ffdede"});
                            }

                            // --- Skills UI Updates ---
                            const skillTagsContainer = $(".skill-tags");
                            skillTagsContainer.empty();
                            skillsResponse.data.forEach(skill => {
                                const skillTag = $('<span class="skill-tag"></span>').text(skill);
                                skillTagsContainer.append(skillTag);
                            });
                        } else {
                            showAlert("danger", "Failed to load skills: " + skillsResponse.message);
                        }
                    },
                    error: function (xhr) {
                        showAlert("danger", "Error fetching skills: " + (xhr.responseJSON?.message || xhr.statusText));
                    }
                });
            } else {
                showAlert("danger", "Failed to load profile: " + response.message);
                $("#lastPasswordChange, #lastEmailChange").text("Failed to load");
            }
        },
        error: function (xhr) {
            showAlert("danger", "Error fetching profile: " + (xhr.responseJSON?.message || xhr.statusText));
        }
    });
}

// --------------- update user profile details ---------------
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
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000)
                            // retrieveUserProfile();
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

// --------------- Update modal preview with current profile picture ---------------
$("#profileModal").on("show.bs.modal", function () {
    const currentProfileSrc = $("#profilePreview").attr("src");
    $("#imagePreview").attr("src", currentProfileSrc);
});

// --------------- Profile Picture System ---------------
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

// ------------ Profile picture upload using file chooser ------------
$("#saveChanges").on("click", function (e) {
    if (!currentFile) {
        showAlert("danger", "Please select an image to upload");
        return;
    }

    const formData = new FormData();
    formData.append("image", currentFile);
    const token = localStorage.getItem("token");

    $("#imageSpinner").show().css("display", "flex");

    $.ajax({
        url: "http://localhost:8080/api/v1/user/profile/image",
        type: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "X-Requested-With": "XMLHttpRequest"
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status === 200) {
                $("#profilePreview").attr("src", response.data);
                showAlert("success", "Profile image updated successfully!");
                closeCamera();
                $("#cameraVideo").remove();
                profileModal.hide();

                setTimeout(function () {
                    window.location.reload();
                }, 1500)
            } else {
                showAlert("danger", "Failed to upload image: " + response.message);
            }
        },
        error: function (xhr) {
            showAlert("danger", "Error uploading image: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
        },
        complete: function () {
            $("#imageSpinner").hide();
            currentFile = null;
        }
    });
});

// ------------ Camera capture functionality for profile picture ------------
$("#takePhoto").on("click", function (e) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                videoStream = stream;
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play().catch(err => showAlert("danger", "Error playing video: " + err.message));

                $("#imagePreview").hide();
                $("#imagePreview").after(video);
                video.id = "cameraVideo";

                $("#uploadImage").hide();
                $("#takePhoto").hide();
                $("#cameraControls").show().css("display", "flex");
            })
            .catch(function (error) {
                showAlert("danger", "Error accessing camera: " + error.message);
            });
    } else {
        showAlert("danger", "Camera not supported on this device/browser.");
    }
});

// --------------- Capture image when "Capture" button is clicked ---------------
$("#captureBtn").on("click", function (e) {
    const video = $("#cameraVideo")[0];
    if (!video || !videoStream) {
        showAlert("danger", "Camera is not active.");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(function (blob) {
        currentFile = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        $("#imagePreview").attr("src", canvas.toDataURL("image/jpeg")).show();
        $("#cameraVideo").remove();
        closeCamera();
    }, "image/jpeg", 1);
});

$("#closeCameraBtn, #cancelBtn, .btn-close").on("click", function (e) {
    closeCamera();
    $("#cameraVideo").remove();
});

// --------------- Improved camera close function ---------------
function closeCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
        });
        videoStream = null;
    }
    $("#cameraControls").hide();
    $("#uploadImage").show();
    $("#takePhoto").show();
}

// --------------- Ensure the camera is stopped on page unloaded ---------------
window.addEventListener("beforeunload", function () {
    closeCamera();
    $("#cameraVideo").remove();
});

// --------------- remove-btn show when the image isn't the default image ---------------
function updateRemoveImageVisibility() {
    const defaultImage = "../../assets/images/icons/placeholder.svg";
    if ($("#profilePreview").attr("src") === defaultImage) {
        $(".profile-preview-container .remove-image").hide();
    } else {
        $(".profile-preview-container .remove-image").css("display", "");
    }
}

// ------------ Remove profile image ------------
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
                    }, 1500)
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

// ------------ Word counter for bio textarea ------------
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

    // prevent typing if word limit exceeded
    if (remainingWords < 0) {
        $textarea.val($textarea.val().split(/\s+/).slice(0, MAX_WORDS).join(" "));
        $counter.text("0");
        $counter.removeClass("warning").addClass("danger");
    }
}

/* ------------------------------------------------ Skill Tag System ------------------------------------------------ */

const editSkillsBtn = $(".skills-section .edit-skill-btn");
const skillTagsContainer = $(".skill-tags");

// ------------ Edit user skills ------------
editSkillsBtn.on("click", function () {
    const token = localStorage.getItem("token");
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
                                showAlert("success", "Skill \"" + skillName + "\" removed successfully!");
                            }
                        }.bind(this),
                        error: function(xhr) {
                            showAlert("danger", "Error removing skill: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
                        }
                    });
                });
                $(this).append(removeIcon);
            }
        });

        const emptySkillTag = $('<span class="skill-tag empty-skill"></span>');
        emptySkillTag.html(`
            <div class="suggestion-hint-container">
                <div class="suggestion-hint"></div>
                <input type="text" placeholder="Add skill" />
            </div>
            <i class="hgi-stroke hgi-tick-01 save-tick-input"></i>
            `);
        skillTagsContainer.append(emptySkillTag);

        const inputField = emptySkillTag.find("input");
        const saveTick = emptySkillTag.find(".save-tick-input");
        const suggestionHint = emptySkillTag.find(".suggestion-hint");

        // Live suggestion as the background hint
        inputField.on("input", function () {
            const query = $(this).val().trim();
            suggestionHint.text(""); // Clear previous suggestion
            if (query.length > 0) {
                $.ajax({
                    url: "http://localhost:8080/api/v1/user/skills/suggestions",
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    data: { query: query },
                    success: function(response) {
                        if (response.status === 200 && response.data.length > 0) {
                            const suggestion = response.data[0]; // First suggestion
                            if (suggestion.toLowerCase().startsWith(query.toLowerCase())) {
                                suggestionHint.text(suggestion); // Show full suggestion in gray
                            }
                        }
                    },
                    error: function(xhr) {
                        console.error("Error fetching suggestions:", xhr.responseText);
                    }
                });
            }
        });

        // Accept suggestion with Enter or Tab
        inputField.on("keydown", function(e) {
            if ((e.key === "Enter" || e.key === "Tab") && suggestionHint.text()) {
                e.preventDefault();
                $(this).val(suggestionHint.text());
                suggestionHint.text("");
            }
        });

        saveTick.on("click", function () {
            let skillName = inputField.val().trim();
            if (!skillName && suggestionHint.text()) {
                skillName = suggestionHint.text();
            }

            if (skillName) {
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
                            showAlert("success", "Skill \"" + skillName + "\" added successfully!");

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
                                            showAlert("success", "Skill \"" + skillName + "\" removed successfully!");
                                        }
                                    },
                                    error: function(xhr) {
                                        showAlert("danger", "Error removing skill: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
                                    }
                                });
                            });
                            newSkillTag.append(removeIcon);
                            skillTagsContainer.find(".empty-skill").before(newSkillTag);
                            inputField.val(""); // Clear input
                            suggestionHint.text(""); // Clear suggestion after adding
                        } else if (response.status === 409) {
                            alert(response.message);
                        }
                    },
                    error: function(xhr) {
                        if (xhr.status === 409) {
                            alert(xhr.responseJSON.message);
                        }
                        showAlert("danger", "Error adding skill: " + (xhr.responseJSON ? xhr.responseJSON.message : xhr.statusText));
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
