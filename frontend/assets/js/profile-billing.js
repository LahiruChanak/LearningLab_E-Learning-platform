const viewHistoryBtn = $("#viewHistory");
const billingInfo = $("#billingInfo");
const billingHistory = $("#billingHistory");
const cardNumber = $("#card-number");
const cvvCode = $("#cvv-code");
let isHistoryVisible = false;

// ------------ Mask card number ------------
const cardOriginal = cardNumber.attr("data-original");
const cardParts = cardOriginal.split(" ");
const maskedParts = cardParts.map((part, index) =>
    index < 3 ? "****" : part
);
cardNumber.text(maskedParts.join(" "));

// ------------ Mask CVV ------------
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
        showAlert("danger", "Error adding card. Please try again.");
        $("#paymentMethod").append(newCard);
    }
});

// Add event listener to the new remove button
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