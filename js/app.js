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


// Simulated POST - in the demo we do not call external webhooks by default.
async function fakePost(url, body){
console.log('POST simulated to', url, body);
// Simulate network latency
await new Promise(r=>setTimeout(r,400));
// Simulate success
return {ok:true};
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
window.fakePost = fakePost;
window.redirectWith = redirectWith;