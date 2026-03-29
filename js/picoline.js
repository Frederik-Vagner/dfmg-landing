function showServices(serviceType) {
    // Hide all service contents
    document.querySelectorAll('.toggle-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected service content
    document.getElementById(serviceType).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}
