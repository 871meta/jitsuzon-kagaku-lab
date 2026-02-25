/* ============================================
   真理探究の対話 — discussion.js
   Discussion app: AI-powered philosophical dialogue
   Data persisted in localStorage
   ============================================ */

(function () {
  'use strict';

  // --- Constants ---
  var STORAGE_KEY = 'disc_sessions';
  var SETTINGS_KEY = 'disc_settings';
  var API_URL = 'https://api.anthropic.com/v1/messages';

  var DEFAULT_SYSTEM_PROMPT =
    'あなたは哲学的対話の相手です。' +
    'ユーザーの問いに対して、多角的な視点から深い考察を提示してください。' +
    '一方的に答えを与えるのではなく、さらなる問いを投げかけ、' +
    '対話を通じて真理に近づくことを目指してください。' +
    '必要に応じて、哲学者の思想や概念を引用しながら、' +
    '論理的かつ明晰な日本語で応答してください。';

  // --- DOM Elements ---
  var sessionListEl = document.getElementById('sessionList');
  var welcomeScreen = document.getElementById('welcomeScreen');
  var chatArea = document.getElementById('chatArea');
  var chatTopic = document.getElementById('chatTopic');
  var chatMessages = document.getElementById('chatMessages');
  var messageInput = document.getElementById('messageInput');
  var sendBtn = document.getElementById('sendBtn');
  var typingIndicator = document.getElementById('typingIndicator');
  var errorMsg = document.getElementById('errorMsg');

  // Buttons
  var newSessionBtn = document.getElementById('newSessionBtn');
  var settingsBtn = document.getElementById('settingsBtn');
  var editTopicBtn = document.getElementById('editTopicBtn');
  var exportBtn = document.getElementById('exportBtn');
  var sidebarToggle = document.getElementById('sidebarToggle');

  // Modals
  var newSessionModal = document.getElementById('newSessionModal');
  var settingsModal = document.getElementById('settingsModal');
  var editTopicModal = document.getElementById('editTopicModal');

  // Modal inputs
  var topicInput = document.getElementById('topicInput');
  var systemPromptInput = document.getElementById('systemPromptInput');
  var apiKeyInput = document.getElementById('apiKeyInput');
  var modelSelect = document.getElementById('modelSelect');
  var editTopicInput = document.getElementById('editTopicInput');

  // --- State ---
  var sessions = [];
  var currentSessionId = null;
  var isStreaming = false;

  // --- Persistence ---
  function loadSessions() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      sessions = data ? JSON.parse(data) : [];
    } catch (e) {
      sessions = [];
    }
  }

  function saveSessions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function loadSettings() {
    try {
      var data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // --- Session Management ---
  function createSession(topic, systemPrompt) {
    var session = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      topic: topic || '無題の対話',
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessions.unshift(session);
    saveSessions();
    return session;
  }

  function getSession(id) {
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].id === id) return sessions[i];
    }
    return null;
  }

  function deleteSession(id) {
    sessions = sessions.filter(function (s) { return s.id !== id; });
    saveSessions();
    if (currentSessionId === id) {
      currentSessionId = null;
      showWelcome();
    }
    renderSessionList();
  }

  // --- UI Rendering ---
  function renderSessionList() {
    sessionListEl.innerHTML = '';
    if (sessions.length === 0) {
      sessionListEl.innerHTML =
        '<div style="padding:2rem 1.5rem;text-align:center;">' +
        '<p style="font-size:0.78rem;color:rgba(168,164,160,0.4);margin:0;">対話はまだありません</p>' +
        '</div>';
      return;
    }
    sessions.forEach(function (session) {
      var item = document.createElement('div');
      item.className = 'disc-session-item' + (session.id === currentSessionId ? ' is-active' : '');
      item.setAttribute('data-id', session.id);

      var date = new Date(session.updatedAt);
      var dateStr = date.getFullYear() + '/' +
        String(date.getMonth() + 1).padStart(2, '0') + '/' +
        String(date.getDate()).padStart(2, '0');
      var msgCount = session.messages.length;

      item.innerHTML =
        '<div class="disc-session-item__topic">' + escapeHtml(session.topic) + '</div>' +
        '<div class="disc-session-item__meta">' + dateStr + ' · ' + msgCount + '件のメッセージ</div>' +
        '<button class="disc-session-item__delete" title="削除">✕</button>';

      item.addEventListener('click', function (e) {
        if (e.target.classList.contains('disc-session-item__delete')) {
          e.stopPropagation();
          if (confirm('この対話を削除しますか？')) {
            deleteSession(session.id);
          }
          return;
        }
        openSession(session.id);
      });

      sessionListEl.appendChild(item);
    });
  }

  function showWelcome() {
    welcomeScreen.style.display = 'flex';
    chatArea.classList.remove('is-active');
  }

  function showChat() {
    welcomeScreen.style.display = 'none';
    chatArea.classList.add('is-active');
  }

  function openSession(id) {
    var session = getSession(id);
    if (!session) return;

    currentSessionId = id;
    chatTopic.textContent = session.topic;
    renderMessages(session);
    showChat();
    renderSessionList();
    hideError();

    // Close mobile sidebar
    document.getElementById('discSidebar').classList.remove('is-open');

    // Scroll to bottom
    setTimeout(function () {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }

  function renderMessages(session) {
    chatMessages.innerHTML = '';

    if (session.messages.length === 0) {
      var systemMsg = document.createElement('div');
      systemMsg.className = 'disc-msg disc-msg--system';
      systemMsg.innerHTML =
        '<div class="disc-msg__body">対話が始まります。問いを投げかけてください。</div>';
      chatMessages.appendChild(systemMsg);
      return;
    }

    session.messages.forEach(function (msg) {
      appendMessageToDOM(msg.role, msg.content);
    });
  }

  function appendMessageToDOM(role, content) {
    var div = document.createElement('div');
    var isUser = role === 'user';
    div.className = 'disc-msg disc-msg--' + (isUser ? 'user' : 'ai');
    div.innerHTML =
      '<span class="disc-msg__label">' + (isUser ? 'You' : 'AI') + '</span>' +
      '<div class="disc-msg__body">' + (isUser ? escapeHtml(content).replace(/\n/g, '<br>') : renderMarkdown(content)) + '</div>';
    chatMessages.appendChild(div);
    return div;
  }

  // --- Markdown Rendering (lightweight) ---
  function renderMarkdown(text) {
    if (!text) return '';
    var html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre><code>' + code + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered list
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered list
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs (wrap remaining text)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped in block element
    if (!/^<(h[1-4]|ul|ol|pre|blockquote|hr)/.test(html)) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }

  // --- API Communication ---
  function sendMessage(userText) {
    if (isStreaming) return;
    if (!userText.trim()) return;

    var settings = loadSettings();
    if (!settings.apiKey) {
      showError('APIキーが設定されていません。左下の「API設定」から設定してください。');
      return;
    }

    var session = getSession(currentSessionId);
    if (!session) return;

    // Add user message
    session.messages.push({ role: 'user', content: userText });
    session.updatedAt = new Date().toISOString();
    saveSessions();
    renderSessionList();

    appendMessageToDOM('user', userText);
    messageInput.value = '';
    autoResizeTextarea();
    scrollToBottom();

    // Show typing
    isStreaming = true;
    sendBtn.disabled = true;
    typingIndicator.classList.add('is-active');
    hideError();

    // Build messages for API
    var apiMessages = session.messages.map(function (m) {
      return { role: m.role, content: m.content };
    });

    var model = settings.model || 'claude-sonnet-4-20250514';

    // Call API
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        system: session.systemPrompt,
        messages: apiMessages
      })
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (err) {
            throw new Error(err.error ? err.error.message : 'API error: ' + response.status);
          });
        }
        return response.json();
      })
      .then(function (data) {
        var aiText = '';
        if (data.content && data.content.length > 0) {
          aiText = data.content[0].text;
        }

        // Save AI response
        session.messages.push({ role: 'assistant', content: aiText });
        session.updatedAt = new Date().toISOString();
        saveSessions();
        renderSessionList();

        // Show AI message
        typingIndicator.classList.remove('is-active');
        appendMessageToDOM('assistant', aiText);
        scrollToBottom();
      })
      .catch(function (err) {
        typingIndicator.classList.remove('is-active');
        showError('エラー: ' + err.message);
        // Remove the user message if API failed so they can retry
        session.messages.pop();
        saveSessions();
      })
      .finally(function () {
        isStreaming = false;
        sendBtn.disabled = false;
        messageInput.focus();
      });
  }

  // --- Export ---
  function exportSession() {
    var session = getSession(currentSessionId);
    if (!session) return;

    var lines = [];
    lines.push('# ' + session.topic);
    lines.push('');
    lines.push('日時: ' + new Date(session.createdAt).toLocaleString('ja-JP'));
    lines.push('');
    lines.push('---');
    lines.push('');

    session.messages.forEach(function (msg) {
      var label = msg.role === 'user' ? '【あなた】' : '【AI】';
      lines.push(label);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    var blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = session.topic.replace(/[^\w\u3000-\u9FFF]/g, '_') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Utilities ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function scrollToBottom() {
    setTimeout(function () {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('is-active');
  }

  function hideError() {
    errorMsg.classList.remove('is-active');
  }

  function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
  }

  // --- Modal Helpers ---
  function openModal(modal) {
    modal.classList.add('is-active');
  }

  function closeModal(modal) {
    modal.classList.remove('is-active');
  }

  // --- Event Listeners ---

  // New session
  newSessionBtn.addEventListener('click', function () {
    topicInput.value = '';
    systemPromptInput.value = '';
    openModal(newSessionModal);
    topicInput.focus();
  });

  document.getElementById('confirmNewSession').addEventListener('click', function () {
    var topic = topicInput.value.trim();
    if (!topic) {
      topicInput.focus();
      return;
    }
    var systemPrompt = systemPromptInput.value.trim() || DEFAULT_SYSTEM_PROMPT;
    var session = createSession(topic, systemPrompt);
    closeModal(newSessionModal);
    renderSessionList();
    openSession(session.id);
    messageInput.focus();
  });

  document.getElementById('cancelNewSession').addEventListener('click', function () {
    closeModal(newSessionModal);
  });

  // Settings
  settingsBtn.addEventListener('click', function () {
    var settings = loadSettings();
    apiKeyInput.value = settings.apiKey || '';
    modelSelect.value = settings.model || 'claude-sonnet-4-20250514';
    openModal(settingsModal);
  });

  document.getElementById('saveSettings').addEventListener('click', function () {
    var settings = {
      apiKey: apiKeyInput.value.trim(),
      model: modelSelect.value
    };
    saveSettings(settings);
    closeModal(settingsModal);
  });

  document.getElementById('cancelSettings').addEventListener('click', function () {
    closeModal(settingsModal);
  });

  // Edit topic
  editTopicBtn.addEventListener('click', function () {
    var session = getSession(currentSessionId);
    if (!session) return;
    editTopicInput.value = session.topic;
    openModal(editTopicModal);
    editTopicInput.focus();
  });

  document.getElementById('confirmEditTopic').addEventListener('click', function () {
    var session = getSession(currentSessionId);
    if (!session) return;
    var newTopic = editTopicInput.value.trim();
    if (!newTopic) return;
    session.topic = newTopic;
    session.updatedAt = new Date().toISOString();
    saveSessions();
    chatTopic.textContent = newTopic;
    renderSessionList();
    closeModal(editTopicModal);
  });

  document.getElementById('cancelEditTopic').addEventListener('click', function () {
    closeModal(editTopicModal);
  });

  // Export
  exportBtn.addEventListener('click', exportSession);

  // Send message
  sendBtn.addEventListener('click', function () {
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  messageInput.addEventListener('input', autoResizeTextarea);

  // Sidebar toggle (mobile)
  sidebarToggle.addEventListener('click', function () {
    document.getElementById('discSidebar').classList.toggle('is-open');
  });

  // Close modals on overlay click
  [newSessionModal, settingsModal, editTopicModal].forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal(newSessionModal);
      closeModal(settingsModal);
      closeModal(editTopicModal);
    }
  });

  // Enter key in modal inputs
  topicInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('confirmNewSession').click();
    }
  });

  editTopicInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('confirmEditTopic').click();
    }
  });

  apiKeyInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('saveSettings').click();
    }
  });

  // --- Initialize ---
  loadSessions();
  renderSessionList();

  // Auto-open settings if no API key
  var settings = loadSettings();
  if (!settings.apiKey) {
    setTimeout(function () {
      openModal(settingsModal);
    }, 500);
  }

})();
