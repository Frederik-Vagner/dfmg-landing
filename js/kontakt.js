        // Dropdown toggle
        const dropdownSelected = document.querySelector('[data-action="toggle-dropdown"]');
        const dropdownOptions = document.getElementById('dropdown-options');

        if (dropdownSelected && dropdownOptions) {
            dropdownSelected.addEventListener('click', function() {
                const isOpen = dropdownOptions.style.display === 'block';
                dropdownOptions.style.display = isOpen ? 'none' : 'block';
                dropdownOptions.classList.toggle('open', !isOpen);
                dropdownSelected.classList.toggle('open', !isOpen);
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                const dropdown = dropdownSelected.closest('.custom-dropdown');
                if (!dropdown.contains(event.target)) {
                    dropdownOptions.style.display = 'none';
                    dropdownOptions.classList.remove('open');
                    dropdownSelected.classList.remove('open');
                }
            });

            // Prevent dropdown from closing when clicking inside it
            dropdownSelected.closest('.custom-dropdown').addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }

        // Update selected text and visual styling
        document.querySelectorAll('#dropdown-options input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedText();
                updateVisualSelection();
            });
        });

        function updateVisualSelection() {
            document.querySelectorAll('#dropdown-options label').forEach(label => {
                const checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            });
        }

        function updateSelectedText() {
            const selected = [...document.querySelectorAll('#dropdown-options input:checked')]
                .map(cb => cb.parentElement.textContent.trim());
            document.getElementById('selected-text').textContent =
                selected.length ? selected.join(', ') : 'Hvilke services drejer det sig om?';
        }

        // FAQ toggle via event delegation
        document.addEventListener('click', function(event) {
            const faqQuestion = event.target.closest('[data-action="toggle-faq"]');
            if (!faqQuestion) return;

            const answer = faqQuestion.nextElementSibling;
            const isOpen = answer.classList.contains('open');

            // Close all FAQ items
            document.querySelectorAll('.faq-answer').forEach(item => {
                item.classList.remove('open');
            });
            document.querySelectorAll('[data-action="toggle-faq"]').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't already open
            if (!isOpen) {
                answer.classList.add('open');
                faqQuestion.classList.add('active');
            }
        });
