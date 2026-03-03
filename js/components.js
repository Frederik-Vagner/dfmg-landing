// Fast, simple component loader with chatbot support
async function loadComponents() {
    try {
        // Always load header, footer, and chatbot
        const fetchPromises = [
            fetch('/pages/components/header.html'),
            fetch('/pages/components/footer.html'),
            fetch('/pages/components/chatbot.html')
        ];

        // Check if article sidebar exists on page
        const articleSidebarElement = document.getElementById('article-sidebar');
        if (articleSidebarElement) {
            fetchPromises.push(fetch('/pages/components/article-sidebar.html'));
        }

        const responses = await Promise.all(fetchPromises);

        const header = await responses[0].text();
        const footer = await responses[1].text();
        const chatbot = await responses[2].text();

        document.getElementById('header').innerHTML = header;
        document.getElementById('footer').innerHTML = footer;
        document.getElementById('chatbot').innerHTML = chatbot;

        // Load article sidebar if it exists
        if (articleSidebarElement && responses[3]) {
            const articleSidebar = await responses[3].text();
            articleSidebarElement.innerHTML = articleSidebar;
        }

        // Initialize chatbot after loading
        initializeChatbotFunctions();
    } catch (error) {
        console.error('Failed to load components:', error);
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

    window.switchTab = function(tabName, clickedElement) {
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


// Carousel functions for services section
function initializeServicesCarousel() {
    let currentIndex = 0;
    const totalCards = 6;
    const cardsVisible = 3;
    const maxIndex = totalCards - cardsVisible;

    function updateCarousel() {
        const track = document.getElementById('servicesTrack');
        if (track) {
            const moveDistance = currentIndex * 400; // 386px card + 14px margin = 400px exactly
            track.style.transform = `translateX(-${moveDistance}px)`;
        }
    }

    window.nextServices = function() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    };

    window.previousServices = function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    };
}

// Auto-load when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadComponents();
        initializeServicesCarousel();
    });
} else {
    loadComponents();
    initializeServicesCarousel();
}