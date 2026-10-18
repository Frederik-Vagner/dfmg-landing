// Behaviour for the header, footer, chatbot and article sidebar.
//
// These used to be fetched here and injected at runtime, which meant the page
// arrived without its navigation and the site data had to be swapped into
// %SITE_*% placeholders in the browser. Eleventy now renders all four into
// every page at build time (see _includes/base.html), so this file only wires
// up behaviour against markup that is already in the document.
function initComponents() {
    // The chatbot markup is only present on facility pages.
    if (document.getElementById('chatbotButton')) {
        initializeChatbotFunctions();
    }

    // Only the article sidebar partial carries these.
    if (document.getElementById('toc-list')) {
        initArticleSidebar();
    }
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

    // Chatbot tab switching and FAQ toggle via event delegation
    document.addEventListener('click', function(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        var tabEl = e.target.closest('[data-chatbot-tab]');
        if (tabEl) {
            document.querySelectorAll('[data-chatbot-tab]').forEach(function(t) { t.classList.remove('active'); });
            tabEl.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            document.getElementById(tabEl.getAttribute('data-chatbot-tab') + '-tab').classList.add('active');
            return;
        }

        var faqEl = e.target.closest('[data-action="toggle-chatbot-faq"]');
        if (faqEl) {
            var answer = faqEl.nextElementSibling;
            document.querySelectorAll('[data-action="toggle-chatbot-faq"]').forEach(function(q) {
                if (q !== faqEl) {
                    q.classList.remove('active');
                    q.nextElementSibling.classList.remove('active');
                }
            });
            faqEl.classList.toggle('active');
            answer.classList.toggle('active');
            return;
        }

        var action = e.target.closest('[data-action]');
        if (action) {
            var actionName = action.getAttribute('data-action');
            if (actionName === 'submit-callback') window.submitCallbackRequest();
            else if (actionName === 'toggle-callback-form') window.toggleCallbackForm();
            else if (actionName === 'send-message') window.sendMessage();
            else if (actionName === 'call-direct') window.callDirect();
        }
    });

    window.sendMessage = function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            window.showNotification('Tak for din besked! Vi svarer inden for 15 minutter.');
            setTimeout(() => {
                window.open(`mailto:${window.DFMG.email}?subject=Spørgsmål fra chatbot&body=Hej DFMG,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AVenlig hilsen`, '_blank');
            }, 1500);
            input.value = '';
        }
    };

    window.callDirect = function() {
        window.open('tel:' + window.DFMG.phone, '_self');
    };

    window.sendEmail = function() {
        window.open('mailto:' + window.DFMG.email + '?subject=Henvendelse fra website', '_blank');
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
        
        fetch('https://formspree.io/f/xdkdrqkw', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ _subject: 'Ring-mig-op anmodning fra chatbot', telefon: phoneNumber })
        }).then(function(res) {
            if (!res.ok) throw new Error('send failed');
            window.showNotification('Tak! Vi ringer dig op inden for 15 minutter i åbningstid.');
            document.getElementById('callbackForm').classList.remove('active');
            phoneInput.value = '';
        }).catch(function() {
            window.showNotification('Noget gik galt. Ring til os på ' + window.DFMG.phoneDisplay + ' i stedet.');
        });
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

    // Attach event listener to chatbot button via ID
    setTimeout(() => {
        const chatbotButton = document.getElementById('chatbotButton');
        if (chatbotButton) {
            chatbotButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.toggleChatbot();
            });
        }
    }, 100);
}




// Initialize all sidebar features after injection
function initArticleSidebar() {
    initTableOfContents();
    initNewsletterForm();
}

// Generate table of contents from article headings
function initTableOfContents() {
    const articleBody = document.querySelector('.article-body');
    const tocList = document.getElementById('toc-list');
    if (!articleBody || !tocList) return;

    const headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        tocList.closest('.card--sidebar').style.display = 'none';
        return;
    }

    headings.forEach((heading, index) => {
        if (!heading.id) heading.id = 'heading-' + index;

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        if (heading.tagName === 'H3') link.style.paddingLeft = '1rem';

        li.appendChild(link);
        tocList.appendChild(li);
    });

    tocList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Newsletter form handler
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value.trim();
        if (!email) return;

        fetch('https://formspree.io/f/xdkdrqkw', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ _subject: 'Nyhedsbrev tilmelding', email: email })
        }).then((res) => {
            if (!res.ok) throw new Error('send failed');
            form.style.display = 'none';
            document.getElementById('newsletter-success').style.display = 'block';
        }).catch(() => {
            window.location.href = 'mailto:' + window.DFMG.email + '?subject=Nyhedsbrev tilmelding&body=Tilmeld venligst denne email til jeres nyhedsbrev: ' + encodeURIComponent(email);
        });
    });
}

// Platform FAQ toggle (pricing.html)
document.addEventListener('click', function(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    var faq = e.target.closest('[data-action="toggle-platform-faq"]');
    if (faq) {
        faq.classList.toggle('active');
        faq.nextElementSibling.classList.toggle('open');
    }
});

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}