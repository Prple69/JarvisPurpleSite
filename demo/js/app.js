/**
 * app.js — Alpine.js components + vanilla logic
 */

// ── Helpers ────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtTime(s) {
  if (!s) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Media position ticker ───────────────────────────────────────────────────
const _mp = { status: 'stopped', syncPos: 0, syncTs: 0, dur: 0 };

setInterval(() => {
  const bar   = document.querySelector('.media-bar');
  const label = document.querySelector('.media-pos-display');
  if (!bar || !_mp.dur) return;
  const elapsed = _mp.status === 'playing' ? (performance.now() - _mp.syncTs) / 1000 : 0;
  const pos = Math.min(_mp.syncPos + elapsed, _mp.dur);
  bar.style.width = Math.min(pos / _mp.dur * 100, 100).toFixed(2) + '%';
  if (label) label.textContent = fmtTime(pos);
}, 250);

function fmtNow() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

// ── Tool badge with feedback ──────────────────────────────────────
const _TOOL_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
// Tool name → Russian display name
const _TOOL_NAMES_RU = {
  set_volume: 'Громкость',
  set_volume_relative: 'Громкость ±',
  media_play: 'Воспроизвести',
  media_pause: 'Пауза',
  media_next: 'Следующий трек',
  media_prev: 'Предыдущий трек',
  mute_toggle: 'Без звука',
  shutdown: 'Выключение',
  restart: 'Перезагрузка',
  sleep_pc: 'Спящий режим',
  abort_shutdown: 'Отмена выключения',
  shutdown_timer: 'Таймер выключения',
  set_brightness: 'Яркость',
  brightness_up: 'Яркость +',
  brightness_down: 'Яркость −',
  monitor_off: 'Выкл. монитор',
  take_screenshot: 'Скриншот',
  kill_process: 'Завершить процесс',
  ocr_screen: 'Чтение экрана',
  open_app: 'Открыть приложение',
  open_url: 'Открыть сайт',
  run_program: 'Запуск программы',
  run_script: 'Запуск сценария',
  web_search: 'Поиск в интернете',
  find_and_open: 'Найти и открыть файл',
  find_files: 'Поиск файлов',
  minimize_all: 'Свернуть окна',
  switch_to_window: 'Переключить окно',
  close_window: 'Закрыть окно',
  get_battery_info: 'Заряд батареи',
  get_gpu_info: 'Видеокарта',
  get_weather: 'Погода',
  clean_temp: 'Очистка мусора',
  flush_ram: 'Освобождение RAM',
  run_command: 'Команда терминала',
  get_clipboard: 'Буфер обмена',
  set_clipboard: 'Копировать в буфер',
  type_text: 'Ввод текста',
  press_key: 'Нажатие клавиш',
  speak_text: 'Озвучка',
  set_timer: 'Таймер',
  set_reminder: 'Напоминание',
  cancel_timer: 'Отмена таймеров',
};

function _toolRu(name) { return _TOOL_NAMES_RU[name] || name; }

const _FEEDBACK_CATEGORIES = [
  { label: 'Открыть приложение', tool: 'open_app', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>' },
  { label: 'Открыть сайт', tool: 'open_url', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
  { label: 'Поиск в интернете', tool: 'web_search', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
  { label: 'Громкость', tool: 'set_volume', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' },
  { label: 'Медиа (пауза/плей/трек)', tool: 'media_play', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' },
  { label: 'Переключить окно', tool: 'switch_to_window', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { label: 'Закрыть окно', tool: 'close_window', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' },
  { label: 'Свернуть окна', tool: 'minimize_all', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' },
  { label: 'Найти файл', tool: 'find_and_open', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { label: 'Скриншот', tool: 'take_screenshot', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' },
  { label: 'Не нужно было ничего', tool: '__none__', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' },
];

function _buildToolBadge(toolName, userMessage) {
  const id = 'fb_' + Math.random().toString(36).slice(2, 8);
  const ruName = _toolRu(toolName);
  // Store data in a global map — avoids quoting issues in inline handlers
  if (!window._fbData) window._fbData = {};
  window._fbData[id] = { tool: toolName, msg: userMessage };
  return `<div class="msg-tool" id="${id}">
    ${_TOOL_ICON} ${escHtml(ruName)}
    <button class="msg-tool-feedback" data-fb-id="${id}" title="Неправильное действие?">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
    </button>
  </div>`;
}

// Event delegation for feedback buttons — works regardless of quoting
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.msg-tool-feedback');
  if (!btn) return;
  e.stopPropagation();
  const id = btn.dataset.fbId;
  const data = window._fbData && window._fbData[id];
  if (data) _openFeedback(id, data.tool, data.msg);
});

function _openFeedback(elId, wrongTool, userMsg) {
  // Close any existing overlay
  document.querySelectorAll('.feedback-overlay').forEach(d => d.remove());

  const chatArea = document.getElementById('chat-messages');
  if (!chatArea) return;

  const overlay = document.createElement('div');
  overlay.className = 'feedback-overlay';

  const items = _FEEDBACK_CATEGORIES
    .filter(c => c.tool !== wrongTool)
    .map(c => `<button class="feedback-dropdown-item" data-tool="${c.tool}">${c.icon} ${c.label}</button>`)
    .join('');

  overlay.innerHTML = `
    <div class="feedback-panel">
      <div class="feedback-panel-header">
        <div class="feedback-panel-title">Какое действие правильное?</div>
        <button class="feedback-panel-close" onclick="this.closest('.feedback-overlay').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="feedback-panel-context">Вызвано: <span>${escHtml(_toolRu(wrongTool))}</span></div>
      <div class="feedback-divider"></div>
      ${items}
    </div>
  `;

  chatArea.appendChild(overlay);

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Handle selection
  overlay.querySelectorAll('.feedback-dropdown-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const correctTool = btn.dataset.tool;
      const panel = overlay.querySelector('.feedback-panel');
      panel.innerHTML = `<div class="feedback-sent">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Спасибо за помощь!
        <div class="feedback-sent-sub">Это улучшит Purify для всех</div>
      </div>`;
      setTimeout(() => overlay.remove(), 1500);
      try {
        await API.submitAiFeedback(userMsg, wrongTool, correctTool, {});
      } catch(e) { console.warn('[feedback]', e); }
    });
  });
}

// ── Toast ──────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  // Limit to 3 visible toasts
  while (c.children.length >= 3) c.removeChild(c.firstChild);
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  // Add dismiss button
  const txt = document.createElement('span');
  txt.innerHTML = msg;
  t.appendChild(txt);
  const btn = document.createElement('button');
  btn.className = 'toast-dismiss';
  btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  btn.onclick = () => { t.classList.add('hiding'); setTimeout(() => t.remove(), 220); };
  t.appendChild(btn);
  c.appendChild(t);
  const delay = type === 'error' ? 5000 : 4000;
  setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => t.remove(), 220);
  }, delay);
}

// ── Modal helpers ──────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (id === 'modal-hotkey') setTimeout(() => document.getElementById('hotkey-capture')?.focus(), 50);
  }
}
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
  // Restore scroll if no other modals open
  if (!document.querySelector('.modal-overlay:not(.hidden)')) {
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    if (!document.querySelector('.modal-overlay:not(.hidden)')) {
      document.body.style.overflow = '';
    }
  }
});

// ── Confirm dialog ─────────────────────────────────────────────────
function openConfirm(text, onOk) {
  const msgEl = document.getElementById('confirm-message');
  if (msgEl) msgEl.textContent = text;
  openModal('modal-confirm');
  const ok = document.getElementById('confirm-ok-btn');
  const cancel = document.getElementById('confirm-cancel-btn');
  const cleanup = () => { ok.removeEventListener('click', handleOk); cancel.removeEventListener('click', handleCancel); };
  const handleOk = () => { closeModal('modal-confirm'); cleanup(); onOk(); };
  const handleCancel = () => { closeModal('modal-confirm'); cleanup(); };
  ok.addEventListener('click', handleOk);
  cancel.addEventListener('click', handleCancel);
}

