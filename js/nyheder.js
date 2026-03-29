    document.addEventListener('DOMContentLoaded', function() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        const articleCards = document.querySelectorAll('.card--media');
        const featuredArticles = document.querySelectorAll('[data-featured-category]');
        const searchInput = document.getElementById('searchInput');

        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                featuredArticles.forEach(featured => {
                    const featuredCategory = featured.getAttribute('data-featured-category');
                    if (filter === 'all') {
                        featured.style.display = featuredCategory === 'all' ? 'grid' : 'none';
                    } else {
                        featured.style.display = featuredCategory === filter ? 'grid' : 'none';
                    }
                });

                articleCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();

            if (searchTerm.length > 0) {
                featuredArticles.forEach(featured => { featured.style.display = 'none'; });
            } else {
                const activeFilter = document.querySelector('.filter-tab.active').getAttribute('data-filter');
                featuredArticles.forEach(featured => {
                    const fc = featured.getAttribute('data-featured-category');
                    featured.style.display = (activeFilter === 'all' ? fc === 'all' : fc === activeFilter) ? 'grid' : 'none';
                });
            }

            articleCards.forEach(card => {
                const title = card.querySelector('.article-title')?.textContent.toLowerCase() || '';
                const excerpt = card.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
                const category = card.getAttribute('data-category') || '';

                if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });