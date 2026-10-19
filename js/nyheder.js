    // Category tabs and search work together: a card shows when it is in the
    // active category AND matches the search. Clearing the search returns to
    // the active category, not to every article.
    document.addEventListener('DOMContentLoaded', function() {
        const filterTabs = document.querySelectorAll('[data-filter]');
        const articleCards = document.querySelectorAll('[data-category]');
        const featuredArticles = document.querySelectorAll('[data-featured-category]');
        const searchInput = document.getElementById('searchInput');
        const emptyState = document.getElementById('articlesEmpty');

        let activeFilter = 'all';

        function cardText(card) {
            const title = card.querySelector('.article-title')?.textContent || '';
            const excerpt = card.querySelector('.article-excerpt')?.textContent || '';
            return (title + ' ' + excerpt + ' ' + card.getAttribute('data-category')).toLowerCase();
        }

        function update() {
            const searchTerm = searchInput.value.trim().toLowerCase();

            // The featured slot belongs to the category view; a search hides it.
            featuredArticles.forEach(featured => {
                const show = !searchTerm && featured.getAttribute('data-featured-category') === activeFilter;
                featured.style.display = show ? 'grid' : 'none';
            });

            let shown = 0;
            articleCards.forEach(card => {
                const inCategory = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
                const matches = !searchTerm || cardText(card).includes(searchTerm);
                const show = inCategory && matches;
                card.style.display = show ? 'block' : 'none';
                if (show) shown++;
            });

            emptyState.hidden = shown > 0;
        }

        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                activeFilter = this.getAttribute('data-filter');
                update();
            });
        });

        searchInput.addEventListener('input', update);
    });
