// Unified tab switcher — replaces handyman.js, picoline.js, produkter.js
// Usage: onclick="switchTab('tabId', this)"
function switchTab(tabId, clickedEl) {
    // Hide all toggle content sections
    document.querySelectorAll('.toggle-content').forEach(function(el) {
        el.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');

    // Find the tab group (parent of clicked element)
    var group = clickedEl.closest('.tab-button, .card[onclick]');
    if (!group) return;

    // Remove active from siblings of the same type
    var selector = group.classList.contains('tab-button') ? '.tab-button' : '.card[onclick]';
    group.parentElement.querySelectorAll(selector).forEach(function(el) {
        el.classList.remove('active');
    });

    // Activate clicked element
    group.classList.add('active');
}
