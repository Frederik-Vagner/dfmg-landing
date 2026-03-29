function showGallery(galleryType) {
    // Hide all services contents
    document.querySelectorAll('.toggle-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected gallery
    document.getElementById(galleryType).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}
