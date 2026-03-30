/**
 * Unified Carousel Component
 *
 * Usage: Add data attributes to your carousel container:
 *   <div class="carousel" data-carousel>
 *       <div class="carousel-track">
 *           ...cards...
 *       </div>
 *   </div>
 *   <div class="carousel-controls">
 *       <a class="btn--icon" data-carousel-prev>←</a>
 *       <a class="btn--icon" data-carousel-next>→</a>
 *   </div>
 *
 * The carousel auto-detects card width and gap from the rendered DOM.
 * No manual config needed — just works.
 */

(function() {
    'use strict';

    function initCarousels() {
        document.querySelectorAll('[data-carousel]').forEach(function(container) {
            var track = container.querySelector('.carousel-track');
            if (!track || !track.children.length) return;

            var currentIndex = 0;

            function getMetrics() {
                var firstCard = track.children[0];
                if (!firstCard) return { cardWidth: 0, gap: 0, visible: 1, max: 0 };

                var cardWidth = firstCard.offsetWidth;
                var trackStyle = window.getComputedStyle(track);
                var gap = parseInt(trackStyle.gap) || parseInt(trackStyle.columnGap) || 20;
                var containerWidth = container.offsetWidth;
                var visible = Math.floor((containerWidth + gap) / (cardWidth + gap));
                var max = Math.max(0, track.children.length - visible);

                return { cardWidth: cardWidth, gap: gap, visible: visible, max: max };
            }

            function update() {
                var m = getMetrics();
                if (currentIndex > m.max) currentIndex = m.max;
                var moveDistance = currentIndex * (m.cardWidth + m.gap);
                track.style.transform = 'translateX(-' + moveDistance + 'px)';
            }

            // Find associated controls (sibling or parent scope)
            var scope = container.closest('section') || container.parentElement;

            var prevBtn = scope.querySelector('[data-carousel-prev]');
            var nextBtn = scope.querySelector('[data-carousel-next]');

            if (nextBtn) {
                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var m = getMetrics();
                    if (currentIndex < m.max) {
                        currentIndex++;
                        update();
                    }
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var m = getMetrics();
                    if (currentIndex > 0) {
                        currentIndex--;
                        update();
                    }
                });
            }

            // Handle window resize
            var resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(update, 150);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousels);
    } else {
        // Delay slightly to let components.js load dynamic content
        setTimeout(initCarousels, 200);
    }
})();