// ── Onboarding Alpine component ────────────────────────────────────
function onboardingApp() {
  return {
    step: 1,
    token: '',
    showToken: false,
    chatId: '',
    analytics: 'yes',
    autostart: true,
    verifying: false,
    verifyOk: false,
    verifyMsg: '',

    init() {
      if (!localStorage.getItem('purify_onboarding_done')) {
        document.getElementById('onboarding-overlay').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
      }
    },

    async verifyToken() {
      if (!this.token) return;
      this.verifying = true;
      this.verifyMsg = '';
      try {
        const res = await API.verifyToken(this.token);
        if (res.ok) {
          this.verifyOk = true;
          this.verifyMsg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Бот найден: ${res.bot_name}`;
        } else {
          this.verifyOk = false;
          this.verifyMsg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ' + (res.error || 'Неверный токен');
        }
      } catch {
        this.verifyOk = false;
        this.verifyMsg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Нет соединения';
      } finally {
        this.verifying = false;
      }
    },

    async testMessage() {
      if (!this.chatId) { showToast('Введите Chat ID', 'error'); return; }
      if (!this.token)  { showToast('Сначала введите токен', 'error'); return; }
      try {
        // Start bot first (needed to send the test message)
        const start = await API.startBot(this.token, [this.chatId]);
        if (!start.ok && !start.error?.includes('уже запущен')) {
          showToast('Ошибка запуска бота: ' + (start.error || ''), 'error');
          return;
        }
        const r = await API.sendTestMessage(this.chatId);
        if (r.ok) showToast('Тестовое сообщение отправлено', 'success');
        else showToast('Ошибка: ' + (r.error || 'неизвестно'), 'error');
      } catch {
        showToast('Ошибка отправки', 'error');
      }
    },

    skip() {
      // Skip Telegram steps — go straight to analytics
      this.step = 3;
    },

    async next() {
      if (this.step === 1 && this.token.trim() && !this.verifyOk) {
        showToast('Проверьте токен перед продолжением', 'error');
        return;
      }
      if (this.step < 4) { this.step++; return; }
      await this.finish();
    },

    async finish() {
      // Save token + chatId and start the bot
      if (this.token) {
        const r = await API.startBot(this.token, this.chatId ? [this.chatId] : []);
        if (!r.ok && !r.error?.includes('уже запущен')) {
          showToast('Бот не запущен: ' + (r.error || ''), 'error');
        }
      }
      // Persist analytics + autostart preferences
      await API.saveSettings({
        analytics_enabled: this.analytics === 'yes',
        autostart: this.autostart,
      }).catch(() => {});

      localStorage.setItem('purify_onboarding_done', '1');
      document.getElementById('onboarding-overlay').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      window.puriNavigate && window.puriNavigate('dashboard');
    }
  };
}

// ── App Root ───────────────────────────────────────────────────────
function appRoot() {
  return {
    page: 'dashboard',
    pageTitle: 'Дашборд',
    sidebarCollapsed: false,
    botOnline: false,
    _apiFailCount: 0,
    apiDisconnected: false,
    _pollPaused: false,
    cmdOpen: false,
    cmdQuery: '',
    cmdSel: 0,
    license: { plan: 'trial', days_left: 5 },

    pageTitles: {
      dashboard: 'Дашборд',
      chat: 'AI Чат',
      bot: 'Telegram бот',
      programs: 'Программы',
      scripts: 'Сценарии',
      voice: 'Голосовой помощник',
      tools: 'Обслуживание',
      logs: 'Логи',
      settings: 'Настройки'
    },

    cmdGroups: [
      {
        title: 'Страницы',
        items: [
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>', label: 'Дашборд', sub: 'Обзор системы', action: 'nav:dashboard' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', label: 'Чат', sub: 'AI ассистент', action: 'nav:chat' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>', label: 'Telegram', sub: 'Управление ботом', action: 'nav:bot' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></svg>', label: 'Программы', sub: 'Быстрый запуск', action: 'nav:programs' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', label: 'Сценарии', sub: 'Цепочки команд', action: 'nav:scripts' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>', label: 'Голос', sub: 'Wake word и TTS', action: 'nav:voice' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', label: 'Обслуживание', sub: 'Очистка, мониторинг, планировщик', action: 'nav:tools' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', label: 'Логи', sub: 'Системный журнал', action: 'nav:logs' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', label: 'Настройки', sub: 'Конфигурация', action: 'nav:settings' },
        ]
      },
      {
        title: 'Быстрые действия',
        items: [
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', label: 'Скриншот', sub: 'Сделать скриншот экрана', action: 'screenshot' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>', label: 'Перезапустить бота', sub: 'Остановить и запустить снова', action: 'restart-bot' },
          { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>', label: 'Очистить логи', sub: 'Удалить все записи', action: 'clear-logs' },
        ]
      }
    ],

    get cmdFiltered() {
      if (!this.cmdQuery) return this.cmdGroups.flatMap(g => g.items);
      const q = this.cmdQuery.toLowerCase();
      return this.cmdGroups.flatMap(g => g.items).filter(i => i.label.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q));
    },

    getGlobalIdx(gi, ii) {
      let idx = 0;
      for (let g = 0; g < gi; g++) idx += this.cmdGroups[g].items.filter(i => !this.cmdQuery || i.label.toLowerCase().includes(this.cmdQuery.toLowerCase())).length;
      return idx + ii;
    },

    execCmd(item) {
      if (!item) return;
      this.cmdOpen = false;
      this.cmdQuery = '';
      if (item.action?.startsWith('nav:')) {
        this.navigate(item.action.slice(4));
      } else if (item.action === 'screenshot') {
        API.takeScreenshot().then(r => showToast('Скриншот сохранён: ' + r.path, 'success')).catch(() => showToast('Ошибка скриншота', 'error'));
      } else if (item.action === 'restart-bot') {
        showToast('Бот перезапускается...', 'info');
      } else if (item.action === 'clear-logs') {
        document.getElementById('log-viewer') && (document.getElementById('log-viewer').innerHTML = '');
        showToast('Логи очищены');
      }
    },

    init() {
      // Expose navigate globally for onboarding
      window.puriNavigate = (p) => this.navigate(p);

      // Focus cmd input when palette opens
      this.$watch('cmdOpen', val => {
        if (val) setTimeout(() => document.getElementById('cmd-input')?.focus(), 50);
        this.cmdSel = 0;
      });

      this.loadLicense();

      // Sync bot status immediately, then poll every 5s
      const syncBotStatus = async () => {
        try {
          const s = await API.getStats();
          this.botOnline = !!s.bot_online;
          this._apiFailCount = 0;
          this.apiDisconnected = false;
        } catch {
          this._apiFailCount++;
          if (this._apiFailCount >= 3) this.apiDisconnected = true;
        }
      };
      syncBotStatus();
      setInterval(syncBotStatus, 5000);

      // Pause polling when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this._pollPaused = true;
        } else {
          this._pollPaused = false;
          syncBotStatus();
        }
      });
    },

    navigate(p) {
      if (this.page === 'logs' && p !== 'logs' && logPoller) {
        clearInterval(logPoller);
        logPoller = null;
      }
      this.page = p;
      this.pageTitle = this.pageTitles[p] || p;
      if (p === 'bot') this.loadBotPageSettings();
    },

    async loadBotPageSettings() {
      try {
        const s = await API.getSettings();
        const tokenInput = document.getElementById('bot-token-input');
        const chatInput  = document.getElementById('bot-chatid-input');
        if (tokenInput && s.telegram_token) tokenInput.value = s.telegram_token;
        if (chatInput  && s.chat_ids?.length) chatInput.value = s.chat_ids[0];
        setVal('settings-del-delay', s.del_delay ?? 0);
      } catch {}
    },

    async loadLicense() {
      try { this.license = await API.checkLicense(); } catch {}
    },

    async toggleBot() {
      if (this.botOnline) {
        await API.stopBot().catch(() => {});
        this.botOnline = false;
        showToast('Бот остановлен', 'info');
      } else {
        const token  = document.getElementById('bot-token-input')?.value.trim() || '';
        const chatId = document.getElementById('bot-chatid-input')?.value.trim() || '';
        const r = await API.startBot(token, chatId ? [chatId] : []).catch(e => ({ ok: false, error: String(e) }));
        if (r.ok) {
          this.botOnline = true;
          showToast('Бот запущен: ' + (r.bot_name || ''), 'success');
        } else {
          showToast('Ошибка: ' + (r.error || 'Проверьте токен'), 'error');
        }
      }
    }
  };
}

// ── Dashboard Widget System ─────────────────────────────────────────

const WIDGET_CATALOG = {
  clock:    { label:'Часы',         icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  cpu:      { label:'Процессор',    icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  ram:      { label:'Память',       icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="6" x2="6" y2="18"/><line x1="10" y1="6" x2="10" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/><line x1="18" y1="6" x2="18" y2="18"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  disk:     { label:'Диск C:',      icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  volume:   { label:'Громкость',    icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  media:    { label:'Медиаплеер',   icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',  minW:2, minH:1, maxW:4, maxH:3, defW:2, defH:2 },
  weather:  { label:'Погода',       icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:2 },
  currency: { label:'Курсы валют',  icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',  minW:2, minH:1, maxW:4, maxH:3, defW:2, defH:1 },
  bot:      { label:'Telegram',     icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',  minW:1, minH:1, maxW:2, maxH:3, defW:1, defH:1 },
  voice:    { label:'Голос',        icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>',  minW:1, minH:1, maxW:2, maxH:2, defW:1, defH:1 },
  gpu:      { label:'Видеокарта',  icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3l-4 4-4-4"/></svg>',  minW:1, minH:1, maxW:2, maxH:2, defW:1, defH:1 },
  battery:  { label:'Батарея',     icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>',  minW:1, minH:1, maxW:2, maxH:2, defW:1, defH:1 },
  network:  { label:'Сеть',        icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',  minW:1, minH:1, maxW:2, maxH:2, defW:1, defH:1 },
  actions:  { label:'Быстрые действия', icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', minW:2, minH:1, maxW:4, maxH:1, defW:2, defH:1 },
  usage:    { label:'Статистика',  icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',  minW:1, minH:1, maxW:2, maxH:2, defW:1, defH:1 },
};

// 4 cols × 3 rows = 12 cells, fits exactly without scroll
// Row 1-2: media(2×2) | weather(1×2) | clock(1×1) / cpu(1×1)
// Row 3:   ram(1×1)   | disk(1×1)    | volume(1×1)| bot(1×1)
const DEFAULT_LAYOUT = [
  { id:'w1', type:'media',   w:2, h:2 },
  { id:'w2', type:'weather', w:1, h:2 },
  { id:'w3', type:'clock',   w:1, h:1 },
  { id:'w4', type:'cpu',     w:1, h:1 },
  { id:'w5', type:'ram',     w:1, h:1 },
  { id:'w6', type:'disk',    w:1, h:1 },
  { id:'w7', type:'volume',  w:1, h:1 },
  { id:'w8', type:'bot',     w:1, h:1 },
];

// Shared sparkline history (global, all widgets share)
const _cpuH    = Array.from({length:20}, () => Math.floor(Math.random()*30)+20);
const _ramH    = Array.from({length:20}, () => Math.floor(Math.random()*15)+45);
const _gpuH    = Array.from({length:20}, () => Math.floor(Math.random()*20)+10);
const _netDownH = new Array(20).fill(0);
const _netUpH   = new Array(20).fill(0);

// Parse "12.5 KB/s" / "1.2 MB/s" → KB/s number for sparkline scaling
function _parseKBs(str) {
  if (!str) return 0;
  const m = String(str).match(/([\d.]+)\s*(KB|MB|GB)?/i);
  if (!m) return 0;
  const v = parseFloat(m[1]);
  const u = (m[2]||'KB').toUpperCase();
  if (u === 'GB') return v * 1024 * 1024;
  if (u === 'MB') return v * 1024;
  return v;
}

function _sparkPts(arr) {
  const n = arr.length - 1;
  return arr.map((v, i) => `${(i/n)*100},${28-(v/100)*28}`).join(' ');
}

// Network sparkline — values in KB/s, auto-scaled to 0-100
function _netSparkPts(arr) {
  const max = Math.max(...arr, 1);
  const n = arr.length - 1;
  return arr.map((v, i) => `${(i/n)*100},${28-(v/max)*26}`).join(' ');
}

function dashboardPage() {
  return {
    catalogMap: WIDGET_CATALOG,
    layout: [],
    editMode: false,
    showCatalog: false,
    swapSource: null,
    _timer: null,
    _clockTimer: null,
    _resizing: null,
    _refreshing: false,

    // Live state
    stats: { cpu:0, ram_used:0, ram_total:16, ramPct:0, disk_used:0, disk_free:200, disk_total:256, diskPct:0, volume:50, muted:false, bot_online:false, uptime:'' },
    media: { track:'', artist:'', status:'stopped', position:0, duration:0, art:null },
    _swappingIds: [],
    weather: { city:'', temp:null, icon:'🌤', desc:'', humidity:null, wind:null, feels_like:null, forecast:[] },
    currency: { rates:[], updated:'' },
    curAllPairs: [
      { code:'USD', flag:'🇺🇸', name:'Доллар', type:'fiat' },
      { code:'EUR', flag:'🇪🇺', name:'Евро', type:'fiat' },
      { code:'CNY', flag:'🇨🇳', name:'Юань', type:'fiat' },
      { code:'GBP', flag:'🇬🇧', name:'Фунт', type:'fiat' },
      { code:'JPY', flag:'🇯🇵', name:'Иена', type:'fiat' },
      { code:'TRY', flag:'🇹🇷', name:'Лира', type:'fiat' },
      { code:'KZT', flag:'🇰🇿', name:'Тенге', type:'fiat' },
      { code:'AED', flag:'🇦🇪', name:'Дирхам', type:'fiat' },
      { code:'BTC', flag:'₿', name:'Bitcoin', type:'crypto', cgId:'bitcoin' },
      { code:'ETH', flag:'Ξ', name:'Ethereum', type:'crypto', cgId:'ethereum' },
      { code:'TON', flag:'💎', name:'Toncoin', type:'crypto', cgId:'the-open-network' },
      { code:'SOL', flag:'◎', name:'Solana', type:'crypto', cgId:'solana' },
      { code:'USDT', flag:'₮', name:'Tether', type:'crypto', cgId:'tether' },
    ],
    curSelected: ['USD','EUR','BTC','ETH'],
    curCryptoUnit: 'rub',
    curSettingsOpen: false,
    clockTime: '', clockDate: '', clockDay: '', dateStr: '',
    calMonth: null, calYear: null,
    botInfo: { username: '', name: '', avatar: null },
    voice: { armed: false, micEnabled: true, hotkeyHeld: false, hotkey: 'Ctrl', tts: false, silence: false },
    ramFlushing: false, ramFlushResult: '',
    diskCleaning: false, diskCleanResult: '',
    _micBars: new Array(20).fill(0),
    _ringLevel: 0,
    gpu: { name: 'GPU', load: null, vram_mb: 0, vram_used_mb: 0, temp: null },
    battery: { present: false, percent: 0, plugged: false, status: '' },
    usageStats: { commands_today: 0, ai_today: 0, screenshots_today: 0, total_commands: 0 },
    _gpuTick: 0, _batTick: 0, _usageTick: 0,

    get mediaPct() {
      return this.media.duration ? Math.min((this.media.position / this.media.duration) * 100, 100) : 0;
    },
    get cpuSparkPts()     { return _sparkPts(_cpuH); },
    get ramSparkPts()     { return _sparkPts(_ramH); },
    get gpuSparkPts()     { return _sparkPts(_gpuH); },
    get netDownSparkPts() { return _netSparkPts(_netDownH); },
    get netUpSparkPts()   { return _netSparkPts(_netUpH); },
    get catalogList() {
      return Object.entries(WIDGET_CATALOG).map(([key, cat]) => ({ key, ...cat }));
    },

    get calDays() {
      const y = this.calYear, m = this.calMonth;
      if (y == null || m == null) return [];
      const first = new Date(y, m, 1).getDay();
      const offset = (first + 6) % 7; // Monday-first
      const total = new Date(y, m + 1, 0).getDate();
      const today = new Date();
      const isThisMonth = today.getFullYear() === y && today.getMonth() === m;
      const days = [];
      for (let i = 0; i < offset; i++) days.push({ d: '', cls: '' });
      for (let d = 1; d <= total; d++) {
        let cls = '';
        if (isThisMonth && d === today.getDate()) cls = 'cal-today';
        const dow = (offset + d - 1) % 7;
        if (dow >= 5) cls += ' cal-weekend';
        days.push({ d, cls: cls.trim() });
      }
      return days;
    },
    get calMonthName() {
      const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
      return this.calMonth != null ? MONTHS[this.calMonth] + ' ' + this.calYear : '';
    },
    calPrev() { if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; } else this.calMonth--; },
    calNext() { if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; } else this.calMonth++; },
    calToday() { const d = new Date(); this.calMonth = d.getMonth(); this.calYear = d.getFullYear(); },

    init() {
      try { const s = JSON.parse(localStorage.getItem('puri_cur_sel')); if (Array.isArray(s) && s.length) this.curSelected = s; } catch {}
      try { const u = localStorage.getItem('puri_cur_unit'); if (u === 'usd' || u === 'rub') this.curCryptoUnit = u; } catch {}
      const now = new Date(); this.calMonth = now.getMonth(); this.calYear = now.getFullYear();
      this.loadLayout();
      this.tickClock();
      this._clockTimer = setInterval(() => this.tickClock(), 1000);
      // Initial data load (also serves as fallback for browser preview)
      this.refresh();
      this._pushActive = false;
      // Fallback polling — only fires if Python push is not active
      this._timer = setInterval(() => {
        if (!document.hidden && !this._pushActive) this.refresh();
      }, 3000);
      this.fetchWeather();
      this.fetchCurrency();
      this.loadBotInfo();
      this.fetchVoiceState();
      this._voiceTimer = setInterval(() => this.fetchVoiceState(), 5000);
      this._startCanvasLoop();
      this._setupHotkeyListener();
      // Python real-time push handlers
      window._onStatsPush = (payload) => {
        if (document.hidden) return;
        this._pushActive = true;
        this._handlePush(payload);
      };
      // Audio bars pushed at 20fps from Python sounddevice (no browser perms needed)
      window._onAudioPush = (data) => {
        if (data?.bars) {
          // Exponential smoothing: fast attack (α=0.55), creates fluid bar motion
          const alpha = 0.55;
          this._micBars = data.bars.map((v, i) => (this._micBars[i] || 0) * (1 - alpha) + v * alpha);
        }
        if (data?.muted !== undefined) {
          const nowEnabled = !data.muted;
          if (nowEnabled !== this.voice.micEnabled) {
            this.voice = { ...this.voice, micEnabled: nowEnabled };
          }
        }
      };
    },

    destroy() {
      if (this._clockTimer) { clearInterval(this._clockTimer); this._clockTimer = null; }
      if (this._timer)      { clearInterval(this._timer);      this._timer      = null; }
      if (this._voiceTimer) { clearInterval(this._voiceTimer); this._voiceTimer = null; }
      if (this._micRaf)     { cancelAnimationFrame(this._micRaf); this._micRaf  = null; }
      if (this._hotkeyDown) { document.removeEventListener('keydown', this._hotkeyDown); this._hotkeyDown = null; }
      if (this._hotkeyUp)   { document.removeEventListener('keyup',   this._hotkeyUp);   this._hotkeyUp   = null; }
      window._onStatsPush = null;
      window._onAudioPush = null;
    },

    async fetchVoiceState() {
      try {
        const [vsR, micR] = await Promise.allSettled([
          API.getVoiceSettings(),
          API.getMicMute(),
        ]);
        if (vsR.status === 'fulfilled') {
          const s = vsR.value;
          const hotkey = s.hotkey || 'ctrl';
          const hm = { ctrl:'Ctrl', alt:'Alt', shift:'Shift', tab:'Tab' };
          const fmt = hm[hotkey] || (hotkey.startsWith('f') && !isNaN(hotkey.slice(1)) ? hotkey.toUpperCase() : hotkey.charAt(0).toUpperCase() + hotkey.slice(1));
          this.voice = { ...this.voice, armed: !!s.wake_word_enabled, hotkey: fmt, tts: !!s.tts_enabled, silence: !!s.silence_mode };
        }
        if (micR.status === 'fulfilled' && micR.value?.ok !== false) {
          const nowEnabled = !micR.value.muted;
          this.voice = { ...this.voice, micEnabled: nowEnabled };
        }
      } catch {}
    },

    async toggleMicEnabled() {
      const next = !this.voice.micEnabled;
      this.voice = { ...this.voice, micEnabled: next };
      try {
        await API.setMicMute(!next);  // muted = opposite of enabled
      } catch {
        this.voice = { ...this.voice, micEnabled: !next };
      }
    },

    async toggleVoiceArmed() {
      const next = !this.voice.armed;
      this.voice = { ...this.voice, armed: next };
      try {
        await API.saveVoiceSettings({ wake_word_enabled: next });
      } catch {
        this.voice = { ...this.voice, armed: !next };
      }
    },

    _setupHotkeyListener() {
      if (this._hotkeyDown) return;
      this._hotkeyDown = (e) => {
        if (!this.voice.micEnabled || e.repeat) return;
        const hk = (this.voice.hotkey || 'Ctrl').toLowerCase();
        const pressed = (hk === 'ctrl' && e.ctrlKey) || (hk === 'alt' && e.altKey) ||
                        (hk === 'shift' && e.shiftKey) || e.key.toLowerCase() === hk;
        if (pressed) {
          this.voice = { ...this.voice, hotkeyHeld: true };
        }
      };
      this._hotkeyUp = (e) => {
        const hk = (this.voice.hotkey || 'Ctrl').toLowerCase();
        const released = (hk === 'ctrl' && !e.ctrlKey) || (hk === 'alt' && !e.altKey) ||
                         (hk === 'shift' && !e.shiftKey) || e.key.toLowerCase() === hk;
        if (released) this.voice = { ...this.voice, hotkeyHeld: false };
      };
      document.addEventListener('keydown', this._hotkeyDown);
      document.addEventListener('keyup',   this._hotkeyUp);
    },

    // ── Voice canvas — bars fed by Python sounddevice via _onAudioPush ──
    _micRaf: null,

    // Canvas loop runs ALWAYS after init — draws _micBars from Python
    _startCanvasLoop() {
      if (this._micRaf) return;
      const tick = () => {
        this._updateVoiceRing();
        this._drawWaveCanvas();
        this._micRaf = requestAnimationFrame(tick);
      };
      this._micRaf = requestAnimationFrame(tick);
    },

    _updateVoiceRing() {
      const ring = document.getElementById('voice-ring');
      if (!ring) return;

      // Average mic energy across all bars
      const avgLevel = this._micBars.reduce((s, v) => s + v, 0) / this._micBars.length;
      const target = Math.min(1, avgLevel * 6);

      // Fast attack (α=0.5), slow decay (α=0.08)
      this._ringLevel = target > this._ringLevel
        ? this._ringLevel * 0.5 + target * 0.5
        : this._ringLevel * 0.92;

      const intensity = this._ringLevel;

      if (intensity < 0.01) {
        ring.style.opacity = '0';
        return;
      }

      // Outer glow only — sits behind the window chrome, always interface purple
      const spread1 = Math.round(intensity * 40);
      const spread2 = Math.round(intensity * 90);
      const a1 = (intensity * 0.45).toFixed(2);
      const a2 = (intensity * 0.18).toFixed(2);

      ring.style.opacity = '1';
      ring.style.boxShadow = `0 0 ${spread1}px hsla(262,80%,65%,${a1}), 0 0 ${spread2}px hsla(262,80%,55%,${a2})`;
    },

    _drawWaveCanvas() {
      const canvas = document.querySelector('.wv-canvas');
      if (!canvas || !this.voice.micEnabled) return;

      const parent = canvas.parentElement;
      if (!parent) return;
      const W = parent.clientWidth, H = parent.clientHeight;
      if (W < 4 || H < 4) return;

      const dpr = window.devicePixelRatio || 1;
      const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width  = pw;
        canvas.height = ph;
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const BAR_COUNT = 22;
      const GAP = 2;
      const barW = Math.max(1, (W - GAP * (BAR_COUNT - 1)) / BAR_COUNT);
      const now = performance.now() / 1000;
      const hotkeyHeld = this.voice.hotkeyHeld;
      const armed = this.voice.armed;
      // Color: red when recording, accent when wake-word armed, muted blue-gray when idle PTT
      const hue = hotkeyHeld ? 0 : armed ? 262 : 220;
      const sat = hotkeyHeld ? '85%' : '70%';

      // ── Radial background glow (reacts to audio level) ──────────────
      const avgLevel = this._micBars.reduce((s, v) => s + v, 0) / this._micBars.length;
      if (avgLevel > 0.01 || hotkeyHeld || armed) {
        const glowBase = hotkeyHeld ? 0.10 : armed ? 0.04 : 0;
        const glowAlpha = Math.min(0.32, glowBase + avgLevel * 1.6);
        const grd = ctx.createRadialGradient(W / 2, H * 0.9, 0, W / 2, H * 0.6, W * 0.9);
        grd.addColorStop(0, `hsla(${hue},${sat},65%,${glowAlpha.toFixed(2)})`);
        grd.addColorStop(0.6, `hsla(${hue},${sat},55%,${(glowAlpha * 0.3).toFixed(2)})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        // Map BAR_COUNT bars to 20 Python frequency bins
        const srcIdx = Math.min(this._micBars.length - 1, Math.floor((i / BAR_COUNT) * this._micBars.length));
        const srcVal = this._micBars[srcIdx] || 0;
        // Show idle ripple when mic is silent, real bars when active
        let val = srcVal > 0.015 ? srcVal : (0.03 + Math.abs(Math.sin(now * 1.1 + i * 0.42)) * 0.05);

        const barH = Math.max(3, val * (H - 6));
        const x = i * (barW + GAP);
        const alpha = 0.25 + val * 0.75;

        const grad = ctx.createLinearGradient(0, H - barH, 0, H);
        grad.addColorStop(0, `hsla(${hue},${sat},76%,${alpha.toFixed(2)})`);
        grad.addColorStop(1, `hsla(${hue},${sat},55%,${(alpha * 0.4).toFixed(2)})`);
        ctx.fillStyle = grad;

        // Rounded top corners
        const rx = Math.min(2, barW / 2);
        ctx.beginPath();
        if (barH > rx * 2) {
          ctx.moveTo(x + rx, H - barH);
          ctx.lineTo(x + barW - rx, H - barH);
          ctx.arcTo(x + barW, H - barH, x + barW, H - barH + rx, rx);
          ctx.lineTo(x + barW, H);
          ctx.lineTo(x, H);
          ctx.lineTo(x, H - barH + rx);
          ctx.arcTo(x, H - barH, x + rx, H - barH, rx);
        } else {
          ctx.rect(x, H - barH, barW, barH);
        }
        ctx.closePath();
        ctx.fill();
      }
    },

    loadLayout() {
      try {
        const s = localStorage.getItem('puri_wl_v4');
        this.layout = s ? JSON.parse(s) : DEFAULT_LAYOUT.map(w => ({ ...w }));
      } catch { this.layout = DEFAULT_LAYOUT.map(w => ({ ...w })); }
    },

    saveLayout() {
      localStorage.setItem('puri_wl_v4', JSON.stringify(this.layout));
    },

    tickClock() {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2,'0');
      const mm = d.getMinutes().toString().padStart(2,'0');
      this.clockTime = `${hh}:${mm}`;
      const DAYS   = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
      const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
      this.clockDay  = DAYS[d.getDay()];
      this.clockDate = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      this.dateStr   = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    },

    // Sync media state + position ticker — called from both _handlePush and refresh()
    _syncMedia(m) {
      const trackChanged = m.track !== this.media.track;
      const prevStatus   = _mp.status;
      this.media = { ...m, art: this.media.art };
      _mp.dur    = m.duration;
      _mp.status = m.status;

      if (trackChanged || m.status !== prevStatus || m.status !== 'playing') {
        // Track/status change → snap to SMTC position (it's accurate on events)
        _mp.syncPos = m.position;
        _mp.syncTs  = performance.now();
      } else {
        // Continuous playback: SMTC position is an integer and many apps don't
        // update it during playback — trust JS interpolation unless we detect a seek.
        // A seek = SMTC position actually changed AND the jump is large (> 8s).
        if (m.position !== this._lastSmtcPos) {
          const predicted = _mp.syncPos + (performance.now() - _mp.syncTs) / 1000;
          if (Math.abs(m.position - predicted) > 8) {
            // Hard seek — snap to real position
            _mp.syncPos = m.position;
            _mp.syncTs  = performance.now();
          }
          // Small SMTC update (≤8s diff) = normal 1-second increment, trust ticker
        }
        // SMTC unchanged → app doesn't update timeline → ticker runs freely
      }
      this._lastSmtcPos = m.position;
      if (trackChanged) this.fetchMediaArt();
    },

    // Called by Python push loop via window._onStatsPush
    _handlePush(payload) {
      // Separate volume — user may be actively dragging the slider
      const { volume: pushedVol, ...s } = payload;
      const ramPct = s.ram_total ? Math.round((s.ram_used / s.ram_total) * 100) : 0;
      this.stats = { ...this.stats, ...s, ramPct };
      if (s.disk_total !== undefined) {
        const diskPct = Math.round(((s.disk_used || 0) / s.disk_total) * 100);
        const disk_free = s.disk_free !== undefined ? s.disk_free : (s.disk_total - (s.disk_used || 0));
        this.stats = { ...this.stats, diskPct, disk_free };
      }
      // Apply pushed volume only if user hasn't touched the slider in last 2s
      const skipVol = this._volUserTs && (Date.now() - this._volUserTs) < 2000;
      if (!skipVol && pushedVol !== undefined) {
        this.stats = { ...this.stats, volume: pushedVol };
      }
      _cpuH.push(Math.round(s.cpu || 0)); _cpuH.shift();
      _ramH.push(ramPct);                 _ramH.shift();
      if (s.net_down !== undefined) { _netDownH.push(_parseKBs(s.net_down)); _netDownH.shift(); }
      if (s.net_up   !== undefined) { _netUpH.push(_parseKBs(s.net_up));     _netUpH.shift(); }

      if (s.media) this._syncMedia(s.media);

      if (s.bot_online && !this.botInfo.username) this.loadBotInfo();
      if (s.gpu)        { this.gpu = s.gpu; _gpuH.push(Math.round(s.gpu.load || 0)); _gpuH.shift(); }
      if (s.battery)    { this.battery = s.battery; }
      if (s.usage_stats){ this.usageStats = s.usage_stats; }
    },

    async refresh() {
      if (this._refreshing) return;
      this._refreshing = true;
      try {
        const [s, m] = await Promise.all([API.getStats(), API.getMediaStatus()]);
        const ramPct  = s.ram_total  ? Math.round((s.ram_used  / s.ram_total)  * 100) : 0;
        const diskPct = s.disk_total ? Math.round((s.disk_used / s.disk_total) * 100) : 0;
        const { volume: pollVol, ...sRest } = s;
        this.stats = { ...this.stats, ...sRest, ramPct, diskPct };
        const skipVol = this._volUserTs && (Date.now() - this._volUserTs) < 2000;
        if (!skipVol && pollVol !== undefined) this.stats = { ...this.stats, volume: pollVol };
        _cpuH.push(Math.round(s.cpu)); _cpuH.shift();
        _ramH.push(ramPct);            _ramH.shift();
        this._syncMedia(m);
        if (s.bot_online && !this.botInfo.username) this.loadBotInfo();
        // Slow-polled data — only used in browser preview (push carries these in prod)
        this._gpuTick = (this._gpuTick || 0) + 1;
        this._batTick = (this._batTick || 0) + 1;
        this._usageTick = (this._usageTick || 0) + 1;
        if (this._gpuTick >= 10) {
          this._gpuTick = 0;
          try { const g = await API.getGpuInfo(); if (g.ok !== false) { this.gpu = g; _gpuH.push(Math.round(g.load||0)); _gpuH.shift(); } } catch {}
        }
        if (this._batTick >= 30) {
          this._batTick = 0;
          try { const b = await API.getBatteryInfo(); if (b.ok !== false) this.battery = b; } catch {}
        }
        if (this._usageTick >= 60) {
          this._usageTick = 0;
          try { const u = await API.getUsageStats(); if (u) this.usageStats = u; } catch {}
        }
      } catch {}
      finally { this._refreshing = false; }
    },

    getGreeting() {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) return 'Доброе утро';
      if (h >= 12 && h < 17) return 'Добрый день';
      if (h >= 17 && h < 22) return 'Добрый вечер';
      return 'Доброй ночи';
    },

    async fetchMediaArt() {
      try {
        const r = await API.getMediaThumbnail();
        this.media = { ...this.media, art: r.art || null };
      } catch {}
    },

    async fetchWeather() {
      // WMO weather code → icon + Russian description
      const WI = {0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌦',55:'🌧',61:'🌦',63:'🌧',65:'🌧',71:'🌨',73:'❄️',75:'❄️',77:'❄️',80:'🌦',81:'🌧',82:'🌧',85:'🌨',86:'❄️',95:'⛈',96:'⛈',99:'⛈'};
      const WD = {0:'Ясно',1:'Преимущественно ясно',2:'Переменная облачность',3:'Пасмурно',45:'Туман',48:'Туман с изморозью',51:'Слабая морось',53:'Морось',55:'Сильная морось',61:'Слабый дождь',63:'Умеренный дождь',65:'Сильный дождь',71:'Слабый снег',73:'Умеренный снег',75:'Сильный снег',77:'Снежная крупа',80:'Ливень',81:'Умеренный ливень',82:'Сильный ливень',85:'Снегопад',86:'Сильный снегопад',95:'Гроза',96:'Гроза с градом',99:'Сильная гроза'};
      try {
        let city = 'Москва';
        try { city = (await API.getSettings()).city || city; } catch {}
        // Geocode city → lat/lon
        const gR = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`);
        if (!gR.ok) throw new Error('geo ' + gR.status);
        const gD = await gR.json();
        if (!gD.results?.length) throw new Error('city not found: ' + city);
        const { latitude: lat, longitude: lon, name } = gD.results[0];
        // Fetch weather
        const wR = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`
        );
        if (!wR.ok) throw new Error('weather ' + wR.status);
        const d = await wR.json();
        const cur = d.current;
        const code = cur.weather_code;
        this.weather = {
          city: name,
          temp: Math.round(cur.temperature_2m),
          icon: WI[code] ?? '🌤',
          desc: WD[code] ?? 'Переменная облачность',
          humidity: cur.relative_humidity_2m,
          wind: Math.round(cur.wind_speed_10m / 3.6),
          feels_like: Math.round(cur.apparent_temperature),
          forecast: d.daily.time.slice(0, 3).map((_, i) => ({
            name: ['Сегодня', 'Завтра', 'Послезавтра'][i],
            icon: WI[d.daily.weather_code[i]] ?? '🌤',
            desc: WD[d.daily.weather_code[i]] ?? '',
            temp: Math.round((d.daily.temperature_2m_max[i] + d.daily.temperature_2m_min[i]) / 2),
            max: Math.round(d.daily.temperature_2m_max[i]),
            min: Math.round(d.daily.temperature_2m_min[i]),
          })),
        };
      } catch { this.weather = { ...this.weather, city: 'Нет данных', desc: 'Нет соединения' }; }
      setTimeout(() => this.fetchWeather(), 30 * 60 * 1000);
    },

    toggleCurPair(code) {
      const i = this.curSelected.indexOf(code);
      if (i !== -1) { if (this.curSelected.length > 1) this.curSelected.splice(i, 1); }
      else { if (this.curSelected.length >= 5) return; this.curSelected.push(code); }
      try { localStorage.setItem('puri_cur_sel', JSON.stringify(this.curSelected)); } catch {}
      this.fetchCurrency();
    },
    async fetchCurrency() {
      const map = Object.fromEntries(this.curAllPairs.map(p => [p.code, p]));
      const sel = this.curSelected;
      const fiatCodes = sel.filter(c => map[c]?.type === 'fiat');
      const cryptoCodes = sel.filter(c => map[c]?.type === 'crypto');
      const cUnit = this.curCryptoUnit;
      const results = [];
      try {
        const promises = [];
        // Fiat via exchangerate-api
        if (fiatCodes.length) {
          promises.push(
            fetch('https://open.er-api.com/v6/latest/RUB').then(r => r.json()).then(d => {
              if (!d.rates) return;
              for (const c of fiatCodes) {
                if (d.rates[c]) {
                  const val = 1 / d.rates[c];
                  results.push({ code: c, value: val < 1 ? val.toFixed(4) : val.toFixed(2), unit: '₽' });
                }
              }
            })
          );
        }
        // Crypto via CoinGecko
        if (cryptoCodes.length) {
          const ids = cryptoCodes.map(c => map[c].cgId).join(',');
          const vs = cUnit === 'usd' ? 'usd' : 'rub';
          promises.push(
            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs}`).then(r => r.json()).then(d => {
              for (const c of cryptoCodes) {
                const price = d[map[c].cgId]?.[vs];
                if (price != null) {
                  const fmt = price >= 1000 ? Math.round(price).toLocaleString('ru-RU') : price < 1 ? price.toFixed(4) : price.toFixed(2);
                  results.push({ code: c, value: fmt, unit: cUnit === 'usd' ? '$' : '₽' });
                }
              }
            })
          );
        }
        await Promise.all(promises);
        // sort by selection order
        const order = Object.fromEntries(sel.map((c, i) => [c, i]));
        results.sort((a, b) => (order[a.code] ?? 99) - (order[b.code] ?? 99));
        this.currency = { updated: '', rates: results };
      } catch { this.currency = { rates: this.currency.rates.length ? this.currency.rates : [], updated: '' }; }
      setTimeout(() => this.fetchCurrency(), 5 * 60 * 1000);
    },

    toggleEdit() {
      this.editMode = !this.editMode;
      if (!this.editMode) { this.swapSource = null; this.saveLayout(); }
    },

    get usedCells() { return this.layout.reduce((s, w) => s + w.w * w.h, 0); },
    get freeCells() { return 12 - this.usedCells; },
    canFit(type) { const c = WIDGET_CATALOG[type]; return c && c.defW * c.defH <= this.freeCells; },

    addWidget(type) {
      const cat = WIDGET_CATALOG[type];
      if (!cat) return;
      if (cat.defW * cat.defH > this.freeCells) return;
      this.layout = [...this.layout, { id:'w'+Date.now(), type, w:cat.defW, h:cat.defH }];
      this.saveLayout();
    },

    removeWidget(id) {
      this.layout = this.layout.filter(w => w.id !== id);
      this.saveLayout();
    },

    handleSwapClick(id) {
      if (!this.swapSource) { this.swapSource = id; return; }
      if (this.swapSource === id) { this.swapSource = null; return; }
      const srcId = this.swapSource;
      const a = this.layout.findIndex(w => w.id === srcId);
      const b = this.layout.findIndex(w => w.id === id);
      if (a !== -1 && b !== -1) {
        const arr = [...this.layout];
        [arr[a], arr[b]] = [arr[b], arr[a]];
        this.layout = arr;
        this._swappingIds = [srcId, id];
        setTimeout(() => { this._swappingIds = []; }, 500);
      }
      this.swapSource = null;
      this.saveLayout();
    },

    _clamp(widget, axis, delta) {
      const cat = WIDGET_CATALOG[widget.type] || {};
      if (delta > 0) {
        const grow = axis === 'w' ? widget.h : widget.w;
        if (grow > this.freeCells) return;
      }
      if (axis === 'w') widget.w = Math.max(cat.minW||1, Math.min(cat.maxW||4, widget.w + delta));
      else              widget.h = Math.max(cat.minH||1, Math.min(cat.maxH||3, widget.h + delta));
      this.layout = [...this.layout];
    },
    growW(id)   { const w = this.layout.find(x=>x.id===id); if(w) this._clamp(w,'w',+1); },
    shrinkW(id) { const w = this.layout.find(x=>x.id===id); if(w) this._clamp(w,'w',-1); },
    growH(id)   { const w = this.layout.find(x=>x.id===id); if(w) this._clamp(w,'h',+1); },
    shrinkH(id) { const w = this.layout.find(x=>x.id===id); if(w) this._clamp(w,'h',-1); },

    startResize(e, id) {
      e.preventDefault();
      e.stopPropagation();
      const widget = this.layout.find(w => w.id === id);
      if (!widget) return;
      const cell = e.currentTarget.closest('.widget-cell');
      this._resizing = {
        id,
        startX: e.clientX, startY: e.clientY,
        startW: widget.w,  startH: widget.h,
        unitW: cell.offsetWidth  / widget.w,
        unitH: cell.offsetHeight / widget.h,
      };
      const onMove = (ev) => {
        const r = this._resizing;
        if (!r) return;
        const cat = WIDGET_CATALOG[widget.type] || {};
        const dw = Math.round((ev.clientX - r.startX) / r.unitW);
        const dh = Math.round((ev.clientY - r.startY) / r.unitH);
        const nw = Math.max(cat.minW||1, Math.min(cat.maxW||4, r.startW + dw));
        const nh = Math.max(cat.minH||1, Math.min(cat.maxH||3, r.startH + dh));
        if (widget.w !== nw || widget.h !== nh) {
          widget.w = nw; widget.h = nh;
          this.layout = [...this.layout];
        }
      };
      const onUp = () => {
        this._resizing = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.saveLayout();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },

    async flushRam() {
      if (this.ramFlushing) return;
      this.ramFlushing = true;
      this.ramFlushResult = '';
      try {
        const r = await API.flushRam();
        if (r.ok) {
          const gb = (r.available_mb / 1024).toFixed(1);
          this.ramFlushResult = `↑ ${gb} GB`;
        }
      } catch {}
      this.ramFlushing = false;
      if (this.ramFlushResult) setTimeout(() => { this.ramFlushResult = ''; }, 6000);
    },

    async cleanDisk() {
      if (this.diskCleaning) return;
      this.diskCleaning = true;
      this.diskCleanResult = '';
      try {
        const r = await API.cleanTemp();
        if (r.ok) {
          this.diskCleanResult = `−${r.freed_mb?.toFixed(0) ?? 0} MB`;
        }
      } catch {}
      this.diskCleaning = false;
      if (this.diskCleanResult) setTimeout(() => { this.diskCleanResult = ''; }, 6000);
    },

    toggleMedia() {
      if (this.media.status === 'playing') { API.mediaPause(); this.media = {...this.media, status:'paused'}; }
      else                                 { API.mediaPlay();  this.media = {...this.media, status:'playing'}; }
    },

    setVolume(val) {
      const v = parseInt(val);
      this.stats = { ...this.stats, volume: v };
      this._volUserTs = Date.now();
      clearTimeout(this._volDebounce);
      this._volDebounce = setTimeout(() => API.setVolume(v).catch(() => {}), 60);
    },

    toggleMute() {
      this.stats = { ...this.stats, muted: !this.stats.muted };
      this._volUserTs = Date.now();
      API.muteToggle().catch(() => {});
    },

    async loadBotInfo() {
      try {
        const info = await API.getBotInfo();
        if (info.ok) this.botInfo = info;
      } catch {}
    },

    async toggleBot() {
      if (this.stats.bot_online) {
        await API.stopBot();
        this.stats = { ...this.stats, bot_online: false };
        showToast('Бот остановлен', 'info');
      } else {
        const r = await API.startBot('', []);
        if (r.ok) {
          this.stats = { ...this.stats, bot_online: true };
          showToast('Бот запущен', 'success');
          this.loadBotInfo();
        } else {
          showToast('Ошибка: ' + (r.error || 'неизвестно'), 'error');
        }
      }
    },

    openBot() {
      if (this.botInfo.username) {
        API.openInBrowser(`https://t.me/${this.botInfo.username}`);
      }
    },
  };
}

