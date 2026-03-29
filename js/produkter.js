function showCategory(categoryId) {
    // Hide all toggle content sections
    document.querySelectorAll('.toggle-content').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all category cards
    document.querySelectorAll('.card[onclick]').forEach(card => {
        card.classList.remove('active');
    });

    // Show selected content section
    document.getElementById(categoryId).classList.add('active');

    // Add active class to clicked category card
    event.target.closest('.card[onclick]').classList.add('active');
}
