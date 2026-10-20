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
 *       <button type="button" class="icon-button" data-carousel-prev aria-label="Forrige">←</button>
 *       <button type="button" class="icon-button" data-carousel-next aria-label="Næste">→</button>
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

            // Touch: a horizontal swipe steps the carousel like the arrows do.
            // The frame hides its overflow, so without this a phone user could
            // only use the two small buttons.
            var touchStartX = null, touchStartY = null;
            container.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            container.addEventListener('touchend', function(e) {
                if (touchStartX === null) return;
                var dx = e.changedTouches[0].clientX - touchStartX;
                var dy = e.changedTouches[0].clientY - touchStartY;
                touchStartX = null;
                if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
                var m = getMetrics();
                if (dx < 0 && currentIndex < m.max) currentIndex++;
                else if (dx > 0 && currentIndex > 0) currentIndex--;
                update();
            });

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
