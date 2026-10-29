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
 * Navigate to the buy/sell confirmation page (does NOT execute the transaction)
 * @param {number} id - Property ID (must be a positive integer)
 * @param {number} cantidad - Optional number of tokens
 * @param {string} action - 'buy' or 'sell'
 * @returns {boolean} false if the id is invalid and no navigation happened
 */
window.navigateToBuy = function(id, cantidad, action) {
  const propId = Number(id);
  if (!Number.isInteger(propId) || propId <= 0) {
    console.warn('[NAV] ID de propiedad inválido, no se navega:', id);
    return false;
  }

  const params = new URLSearchParams();
  params.set('action', action === 'sell' ? 'sell' : 'buy');
  params.set('property_id', propId);
  const cant = Number(cantidad);
  if (Number.isInteger(cant) && cant > 0) params.set('cantidad', cant);

  console.log('[NAV] Navegando a confirmación:', params.toString());
  window.location.href = 'confirm.html?' + params.toString();
  return true;
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
