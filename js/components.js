// Fast, simple component loader with chatbot support
async function loadComponents() {
    try {
        const [headerResponse, footerResponse, chatbotResponse] = await Promise.all([
            fetch('/pages/components/header.html'),
            fetch('/pages/components/footer.html'),
            fetch('/pages/components/chatbot.html')
        ]);
        
        const header = await headerResponse.text();
        const footer = await footerResponse.text();
        const chatbot = await chatbotResponse.text();
        
        document.getElementById('header').innerHTML = header;
        document.getElementById('footer').innerHTML = footer;
        document.getElementById('chatbot').innerHTML = chatbot;
        
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
        } else {
        }
    }, 100);
}


// Auto-load when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}