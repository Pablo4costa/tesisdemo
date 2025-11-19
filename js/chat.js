/**
 * Chat Module with Session & Context for n8n
 * Manages user session, chat history, and webhook communication
 */
(function(window){
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

  function getSession(){
    try {
      const session = localStorage.getItem('housegur_session');
      return session ? JSON.parse(session) : null;
    } catch(e) {
      console.warn('[CHAT] Failed to parse session:', e);
      return null;
    }
  }

  function createChat(container, opts){
    const WEBHOOK = opts.webhookUrl || null;
    const session = getSession();
    
    if (!session) {
      container.innerHTML = '<div class="chat-card"><p class="muted">Por favor inicia sesión en login.html</p></div>';
      return null;
    }

    const { usuario_id, nombre } = session;
    const HISTORY_KEY = `housegur.chat.history.${usuario_id}`;
    let chatHistory = [];
    let pendingAction = null;

    function loadHistory(){
      try {
        chatHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      } catch(e) {
        chatHistory = [];
      }
    }

    function saveHistory(){
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory));
      } catch(e) {
        console.warn('[CHAT] Failed to save history:', e);
      }
    }

    container.innerHTML = `
      <div class="chat-card" role="region" aria-label="Asistente virtual">
        <div class="chat-header">
          <div style="width:40px;height:40px;border-radius:8px;background:#0b7cff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">AV</div>
          <div>
            <div class="chat-title">Asistente Housegur</div>
            <div class="muted" style="font-size:12px">Hola ${escapeHtml(nombre)}, ¿cómo te puedo ayudar?</div>
          </div>
        </div>
        <div class="chat-body" id="__hg_chat_body" style="min-height:120px;max-height:56vh;overflow:auto;padding-right:6px;"></div>
        <div id="__hg_chat_actions" style="display:none;margin-top:8px;padding:8px;background:#f9f9f9;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-size:13px;" id="__hg_chat_action_msg"></p>
          <div style="display:flex;gap:8px;">
            <button id="__hg_chat_confirm" class="btn small" style="background:#28a745;">Sí, confirmar</button>
            <button id="__hg_chat_cancel" class="btn small" style="background:#dc3545;">Cancelar</button>
          </div>
        </div>
        <div class="chat-input-row" style="margin-top:8px;">
          <input id="__hg_chat_input" class="chat-input" placeholder="Escribe tu pregunta..." aria-label="Mensaje al asistente">
          <button id="__hg_chat_send" class="chat-send">Enviar</button>
        </div>
        <div class="chat-muted" style="margin-top:8px;font-size:12px;">Ej: "¿Qué propiedades hay?" o "Quiero comprar tokens"</div>
      </div>
    `;

    const body = container.querySelector('#__hg_chat_body');
    const input = container.querySelector('#__hg_chat_input');
    const send = container.querySelector('#__hg_chat_send');
    const actionsDiv = container.querySelector('#__hg_chat_actions');
    const confirmBtn = container.querySelector('#__hg_chat_confirm');
    const cancelBtn = container.querySelector('#__hg_chat_cancel');

    function renderHistory(){
      body.innerHTML = '';
      chatHistory.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'msg ' + (msg.role === 'user' ? 'user' : 'assistant');
        div.style.marginBottom = '8px';
        div.innerHTML = `<div class="bubble">${escapeHtml(msg.content)}</div>`;
        body.appendChild(div);
      });
      body.scrollTop = body.scrollHeight;
    }

    function addMessage(role, content){
      chatHistory.push({ role, content });
      saveHistory();
      renderHistory();
    }

    function showActionPanel(accion){
      pendingAction = accion;
      const actionMsg = container.querySelector('#__hg_chat_action_msg');
      actionMsg.textContent = accion.descripcion || 'Confirma tu acción';
      actionsDiv.style.display = 'block';
    }

    function hideActionPanel(){
      pendingAction = null;
      actionsDiv.style.display = 'none';
    }

    let pending = false;
    async function sendMessage(text, isConfirmation = false){
      if (!text || pending) return;
      pending = true;

      addMessage('user', text);
      input.value = '';
      addMessage('assistant', '⏳ Procesando...');

      if (!WEBHOOK) {
        addMessage('assistant', '❌ Webhook no configurado.');
        pending = false;
        return;
      }

      try {
        const payload = {
          usuario_id,
          nombre_usuario: nombre,
          mensaje: text,
          historial: chatHistory.filter(m => m.content !== '⏳ Procesando...'),
          confirmacion: isConfirmation,
          accion_confirmada: isConfirmation ? pendingAction : null
        };

        console.log('[CHAT] Payload:', payload);

        const resp = await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (chatHistory.length && chatHistory[chatHistory.length - 1].content === '⏳ Procesando...') {
          chatHistory.pop();
        }

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const data = await resp.json();
        const respuesta = data.respuesta || data.output || data.reply || data.message || 'Sin respuesta';
        addMessage('assistant', respuesta);

        if (data.accion_detectada && !isConfirmation) {
          showActionPanel(data.accion_detectada);
        } else {
          hideActionPanel();
        }

      } catch (err) {
        console.error('[CHAT] Error:', err);
        if (chatHistory.length && chatHistory[chatHistory.length - 1].content === '⏳ Procesando...') {
          chatHistory.pop();
        }
        addMessage('assistant', `❌ Error: ${err.message}`);
        hideActionPanel();
      } finally {
        pending = false;
      }
    }

    send.addEventListener('click', () => {
      const v = input.value.trim();
      if (v) sendMessage(v, false);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send.click();
      }
    });

    confirmBtn.addEventListener('click', () => {
      if (pendingAction) {
        sendMessage(`Confirmar: ${pendingAction.descripcion || 'transacción'}`, true);
      }
    });

    cancelBtn.addEventListener('click', () => {
      addMessage('assistant', 'Acción cancelada.');
      hideActionPanel();
    });

    loadHistory();
    renderHistory();

    return { 
      addMessage, 
      sendMessage, 
      renderHistory,
      getSession: () => session,
      getChatHistory: () => chatHistory,
      logout: () => {
        localStorage.removeItem('housegur_session');
        localStorage.removeItem(HISTORY_KEY);
        window.location.href = '/login.html';
      }
    };
  }

  window.initGlobalChat = function(containerId, opts){
    const el = document.getElementById(containerId);
    if (!el) return null;
    const session = getSession();
    if (!session) {
      el.innerHTML = '<div class="chat-card"><p class="muted">Por favor inicia sesión.</p></div>';
      return null;
    }
    const chat = createChat(el, opts || {});
    window.__housegur_chat = chat;
    return chat;
  };

})(window);
