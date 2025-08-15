// Fast, simple component loader
async function loadComponents() {
    try {
        const [headerResponse, footerResponse] = await Promise.all([
            fetch('/pages/components/header.html'),
            fetch('/pages/components/footer.html')
        ]);
        
        const header = await headerResponse.text();
        const footer = await footerResponse.text();
        
        document.getElementById('header').innerHTML = header;
        document.getElementById('footer').innerHTML = footer;
    } catch (error) {
        console.error('Failed to load components:', error);
    }
}

// Auto-load when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}