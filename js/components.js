// Fast, simple component loader with chatbot support
function isPlatformPage() {
    return window.location.pathname.startsWith('/pages/software/');
}

// Replace site-data tokens in runtime-loaded component HTML
function replaceSiteTokens(html) {
    var s = window.DFMG || {};
    return html
        .replace(/%SITE_EMAIL%/g, s.email || '')
        .replace(/%SITE_PLATFORM_EMAIL%/g, s.platformEmail || '')
        .replace(/%SITE_PHONE%/g, s.phone || '')
        .replace(/%SITE_PHONE_DISPLAY%/g, s.phoneDisplay || '')
        .replace(/%SITE_PHONE_SHORT%/g, s.phoneShort || '')
        .replace(/%SITE_CVR%/g, s.cvr || '')
        .replace(/%SITE_CVR_URL%/g, s.cvrUrl || '')
        .replace(/%SITE_ADDRESS%/g, s.address || '')
        .replace(/%SITE_LINKEDIN%/g, s.linkedin || '');
}

async function loadComponents() {
    try {
        const platform = isPlatformPage();
        const headerPath = platform ? '/pages/software/components/header-platform.html' : '/pages/facility/components/header.html';
        const footerPath = platform ? '/pages/software/components/footer-platform.html' : '/pages/facility/components/footer.html';

        const fetchPromises = [
            fetch(headerPath),
            fetch(footerPath)
        ];

        // Load chatbot on service pages, contact widget on all pages
        if (!platform) {
            fetchPromises.push(fetch('/pages/facility/components/chatbot.html'));
        }
        fetchPromises.push(fetch('/pages/components/contact-widget.html'));

        // Check if article sidebar exists on page
        const articleSidebarElement = document.getElementById('article-sidebar');
        if (articleSidebarElement) {
            fetchPromises.push(fetch('/pages/facility/components/article-sidebar.html'));
        }

        const responses = await Promise.all(fetchPromises);

        const header = replaceSiteTokens(await responses[0].text());
        const footer = replaceSiteTokens(await responses[1].text());

        document.getElementById('header').innerHTML = header;
        document.getElementById('footer').innerHTML = footer;

        let nextIdx = 2;

        // Inject chatbot on non-platform pages
        if (!platform) {
            const chatbotHtml = replaceSiteTokens(await responses[nextIdx].text());
            const chatbotEl = document.getElementById('chatbot');
            if (chatbotEl) chatbotEl.innerHTML = chatbotHtml;
            nextIdx++;
        }

        // Inject contact widget on all pages
        const contactHtml = replaceSiteTokens(await responses[nextIdx].text());
        const contactEl = document.getElementById('contact-widget');
        if (contactEl) contactEl.innerHTML = contactHtml;
        nextIdx++;

        // Load article sidebar if it exists
        if (articleSidebarElement && responses[nextIdx]) {
            const articleSidebar = replaceSiteTokens(await responses[nextIdx].text());
            articleSidebarElement.innerHTML = articleSidebar;
            initArticleSidebar();
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

    // Chatbot tab switching and FAQ toggle via event delegation
    document.addEventListener('click', function(e) {
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


// Contact widget initialization (platform pages)
function initializeContactWidget() {
    // Bind toggle via data-action attributes
    document.querySelectorAll('[data-action="toggle-contact-widget"]').forEach(function(el) {
        el.addEventListener('click', function() {
            document.getElementById('contactWidget').classList.toggle('active');
        });
    });

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
    widget.querySelectorAll('[data-da], [data-en]').forEach(function(el) {
        var translation = el.getAttribute('data-' + lang);
        if (translation) el.textContent = translation;
    });

    // On Danish pages, point demo link to service contact page
    if (lang === 'da') {
        var demoLink = document.getElementById('contactWidgetDemoLink');
        if (demoLink) demoLink.href = '/pages/facility/kontakt.html';
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


// Article data for related articles
const sidebarArticles = [
    { path: '/pages/facility/indblik/artikler/innovation/mennesker-vs-robotter-facility-management.html', title: 'Mennesker vs. Robotter i Facility Management', time: '5 min læsning', category: 'innovation' },
    { path: '/pages/facility/indblik/artikler/innovation/fra-kaos-til-kontrol-dfmg-erp-system-historie.html', title: 'Fra Kaos til Kontrol: DFMG\'s ERP-System Historie', time: '6 min læsning', category: 'innovation' },
    { path: '/pages/facility/indblik/artikler/indsigt/fra-vip-til-glemt-kunde.html', title: 'Fra VIP til Glemt Kunde: En Alt-for-Almindelig Historie', time: '4 min læsning', category: 'insights' },
    { path: '/pages/facility/indblik/artikler/indsigt/systematik-vs-talent.html', title: 'Hvorfor Systematik Slår Talent i Facility Management', time: '6 min læsning', category: 'insights' },
    { path: '/pages/facility/indblik/artikler/indsigt/oejeblikkelige-svar-vs-jeg-vender-tilbage.html', title: '\u00d8jeblikkelige Svar vs. \u201cJeg Vender Tilbage\u201d', time: '5 min læsning', category: 'insights' },
    { path: '/pages/facility/indblik/artikler/baeredygtighed/100-procent-bilfri-facility-service.html', title: '100% Bilfri Facility Service: S\u00e5dan G\u00f8r Vi Det', time: '3 min læsning', category: 'sustainability' },
    { path: '/pages/facility/indblik/artikler/cases/fra-5-leverandoerer-til-en-paalidelig-partner.html', title: 'Fra 5 Leverand\u00f8rer til \u00c9n P\u00e5lidelig Partner', time: '5 min læsning', category: 'cases' },
    { path: '/pages/facility/indblik/artikler/cases/case-20-procent-omkostningsreduktion-tech-virksomhed.html', title: 'Case: 20% Omkostningsreduktion for Tech-Virksomhed', time: '4 min læsning', category: 'cases' },
    { path: '/pages/facility/indblik/artikler/tips/saadan-laeser-i-facility-tidsrapport.html', title: 'S\u00e5dan L\u00e6ser I En Facility Tidsrapport', time: '3 min læsning', category: 'tips' },
    { path: '/pages/facility/indblik/artikler/tips/5-tegn-paa-at-skifte-leverandoer.html', title: '5 Tegn P\u00e5 at I Skal Skifte Facility Leverand\u00f8r', time: '4 min læsning', category: 'tips' },
    { path: '/pages/facility/indblik/artikler/tips/location-guides-hemmeligheden-bag-konsistent-kvalitet.html', title: 'Location Guides: Et V\u00e6rkt\u00f8j til Konsistent Kvalitet', time: '4 min læsning', category: 'tips' }
];

// Initialize all sidebar features after injection
function initArticleSidebar() {
    initTableOfContents();
    initRelatedArticles();
    initNewsletterForm();
}

// Generate table of contents from article headings
function initTableOfContents() {
    const articleBody = document.querySelector('.article-body');
    const tocList = document.getElementById('toc-list');
    if (!articleBody || !tocList) return;

    const headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        tocList.closest('.sidebar-card').style.display = 'none';
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

// Populate related articles, excluding the current page
function initRelatedArticles() {
    const container = document.getElementById('related-articles');
    if (!container) return;

    const currentPath = window.location.pathname;
    const otherArticles = sidebarArticles.filter(a => a.path !== currentPath);

    // Shuffle and pick 3
    for (let i = otherArticles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherArticles[i], otherArticles[j]] = [otherArticles[j], otherArticles[i]];
    }

    otherArticles.slice(0, 3).forEach(article => {
        const div = document.createElement('div');
        div.className = 'related-article';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'related-image ' + article.category;
        const img = document.createElement('img');
        img.src = '/images/article/ipad.jpg';
        img.alt = '';
        img.className = 'w-full h-full object-cover rounded-lg';
        img.loading = 'lazy';
        img.decoding = 'async';
        imageDiv.appendChild(img);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'related-content';
        const h4 = document.createElement('h4');
        const link = document.createElement('a');
        link.href = article.path;
        link.textContent = article.title;
        link.setAttribute('aria-label', 'Læs artikel: ' + article.title);
        h4.appendChild(link);
        const meta = document.createElement('div');
        meta.className = 'related-meta';
        meta.textContent = article.time;
        contentDiv.appendChild(h4);
        contentDiv.appendChild(meta);

        div.appendChild(imageDiv);
        div.appendChild(contentDiv);
        container.appendChild(div);
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

        window.location.href = 'mailto:' + window.DFMG.email + '?subject=Nyhedsbrev tilmelding&body=Tilmeld venligst denne email til jeres nyhedsbrev: ' + encodeURIComponent(email);

        form.style.display = 'none';
        document.getElementById('newsletter-success').style.display = 'block';
    });
}

// Platform FAQ toggle (pricing.html)
document.addEventListener('click', function(e) {
    var faq = e.target.closest('[data-action="toggle-platform-faq"]');
    if (faq) {
        faq.classList.toggle('active');
        faq.nextElementSibling.classList.toggle('active');
    }
});

// Auto-load when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}