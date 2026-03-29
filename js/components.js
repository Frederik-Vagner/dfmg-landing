// Fast, simple component loader with chatbot support
function isPlatformPage() {
    return window.location.pathname.startsWith('/pages/platform/');
}

async function loadComponents() {
    try {
        const platform = isPlatformPage();
        const headerPath = platform ? '/pages/components/header-platform.html' : '/pages/components/header.html';
        const footerPath = platform ? '/pages/components/footer-platform.html' : '/pages/components/footer.html';

        const fetchPromises = [
            fetch(headerPath),
            fetch(footerPath)
        ];

        // Load chatbot on service pages, contact widget on all pages
        if (!platform) {
            fetchPromises.push(fetch('/pages/components/chatbot.html'));
        }
        fetchPromises.push(fetch('/pages/components/contact-widget.html'));

        // Check if article sidebar exists on page
        const articleSidebarElement = document.getElementById('article-sidebar');
        if (articleSidebarElement) {
            fetchPromises.push(fetch('/pages/components/article-sidebar.html'));
        }

        const responses = await Promise.all(fetchPromises);

        const header = await responses[0].text();
        const footer = await responses[1].text();

        document.getElementById('header').innerHTML = header;
        document.getElementById('footer').innerHTML = footer;

        let nextIdx = 2;

        // Inject chatbot on non-platform pages
        if (!platform) {
            const chatbotHtml = await responses[nextIdx].text();
            const chatbotEl = document.getElementById('chatbot');
            if (chatbotEl) chatbotEl.innerHTML = chatbotHtml;
            nextIdx++;
        }

        // Inject contact widget on all pages
        const contactHtml = await responses[nextIdx].text();
        const contactEl = document.getElementById('contact-widget');
        if (contactEl) contactEl.innerHTML = contactHtml;
        nextIdx++;

        // Load article sidebar if it exists
        if (articleSidebarElement && responses[nextIdx]) {
            const articleSidebar = await responses[nextIdx].text();
            articleSidebarElement.innerHTML = articleSidebar;
        }

        // Toggle header logo color on scroll
        initHeaderScroll();

        // Initialize widget JS after DOM injection
        if (!platform) {
            initializeChatbotFunctions();
        }
        initializeContactWidget();
    } catch (error) {
        console.error('Failed to load components:', error);
    }
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const threshold = window.innerHeight * 0.6;
    let scrolled = false;

    const scrollTarget = document.body;
    scrollTarget.addEventListener('scroll', () => {
        const shouldBeScrolled = scrollTarget.scrollTop > threshold;
        if (shouldBeScrolled !== scrolled) {
            scrolled = shouldBeScrolled;
            header.classList.toggle('header--scrolled', scrolled);
        }
    }, { passive: true });
}

// Initialize all chatbot functions globally
function initializeChatbotFunctions() {
    // Define all window functions first
    window.toggleChatbot = function() {
        const popup = document.getElementById('chatbotPopup');
        const chatPreview = document.getElementById('chatPreview');
                
        if (popup) {
            popup.classList.toggle('active');
            
            if (popup.classList.contains('active') && chatPreview) {
                chatPreview.classList.remove('show');
            }
        }
    };

    window.toggleCallbackForm = function() {
        const callbackForm = document.getElementById('callbackForm');
        if (callbackForm) {
            callbackForm.classList.toggle('active');
        }
    };

    window.closeCallbackForm = function() {
        const callbackForm = document.getElementById('callbackForm');
        if (callbackForm) {
            callbackForm.classList.remove('active');
        }
    };

    window.switchChatbotTab = function(tabName, clickedElement) {
        document.querySelectorAll('.chatbot-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        clickedElement.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + '-tab').classList.add('active');
    };

    window.toggleFAQ = function(element) {
        const answer = element.nextElementSibling;
        document.querySelectorAll('.faq-question').forEach(q => {
            if (q !== element) {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            }
        });
        element.classList.toggle('active');
        answer.classList.toggle('active');
    };

    window.sendMessage = function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            window.showNotification('Tak for din besked! Vi svarer inden for 15 minutter.');
            setTimeout(() => {
                window.open(`mailto:kontakt@dfmg.dk?subject=Spørgsmål fra chatbot&body=Hej DFMG,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AVenlig hilsen`, '_blank');
            }, 1500);
            input.value = '';
        }
    };

    window.callDirect = function() {
        window.open('tel:+4550480273', '_self');
    };

    window.sendEmail = function() {
        window.open('mailto:kontakt@dfmg.dk?subject=Henvendelse fra website', '_blank');
    };

    window.submitCallbackRequest = function() {
        const phoneInput = document.getElementById('callbackPhone');
        const phoneNumber = phoneInput.value.trim();
        
        if (!phoneNumber) {
            alert('Indtast venligst dit telefonnummer');
            return;
        }
        
        const phoneRegex = /^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/;
        if (!phoneRegex.test(phoneNumber)) {
            alert('Indtast venligst et gyldigt dansk telefonnummer');
            return;
        }
        
        window.showNotification('Tak! Vi ringer dig op inden for 15 minutter i åbningstid.');
        document.getElementById('callbackForm').classList.remove('active');
        phoneInput.value = '';
    };

    window.showNotification = function(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }
    };

    // Now attach event listener to chatbot button
    setTimeout(() => {
        const chatbotButton = document.querySelector('.chatbot-button');
        if (chatbotButton) {
            chatbotButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.toggleChatbot();
            });
        }
    }, 100);
}


// Contact widget initialization (platform pages)
function initializeContactWidget() {
    window.toggleContactWidget = function() {
        document.getElementById('contactWidget').classList.toggle('active');
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var widget = document.getElementById('contactWidget');
            if (widget) widget.classList.remove('active');
        }
    });

    document.addEventListener('click', function(e) {
        var widget = document.getElementById('contactWidget');
        if (widget && widget.classList.contains('active') && !widget.contains(e.target)) {
            widget.classList.remove('active');
        }
    });

    // Language detection
    var lang = document.documentElement.lang === 'da' ? 'da' : 'en';

    var widget = document.getElementById('contactWidget');
    if (!widget) return;

    // Apply translations
    widget.querySelectorAll('[data-' + lang + ']').forEach(function(el) {
        el.textContent = el.getAttribute('data-' + lang);
    });

    // On Danish pages, point demo link to service contact page
    if (lang === 'da') {
        var demoLink = document.getElementById('contactWidgetDemoLink');
        if (demoLink) demoLink.href = '/pages/kontakt.html';
    }

    // Availability: Mon-Fri 08:00-17:00 CET
    function updateAvailability() {
        var now = new Date();
        var cet = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' }));
        var day = cet.getDay();
        var hour = cet.getHours();
        var available = day >= 1 && day <= 5 && hour >= 8 && hour < 17;

        var dot = document.getElementById('contactWidgetDot');
        var status = document.getElementById('contactWidgetStatus');
        if (dot && status) {
            dot.className = available ? 'contact-widget__dot' : 'contact-widget__dot contact-widget__dot--offline';
            if (available) {
                status.textContent = lang === 'da' ? 'Tilg\u00e6ngelig nu' : 'Available now';
            } else {
                status.textContent = lang === 'da' ? 'Tilbage man\u2013fre 08:00\u201317:00' : 'Back Mon\u2013Fri 08:00\u201317:00';
            }
        }
    }

    updateAvailability();
    setInterval(updateAvailability, 60000);
}


// Auto-load when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}