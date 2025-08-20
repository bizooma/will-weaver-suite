/**
 * Amicus Edge Chatbot Widget
 * Production-ready embeddable widget for external websites
 */
(function() {
  'use strict';
  
  const WIDGET_API_BASE = 'https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1';
  
  class AmicusChatWidget {
    constructor(chatbotId, options = {}) {
      this.chatbotId = chatbotId;
      this.options = {
        position: 'bottom-right',
        theme: 'light',
        ...options
      };
      this.isOpen = false;
      this.sessionId = this.generateSessionId();
      this.messages = [];
      this.config = null;
      
      this.init();
    }
    
    generateSessionId() {
      return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    
    async init() {
      try {
        await this.loadConfig();
        this.render();
        this.attachEventListeners();
        this.logWidgetLoad();
      } catch (error) {
        console.error('Failed to initialize Amicus Chat Widget:', error);
      }
    }
    
    async loadConfig() {
      const response = await fetch(`${WIDGET_API_BASE}/widget-config?chatbotId=${this.chatbotId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chatbot configuration');
      }
      
      const result = await response.json();
      this.config = result.data;
    }
    
    async logWidgetLoad() {
      try {
        await fetch(`${WIDGET_API_BASE}/widget-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbotId: this.chatbotId,
            origin: window.location.origin,
            sessionId: this.sessionId
          })
        });
      } catch (error) {
        console.warn('Failed to log widget interaction:', error);
      }
    }
    
    render() {
      // Create widget container
      this.container = document.createElement('div');
      this.container.id = 'amicus-chat-widget';
      this.container.innerHTML = this.getWidgetHTML();
      
      // Add styles
      this.addStyles();
      
      // Append to body
      document.body.appendChild(this.container);
    }
    
    getWidgetHTML() {
      const primaryColor = this.config?.primaryColor || '#3b82f6';
      const chatbotName = this.config?.name || 'Chat Assistant';
      const welcomeMessage = this.config?.welcomeMessage || 'Hello! How can I help you today?';
      
      return `
        <div class="amicus-widget-button" id="amicus-widget-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
          </svg>
        </div>
        
        <div class="amicus-widget-chat" id="amicus-widget-chat" style="display: none;">
          <div class="amicus-widget-header">
            <div class="amicus-widget-title">
              <h4>${chatbotName}</h4>
              <span class="amicus-widget-status">Online</span>
            </div>
            <button class="amicus-widget-close" id="amicus-widget-close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div class="amicus-widget-messages" id="amicus-widget-messages">
            <div class="amicus-message amicus-message-bot">
              <div class="amicus-message-content">${welcomeMessage}</div>
            </div>
          </div>
          
          ${this.config?.suggestedResponses && this.config?.showSuggestedResponses ? this.getSuggestedResponsesHTML() : ''}
          
          <div class="amicus-widget-input">
            <input type="text" id="amicus-widget-input" placeholder="Type your message...">
            <button id="amicus-widget-send">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15 1L1 8L6 9L7 14L15 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="amicus-widget-footer">
            <span>Powered by Amicus Edge</span>
          </div>
        </div>
      `;
    }
    
    getSuggestedResponsesHTML() {
      if (!this.config?.suggestedResponses || !Array.isArray(this.config.suggestedResponses)) {
        return '';
      }
      
      const responses = this.config.suggestedResponses.map(response => 
        `<button class="amicus-suggested-response" data-response="${response}">${response}</button>`
      ).join('');
      
      return `
        <div class="amicus-suggested-responses" id="amicus-suggested-responses">
          ${responses}
        </div>
      `;
    }
    
    addStyles() {
      if (document.getElementById('amicus-widget-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'amicus-widget-styles';
      style.textContent = `
        #amicus-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .amicus-widget-button {
          width: 60px;
          height: 60px;
          background: ${this.config?.primaryColor || '#3b82f6'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        .amicus-widget-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .amicus-widget-chat {
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: absolute;
          bottom: 70px;
          right: 0;
        }
        
        .amicus-widget-header {
          background: ${this.config?.primaryColor || '#3b82f6'};
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .amicus-widget-title h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .amicus-widget-status {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .amicus-widget-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .amicus-widget-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .amicus-widget-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .amicus-message {
          max-width: 80%;
          word-wrap: break-word;
        }
        
        .amicus-message-bot {
          align-self: flex-start;
        }
        
        .amicus-message-user {
          align-self: flex-end;
        }
        
        .amicus-message-content {
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .amicus-message-bot .amicus-message-content {
          background: #f3f4f6;
          color: #374151;
        }
        
        .amicus-message-user .amicus-message-content {
          background: ${this.config?.primaryColor || '#3b82f6'};
          color: white;
        }
        
        .amicus-suggested-responses {
          padding: 0 16px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .amicus-suggested-response {
          background: #f3f4f6;
          border: none;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .amicus-suggested-response:hover {
          background: #e5e7eb;
        }
        
        .amicus-widget-input {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        
        .amicus-widget-input input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }
        
        .amicus-widget-input input:focus {
          border-color: ${this.config?.primaryColor || '#3b82f6'};
        }
        
        .amicus-widget-input button {
          background: ${this.config?.primaryColor || '#3b82f6'};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .amicus-widget-input button:hover {
          opacity: 0.9;
        }
        
        .amicus-widget-footer {
          padding: 8px 16px;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          border-top: 1px solid #f3f4f6;
        }
        
        @media (max-width: 480px) {
          .amicus-widget-chat {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            right: 20px;
            bottom: 80px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    attachEventListeners() {
      const button = document.getElementById('amicus-widget-button');
      const chat = document.getElementById('amicus-widget-chat');
      const close = document.getElementById('amicus-widget-close');
      const input = document.getElementById('amicus-widget-input');
      const send = document.getElementById('amicus-widget-send');
      
      button.addEventListener('click', () => this.toggleChat());
      close.addEventListener('click', () => this.toggleChat());
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
      
      send.addEventListener('click', () => this.sendMessage());
      
      // Suggested responses
      const suggestedResponses = document.querySelectorAll('.amicus-suggested-response');
      suggestedResponses.forEach(button => {
        button.addEventListener('click', (e) => {
          const response = e.target.getAttribute('data-response');
          this.sendMessage(response);
        });
      });
    }
    
    toggleChat() {
      const chat = document.getElementById('amicus-widget-chat');
      this.isOpen = !this.isOpen;
      chat.style.display = this.isOpen ? 'flex' : 'none';
      
      if (this.isOpen) {
        document.getElementById('amicus-widget-input').focus();
      }
    }
    
    sendMessage(text) {
      const input = document.getElementById('amicus-widget-input');
      const message = text || input.value.trim();
      
      if (!message) return;
      
      // Add user message
      this.addMessage(message, 'user');
      
      // Clear input
      if (!text) {
        input.value = '';
      }
      
      // Hide suggested responses after first message
      const suggestedResponses = document.getElementById('amicus-suggested-responses');
      if (suggestedResponses) {
        suggestedResponses.style.display = 'none';
      }
      
      // Simulate bot response (in real implementation, this would call your AI service)
      setTimeout(() => {
        this.addMessage("Thanks for your message! A human agent will respond shortly.", 'bot');
      }, 1000);
    }
    
    addMessage(text, sender) {
      const messagesContainer = document.getElementById('amicus-widget-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `amicus-message amicus-message-${sender}`;
      messageDiv.innerHTML = `<div class="amicus-message-content">${text}</div>`;
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      this.messages.push({ text, sender, timestamp: new Date() });
    }
  }
  
  // Auto-initialize widget from script tag data attributes
  function initializeFromScript() {
    const scripts = document.querySelectorAll('script[data-amicus-chatbot-id]');
    scripts.forEach(script => {
      const chatbotId = script.getAttribute('data-amicus-chatbot-id');
      if (chatbotId) {
        new AmicusChatWidget(chatbotId);
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFromScript);
  } else {
    initializeFromScript();
  }
  
  // Export for manual initialization
  window.AmicusChatWidget = AmicusChatWidget;
  
})();