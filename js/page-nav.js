/* =============================================================================
   LANDING PAGE - SMOOTH NAVIGATION
   Lightweight prefetch on hover/touch for near-instant page loads.
   View Transitions handled via CSS @view-transition rule (MPA, Chrome 126+).
   ============================================================================= */

(function() {
    'use strict';

    // ── 1. Link prefetching on hover ──
    // Injects <link rel="prefetch"> when a user hovers a link.
    // Browser fetches at low priority and caches the result.
    // By the time they click (~200-300ms later), the page is already cached.

    var prefetched = new Set();

    function isInternalLink(a) {
        return a.href &&
            a.href.startsWith(window.location.origin) &&
            !a.href.includes('#') &&
            a.target !== '_blank' &&
            !a.hasAttribute('download') &&
            a.href !== window.location.href;
    }

    function prefetchLink(href) {
        if (prefetched.has(href)) return;
        prefetched.add(href);

        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'document';
        document.head.appendChild(link);
    }

    // Event delegation — works with dynamically injected links (header/footer)
    document.addEventListener('mouseover', function(e) {
        var a = e.target.closest('a');
        if (a && isInternalLink(a)) {
            prefetchLink(a.href);
        }
    }, { passive: true });

    // Touch devices: prefetch on touchstart (touch → click delay gives ~100ms head start)
    document.addEventListener('touchstart', function(e) {
        var a = e.target.closest('a');
        if (a && isInternalLink(a)) {
            prefetchLink(a.href);
        }
    }, { passive: true });


    // ── 2. Scroll position restoration ──
    // Save scroll position before leaving, restore on back/forward navigation.

    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('scrollPos_' + window.location.pathname,
            document.body.scrollTop || document.documentElement.scrollTop || 0);
    });

    // Restore on back/forward (type 2 = back_forward)
    if (performance.getEntriesByType) {
        var navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry && navEntry.type === 'back_forward') {
            var savedScroll = sessionStorage.getItem('scrollPos_' + window.location.pathname);
            if (savedScroll) {
                window.addEventListener('load', function() {
                    var pos = parseInt(savedScroll, 10);
                    document.body.scrollTop = pos;
                    document.documentElement.scrollTop = pos;
                });
            }
        }
    }

})();