// ── Chat ───────────────────────────────────────────────────────────
function chatPage() {
  return {
    inputText: '',
    sending: false,
    toolUse: true,
    pendingAttach: null,
    dragging: false,
    showScrollBtn: false,
    msgCount: 0,
    providerLabel: 'Groq',

    init() {
      const msgs = document.getElementById('chat-messages');
      if (!msgs) return;
      msgs.addEventListener('scroll', () => {
        this.showScrollBtn = msgs.scrollTop + msgs.clientHeight < msgs.scrollHeight - 100;
      }, { passive: true });
      this.loadAISettings();
      this.loadHistory();
    },

    _historyLoaded: false,
    async loadHistory() {
      if (this._historyLoaded) return;
      this._historyLoaded = true;
      try {
        const history = await API.getChatHistory();
        if (!history || !history.length) return;
        for (const msg of history) {
          const role = msg.role === 'user' ? 'user' : 'bot';
          const meta = { time: msg.time || '' };
          if (msg.tool) meta.tool_call = msg.tool;
          if (msg.image) meta.image = msg.image;
          if (msg.file) meta.file = msg.file;
          this.appendMessage(role, msg.text, meta);
        }
      } catch {}
    },

    async loadAISettings() {
      try {
        const s = await API.getSettings();
        let prov = s.ai_provider || 'custom';
        if (prov === 'groq') prov = 'custom';
        chatSetProvider(prov);
        this.providerLabel = prov === 'ollama' ? 'Ollama' : 'API';
        this.toolUse = !!s.ai_tool_use_enabled;
        // migrate groq → custom fields
        setVal('chat-custom-url',    s.custom_api_url || (s.groq_api_key ? 'https://api.groq.com/openai/v1' : ''));
        setVal('chat-custom-key',    s.custom_api_key || s.groq_api_key || '');
        setVal('chat-custom-model',  s.custom_api_model || s.ollama_model || '');
        setVal('chat-ollama-url',    s.ollama_url);
        setVal('chat-ollama-model',  s.ollama_model);
        setVal('chat-ollama-vision', s.ollama_vision_model);
        setCheck('chat-tool-use',    s.ai_tool_use_enabled);
        setCheck('chat-web-search',  s.web_search_enabled);
      } catch {}
    },

    pickFile() {
      const fi = document.createElement('input');
      fi.type = 'file';
      fi.style.display = 'none';
      document.body.appendChild(fi);
      fi.click();
      fi.onchange = () => {
        const f = fi.files[0];
        if (f) this.pendingAttach = { type: f.type.startsWith('image/') ? 'image' : 'file', name: f.name, path: f.path || f.name };
        fi.remove();
      };
    },

    async screenshot() {
      try {
        const r = await API.takeScreenshot();
        this.pendingAttach = { type: 'image', name: 'screenshot.png', path: r.path };
        showToast('Скриншот добавлен', 'success');
      } catch { showToast('Ошибка скриншота', 'error'); }
    },

    handleDrop(e) {
      this.dragging = false;
      const f = e.dataTransfer.files[0];
      if (f) this.pendingAttach = { type: f.type.startsWith('image/') ? 'image' : 'file', name: f.name, path: f.path || f.name };
    },

    autoResize(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    },

    scrollToBottom() {
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    },

    appendMessage(role, text, meta = {}) {
      const msgs = document.getElementById('chat-messages');
      if (!msgs) return;
      const emptyState = document.getElementById('chat-empty-state');
      if (emptyState) emptyState.style.display = 'none';
      const isUser = role === 'user';
      const group = document.createElement('div');
      group.className = `message-group ${role}`;

      let extras = '';
      if (meta.image) extras += `<div class="msg-image"><img src="${escHtml(meta.image)}" alt="изображение" onerror="this.parentElement.style.display='none'"></div>`;
      if (meta.file)  extras += `<div class="msg-file"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> ${escHtml(meta.file)}</div>`;
      if (meta.tool_call) extras += _buildToolBadge(meta.tool_call, meta._userText || '');

      const nameClass = isUser ? '' : 'puri';
      group.innerHTML = `
        <div class="msg-avatar ${role}">${isUser ? 'Вы' : 'P'}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name ${nameClass}">${isUser ? 'Вы' : 'Purify'}</span>
            <span class="msg-time">${meta.time || fmtNow()}</span>
          </div>
          ${text ? `<div class="msg-bubble">${escHtml(text)}</div>` : ''}
          ${extras}
        </div>`;

      const anchor = document.getElementById('chat-scroll-anchor');
      if (anchor) msgs.insertBefore(group, anchor);
      else msgs.appendChild(group);
      this.scrollToBottom();
    },

    appendTyping() {
      const msgs = document.getElementById('chat-messages');
      if (!msgs) return null;
      const g = document.createElement('div');
      g.id = 'typing-indicator';
      g.className = 'message-group bot';
      g.innerHTML = `
        <div class="msg-avatar bot">P</div>
        <div class="msg-body">
          <div class="msg-meta"><span class="msg-name puri">Purify</span></div>
          <div class="msg-bubble"><div class="msg-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>
        </div>`;
      const anchor = document.getElementById('chat-scroll-anchor');
      if (anchor) msgs.insertBefore(g, anchor); else msgs.appendChild(g);
      this.scrollToBottom();
      return g;
    },

    async streamText(el, text) {
      const bubble = el.querySelector('.msg-bubble');
      if (!bubble) return;
      bubble.textContent = '';
      const batchSize = 8;
      for (let i = 0; i < text.length; i += batchSize) {
        bubble.textContent += text.slice(i, i + batchSize);
        await new Promise(r => requestAnimationFrame(r));
      }
    },

    async sendMessage() {
      const text = this.inputText.trim();
      const attach = this.pendingAttach;
      if (!text && !attach) return;

      this.inputText = '';
      const ta = document.getElementById('chat-textarea');
      if (ta) { ta.style.height = 'auto'; }

      const meta = {};
      if (attach) {
        if (attach.type === 'image') meta.image = attach.path;
        else meta.file = attach.name;
      }
      this.pendingAttach = null;
      this.appendMessage('user', text, meta);

      this.sending = true;
      const typing = this.appendTyping();
      try {
        const resp = await API.sendChatMessage(text, attach?.path);
        typing?.remove();

        // Streaming effect
        const msgs = document.getElementById('chat-messages');
        const group = document.createElement('div');
        group.className = 'message-group bot';
        let toolHtml = '';
        if (resp.tool_call) toolHtml = _buildToolBadge(resp.tool_call, text);
        group.innerHTML = `
          <div class="msg-avatar bot">P</div>
          <div class="msg-body">
            <div class="msg-meta"><span class="msg-name puri">Purify</span><span class="msg-time">${fmtNow()}</span></div>
            ${toolHtml}
            <div class="msg-bubble"></div>
          </div>`;
        const anchor = document.getElementById('chat-scroll-anchor');
        if (anchor) msgs?.insertBefore(group, anchor); else msgs?.appendChild(group);
        await this.streamText(group, resp.reply || '');
        this.scrollToBottom();
      } catch {
        typing?.remove();
        this.appendMessage('bot', 'Ошибка соединения с AI.');
      } finally {
        this.sending = false;
      }
    },

    async clearHistory() {
      await API.clearChatHistory().catch(() => {});
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.querySelectorAll('.message-group').forEach(g => g.remove());
      const emptyState = document.getElementById('chat-empty-state');
      if (emptyState) emptyState.style.display = '';
      showToast('История очищена');
    }
  };
}

