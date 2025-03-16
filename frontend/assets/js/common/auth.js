$(document).ready(function() {
  // --------------------------- OTP modal ---------------------------
  // Focus on next input when previous input is filled
  $('.otp-input').on('input', function() {
    const $this = $(this);
    const index = $('.otp-input').index(this);
    
    if ($this.val() && index < $('.otp-input').length - 1) {
      $('.otp-input').eq(index + 1).focus();
    }
  });

  // Move focus to previous input on backspace when current input is empty
  $('.otp-input').on('keydown', function(e) {
    const $this = $(this);
    const index = $('.otp-input').index(this);
    
    if (e.key === 'Backspace' && !$this.val() && index > 0) {
      $('.otp-input').eq(index - 1).focus();
    }
  });

  // Focus on first input when modal is shown
  $('#otpModal').on('shown.bs.modal', function() {
    $('#otp-input1').focus();
  });

  // Password toggle
  $('.password-toggle').on('click', function() {
    const $input = $(this).closest('.input-container').find('input');
    const $icon = $(this).find('i');
    
    if ($input.attr('type') === 'password') {
      $input.attr('type', 'text');
      $icon.removeClass('hgi-view-off-slash').addClass('hgi-view');
      $(this).attr('aria-label', 'Hide password');
    } else {
      $input.attr('type', 'password');
      $icon.removeClass('hgi-view').addClass('hgi-view-off-slash');
      $(this).attr('aria-label', 'Show password');
    }
  });
});