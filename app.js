/* =========================================================
   Claudia AI — Puter.js powered chatbot
   ========================================================= */

// ---------- Available models ----------
const MODELS = [
    { id: 'claude-sonnet-4-5',         name: 'Claude Sonnet 4.5',    desc: 'Anthropic · Smartest, most capable' },
    { id: 'claude-opus-4-1',           name: 'Claude Opus 4.1',      desc: 'Anthropic · Deep reasoning' },
    { id: 'claude-3-7-sonnet',         name: 'Claude 3.7 Sonnet',    desc: 'Anthropic · Balanced' },
    { id: 'claude-3-5-sonnet',         name: 'Claude 3.5 Sonnet',    desc: 'Anthropic · Fast & capable' },
    { id: 'gpt-5',                     name: 'GPT-5',                desc: 'OpenAI · Latest flagship' },
    { id: 'gpt-5-mini',                name: 'GPT-5 mini',           desc: 'OpenAI · Fast & smart' },
    { id: 'gpt-4o',                    name: 'GPT-4o',               desc: 'OpenAI · Multimodal' },
    { id: 'gpt-4o-mini',               name: 'GPT-4o mini',          desc: 'OpenAI · Quick responses' },
    { id: 'o1',                        name: 'o1',                   desc: 'OpenAI · Reasoning' },
    { id: 'o3-mini',                   name: 'o3-mini',              desc: 'OpenAI · Fast reasoning' },
    { id: 'google/gemini-2.5-pro',     name: 'Gemini 2.5 Pro',       desc: 'Google · Advanced' },
    { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash',   desc: 'Google · Very fast' },
    { id: 'deepseek-chat',             name: 'DeepSeek V3',          desc: 'DeepSeek · Open & capable' },
    { id: 'deepseek-reasoner',         name: 'DeepSeek R1',          desc: 'DeepSeek · Reasoning' },
    { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick',   desc: 'Meta · Open source' },
    { id: 'mistral-large-latest',      name: 'Mistral Large',        desc: 'Mistral · Multilingual' },
    { id: 'grok-beta',                 name: 'Grok',                 desc: 'xAI · Witty' }
];

const DEFAULT_MODEL = 'claude-sonnet-4-5';
const VISION_MODELS = new Set([
    'claude-sonnet-4-5','claude-opus-4-1','claude-3-7-sonnet','claude-3-5-sonnet',
    'gpt-5','gpt-5-mini','gpt-4o','gpt-4o-mini',
    'google/gemini-2.5-pro','google/gemini-2.0-flash-001'
]);

// ---------- State ----------
const state = {
    chats: [],              // [{id, title, model, messages:[{role, content, image?}], createdAt, updatedAt}]
    currentChatId: null,
    currentModel: DEFAULT_MODEL,
    theme: 'dark',
    imageMode: false,       // when true, next send generates an image
    attachedImage: null,    // {dataUrl, name} for vision
    streaming: false,
    streamAbort: null
};

const LS = {
    chats: 'claudia.chats',
    current: 'claudia.currentChatId',
    model: 'claudia.model',
    theme: 'claudia.theme'
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const els = {
    app: $('app'),
    sidebar: $('sidebar'),
    sidebarOverlay: $('sidebar-overlay'),
    sidebarOpen: $('sidebar-open'),
    sidebarClose: $('sidebar-close'),
    brandBtn: $('brand-btn'),
    newChatBtn: $('new-chat-btn'),
    mobileNewChat: $('mobile-new-chat'),
    chatList: $('chat-list'),
    themeToggle: $('theme-toggle'),
    themeLabel: $('theme-label'),
    clearAllBtn: $('clear-all-btn'),
    modelBtn: $('model-btn'),
    modelLabel: $('model-label'),
    modelMenu: $('model-menu'),
    welcome: $('welcome'),
    messages: $('messages'),
    input: $('input'),
    sendBtn: $('send-btn'),
    attachBtn: $('attach-btn'),
    imageBtn: $('image-btn'),
    fileInput: $('file-input'),
    attachments: $('attachments'),
    modeHint: $('mode-hint'),
    toast: $('toast')
};

// ---------- Utilities ----------
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
}
function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function toast(msg, ms = 2400) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove('show'), ms);
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Tiny markdown renderer (safe-ish, no external deps)
function renderMarkdown(text) {
    if (!text) return '';

    // Extract fenced code blocks first so their contents aren't processed
    const codeBlocks = [];
    let src = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
        const i = codeBlocks.length;
        codeBlocks.push({ lang: lang || 'text', code: code.replace(/\n$/, '') });
        return `\u0000CODE${i}\u0000`;
    });

    src = escapeHtml(src);

    // Inline code
    src = src.replace(/`([^`\n]+)`/g, (_, c) => `<code>${c}</code>`);

    // Headings
    src = src.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    src = src.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    src = src.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold / italic
    src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    src = src.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    src = src.replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1<em>$2</em>');

    // Links [text](url) — safe URLs only
    src = src.replace(/\[([^\]]+)\]\((https?:[^\s)]+)\)/g, (_, t, u) =>
        `<a href="${u}" target="_blank" rel="noreferrer noopener">${t}</a>`);

    // Blockquotes
    src = src.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>');

    // Lists (simple): group consecutive list items
    src = src.replace(/(?:^|\n)((?:[-*]\s+.+\n?)+)/g, (m, block) => {
        const items = block.trim().split(/\n/).map(line =>
            `<li>${line.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `\n<ul>${items}</ul>`;
    });
    src = src.replace(/(?:^|\n)((?:\d+\.\s+.+\n?)+)/g, (m, block) => {
        const items = block.trim().split(/\n/).map(line =>
            `<li>${line.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `\n<ol>${items}</ol>`;
    });

    // Paragraphs from remaining lines (double newline → paragraph)
    src = src.split(/\n{2,}/).map(block => {
        if (/^\s*<(h\d|ul|ol|blockquote|pre|table)/.test(block.trim())) return block;
        if (/\u0000CODE\d+\u0000/.test(block)) return block;
        const inner = block.trim().replace(/\n/g, '<br>');
        return inner ? `<p>${inner}</p>` : '';
    }).join('\n');

    // Restore code blocks
    src = src.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => {
        const { lang, code } = codeBlocks[Number(i)];
        return `<div class="code-block">
            <div class="code-block-header">
                <span>${escapeHtml(lang)}</span>
                <button class="copy-btn" data-copy="${encodeURIComponent(code)}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                </button>
            </div>
            <pre><code>${escapeHtml(code)}</code></pre>
        </div>`;
    });

    return src;
}

// ---------- Theme ----------
function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    els.themeLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1f1e1d' : '#faf9f5');
    save(LS.theme, theme);
}
function toggleTheme() { applyTheme(state.theme === 'dark' ? 'light' : 'dark'); }

// ---------- Chat management ----------
function currentChat() {
    return state.chats.find(c => c.id === state.currentChatId) || null;
}

function createChat() {
    const chat = {
        id: uid(),
        title: 'New chat',
        model: state.currentModel,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    state.chats.unshift(chat);
    state.currentChatId = chat.id;
    persistChats();
    renderChatList();
    renderMessages();
    els.input.focus();
}

function deleteChat(id) {
    const idx = state.chats.findIndex(c => c.id === id);
    if (idx === -1) return;
    state.chats.splice(idx, 1);
    if (state.currentChatId === id) {
        state.currentChatId = state.chats[0]?.id || null;
    }
    persistChats();
    renderChatList();
    renderMessages();
}

function selectChat(id) {
    if (state.currentChatId === id) return;
    state.currentChatId = id;
    save(LS.current, id);
    const chat = currentChat();
    if (chat?.model) {
        state.currentModel = chat.model;
        updateModelLabel();
    }
    renderChatList();
    renderMessages();
    closeSidebar();
}

function clearAllChats() {
    if (!confirm('Delete all chats? This cannot be undone.')) return;
    state.chats = [];
    state.currentChatId = null;
    persistChats();
    renderChatList();
    renderMessages();
    toast('All chats cleared');
}

function persistChats() {
    save(LS.chats, state.chats);
    if (state.currentChatId) save(LS.current, state.currentChatId);
}

function updateChatTitle(chat, firstMessage) {
    if (chat.title !== 'New chat') return;
    const t = firstMessage.trim().replace(/\s+/g, ' ').slice(0, 48);
    chat.title = t || 'New chat';
    persistChats();
    renderChatList();
}

// ---------- Rendering ----------
function renderChatList() {
    els.chatList.innerHTML = '';
    if (state.chats.length === 0) {
        els.chatList.innerHTML = `<div style="padding:10px 12px;font-size:13px;color:var(--text-dim)">No chats yet</div>`;
        return;
    }
    state.chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-item' + (chat.id === state.currentChatId ? ' active' : '');
        item.innerHTML = `
            <span class="chat-item-title">${escapeHtml(chat.title)}</span>
            <button class="chat-item-delete" title="Delete chat" aria-label="Delete chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
            </button>`;
        item.addEventListener('click', (e) => {
            if (e.target.closest('.chat-item-delete')) {
                e.stopPropagation();
                deleteChat(chat.id);
            } else {
                selectChat(chat.id);
            }
        });
        els.chatList.appendChild(item);
    });
}

function renderMessages() {
    const chat = currentChat();
    els.messages.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
        els.welcome.classList.remove('hidden');
        els.messages.classList.remove('show');
        return;
    }
    els.welcome.classList.add('hidden');
    els.messages.classList.add('show');

    chat.messages.forEach(m => appendMessage(m.role, m.content, m.image, { animate: false }));
    scrollToBottom(true);
}

function appendMessage(role, content, image = null, opts = {}) {
    const group = document.createElement('div');
    group.className = 'msg-group';
    const name = role === 'user' ? 'You' : 'Claudia';
    const avatarText = role === 'user' ? 'Y' : '✦';

    const imgHtml = image ? `<img class="msg-image" src="${image}" alt="attachment" />` : '';
    const contentHtml = role === 'assistant'
        ? renderMarkdown(content)
        : `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`;

    group.innerHTML = `
        <div class="msg-avatar ${role}">${avatarText}</div>
        <div class="msg-body">
            <div class="msg-name">${name}</div>
            <div class="msg-content">${imgHtml}${contentHtml}</div>
            <div class="msg-actions">
                <button class="msg-action-btn" data-action="copy">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                </button>
            </div>
        </div>`;

    if (opts.animate === false) group.style.animation = 'none';

    els.messages.appendChild(group);
    return group;
}

function scrollToBottom(instant = false) {
    requestAnimationFrame(() => {
        els.messages.scrollTop = els.messages.scrollHeight;
        if (instant) els.messages.style.scrollBehavior = 'smooth';
    });
}

// ---------- Model selector ----------
function renderModelMenu() {
    els.modelMenu.innerHTML = MODELS.map(m => `
        <button class="model-option ${m.id === state.currentModel ? 'selected' : ''}" data-model="${m.id}">
            <div class="model-option-name">
                ${escapeHtml(m.name)}
                ${m.id === state.currentModel
                    ? '<span class="model-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>'
                    : ''}
            </div>
            <div class="model-option-desc">${escapeHtml(m.desc)}</div>
        </button>
    `).join('');
}

function updateModelLabel() {
    const m = MODELS.find(x => x.id === state.currentModel) || MODELS[0];
    els.modelLabel.textContent = m.name;
    save(LS.model, state.currentModel);
    renderModelMenu();
}

function toggleModelMenu(force) {
    const open = force ?? !els.modelMenu.classList.contains('open');
    els.modelMenu.classList.toggle('open', open);
    els.modelBtn.classList.toggle('open', open);
}

// ---------- Sidebar ----------
function openSidebar() {
    els.sidebar.classList.add('open');
    els.sidebarOverlay.classList.add('show');
}
function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarOverlay.classList.remove('show');
}

// ---------- Composer ----------
function autoResize() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 200) + 'px';
    updateSendBtn();
}

function updateSendBtn() {
    const hasText = els.input.value.trim().length > 0;
    const hasImage = !!state.attachedImage;
    els.sendBtn.disabled = !state.streaming && !hasText && !hasImage;
}

function setImageMode(on) {
    state.imageMode = on;
    els.imageBtn.classList.toggle('active', on);
    els.input.placeholder = on
        ? 'Describe the image to generate...'
        : 'Reply to Claudia...';
    els.modeHint.textContent = on ? 'Image generation mode' : 'Chat mode';
    if (on) {
        clearAttachment();
    }
}

function clearAttachment() {
    state.attachedImage = null;
    els.attachments.innerHTML = '';
    els.attachments.classList.remove('show');
    updateSendBtn();
}

function showAttachment(dataUrl) {
    state.attachedImage = { dataUrl };
    els.attachments.innerHTML = `
        <div class="attachment">
            <img src="${dataUrl}" alt="attachment" />
            <button class="attachment-remove" id="attachment-remove" aria-label="Remove">✕</button>
        </div>`;
    els.attachments.classList.add('show');
    $('attachment-remove').addEventListener('click', clearAttachment);
    updateSendBtn();
}

async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        toast('Please select an image file');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        toast('Image must be under 10MB');
        return;
    }
    if (!VISION_MODELS.has(state.currentModel)) {
        toast('Switch to Claude, GPT, or Gemini for image understanding');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        setImageMode(false);
        showAttachment(reader.result);
    };
    reader.readAsDataURL(file);
}

// ---------- Sending ----------
async function handleSend() {
    if (state.streaming) {
        // Stop streaming
        state.streamAbort?.();
        return;
    }

    const text = els.input.value.trim();
    const image = state.attachedImage?.dataUrl || null;
    if (!text && !image && !state.imageMode) return;

    // Ensure chat exists
    if (!currentChat()) createChat();
    const chat = currentChat();
    chat.model = state.currentModel;

    if (state.imageMode) {
        if (!text) { toast('Describe the image to generate'); return; }
        await generateImage(text, chat);
        return;
    }

    // Add user message
    const userMsg = { role: 'user', content: text, image };
    chat.messages.push(userMsg);
    updateChatTitle(chat, text || 'Image');
    chat.updatedAt = Date.now();
    persistChats();

    // Render user message
    els.welcome.classList.add('hidden');
    els.messages.classList.add('show');
    appendMessage('user', text, image);

    // Clear input
    els.input.value = '';
    clearAttachment();
    autoResize();
    scrollToBottom();

    // Stream AI response
    await streamResponse(chat);
}

async function streamResponse(chat) {
    state.streaming = true;
    setSendStopMode(true);

    // Append assistant placeholder
    const group = appendMessage('assistant', '');
    const contentEl = group.querySelector('.msg-content');
    contentEl.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    scrollToBottom();

    let full = '';
    let aborted = false;
    state.streamAbort = () => { aborted = true; };

    try {
        // Build messages array for the API
        const messages = chat.messages.map(m => {
            if (m.image && m.role === 'user') {
                // Multimodal content
                return {
                    role: m.role,
                    content: [
                        { type: 'text', text: m.content || 'What is in this image?' },
                        { type: 'image_url', image_url: { url: m.image } }
                    ]
                };
            }
            return { role: m.role, content: m.content };
        });

        const response = await puter.ai.chat(messages, {
            model: state.currentModel,
            stream: true
        });

        let first = true;
        for await (const part of response) {
            if (aborted) break;
            const chunk = part?.text ?? '';
            if (!chunk) continue;
            if (first) { contentEl.innerHTML = ''; first = false; }
            full += chunk;
            contentEl.innerHTML = renderMarkdown(full) + '<span class="cursor"></span>';
            scrollToBottom();
        }

        // Final render (no cursor)
        contentEl.innerHTML = renderMarkdown(full || '(no response)');

        // Save
        chat.messages.push({ role: 'assistant', content: full });
        chat.updatedAt = Date.now();
        persistChats();
    } catch (err) {
        console.error('AI error:', err);
        const msg = err?.error?.message || err?.message || 'Something went wrong. Please try again.';
        contentEl.innerHTML = `<p style="color:var(--danger)">⚠️ ${escapeHtml(msg)}</p>`;
        // Remove the failed user message? Keep it so user can retry.
    } finally {
        state.streaming = false;
        state.streamAbort = null;
        setSendStopMode(false);
        updateSendBtn();
    }
}

async function generateImage(prompt, chat) {
    const userMsg = { role: 'user', content: `🎨 Generate image: ${prompt}` };
    chat.messages.push(userMsg);
    updateChatTitle(chat, prompt);
    chat.updatedAt = Date.now();

    els.welcome.classList.add('hidden');
    els.messages.classList.add('show');
    appendMessage('user', userMsg.content);
    els.input.value = '';
    autoResize();

    const group = appendMessage('assistant', '');
    const contentEl = group.querySelector('.msg-content');
    contentEl.innerHTML = '<div class="typing"><span></span><span></span><span></span></div><p style="margin-top:8px;color:var(--text-muted);font-size:13px">Generating image...</p>';
    scrollToBottom();

    state.streaming = true;
    setSendStopMode(true);

    try {
        const imgEl = await puter.ai.txt2img(prompt);
        const src = imgEl?.src || (imgEl instanceof HTMLImageElement ? imgEl.src : null);
        if (!src) throw new Error('No image returned');

        contentEl.innerHTML = `
            <p>Here's your generated image:</p>
            <img class="msg-image" src="${src}" alt="${escapeHtml(prompt)}" />`;
        chat.messages.push({
            role: 'assistant',
            content: `Here's your generated image:`,
            image: src
        });
        persistChats();
        scrollToBottom();
        // Turn off image mode after a successful generation
        setImageMode(false);
    } catch (err) {
        console.error('Image gen error:', err);
        const msg = err?.error?.message || err?.message || 'Image generation failed.';
        contentEl.innerHTML = `<p style="color:var(--danger)">⚠️ ${escapeHtml(msg)}</p>`;
    } finally {
        state.streaming = false;
        setSendStopMode(false);
        updateSendBtn();
    }
}