// ── Programs ───────────────────────────────────────────────────────
function programsPage() {
  return {
    items: [],
    search: '',

    get filtered() {
      if (!this.search) return this.items;
      const q = this.search.toLowerCase();
      return this.items.filter(p => p.name.toLowerCase().includes(q));
    },

    async load() {
      try { this.items = await API.getPrograms(); } catch {}
    },

    openAddModal() {
      document.getElementById('prog-name-input').value = '';
      document.getElementById('prog-path-input').value = '';
      openModal('modal-add-program');
    },

    async addProgram() {
      const name = document.getElementById('prog-name-input').value.trim();
      const path = document.getElementById('prog-path-input').value.trim();
      if (!name || !path) { showToast('Заполните все поля', 'error'); return; }
      await API.addProgram(name, path);
      this.items.push({ name, path, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' });
      closeModal('modal-add-program');
      showToast(`"${name}" добавлена`, 'success');
    },

    async run(name) {
      await API.runProgram(name);
      showToast(`<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg> ${name} запущен`, 'success');
    },

    remove(name) {
      openConfirm(`Удалить "${name}"?`, async () => {
        await API.removeProgram(name);
        this.items = this.items.filter(p => p.name !== name);
        showToast('Удалено');
      });
    }
  };
}

// Init browse button (outside Alpine, once DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prog-browse-btn')?.addEventListener('click', () => {
    const fi = document.createElement('input');
    fi.type = 'file'; fi.accept = '.exe,.bat,.cmd,.lnk'; fi.style.display = 'none';
    document.body.appendChild(fi); fi.click();
    fi.onchange = () => {
      const f = fi.files[0];
      if (f) {
        document.getElementById('prog-path-input').value = f.path || f.name;
        const n = document.getElementById('prog-name-input');
        if (n && !n.value) n.value = f.name.replace(/\.(exe|bat|cmd|lnk)$/i, '');
      }
      fi.remove();
    };
  });
});

