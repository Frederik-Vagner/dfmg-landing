        function toggleDropdown() {
            const options = document.getElementById('dropdown-options');
            const selected = document.querySelector('.dropdown-selected');

            if (options.style.display === 'block') {
                options.style.display = 'none';
                options.classList.remove('open');
                selected.classList.remove('open');
            } else {
                options.style.display = 'block';
                options.classList.add('open');
                selected.classList.add('open');
            }
        }

        // Update selected text og visual styling
        document.querySelectorAll('.dropdown-options input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedText();
                updateVisualSelection();
            });
        });

        function updateVisualSelection() {
            document.querySelectorAll('.dropdown-options label').forEach(label => {
                const checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            });
        }

        function updateSelectedText() {
            const selected = [...document.querySelectorAll('.dropdown-options input:checked')]
                .map(cb => cb.parentElement.textContent.trim());
            document.getElementById('selected-text').textContent =
                selected.length ? selected.join(', ') : 'Hvilke services drejer det sig om?';
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.custom-dropdown');
            const options = document.getElementById('dropdown-options');
            const selected = document.querySelector('.dropdown-selected');

            if (!dropdown.contains(event.target)) {
                options.style.display = 'none';
                options.classList.remove('open');
                selected.classList.remove('open');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        document.querySelector('.custom-dropdown').addEventListener('click', function(event) {
            event.stopPropagation();
        });

        function toggleFaq(element) {
            const answer = element.nextElementSibling;
            const isOpen = answer.classList.contains('open');

            // Close all FAQ items
            document.querySelectorAll('.faq-answer').forEach(item => {
                item.classList.remove('open');
            });
            document.querySelectorAll('.faq-question').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't already open
            if (!isOpen) {
                answer.classList.add('open');
                element.classList.add('active');
            }
        }
