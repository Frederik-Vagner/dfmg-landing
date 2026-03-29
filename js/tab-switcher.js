// Unified tab switcher — uses data-tab attributes
// Works with both .tab-button and .card elements that have data-tab
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-tab]').forEach(function(el) {
        el.addEventListener('click', function() {
            var tabId = el.getAttribute('data-tab');

            // Hide all toggle content sections
            document.querySelectorAll('.toggle-content').forEach(function(content) {
                content.classList.remove('active');
            });

            // Show selected tab content
            var target = document.getElementById(tabId);
            if (target) target.classList.add('active');

            // Remove active from siblings with data-tab
            var parent = el.parentElement;
            if (parent) {
                parent.querySelectorAll('[data-tab]').forEach(function(sibling) {
                    sibling.classList.remove('active');
                });
            }

            // Activate clicked element
            el.classList.add('active');
        });
    });
});