// ── Scripts ────────────────────────────────────────────────────────
function scriptsPage() {
  return {
    items: [],

    async load() {
      try { this.items = await API.getScripts(); } catch {}
    },

    openAddModal() {
      document.getElementById('script-name-input').value = '';
      const list = document.getElementById('script-steps-list');
      if (list) list.innerHTML = '';
      addScriptStep(); addScriptStep();
      openModal('modal-add-script');
    },

    async addScript() {
      const name = document.getElementById('script-name-input').value.trim();
      const steps = [...document.querySelectorAll('#script-steps-list .input')].map(i => i.value.trim()).filter(Boolean);
      if (!name) { showToast('Введите название', 'error'); return; }
      if (steps.length === 0) { showToast('Добавьте хотя бы один шаг', 'error'); return; }
      await API.addScript(name, steps);
      this.items.push({ name, steps, in_bot: true });
      closeModal('modal-add-script');
      showToast(`"${name}" создан`, 'success');
    },

    async run(name) {
      await API.runScript(name);
      showToast(`<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg> "${name}" запущен`, 'success');
    },

    remove(name) {
      openConfirm(`Удалить сценарий "${name}"?`, async () => {
        await API.removeScript(name);
        this.items = this.items.filter(s => s.name !== name);
        showToast('Сценарий удалён');
      });
    }
  };
}

