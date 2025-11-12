/* Helpers for static demo pages */
function getParam(name){
const s = new URLSearchParams(window.location.search);
return s.get(name);
}
function escapeHtml(str){
if(!str) return '';
return String(str).replace(/[&<>\"']/g, function(m){
return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];
});
}



// Utility to redirect keeping params object
function redirectWith(params, to){
const url = new URL(window.location.origin + '/' + to);
Object.keys(params || {}).forEach(k=>url.searchParams.set(k, params[k]));
window.location.href = url.toString();
}


// Export small API if used elsewhere
window.getParam = getParam;
window.escapeHtml = escapeHtml;
window.redirectWith = redirectWith;