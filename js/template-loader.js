// Base Template Loader - Manages page metadata and component loading
(function() {
    'use strict';

    // Get current page path relative to root
    function getCurrentPagePath() {
        const path = window.location.pathname;
        // Remove .html extension and leading/trailing slashes
        return path.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '') || 'index';
    }

    // Load page configuration
    async function loadPageConfig() {
        try {
            const response = await fetch('/config/pages.json');
            const config = await response.json();
            return config;
        } catch (error) {
            console.error('Failed to load page configuration:', error);
            return null;
        }
    }

    // Inject page metadata into head (if not already set)
    function injectMetadata(pageConfig) {
        if (!pageConfig) return;

        // Only set title if it's still "Loading..." (fallback)
        if (pageConfig.title && document.title === 'Loading...') {
            document.title = pageConfig.title;
        }

        // Only set description if empty (fallback)
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && pageConfig.description && !metaDescription.getAttribute('content')) {
            metaDescription.setAttribute('content', pageConfig.description);
        }
    }

    // Load component stylesheets
    function loadComponentStyles(components) {
        if (!components || components.length === 0) return;

        const head = document.head;
        components.forEach(component => {
            // Check if stylesheet already exists
            const existingLink = document.querySelector(`link[href="/css/components/${component}.css"]`);
            if (existingLink) return;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/css/components/${component}.css`;
            head.appendChild(link);
        });
    }

    // Load additional scripts
    function loadScripts(scripts) {
        if (!scripts || scripts.length === 0) return;

        scripts.forEach(scriptPath => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.defer = true;
            document.body.appendChild(script);
        });
    }

    // Initialize template loader
    async function initTemplateLoader() {
        const pagePath = getCurrentPagePath();
        const allConfigs = await loadPageConfig();

        if (!allConfigs) {
            console.warn('Page configuration not found, using defaults');
            return;
        }

        // Get config for current page
        const pageConfig = allConfigs[pagePath];

        if (!pageConfig) {
            console.warn(`No configuration found for page: ${pagePath}`);
            return;
        }

        // Inject metadata
        injectMetadata(pageConfig);

        // Load component stylesheets
        loadComponentStyles(pageConfig.components);

        // Load additional scripts
        loadScripts(pageConfig.scripts);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplateLoader);
    } else {
        initTemplateLoader();
    }
})();