function addScriptStep(value = '') {
  const list = document.getElementById('script-steps-list');
  if (!list) return;
  const n = list.children.length + 1;
  const item = document.createElement('div');
  item.className = 'step-item';
  item.innerHTML = `
    <div class="step-num">${n}</div>
    <input type="text" class="input" placeholder="Например: Открыть Chrome" value="${escHtml(value)}">
    <button class="btn-remove-step" title="Удалить"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
  item.querySelector('.btn-remove-step').addEventListener('click', () => item.remove());
  list.appendChild(item);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-step-btn')?.addEventListener('click', () => addScriptStep());
});

// ── Voice ──────────────────────────────────────────────────────────
function voicePage() {
  return {
    recording: false,
    wakeActive: false,
    samplesCount: 0,
    ttsVoice: 'male',
    ttsVolume: 100,

    async load() {
      try {
        const s = await API.getVoiceSettings();
        const hotkeyEl = document.getElementById('hotkey-key');
        if (hotkeyEl) hotkeyEl.textContent = formatHotkey(s.hotkey || 'ctrl');

        setCheck('wake-word-toggle', s.wake_word_enabled);
        setCheck('tts-toggle', s.tts_enabled);
        setCheck('silence-mode-toggle', s.silence_mode);
        this.ttsVoice = s.tts_voice || 'male';
        this.ttsVolume = s.tts_volume ?? 100;

        if (s.tts_categories) {
          setCheck('tts-cat-media',   s.tts_categories.media);
          setCheck('tts-cat-power',   s.tts_categories.power);
          setCheck('tts-cat-ai',      s.tts_categories.ai);
          setCheck('tts-cat-info',    s.tts_categories.info);
          setCheck('tts-cat-unknown', s.tts_categories.unknown);
        }

        this.samplesCount = s.wake_word_samples || 0;
        this.wakeActive = s.wake_word_enabled;

        const countEl = document.getElementById('wake-samples-count');
        if (countEl) countEl.textContent = `${this.samplesCount} / 20`;

        const procs = await API.getRunningProcesses();
        const sel = document.getElementById('processes-select');
        if (sel) {
          sel.innerHTML = '<option value="">Выберите процесс...</option>' + procs.map(p => `<option value="${escHtml(p)}">${escHtml(p)}</option>`).join('');
        }
      } catch {}
    },

    toggleRecording() {
      this.recording = !this.recording;
      if (this.recording) showToast('Запись началась...', 'info');
    },

    setTtsVoice(v) {
      this.ttsVoice = v;
      API.saveVoiceSettings({ tts_voice: v }).catch(() => {});
    },

    setTtsVolume(v) {
      this.ttsVolume = parseInt(v);
      API.saveVoiceSettings({ tts_volume: parseInt(v) }).catch(() => {});
    },

    async recordSample() {
      if (this.samplesCount >= 20) { showToast('Все образцы уже записаны', 'success'); return; }
      this.samplesCount++;
      const countEl = document.getElementById('wake-samples-count');
      if (countEl) countEl.textContent = `${this.samplesCount} / 20`;
      showToast(`Образец ${this.samplesCount}/20 записан`, 'success');
      if (this.samplesCount === 20) setTimeout(() => showToast('Обучение завершено! Wake word готов.', 'success'), 400);
      API.saveVoiceSettings({ wake_word_samples: this.samplesCount }).catch(() => {});
    }
  };
}

function setCheck(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

function formatHotkey(k) {
  const m = { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', tab: 'Tab' };
  if (m[k]) return m[k];
  if (k.startsWith('f') && !isNaN(k.slice(1))) return k.toUpperCase();
  return k.charAt(0).toUpperCase() + k.slice(1);
}

// Voice exclusion list
const voiceExclusions = [];

function renderExclusions() {
  const list = document.getElementById('exclusion-list');
  if (!list) return;
  list.innerHTML = voiceExclusions.length
    ? voiceExclusions.map((p, i) => `
        <div class="exclusion-item">
          <span>${escHtml(p)}</span>
          <button onclick="voiceExclusions.splice(${i},1);renderExclusions()" title="Удалить"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`).join('')
    : '<div class="text-xs text-muted" style="padding:4px 8px">Список пуст</div>';
}

// Voice toggles
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wake-word-toggle')?.addEventListener('change', e => {
    API.saveVoiceSettings({ wake_word_enabled: e.target.checked }).catch(() => {});
    showToast(e.target.checked ? 'Wake word включён' : 'Wake word выключен');
  });
  document.getElementById('tts-toggle')?.addEventListener('change', e => {
    API.saveVoiceSettings({ tts_enabled: e.target.checked }).catch(() => {});
  });
  document.getElementById('silence-mode-toggle')?.addEventListener('change', e => {
    API.saveVoiceSettings({ silence_mode: e.target.checked }).catch(() => {});
    showToast(e.target.checked ? 'Тихий режим включён' : 'Тихий режим выключен');
  });

  // Process exclusion add
  document.getElementById('add-exclusion-btn')?.addEventListener('click', () => {
    const sel = document.getElementById('processes-select');
    const val = sel?.value;
    if (!val) { showToast('Выберите процесс', 'error'); return; }
    if (!voiceExclusions.includes(val)) {
      voiceExclusions.push(val);
      renderExclusions();
      API.saveVoiceSettings({ exclusions: voiceExclusions }).catch(() => {});
      showToast('Процесс добавлен в исключения', 'success');
    } else {
      showToast('Уже добавлен', 'info');
    }
  });

  // Render initial exclusions
  setTimeout(renderExclusions, 200);

  // Hotkey capture
  const hotkeyBox = document.getElementById('hotkey-capture');
  if (hotkeyBox) {
    hotkeyBox.addEventListener('click', () => hotkeyBox.focus());
    hotkeyBox.addEventListener('keydown', e => {
      e.preventDefault(); e.stopPropagation();
      let key = e.key.toLowerCase();
      if (key === 'control') key = 'ctrl';
      else if (key === 'alt') key = 'alt';
      else if (key === 'shift') key = 'shift';
      const el = document.getElementById('hotkey-key');
      if (el) el.textContent = formatHotkey(key);
      API.saveVoiceSettings({ hotkey: key }).catch(() => {});
      showToast(`Клавиша: ${formatHotkey(key)}`, 'success');
      closeModal('modal-hotkey');
    });
  }
});

// ── Logs ───────────────────────────────────────────────────────────
const SAMPLE_LOGS = [
  { time: '14:22:01', level: 'INFO',    mod: 'app',      msg: 'Purify v2.1.0 запущен — Windows 10 Pro, Python 3.11.7',   cls: 'lvl-info' },
  { time: '14:22:02', level: 'INFO',    mod: 'config',   msg: 'Конфигурация загружена из .env (18 параметров)',           cls: 'lvl-info' },
  { time: '14:22:03', level: 'SUCCESS', mod: 'license',  msg: 'Лицензия активна (paid), осталось 340 дней',              cls: 'lvl-success' },
  { time: '14:22:04', level: 'INFO',    mod: 'ollama',   msg: 'Подключён к Ollama — модель qwen2.5:3b (3.1 GB)',         cls: 'lvl-info' },
  { time: '14:22:05', level: 'INFO',    mod: 'bot',      msg: 'Telegram бот @purify_control_bot запущен (polling)',       cls: 'lvl-info' },
  { time: '14:22:06', level: 'INFO',    mod: 'voice',    msg: 'faster-whisper large-v3 загружен (GPU int8, 1.4s)',        cls: 'lvl-info' },
  { time: '14:22:06', level: 'INFO',    mod: 'wakeword', msg: 'Wake word "Пури" активирован (CPU поток)',                 cls: 'lvl-info' },
  { time: '14:22:07', level: 'SUCCESS', mod: 'tts',      msg: 'XTTS v2 инициализирован, voice_sample.wav загружен',      cls: 'lvl-success' },
  { time: '14:22:08', level: 'INFO',    mod: 'monitor',  msg: 'Системный монитор запущен (CPU >85%, RAM >90%)',           cls: 'lvl-info' },
  { time: '15:41:10', level: 'INFO',    mod: 'wakeword', msg: 'Wake word обнаружен → активация записи',                  cls: 'lvl-info' },
  { time: '15:41:13', level: 'INFO',    mod: 'voice',    msg: 'STT: "Пури, сделай погромче" — 247ms',                    cls: 'lvl-info' },
  { time: '15:41:13', level: 'DEBUG',   mod: 'ai',       msg: 'Ollama tool call → set_volume_relative(delta=+15)',        cls: 'lvl-debug' },
  { time: '15:41:14', level: 'SUCCESS', mod: 'media',    msg: 'Громкость: 57% → 72%',                                    cls: 'lvl-success' },
  { time: '16:12:30', level: 'INFO',    mod: 'bot',      msg: 'Telegram: входящее сообщение "скриншот"',                  cls: 'lvl-info' },
  { time: '16:12:31', level: 'DEBUG',   mod: 'ai',       msg: 'Ollama tool call → take_screenshot()',                     cls: 'lvl-debug' },
  { time: '16:12:32', level: 'SUCCESS', mod: 'system',   msg: 'Скриншот отправлен в Telegram (1.2 MB)',                   cls: 'lvl-success' },
  { time: '16:15:44', level: 'INFO',    mod: 'bot',      msg: 'Telegram: "какая погода в Москве?"',                       cls: 'lvl-info' },
  { time: '16:15:44', level: 'DEBUG',   mod: 'ai',       msg: 'Ollama tool call → web_search("погода Москва")',           cls: 'lvl-debug' },
  { time: '16:15:46', level: 'SUCCESS', mod: 'ai',       msg: 'Ответ отправлен (142 токена, 1.8s)',                       cls: 'lvl-success' },
  { time: '16:21:08', level: 'INFO',    mod: 'voice',    msg: 'Ctrl зажат → запись начата',                               cls: 'lvl-info' },
  { time: '16:21:10', level: 'INFO',    mod: 'voice',    msg: 'STT: "открой Discord" — 189ms',                           cls: 'lvl-info' },
  { time: '16:21:10', level: 'DEBUG',   mod: 'ai',       msg: 'Ollama tool call → open_app("Discord")',                   cls: 'lvl-debug' },
  { time: '16:21:11', level: 'SUCCESS', mod: 'programs', msg: 'Discord запущен',                                          cls: 'lvl-success' },
  { time: '16:38:02', level: 'INFO',    mod: 'bot',      msg: 'Telegram: "скриншот"',                                     cls: 'lvl-info' },
  { time: '16:38:03', level: 'SUCCESS', mod: 'system',   msg: 'Скриншот отправлен в Telegram (1.4 MB)',                   cls: 'lvl-success' },
  { time: '16:42:15', level: 'INFO',    mod: 'wakeword', msg: 'Wake word обнаружен → активация записи',                  cls: 'lvl-info' },
  { time: '16:42:18', level: 'INFO',    mod: 'voice',    msg: 'STT: "Пури, сделай погромче" — 232ms',                    cls: 'lvl-info' },
  { time: '16:42:18', level: 'DEBUG',   mod: 'ai',       msg: 'Ollama tool call → set_volume_relative(delta=+10)',        cls: 'lvl-debug' },
  { time: '16:42:19', level: 'SUCCESS', mod: 'media',    msg: 'Громкость: 72% → 82%',                                    cls: 'lvl-success' },
];

let logFilter = null;
let logPoller = null;
let logAutoScroll = true;

function logsPage() {
  return {
    init() {
      const viewer = document.getElementById('log-viewer');
      if (!viewer || viewer.dataset.populated) return;
      viewer.dataset.populated = '1';
      SAMPLE_LOGS.forEach(l => appendLogLine(viewer, l));
      viewer.scrollTop = viewer.scrollHeight;
      viewer.addEventListener('scroll', () => {
        const atBottom = viewer.scrollHeight - viewer.scrollTop - viewer.clientHeight < 100;
        logAutoScroll = atBottom;
      }, { passive: true });
      clearInterval(logPoller);
      logPoller = setInterval(pollLogs, 3000);

      // Search
      document.querySelector('.log-search-input')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        viewer.querySelectorAll('.log-line').forEach(line => {
          const msg = line.querySelector('.log-msg')?.textContent.toLowerCase() || '';
          const mod = line.querySelector('.log-mod')?.textContent.toLowerCase() || '';
          line.style.display = (msg.includes(q) || mod.includes(q)) ? '' : 'none';
        });
      });
    }
  };
}

function appendLogLine(viewer, log) {
  const line = document.createElement('div');
  line.className = `log-line ${log.cls}`;
  line.dataset.level = log.level.toLowerCase();
  line.innerHTML = `<span class="log-time">${log.time}</span><span class="log-level">${log.level}</span><span class="log-mod">${log.mod}</span><span class="log-msg">${escHtml(log.msg)}</span>`;
  viewer.appendChild(line);
  if (logFilter) line.style.display = line.dataset.level === logFilter ? '' : 'none';
  return line;
}

function parseLogLine(raw) {
  // Format: "2024-01-01 12:00:00 | LEVEL    | module:line — message"
  const parts = raw.split(' | ');
  if (parts.length < 3) return { time: raw, level: 'DEBUG', mod: '', msg: raw, cls: 'lvl-debug' };
  const time = parts[0].trim().substring(11, 19); // HH:mm:ss
  const level = parts[1].trim();
  const rest = parts.slice(2).join(' | ');
  const dashIdx = rest.indexOf(' \u2014 ');
  const mod = dashIdx >= 0 ? rest.substring(0, dashIdx).trim() : '';
  const msg = dashIdx >= 0 ? rest.substring(dashIdx + 3) : rest;
  const levelMap = { INFO: 'lvl-info', ERROR: 'lvl-error', WARNING: 'lvl-warn', WARN: 'lvl-warn', DEBUG: 'lvl-debug', SUCCESS: 'lvl-success', CRITICAL: 'lvl-error' };
  const cls = levelMap[level] || 'lvl-debug';
  return { time, level, mod, msg, cls };
}

async function pollLogs() {
  try {
    const logs = await API.getLogs(logFilter, 50);
    if (!logs.length) return;
    const viewer = document.getElementById('log-viewer');
    if (!viewer) return;
    logs.forEach(raw => appendLogLine(viewer, typeof raw === 'string' ? parseLogLine(raw) : raw));
    if (logAutoScroll) viewer.scrollTop = viewer.scrollHeight;
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.log-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = btn.dataset.level;
      if (logFilter === lvl) {
        logFilter = null;
        document.querySelectorAll('.log-filter-btn').forEach(b => b.className = 'log-filter-btn');
      } else {
        logFilter = lvl;
        document.querySelectorAll('.log-filter-btn').forEach(b => b.className = 'log-filter-btn');
        btn.classList.add('active-' + lvl);
      }
      document.querySelectorAll('#log-viewer .log-line').forEach(l => {
        l.style.display = !logFilter ? '' : l.dataset.level === logFilter ? '' : 'none';
      });
    });
  });

  document.getElementById('logs-clear-btn')?.addEventListener('click', () => {
    const v = document.getElementById('log-viewer');
    if (v) { v.innerHTML = ''; v.dataset.populated = ''; }
    showToast('Логи очищены');
  });
});

// ── Settings ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Only load once (when settings page first shows)
  let settingsLoaded = false;
  let _settingsDirty = false;

  async function loadSettings() {
    if (settingsLoaded) return;
    settingsLoaded = true;
    try {
      const s = await API.getSettings();
      setVal('settings-city',        s.city);
      setCheck('settings-autostart', s.autostart);
      setCheck('settings-analytics', s.analytics_enabled);
      _settingsDirty = false;
      document.getElementById('page-settings')?.addEventListener('input', () => { _settingsDirty = true; }, { once: false });
    } catch {}
  }

  // Observe settings page becoming active
  const observer = new MutationObserver(() => {
    const s = document.getElementById('page-settings');
    if (s && s.classList.contains('active')) loadSettings();
  });
  const settings = document.getElementById('page-settings');
  if (settings) observer.observe(settings, { attributes: true, attributeFilter: ['class'] });

  document.getElementById('export-config-btn')?.addEventListener('click', async () => {
    try {
      const r = await API.exportConfig();
      showToast('Экспортировано: ' + r.path, 'success');
    } catch { showToast('Ошибка экспорта', 'error'); }
  });

  document.getElementById('import-config-btn')?.addEventListener('click', () => {
    const fi = document.createElement('input');
    fi.type = 'file'; fi.accept = '.json'; fi.style.display = 'none';
    document.body.appendChild(fi); fi.click();
    fi.onchange = async () => {
      if (fi.files[0]) {
        await API.importConfig(fi.files[0].path || fi.files[0].name).catch(() => {});
        showToast('Настройки импортированы', 'success');
        settingsLoaded = false;
        loadSettings();
      }
      fi.remove();
    };
  });

  // ── Auto-save helpers (debounced) ──────────────────────────────────
  let _autoSaveTimer = null;
  function _debounce(fn, ms = 600) {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(fn, ms);
  }

  window.autoSaveGeneral = () => _debounce(async () => {
    const data = {
      city:              getVal('settings-city'),
      autostart:         getCheck('settings-autostart'),
      analytics_enabled: getCheck('settings-analytics'),
    };
    await API.saveSettings(data).catch(() => {});
  });

  window.autoSaveBot = () => _debounce(async () => {
    const token  = document.getElementById('bot-token-input')?.value.trim() || '';
    const chatId = document.getElementById('bot-chatid-input')?.value.trim() || '';
    const data = {
      telegram_token: token,
      chat_ids:       chatId ? [parseInt(chatId)] : [],
      del_delay:      parseInt(getVal('settings-del-delay')) || 0,
    };
    await API.saveSettings(data).catch(() => {});
  });

  window.autoSaveAI = () => _debounce(async () => {
    const provider = getVal('chat-ai-provider') || 'custom';
    const data = {
      ai_provider:         provider,
      custom_api_url:      getVal('chat-custom-url'),
      custom_api_key:      getVal('chat-custom-key'),
      custom_api_model:    getVal('chat-custom-model'),
      ollama_url:          getVal('chat-ollama-url'),
      ollama_model:        getVal('chat-ollama-model'),
      ollama_vision_model: getVal('chat-ollama-vision'),
      ai_tool_use_enabled: getCheck('chat-tool-use'),
      web_search_enabled:  getCheck('chat-web-search'),
    };
    await API.saveSettings(data).catch(() => {});
  });
});

// Chat page AI provider segment control
function chatSetProvider(val) {
  if (val === 'groq') val = 'custom'; // migrate old setting
  document.getElementById('chat-ai-provider').value = val;
  document.querySelectorAll('#chat-provider-seg .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === val);
  });
  const custom = document.getElementById('chat-custom-section');
  const ollama = document.getElementById('chat-ollama-section');
  if (custom) custom.style.display = val === 'custom' ? '' : 'none';
  if (ollama) ollama.style.display = val === 'ollama' ? '' : 'none';
  autoSaveAI();
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#chat-provider-seg .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => chatSetProvider(btn.dataset.val));
  });
});

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}
function getVal(id) { return document.getElementById(id)?.value || ''; }
function getCheck(id) { return !!(document.getElementById(id)?.checked); }

// ── Bot page ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // ── Bot page handlers ────────────────────────────────────────────
  document.getElementById('token-eye')?.addEventListener('click', () => {
    const inp = document.getElementById('bot-token-input');
    if (!inp) return;
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    document.getElementById('token-eye').innerHTML = isPass ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  });

  document.getElementById('verify-token-btn')?.addEventListener('click', async () => {
    const token = document.getElementById('bot-token-input')?.value.trim();
    if (!token) return;
    const btn = document.getElementById('verify-token-btn');
    const res = document.getElementById('verify-result');
    btn.disabled = true; btn.textContent = '...';
    try {
      const r = await API.verifyToken(token);
      if (r.ok) { res.className = 'ob-verify success'; res.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> ${r.bot_name}`; }
      else       { res.className = 'ob-verify error';   res.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ' + (r.error || 'Неверный токен'); }
      res.classList.remove('hidden');
    } catch {
      res.className = 'ob-verify error'; res.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Нет соединения'; res.classList.remove('hidden');
    } finally { btn.disabled = false; btn.textContent = 'Проверить'; }
  });

  document.getElementById('test-chatid-btn')?.addEventListener('click', async () => {
    const chatId = document.getElementById('bot-chatid-input')?.value.trim();
    const token  = document.getElementById('bot-token-input')?.value.trim();
    if (!chatId) { showToast('Введите Chat ID', 'error'); return; }
    if (token) {
      const start = await API.startBot(token, [chatId]).catch(() => ({ ok: false }));
      if (!start.ok && !start.error?.includes('уже запущен')) { showToast('Сначала запустите бота', 'error'); return; }
    }
    const r = await API.sendTestMessage(chatId).catch(() => ({ ok: false }));
    if (r.ok) showToast('Тестовое сообщение отправлено', 'success');
    else showToast('Ошибка: ' + (r.error || 'бот не запущен'), 'error');
  });

});

