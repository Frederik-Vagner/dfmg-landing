// Behaviour for the header, footer, chatbot and article sidebar.
//
// These used to be fetched here and injected at runtime, which meant the page
// arrived without its navigation and the site data had to be swapped into
// %SITE_*% placeholders in the browser. Eleventy now renders all four into
// every page at build time (see _includes/base.html), so this file only wires
// up behaviour against markup that is already in the document.
function initComponents() {
    initMobileMenu();
    initClickableKeyboard();

    // The chatbot markup is only present on facility pages.
    if (document.getElementById('chatbotButton')) {
        initializeChatbotFunctions();
    }

    // Only the article sidebar partial carries these.
    if (document.getElementById('toc-list')) {
        initArticleSidebar();
    }
}

// Mobile menu: the button opens a fixed panel under the header. Escape, a
// click outside it or following one of its links closes it again.
function initMobileMenu() {
    const button = document.querySelector('.menu-btn');
    const header = document.querySelector('.header');
    const menu = document.getElementById('mobile-nav');
    if (!button || !header || !menu) return;

    function setOpen(open) {
        header.classList.toggle('is-menu-open', open);
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? button.dataset.labelClose : button.dataset.labelOpen);
    }

    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            button.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (button.getAttribute('aria-expanded') !== 'true') return;
        if (!menu.contains(e.target) && !button.contains(e.target)) setOpen(false);
    });

    menu.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
}

// Some controls are <div>s with click handlers (FAQ rows, tabs, the kontakt
// service picker). They carry role="button" and tabindex="0" in the markup;
// this makes Enter and Space press them like a real button, and keeps
// aria-expanded in step with the open/active class the click handler sets.
function initClickableKeyboard() {
    // The platform FAQ markup lives in a shared include; give it the same
    // treatment here rather than in the template.
    document.querySelectorAll('[data-action="toggle-platform-faq"]:not([role])').forEach(el => {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target;
        if (!el || el.getAttribute('role') !== 'button' || el.tagName === 'BUTTON') return;
        e.preventDefault();
        el.click();
    });

    document.addEventListener('click', (e) => {
        const el = e.target && e.target.closest ? e.target.closest('[role="button"][aria-expanded]') : null;
        if (!el) return;
        // After the page's own handler has toggled its class.
        setTimeout(() => {
            document.querySelectorAll('[role="button"][aria-expanded][data-action]').forEach(t => {
                t.setAttribute('aria-expanded', String(t.classList.contains('active') || t.classList.contains('open')));
            });
        }, 0);
    });
}

// Initialize all chatbot functions globally
function initializeChatbotFunctions() {
    // Define all window functions first
    window.toggleChatbot = function() {
        const popup = document.getElementById('chatbotPopup');
        const chatPreview = document.getElementById('chatPreview');
                
        if (popup) {
            popup.classList.toggle('active');
            const open = popup.classList.contains('active');
            const button = document.getElementById('chatbotButton');
            if (button) {
                button.setAttribute('aria-expanded', String(open));
                button.setAttribute('aria-label', open ? 'Luk chat' : 'Åbn chat');
            }

            if (open && chatPreview) {
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
            document.querySelectorAll('.chatbot__panel').forEach(function(c) { c.classList.remove('active'); });
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
            // The box has no e-mail field, so the question goes out as an e-mail
            // from the visitor's own mail program; say so rather than "sent".
            window.showNotification('Åbner dit mailprogram med dit spørgsmål. Send mailen, så svarer vi samme dag på hverdage.');
            window.open(`mailto:${window.DFMG.email}?subject=Spørgsmål fra chatbot&body=Hej DFMG,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AVenlig hilsen`, '_blank');
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
        
        const phoneError = document.getElementById('callbackError');
        function showPhoneError(message) {
            phoneError.textContent = message;
            phoneError.hidden = !message;
            phoneInput.setAttribute('aria-invalid', message ? 'true' : 'false');
        }

        if (!phoneNumber) {
            showPhoneError('Indtast dit telefonnummer.');
            return;
        }

        const phoneRegex = /^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/;
        if (!phoneRegex.test(phoneNumber)) {
            showPhoneError('Indtast et dansk nummer med 8 cifre.');
            return;
        }
        showPhoneError('');
        
        fetch('https://formspree.io/f/xdkdrqkw', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ _subject: 'Ring-mig-op anmodning fra chatbot', telefon: phoneNumber })
        }).then(function(res) {
            if (!res.ok) throw new Error('send failed');
            window.showNotification('Tak! Vi ringer tilbage samme dag (hverdage 8–16).');
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

    document.addEventListener('keydown', function(e) {
        const popup = document.getElementById('chatbotPopup');
        if (e.key === 'Escape' && popup && popup.classList.contains('active')) {
            window.toggleChatbot();
            document.getElementById('chatbotButton').focus();
        }
    });

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
        tocList.closest('.card--sidebar').hidden = true;
        return;
    }

    headings.forEach((heading, index) => {
        if (!heading.id) heading.id = 'heading-' + index;

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        if (heading.tagName === 'H3') link.classList.add('toc-list__link--sub');

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
            form.hidden = true;
            document.getElementById('newsletter-success').hidden = false;
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