function setSendStopMode(stop) {
    if (stop) {
        els.sendBtn.classList.add('stop');
        els.sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
        els.sendBtn.disabled = false;
        els.sendBtn.title = 'Stop';
    } else {
        els.sendBtn.classList.remove('stop');
        els.sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
        els.sendBtn.title = 'Send';
    }
}

// ---------- Event listeners ----------
function bindEvents() {
    // Sidebar
    els.sidebarOpen.addEventListener('click', openSidebar);
    els.sidebarClose.addEventListener('click', closeSidebar);
    els.sidebarOverlay.addEventListener('click', closeSidebar);
    els.brandBtn.addEventListener('click', () => { createChat(); closeSidebar(); });
    els.newChatBtn.addEventListener('click', () => { createChat(); closeSidebar(); });
    els.mobileNewChat.addEventListener('click', createChat);

    // Theme
    els.themeToggle.addEventListener('click', toggleTheme);

    // Clear all
    els.clearAllBtn.addEventListener('click', clearAllChats);

    // Model menu
    els.modelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModelMenu();
    });
    els.modelMenu.addEventListener('click', (e) => {
        const opt = e.target.closest('.model-option');
        if (!opt) return;
        state.currentModel = opt.dataset.model;
        updateModelLabel();
        toggleModelMenu(false);
        if (state.attachedImage && !VISION_MODELS.has(state.currentModel)) {
            clearAttachment();
            toast('Attachment removed (model does not support images)');
        }
    });
    document.addEventListener('click', () => toggleModelMenu(false));

    // Suggestions
    document.querySelectorAll('.suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            els.input.value = btn.dataset.prompt;
            autoResize();
            els.input.focus();
            handleSend();
        });
    });

    // Input
    els.input.addEventListener('input', autoResize);
    els.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
            e.preventDefault();
            handleSend();
        }
    });

    // Send
    els.sendBtn.addEventListener('click', handleSend);

    // Attach
    els.attachBtn.addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    });

    // Image generation toggle
    els.imageBtn.addEventListener('click', () => setImageMode(!state.imageMode));

    // Paste images
    els.input.addEventListener('paste', (e) => {
        const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
        if (item) {
            e.preventDefault();
            handleFile(item.getAsFile());
        }
    });

    // Drag & drop
    ['dragover', 'dragenter'].forEach(ev =>
        document.addEventListener(ev, (e) => { e.preventDefault(); }));
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
    });

    // Delegated: copy buttons (in messages + code blocks)
    els.messages.addEventListener('click', async (e) => {
        const copyCode = e.target.closest('.copy-btn');
        if (copyCode) {
            const text = decodeURIComponent(copyCode.dataset.copy || '');
            try { await navigator.clipboard.writeText(text); toast('Code copied'); } catch {}
            return;
        }
        const action = e.target.closest('[data-action="copy"]');
        if (action) {
            const group = action.closest('.msg-group');
            const text = group.querySelector('.msg-content').innerText;
            try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch {}
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            createChat();
        }
        if (e.key === 'Escape') {
            toggleModelMenu(false);
            closeSidebar();
        }
    });
}

function isMobile() {
    return window.matchMedia('(max-width: 820px)').matches;
}

// ---------- Boot ----------
function boot() {
    // Restore theme
    applyTheme(load(LS.theme, 'dark'));

    // Restore model
    const savedModel = load(LS.model, DEFAULT_MODEL);
    state.currentModel = MODELS.find(m => m.id === savedModel) ? savedModel : DEFAULT_MODEL;

    // Restore chats
    state.chats = load(LS.chats, []);
    state.currentChatId = load(LS.current, null);
    if (!state.chats.find(c => c.id === state.currentChatId)) {
        state.currentChatId = state.chats[0]?.id || null;
    }

    updateModelLabel();
    renderChatList();
    renderMessages();
    autoResize();
    updateSendBtn();
    bindEvents();

    // Check Puter.js loaded
    if (typeof puter === 'undefined') {
        setTimeout(() => {
            if (typeof puter === 'undefined') {
                toast('Puter.js failed to load. Check your connection.');
            }
        }, 2500);
    }
}

document.addEventListener('DOMContentLoaded', boot);
