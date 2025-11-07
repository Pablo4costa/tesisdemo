// ...new file...
(function(window){
  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

  function defaultReply(prompt, props){
    const lower = (prompt||'').toLowerCase();
    if (lower.includes('alicante')) return `La propiedad de Alicante: rentabilidad ${props[0].rentabilidad}% — ${props[0].tokens_disponibles.toLocaleString()} tokens disponibles.`;
    if (lower.includes('rentabilidad')) return `Ej: Alicante ${props[0].rentabilidad}%, Madrid ${props[1].rentabilidad}%, Barcelona ${props[2].rentabilidad}%.`;
    if (lower.includes('precio') || lower.includes('token')) return `Precios (ej.): Alicante ${props[0].precio} EUR, Madrid ${props[1].precio} EUR.`;
    return "Puedo darte datos sobre ciudades, precios por token, rentabilidad o tokens disponibles. Pregunta por una propiedad.";
  }

  function createChat(container, opts){
    const user = opts.user || 'guest';
    const propsMock = opts.props || [];
    const STORAGE_KEY = 'housegur.chat.' + user;

    container.innerHTML = `
      <div class="chat-card" role="region" aria-label="Asistente virtual">
        <div class="chat-header">
          <div style="width:40px;height:40px;border-radius:8px;background:#0b7cff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">AV</div>
          <div>
            <div class="chat-title">Asistente Housegur</div>
            <div class="muted" style="font-size:12px">Haz preguntas sobre las propiedades</div>
          </div>
        </div>
        <div class="chat-body" id="__hg_chat_body" style="min-height:120px;max-height:56vh;overflow:auto;padding-right:6px;"></div>
        <div class="chat-input-row" style="margin-top:8px;">
          <input id="__hg_chat_input" class="chat-input" placeholder="Escribe tu pregunta y presiona Enter..." aria-label="Mensaje al asistente">
          <button id="__hg_chat_send" class="chat-send">Enviar</button>
        </div>
        <div class="chat-muted" id="__hg_chat_hint" style="margin-top:8px;font-size:12px">Ej: "¿Qué rentabilidad tiene la propiedad en Alicante?"</div>
      </div>
    `;

    const body = container.querySelector('#__hg_chat_body');
    const input = container.querySelector('#__hg_chat_input');
    const send = container.querySelector('#__hg_chat_send');

    function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; } }
    function save(msgs){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch(e){} }

    function render(){
      const msgs = load();
      body.innerHTML = '';
      msgs.forEach(m=>{
        const div = document.createElement('div');
        div.className = 'msg ' + (m.role==='user' ? 'user' : 'assistant');
        div.style.marginBottom = '8px';
        div.innerHTML = `<div class="bubble">${escapeHtml(m.text)}</div>`;
        body.appendChild(div);
      });
      body.scrollTop = body.scrollHeight;
    }

    function append(role, text){
      const msgs = load();
      msgs.push({role, text, ts: Date.now()});
      save(msgs);
      render();
    }

    let pending = false;
    function sendMessage(text){
      if (!text || pending) return;
      pending = true;
      append('user', text);

      const msgs = load();
      msgs.push({role:'assistant', text:'...', loading:true});
      save(msgs);
      render();

      setTimeout(()=>{
        const cur = load();
        if (cur.length && cur[cur.length-1].loading) cur.pop();
        const reply = (opts.getReply || defaultReply)(text, propsMock);
        cur.push({role:'assistant', text: reply});
        save(cur);
        render();
        pending = false;
      }, 600 + Math.random()*700);
    }

    send.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; input.value=''; sendMessage(v); });
    input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send.click(); } });

    return { append, sendMessage, render };
  }

  window.initGlobalChat = function(containerId, opts){
    const el = document.getElementById(containerId);
    if (!el) return null;
    const chat = createChat(el, opts || {});
    chat.render();
    window.__housegur_chat = chat;
    return chat;
  };
})(window);
// ...new file...