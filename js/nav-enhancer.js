// Navigation Enhancer — A-grade MPA navigation
// 1. Prefetches pages on link hover
// 2. Smooth crossfade via View Transitions API
//
// It also used to navigate on mousedown to save ~100ms. That made a click
// impossible to cancel by dragging off the link and broke selecting link
// text; hover prefetch already makes the page arrive almost instantly.
//
// This used to also wrap window.fetch to cache the header, footer, chatbot and
// article sidebar in sessionStorage, because every page fetched them at
// runtime. Eleventy renders all four into the HTML now, so nothing requests
// them and the global fetch override has been removed with the cache.
(function() {
    'use strict';

    const PREFETCH_CACHE = new Set();
    const HOVER_DELAY = 65; // ms before prefetch starts

    // --- Link Prefetch on Hover ---
    function isInternalLink(a) {
        return a.href &&
            a.origin === location.origin &&
            !a.hash &&
            a.target !== '_blank' &&
            !a.hasAttribute('download') &&
            a.pathname !== location.pathname;
    }

    function prefetchUrl(url) {
        if (PREFETCH_CACHE.has(url)) return;
        PREFETCH_CACHE.add(url);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    }

    // pointerenter/pointerleave also fire on `document` itself, whose target has no
    // .closest() — guard every delegated lookup so the handler can't throw.
    function closestFrom(target, sel) {
        return target && typeof target.closest === 'function' ? target.closest(sel) : null;
    }

    // --- Init ---
    function init() {
        let hoverTimer = null;

        document.addEventListener('pointerenter', function(e) {
            const a = closestFrom(e.target, 'a');
            if (a && isInternalLink(a)) {
                hoverTimer = setTimeout(() => prefetchUrl(a.href), HOVER_DELAY);
            }
        }, true);

        document.addEventListener('pointerleave', function(e) {
            if (closestFrom(e.target, 'a') && hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
        }, true);

        // Prefetch links visible in viewport (low priority, after load)
        if ('IntersectionObserver' in window) {
            requestIdleCallback(() => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const a = entry.target;
                            if (isInternalLink(a)) prefetchUrl(a.href);
                            observer.unobserve(a);
                        }
                    });
                }, { rootMargin: '200px' });

                document.querySelectorAll('a[href]').forEach(a => {
                    if (isInternalLink(a)) observer.observe(a);
                });
            }, { timeout: 3000 });
        }

        // Touch devices: prefetch on touchstart
        document.addEventListener('touchstart', function(e) {
            const a = closestFrom(e.target, 'a');
            if (a && isInternalLink(a)) prefetchUrl(a.href);
        }, { passive: true });
    }

    // --- Scroll Position Restoration ---
    // Save before leaving, restore on back/forward
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('scrollPos_' + location.pathname,
            document.body.scrollTop || document.documentElement.scrollTop || 0);
    });

    if (performance.getEntriesByType) {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry && navEntry.type === 'back_forward') {
            const saved = sessionStorage.getItem('scrollPos_' + location.pathname);
            if (saved) {
                window.addEventListener('load', function() {
                    const pos = parseInt(saved, 10);
                    document.body.scrollTop = pos;
                    document.documentElement.scrollTop = pos;
                });
            }
        }
    }

    // requestIdleCallback polyfill
    if (!window.requestIdleCallback) {
        window.requestIdleCallback = function(cb) { return setTimeout(cb, 1); };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
