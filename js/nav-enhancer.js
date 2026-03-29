// Navigation Enhancer — A-grade MPA navigation
// 1. Caches shared components in sessionStorage
// 2. Prefetches pages on link hover
// 3. Navigates on mousedown (saves ~100ms)
// 4. Smooth crossfade via View Transitions API
(function() {
    'use strict';

    const CACHE_VERSION = 'v1';
    const PREFETCH_CACHE = new Set();
    const HOVER_DELAY = 65; // ms before prefetch starts

    // --- Component Caching ---
    // Monkey-patch fetch to cache component HTML in sessionStorage
    const componentPaths = [
        '/pages/components/header.html',
        '/pages/components/header-platform.html',
        '/pages/components/footer.html',
        '/pages/components/footer-platform.html',
        '/pages/components/chatbot.html',
        '/pages/components/contact-widget.html',
        '/pages/components/article-sidebar.html'
    ];

    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const urlStr = typeof url === 'string' ? url : url.toString();

        // Only cache GET requests for known components
        if (!options?.method || options.method === 'GET') {
            const isComponent = componentPaths.some(p => urlStr.endsWith(p) || urlStr === p);
            if (isComponent) {
                const cacheKey = 'nav_' + CACHE_VERSION + '_' + urlStr;
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    return Promise.resolve(new Response(cached, {
                        status: 200,
                        headers: { 'Content-Type': 'text/html' }
                    }));
                }
                // Fetch and cache
                return originalFetch.call(this, url, options).then(response => {
                    const clone = response.clone();
                    clone.text().then(html => {
                        try { sessionStorage.setItem(cacheKey, html); } catch(e) {}
                    });
                    return response;
                });
            }

            // Also cache pages.json
            if (urlStr.endsWith('/config/pages.json')) {
                const cacheKey = 'nav_' + CACHE_VERSION + '_pages.json';
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    return Promise.resolve(new Response(cached, {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                return originalFetch.call(this, url, options).then(response => {
                    const clone = response.clone();
                    clone.text().then(json => {
                        try { sessionStorage.setItem(cacheKey, json); } catch(e) {}
                    });
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
