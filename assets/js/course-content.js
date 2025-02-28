$(document).ready(function() {
    // Track current video
    let currentVideoId = '';

    // Handle lesson item clicks
    $('.lesson-item').on('click', function() {
        const videoId = $(this).data('video-id');
        if (videoId && videoId !== currentVideoId) {
            currentVideoId = videoId;
            // Update iframe source
            $('.video-container iframe').attr('src', `https://www.youtube.com/embed/${videoId}`);
            
            // Update lesson status
            $('.lesson-item i.hgi-check').remove(); // Remove all check marks
            $(this).append('<i class="hgi-stroke hgi-check text-success"></i>');
            
            // Update play icon to indicate current lesson
            $('.lesson-item i.hgi-play').removeClass('text-primary');
            $(this).find('i.hgi-play').addClass('text-primary');
        }
    });

    // Handle enrollment button
    $('.btn-enroll').on('click', function() {
        const $btn = $(this);
        $btn.prop('disabled', true);
        $btn.html('<span class="spinner-border spinner-border-sm me-2"></span>Enrolling...');

        // Simulate enrollment process
        setTimeout(function() {
            $btn.html('Enrolled ✓');
            $btn.removeClass('btn-primary').addClass('btn-success');
        }, 1500);
    });

    // Handle share button
    $('.btn-share').on('click', function() {
        // Create a temporary input element
        const tempInput = $('<input>');
        $('body').append(tempInput);
        tempInput.val(window.location.href);
        tempInput.select();
        document.execCommand('copy');
        tempInput.remove();

        // Show feedback
        const $btn = $(this);
        const originalText = $btn.html();
        $btn.html('<i class="hgi-stroke hgi-check fs-5"></i> Copied!');
        setTimeout(() => {
            $btn.html(originalText);
        }, 2000);
    });

    // Track section progress
    function updateSectionProgress() {
        $('.accordion-item').each(function() {
            const totalLessons = $(this).find('.lesson-item').length;
            const completedLessons = $(this).find('.hgi-check').length;
            const progress = Math.round((completedLessons / totalLessons) * 100);
            
            // Add progress info to section header
            const $header = $(this).find('.accordion-button');
            const $progressInfo = $header.find('.progress-info');
            
            if ($progressInfo.length === 0 && totalLessons > 0) {
                $header.find('.duration').before(
                    `<span class="progress-info text-success ms-2">${progress}% complete</span>`
                );
            } else {
                $progressInfo.text(`${progress}% complete`);
            }
        });
    }

    // Initial progress update
    updateSectionProgress();

    // Update progress when lessons are completed
    $('.lesson-item').on('click', function() {
        if (!$(this).find('.hgi-check').length) {
            $(this).append('<i class="hgi-stroke hgi-check text-success"></i>');
            updateSectionProgress();
        }
    });
});