// ── Favorites Grid ─────────────────────────────────────────────────
function favoritesGrid() {
  return {
    slots: JSON.parse(localStorage.getItem('puri_favorites') || '["","","","","","","",""]'),

    save() {
      localStorage.setItem('puri_favorites', JSON.stringify(this.slots));
      API.saveSettings({ favorites: this.slots }).catch(() => {});
    },

    editSlot(i) {
      const cur = this.slots[i];
      const val = prompt(cur ? `Редактировать слот ${i+1}:` : `Название команды для слота ${i+1}:`, cur || '');
      if (val === null) return;
      this.slots[i] = val.trim();
      this.save();
      if (this.slots[i]) showToast(`Слот ${i+1}: "${this.slots[i]}"`, 'success');
    }
  };
}

// ── Tools Page (unified: cleaner + monitor + scheduler) ─────────────
function toolsPage() {
  return {
    tab: 'cleaner',

    // Cleaner
    tempRunning: false, tempResult: '',
    ramRunning: false, ramResult: '',
    startupLoading: false, startupPrograms: [],

    // Monitor
    monitorEnabled: false, notifWatcherEnabled: false,
    thresholds: { cpu: 85, ram: 85, disk: 90 },
    screenshotInterval: 0,

    // Scheduler
    tasks: [], newTask: { name: '', script: '', cron: '' },

    async init() {
      try {
        const s = await API.getSettings();
        this.monitorEnabled = !!s.monitor_enabled;
        this.notifWatcherEnabled = !!s.notification_watcher_enabled;
        if (s.monitor_cpu_threshold) this.thresholds.cpu = s.monitor_cpu_threshold;
        if (s.monitor_ram_threshold) this.thresholds.ram = s.monitor_ram_threshold;
        if (s.monitor_disk_threshold) this.thresholds.disk = s.monitor_disk_threshold;
        if (s.monitor_screenshot_interval != null) this.screenshotInterval = s.monitor_screenshot_interval;
      } catch {}
      await this.loadTasks();
    },

    // Cleaner methods
    async cleanTemp() {
      this.tempRunning = true; this.tempResult = '';
      try {
        const r = await API.cleanTemp();
        if (r.ok) this.tempResult = `Удалено ${r.deleted} файлов (${r.freed_mb} MB)`;
        else this.tempResult = r.error || 'Ошибка';
        showToast('Temp очищен', 'success');
      } catch (e) { this.tempResult = 'Ошибка'; showToast('Ошибка', 'error'); }
      this.tempRunning = false;
    },
    async flushRam() {
      this.ramRunning = true; this.ramResult = '';
      try {
        const r = await API.flushRam();
        if (r.ok) this.ramResult = `Доступно ${r.available_mb} MB`;
        else this.ramResult = r.error || 'Ошибка';
        showToast('RAM очищена', 'success');
      } catch (e) { this.ramResult = 'Ошибка'; showToast('Ошибка', 'error'); }
      this.ramRunning = false;
    },
    async loadStartup() {
      this.startupLoading = true;
      try { this.startupPrograms = await API.getStartupPrograms() || []; } catch {}
      this.startupLoading = false;
    },
    async removeStartup(name, hive, key) {
      if (!confirm('Убрать "' + name + '" из автозагрузки?')) return;
      try { await API.removeStartupProgram(name, hive, key); showToast('Удалено', 'success'); await this.loadStartup(); }
      catch (e) { showToast('Ошибка', 'error'); }
    },

    // Monitor methods
    async toggleMonitor() {
      try { await API.toggleMonitor(this.monitorEnabled); showToast(this.monitorEnabled ? 'Монитор ВКЛ' : 'Монитор ВЫКЛ', 'success'); }
      catch (e) { showToast('Ошибка', 'error'); }
    },
    async toggleNotifWatcher() {
      try { await API.toggleNotifWatcher(this.notifWatcherEnabled); showToast(this.notifWatcherEnabled ? 'Уведомления ВКЛ' : 'Уведомления ВЫКЛ', 'success'); }
      catch (e) { showToast('Ошибка', 'error'); }
    },
    async saveThresholds() {
      try { await API.saveSettings({
        monitor_cpu_threshold: parseInt(this.thresholds.cpu),
        monitor_ram_threshold: parseInt(this.thresholds.ram),
        monitor_disk_threshold: parseInt(this.thresholds.disk),
        monitor_screenshot_interval: parseInt(this.screenshotInterval),
      }); } catch {}
    },

    // Scheduler methods
    async loadTasks() { try { this.tasks = await API.getScheduledTasks() || []; } catch {} },
    async addTask() {
      const { name, script, cron } = this.newTask;
      if (!name.trim() || !script.trim() || !cron.trim()) return;
      try { await API.addScheduledTask(name.trim(), script.trim(), cron.trim()); showToast('Задача добавлена', 'success'); this.newTask = { name: '', script: '', cron: '' }; await this.loadTasks(); }
      catch (e) { showToast('Ошибка', 'error'); }
    },
    async removeTask(name) {
      if (!confirm('Удалить "' + name + '"?')) return;
      try { await API.removeScheduledTask(name); showToast('Удалено', 'success'); await this.loadTasks(); }
      catch (e) { showToast('Ошибка', 'error'); }
    },
    async toggleTask(name, enabled) {
      try { await API.toggleScheduledTask(name, enabled); } catch (e) { showToast('Ошибка', 'error'); }
    },
  };
}


// ── App init ───────────────────────────────────────────────────────
(function init() {
  const isFirst = !localStorage.getItem('purify_onboarding_done');
  if (isFirst) {
    document.getElementById('onboarding-overlay')?.classList.remove('hidden');
    document.getElementById('app')?.classList.add('hidden');
  } else {
    document.getElementById('onboarding-overlay')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
  }
})();

