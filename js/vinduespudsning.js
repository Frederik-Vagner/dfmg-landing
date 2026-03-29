let isDragging = false;
const sliderHandle = document.getElementById('sliderHandle');
const afterImage = document.getElementById('afterImage');
const sliderContainer = document.getElementById('comparisonSlider');

if (sliderHandle && afterImage && sliderContainer) {
    // Mouse events
    sliderHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // Touch events for mobile
    sliderHandle.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);

    function startDrag(e) {
        isDragging = true;
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;

        const rect = sliderContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        sliderHandle.style.left = percentage + '%';
        afterImage.style.opacity = percentage / 100;
    }

    function stopDrag() {
        isDragging = false;
    }
}

function showComparison(type) {
    const buttons = document.querySelectorAll('.comparison-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (type === 'before') {
        afterImage.style.opacity = '0';
        sliderHandle.style.left = '0%';
        buttons[0].classList.add('active');
    } else {
        afterImage.style.opacity = '1';
        sliderHandle.style.left = '100%';
        buttons[1].classList.add('active');
    }
}