// Navigation Enhancer — A-grade MPA navigation
// 1. Caches shared components in sessionStorage
// 2. Prefetches pages on link hover
// 3. Navigates on mousedown (saves ~100ms)
// 4. Smooth crossfade via View Transitions API
(function() {
    'use strict';

    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
    const PREFETCH_CACHE = new Set();
    const HOVER_DELAY = 65; // ms before prefetch starts

    // --- Component Caching ---
    // Cache component HTML in sessionStorage with TTL
    const cacheable = [
        '/pages/facility/components/header.html',
        '/pages/software/components/header-platform.html',
        '/pages/facility/components/footer.html',
        '/pages/software/components/footer-platform.html',
        '/pages/facility/components/chatbot.html',
        '/pages/facility/components/article-sidebar.html'
    ];

    function getCached(key) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() - entry.t > CACHE_TTL) {
                sessionStorage.removeItem(key);
                return null;
            }
            return entry.d;
        } catch(e) { return null; }
    }

    function setCache(key, data) {
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch(e) {}
    }

    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const urlStr = typeof url === 'string' ? url : url.toString();

        if (!options?.method || options.method === 'GET') {
            const isCacheable = cacheable.some(p => urlStr.endsWith(p) || urlStr === p);
            if (isCacheable) {
                const cacheKey = 'nav_' + urlStr;
                const cached = getCached(cacheKey);
                if (cached) {
                    const contentType = urlStr.endsWith('.json') ? 'application/json' : 'text/html';
                    return Promise.resolve(new Response(cached, {
                        status: 200,
                        headers: { 'Content-Type': contentType }
                    }));
                }
                return originalFetch.call(this, url, options).then(response => {
                    const clone = response.clone();
                    clone.text().then(data => setCache(cacheKey, data));
                    return response;
                });
            }
        }

        return originalFetch.call(this, url, options);
    };

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

    // --- Mousedown Navigation ---
    function navigateOnMousedown(e) {
        // Only left-click, no modifier keys
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const a = e.target.closest('a');
        if (!a || !isInternalLink(a)) return;

        // Skip links with onclick handlers or javascript: hrefs
        if (a.hasAttribute('onclick') || a.href.startsWith('javascript:')) return;

        e.preventDefault();

        // Navigate immediately — View Transitions handled by CSS @view-transition rule
        window.location.href = a.href;
    }

    // --- Init ---
    function init() {
        let hoverTimer = null;

        document.addEventListener('pointerenter', function(e) {
            const a = e.target.closest('a');
            if (a && isInternalLink(a)) {
                hoverTimer = setTimeout(() => prefetchUrl(a.href), HOVER_DELAY);
            }
        }, true);

        document.addEventListener('pointerleave', function(e) {
            if (e.target.closest('a') && hoverTimer) {
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

        // Mousedown navigation
        document.addEventListener('mousedown', navigateOnMousedown, true);

        // Touch devices: prefetch on touchstart
        document.addEventListener('touchstart', function(e) {
            const a = e.target.closest('a');
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
