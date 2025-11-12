/**
 * API Integration Module for Housegur
 * Uses centralized configuration from js/config.js
 * Modern async/await syntax with descriptive console logs
 */

// API_BASE is imported from CONFIG (defined in js/config.js)
// Make sure js/config.js is loaded before this script
const API_BASE = window.CONFIG?.API_BASE || 'https://housegur-api.up.railway.app';

/**
 * Login user with nombre and email
 * Saves usuario_id and nombre to localStorage
 * @param {string} nombre - User's name
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response with status, usuario_id, nombre
 */
async function loginUser(nombre, email) {
  console.log(`[API] Logging in user: ${nombre} (${email})`);
  
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[API] Login successful:', data);
    
    // Save to localStorage
    if (data.status === 'ok') {
      localStorage.setItem('usuario_id', data.usuario_id);
      localStorage.setItem('nombre', data.nombre);
      console.log(`[API] Stored usuario_id: ${data.usuario_id}, nombre: ${data.nombre}`);
    }
    
    return data;
  } catch (error) {
    console.error('[API] Login failed:', error);
    throw error;
  }
}

/**
 * Fetch list of all properties
 * @returns {Promise<Array>} Array of properties
 */
async function getProperties() {
  console.log('[API] Fetching properties...');
  
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[API] Properties fetched:', data);
    return data;
  } catch (error) {
    console.error('[API] Failed to fetch properties:', error);
    throw error;
  }
}

/**
 * Fetch user's holdings (owned properties and tokens)
 * @param {number} user_id - User's ID from localStorage
 * @returns {Promise<Array>} Array of user's holdings
 */
async function getHoldings(user_id) {
  console.log(`[API] Fetching holdings for user_id: ${user_id}`);
  
  try {
    const res = await fetch(`${API_BASE}/holdings?user_id=${user_id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[API] Holdings fetched:', data);
    return data;
  } catch (error) {
    console.error('[API] Failed to fetch holdings:', error);
    throw error;
  }
}

/**
 * Buy tokens for a property
 * @param {number} user_id - User's ID
 * @param {number} property_id - Property ID
 * @param {number} tokens - Number of tokens to buy
 * @returns {Promise<Object>} Transaction response
 */
async function buyTokens(user_id, property_id, tokens) {
  console.log(`[API] Buying ${tokens} tokens for property ${property_id} (user: ${user_id})`);
  
  try {
    const res = await fetch(`${API_BASE}/transactions/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, property_id, tokens })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[API] Buy transaction successful:', data);
    return data;
  } catch (error) {
    console.error('[API] Buy transaction failed:', error);
    throw error;
  }
}

/**
 * Sell tokens for a property
 * @param {number} user_id - User's ID
 * @param {number} property_id - Property ID
 * @param {number} tokens - Number of tokens to sell
 * @returns {Promise<Object>} Transaction response
 */
async function sellTokens(user_id, property_id, tokens) {
  console.log(`[API] Selling ${tokens} tokens for property ${property_id} (user: ${user_id})`);
  
  try {
    const res = await fetch(`${API_BASE}/transactions/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, property_id, tokens })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[API] Sell transaction successful:', data);
    return data;
  } catch (error) {
    console.error('[API] Sell transaction failed:', error);
    throw error;
  }
}

// Export functions for use in HTML pages
window.loginUser = loginUser;
window.getProperties = getProperties;
window.getHoldings = getHoldings;
window.buyTokens = buyTokens;
window.sellTokens = sellTokens;
