// Chat Widget Module

// Function to generate or retrieve a unique chat ID
function getChatId() {
    let chatId = sessionStorage.getItem("chatId");
    if (!chatId) {
        chatId = "chat_" + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem("chatId", chatId);
    }
    return chatId;
}

// Enhanced show chat widget function
document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById("chat-widget-button");
    const chatInput = document.getElementById("chat-widget-input");
    const chatSendButton = document.getElementById("chat-widget-send");

    if (chatButton) {
        chatButton.addEventListener("click", function() {
            const container = document.getElementById("chat-widget-container");
            const button = document.getElementById("chat-widget-button");
            
            container.style.display = "flex";
            // Trigger reflow for animation
            container.offsetHeight;
            container.classList.add("show");
            button.style.display = "none";
            
            // Focus on input
            setTimeout(() => {
                document.getElementById("chat-widget-input").focus();
            }, 300);
            
            // Scroll to bottom
            scrollToBottom();
        });
    }

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener("input", function() {
            this.style.height = "44px";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
        });

        // Send on Enter (but Shift+Enter for new line)
        chatInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Send message button
    if (chatSendButton) {
        chatSendButton.addEventListener("click", sendMessage);
    }
});

// Enhanced close chat widget function
function closeChatWidget() {
    const container = document.getElementById("chat-widget-container");
    const button = document.getElementById("chat-widget-button");
    
    container.classList.remove("show");
    setTimeout(() => {
        container.style.display = "none";
        button.style.display = "flex";
    }, 300);
}

// Enhanced send message function
function sendMessage() {
    const input = document.getElementById("chat-widget-input");
    const message = input.value.trim();
    
    if (message === "") return;
    
    const chatBody = document.getElementById("chat-widget-body");
    const sendButton = document.getElementById("chat-widget-send");
    
    // Disable send button
    sendButton.disabled = true;
    sendButton.innerHTML = '<span>Sending...</span>';
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input and reset height
    input.value = "";
    input.style.height = "44px";
    
    // Show typing indicator
    showTypingIndicator();
    
    const chatId = getChatId();
    
    fetch(window.ChatWidgetConfig.webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chatId: chatId,
            message: message,
            route: window.ChatWidgetConfig.webhook.route
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response
        const botResponse = data.output || "Sorry, I couldn't understand that. Could you please rephrase your question?";
        addMessage(botResponse, 'bot');
        
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.innerHTML = '<span>Send</span>';
        
        // Focus back on input
        input.focus();
    })
    .catch(error => {
        console.error("Error:", error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add error message
        addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", 'bot');
        
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.innerHTML = '<span>Send</span>';
        
        // Focus back on input
        input.focus();
    });
}

// Enhanced add message function
function addMessage(message, type) {
    const chatBody = document.getElementById("chat-widget-body");
    const messageElement = document.createElement("p");
    
    messageElement.innerHTML = formatMessage(message);
    messageElement.classList.add(type === 'user' ? 'user-message' : 'bot-message');
    
    chatBody.appendChild(messageElement);
    scrollToBottom();
}

// Format message (handle links, line breaks, etc.)
function formatMessage(message) {
    return message
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Typing indicator functions
function showTypingIndicator() {
    const chatBody = document.getElementById("chat-widget-body");
    
    // Remove any existing typing indicator
    const existingIndicator = chatBody.querySelector('.typing-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
        <span>Assistant is typing</span>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    chatBody.appendChild(typingIndicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Smooth scroll to bottom
function scrollToBottom() {
    const chatBody = document.getElementById("chat-widget-body");
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
}

// Show/hide chat widget functions for authentication
function showChatWidget() {
    const chatButton = document.getElementById('chat-widget-button');
    if (chatButton) {
        chatButton.style.display = 'flex';
    }
}

function hideChatWidget() {
    const chatButton = document.getElementById('chat-widget-button');
    const chatContainer = document.getElementById('chat-widget-container');
    
    if (chatButton) {
        chatButton.style.display = 'none';
    }
    
    if (chatContainer) {
        chatContainer.classList.remove('show');
        chatContainer.style.display = 'none';
    }
}

// Optional: Add notification badge
function showNotificationBadge(count = 1) {
    const button = document.getElementById('chat-widget-button');
    let badge = button.querySelector('.chat-notification-badge');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'chat-notification-badge';
        button.appendChild(badge);
    }
    
    badge.textContent = count;
    badge.style.display = 'flex';
}

function hideNotificationBadge() {
    const badge = document.querySelector('.chat-notification-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

// Hide badge when chat is opened
document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById("chat-widget-button");
    if (chatButton) {
        chatButton.addEventListener("click", hideNotificationBadge);
    }
});