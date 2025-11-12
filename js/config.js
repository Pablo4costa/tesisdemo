/**
 * Centralized Configuration for Housegur Frontend
 * Update these values to switch between local development and production environments
 */

// API Base URL - points to the Housegur backend
const CONFIG = {
  // Production API endpoint
  API_BASE: 'https://housegur-api.up.railway.app',
  
  // n8n Chat Webhook - where user messages are sent for AI responses
  CHAT_WEBHOOK: 'https://palasino.app.n8n.cloud/webhook/housegur-chat',
  
  // Optional: uncomment for local testing with development backend
  // API_BASE: 'http://localhost:8000',
  // CHAT_WEBHOOK: 'http://localhost:3000/webhook/chat',
};

// Export configuration globally
window.CONFIG = CONFIG;
