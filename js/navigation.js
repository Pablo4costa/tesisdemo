/**
 * Navigation Helper Functions for Conversational Navigation
 * Used by chat.js when n8n sends navigation commands
 */

/**
 * Navigate to properties page with optional filters
 * @param {Object} filtros - Filter object (ciudad, precio_min, precio_max, etc)
 */
window.navigateToProperties = function(filtros) {
  console.log('[NAV] Navegando a propiedades con filtros:', filtros);
  let url = 'propiedades.html';
  
  if (filtros) {
    const params = new URLSearchParams();
    if (filtros.ciudad) params.set('ciudad', filtros.ciudad);
    if (filtros.precio_min) params.set('precio_min', filtros.precio_min);
    if (filtros.precio_max) params.set('precio_max', filtros.precio_max);
    if (filtros.sort) params.set('sort', filtros.sort);
    
    const queryString = params.toString();
    if (queryString) url += '?' + queryString;
  }
  
  window.location.href = url;
};

/**
 * Navigate to property detail page
 * @param {number} id - Property ID
 */
window.navigateToPropertyDetail = function(id) {
  console.log('[NAV] Navegando a detalle de propiedad:', id);
  window.location.href = `detalle.html?propiedad=${id}`;
};

/**
 * Navigate to user's holdings (portfolio) page
 */
window.navigateToHoldings = function() {
  console.log('[NAV] Navegando a mis-tokens (portafolio)');
  window.location.href = 'mis-tokens.html';
};

/**
 * Generic navigation to any route
 * @param {string} ruta - Route/path to navigate to
 */
window.navigateTo = function(ruta) {
  console.log('[NAV] Navegando a ruta:', ruta);
  window.location.href = ruta;
};
