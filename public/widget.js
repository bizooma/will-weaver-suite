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
      this.videoEmbedUrl = null;
      this.videoExpanded = false;
      this.videoInteractionTracked = false;
      
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
      console.log('Widget config loaded:', result);
      this.config = result?.data || result;
      
      // Load video thumbnail if video URL exists
      if (this.config?.videoUrl) {
        this.loadVideoThumbnail();
      }
    }
    
    async loadVideoThumbnail() {
      try {
        const videoUrl = this.config.videoUrl;
        let embedUrl = null;
        
        // YouTube embed URL with autoplay parameters
        if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
          let videoId;
          if (videoUrl.includes('youtube.com/watch')) {
            videoId = videoUrl.split('v=')[1]?.split('&')[0];
          } else {
            videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
          }
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&vq=hd720`;
          }
        }
        // Vimeo embed URL with autoplay parameters
        else if (videoUrl.includes('vimeo.com/')) {
          const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
          if (videoId) {
            embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&controls=0&portrait=0&title=0&byline=0`;
          }
        }
        
        this.videoEmbedUrl = embedUrl;
        const btn = document.getElementById('amicus-widget-button');
        if (btn) {
          btn.innerHTML = this.getChatButtonHTML();
        }
      } catch (error) {
        console.error('Error loading video embed:', error);
      }
    }
    
    getEmbedUrl(url) {
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
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
    
    getChatButtonHTML() {
      // Show auto-playing video if available
      if (this.videoEmbedUrl) {
        return `
          <div class="amicus-video-preview">
            <iframe 
              src="${this.videoEmbedUrl}" 
              width="120" 
              height="120" 
              frameborder="0" 
              allow="autoplay; encrypted-media" 
              allowfullscreen
            ></iframe>
            <button class="amicus-preview-play-cta" aria-label="Watch video" title="Watch video">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            </button>
          </div>
        `;
      }
      
      // Default chat icon
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
        </svg>
      `;
    }
    
    getHeaderHTML() {
      const chatbotName = this.config?.name || 'Chat Assistant';
      const contactPhone = this.config?.contactPhone;
      const contactEmail = this.config?.contactEmail;
      const calendlyUrl = this.config?.calendlyUrl;
      
      let headerContent = '';
      
      // If there are contact options, show buttons
      if (contactPhone || contactEmail || calendlyUrl) {
        headerContent = '<div class="amicus-contact-buttons">';
        
        if (contactPhone) {
          headerContent += `
            <a href="tel:${contactPhone}" class="amicus-contact-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V20.92C22 21.9 21.11 22.8 20.12 22.8C9.07 22.8 0.12 13.85 0.12 2.8C0.12 1.81 1.01 0.92 2 0.92H6C7 0.92 7.88 1.81 7.88 2.8V6.8C7.88 7.79 7 8.68 6 8.68H4.5C4.5 13.25 8.25 17 12.82 17V15.5C12.82 14.5 13.71 13.62 14.7 13.62H18.7C19.69 13.62 20.58 14.5 20.58 15.5V19.5C20.58 20.49 21.47 21.38 22.46 21.38Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Call
            </a>
          `;
        }
        
        if (contactEmail) {
          headerContent += `
            <a href="mailto:${contactEmail}" class="amicus-contact-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Email
            </a>
          `;
        }
        
        headerContent += '</div>';
        
        if (calendlyUrl) {
          headerContent += `
            <a href="${calendlyUrl}" target="_blank" class="amicus-calendly-btn">
              Schedule a Free Consultation
            </a>
          `;
        }
      } else {
        // Show chatbot name if no contact options
        headerContent = `
          <div class="amicus-widget-title">
            <h4>${chatbotName}</h4>
            <span class="amicus-widget-status">Online</span>
          </div>
        `;
      }
      
      return headerContent;
    }
    
    getVideoHTML() {
      if (!this.config?.videoUrl) return '';
      
      const embedUrl = this.getEmbedUrl(this.config.videoUrl);
      return `
        <div class="amicus-video-container">
          <iframe
            src="${embedUrl}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
    
    getPositionStyles() {
      const position = (this.config?.position || 'bottom-right').toLowerCase();
      switch (position) {
        case 'lower-left':
        case 'bottom-left':
          return 'bottom: 20px; left: 20px;';
        case 'lower-center':
        case 'bottom-center':
          return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
        case 'lower-right':
        case 'bottom-right':
        default:
          return 'bottom: 20px; right: 20px;';
      }
    }
    
    getWidgetHTML() {
      const primaryColor = this.config?.primaryColor || '#3b82f6';
      const chatbotName = this.config?.name || 'Chat Assistant';
      const welcomeMessage = this.config?.welcomeMessage || 'Hello! How can I help you today?';
      
      return `
        <div class="amicus-widget-button" id="amicus-widget-button" role="button" tabindex="0" aria-label="Open chat">
          ${this.getChatButtonHTML()}
        </div>
        
        <div class="amicus-widget-chat" id="amicus-widget-chat" style="display: none;">
          <div class="amicus-widget-header">
            ${this.getHeaderHTML()}
            <button class="amicus-widget-close" id="amicus-widget-close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          ${this.config?.videoUrl ? this.getVideoHTML() : ''}
          
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
            <span style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
              Powered by 
              <a href="https://legallyinnovative.com" target="_blank" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
                <img src="/logo.png" alt="Logo" style="height: 32px; width: auto;" />
              </a>
            </span>
          </div>
        </div>
      `;
    }
    
    getSuggestedResponsesHTML() {
      if (!this.config?.suggestedResponses || !Array.isArray(this.config.suggestedResponses)) {
        return '';
      }
      
      const responses = this.config.suggestedResponses
        .filter(response => response && response.trim() !== '')
        .map(response => 
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
          ${this.getPositionStyles()}
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .amicus-widget-button {
          width: 120px;
          height: 120px;
          background: ${this.config?.primaryColor || '#3b82f6'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
          border: 3px solid rgba(255, 255, 255, 0.8);
        }
        
        .amicus-widget-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .amicus-video-preview {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        
        .amicus-video-preview iframe {
          position: absolute;
          width: 180%;
          height: 180%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -58%);
          border-radius: 8px;
          pointer-events: none;
          border: none;
        }
        
        .amicus-video-preview::before {
          content: '';
          position: absolute;
          top: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .amicus-video-preview::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0), rgba(0,0,0,0.1));
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .amicus-video-preview:hover::after {
          opacity: 1;
        }
        
        .amicus-preview-play-cta {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #111827;
          border: none;
          border-radius: 9999px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .amicus-preview-play-cta:hover {
          background: #fff;
        }
        
        .amicus-widget-chat {
          width: 380px;
          height: min(700px, 80vh);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: absolute;
          bottom: 130px;
          right: 0;
        }
        
        .amicus-widget-header {
          background: #dc2626;
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-direction: column;
          gap: 8px;
        }
        
        .amicus-contact-buttons {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        
        .amicus-contact-btn {
          background: white;
          color: #dc2626;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .amicus-contact-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .amicus-calendly-btn {
          background: white;
          color: #dc2626;
          border: 1px solid white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          display: block;
          text-align: center;
          width: 100%;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .amicus-calendly-btn:hover {
          background: #fef2f2;
          color: #dc2626;
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
          position: absolute;
          top: 16px;
          right: 16px;
        }
        
        .amicus-widget-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .amicus-video-container {
          padding: 16px;
          background: #f9fafb;
        }
        
        .amicus-video-container iframe {
          width: 100%;
          height: 200px;
          border-radius: 8px;
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
          padding: 12px 16px;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          background: white;
        }
        
        /* Medium screens (tablets) */
        @media (max-width: 768px) and (min-width: 481px) {
          .amicus-widget-chat {
            height: min(550px, 75vh);
          }
        }
        
        @media (max-width: 480px) {
          .amicus-widget-chat {
            width: calc(100vw - 40px);
            height: min(500px, calc(100vh - 120px));
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
      
      button.addEventListener('click', (e) => {
        const playCta = e.target.closest('.amicus-preview-play-cta');
        if (playCta) {
          e.stopPropagation();
          this.expandVideo();
          return;
        }
        this.toggleChat();
      });
      // Keyboard accessibility
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleChat();
        }
      });
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
    
    expandVideo() {
      if (!this.config?.videoUrl) return;
      
      this.trackVideoInteraction('video_expanded');
      
      // Create modal overlay
      const modal = document.createElement('div');
      modal.id = 'amicus-video-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;
      
      const videoContainer = document.createElement('div');
      videoContainer.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 90vw;
        max-height: 90vh;
        width: 800px;
        position: relative;
      `;
      
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 1;
      `;
      
      const iframe = document.createElement('iframe');
      iframe.src = this.getFullVideoUrl();
      iframe.style.cssText = `
        width: 100%;
        height: 450px;
        border: none;
        border-radius: 8px;
      `;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      
      const ctaContainer = document.createElement('div');
      ctaContainer.style.cssText = `
        margin-top: 15px;
        display: flex;
        gap: 10px;
        justify-content: center;
      `;
      
      const channelButton = document.createElement('a');
      channelButton.href = this.config.videoUrl;
      channelButton.target = '_blank';
      channelButton.innerHTML = '📺 Subscribe on YouTube';
      channelButton.style.cssText = `
        background: #ff0000;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      `;
      channelButton.addEventListener('click', () => {
        this.trackVideoInteraction('subscribe_clicked');
      });
      
      const watchButton = document.createElement('a');
      watchButton.href = this.config.videoUrl;
      watchButton.target = '_blank';
      watchButton.innerHTML = '🔗 Watch on YouTube';
      watchButton.style.cssText = `
        background: #606060;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      `;
      watchButton.addEventListener('click', () => {
        this.trackVideoInteraction('youtube_visited');
      });
      
      ctaContainer.appendChild(channelButton);
      ctaContainer.appendChild(watchButton);
      
      videoContainer.appendChild(closeButton);
      videoContainer.appendChild(iframe);
      videoContainer.appendChild(ctaContainer);
      modal.appendChild(videoContainer);
      
      // Close modal handlers
      const closeModal = () => {
        document.body.removeChild(modal);
      };
      
      closeButton.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      
      document.body.appendChild(modal);
    }
    
    getFullVideoUrl() {
      const videoUrl = this.config.videoUrl;
      if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
        let videoId;
        if (videoUrl.includes('youtube.com/watch')) {
          videoId = videoUrl.split('v=')[1]?.split('&')[0];
        } else {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&vq=hd1080&rel=0&modestbranding=1`;
        }
      }
      return this.getEmbedUrl(videoUrl);
    }
    
    trackVideoInteraction(action) {
      if (!this.videoInteractionTracked || action === 'video_expanded' || action === 'subscribe_clicked' || action === 'youtube_visited') {
        this.videoInteractionTracked = true;
        
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'video_interaction', {
            event_category: 'chatbot_widget',
            event_label: this.config?.name || 'Unknown',
            action: action
          });
        }
        
        // Track with Google Tag Manager if available
        if (typeof dataLayer !== 'undefined') {
          dataLayer.push({
            event: 'video_interaction',
            video_action: action,
            chatbot_name: this.config?.name || 'Unknown'
          });
        }
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
      
      // Get AI response from chatbot-response function
      this.getAIResponse(message);
    }
    
    async getAIResponse(message) {
      try {
        const response = await fetch(`${WIDGET_API_BASE}/chatbot-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            chatbotId: this.chatbotId,
            sessionId: this.sessionId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }
        
        const result = await response.json();
        this.addMessage(result.response || "I'm sorry, I couldn't process that request right now.", 'bot');
      } catch (error) {
        console.error('Error getting AI response:', error);
        this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", 'bot');
      }
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