/**
 * bridge.js — Python API Bridge
 *
 * In production: pywebview exposes window.pywebview.api.METHOD()
 * which is the real Python Api class from main.py.
 *
 * For standalone browser preview only — stubs with realistic mock data.
 * In pywebview this file is loaded first, then window.pywebview.api
 * is available and used directly (see API proxy below).
 */

// ── API proxy: use real pywebview bridge when available ───────────────
window.API = new Proxy({}, {
  get(_, method) {
    return async (...args) => {
      if (window.pywebview && window.pywebview.api && window.pywebview.api[method]) {
        return window.pywebview.api[method](...args);
      }
      // Fallback to stubs (browser preview mode)
      if (window._STUBS && window._STUBS[method]) {
        return window._STUBS[method](...args);
      }
      console.warn(`[bridge] no stub for: ${method}`);
      return { ok: false, error: `Not implemented: ${method}` };
    };
  }
});

// ── Demo album cover (SVG → data URI) ───────────────────────────────
const _DEMO_COVER = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a0533"/>
        <stop offset="50%" stop-color="#2d1b69"/>
        <stop offset="100%" stop-color="#0f0a1e"/>
      </linearGradient>
      <radialGradient id="glow" cx="35%" cy="40%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
        <stop offset="60%" stop-color="#7c3aed" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <radialGradient id="glow2" cx="70%" cy="65%">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.35"/>
        <stop offset="70%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="300" height="300" fill="url(#bg)"/>
    <rect width="300" height="300" fill="url(#glow)"/>
    <rect width="300" height="300" fill="url(#glow2)"/>
    <circle cx="90" cy="110" r="60" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.2)" stroke-width="1"/>
    <circle cx="200" cy="190" r="45" fill="rgba(236,72,153,0.1)" stroke="rgba(236,72,153,0.15)" stroke-width="1"/>
    <circle cx="150" cy="150" r="25" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
    <text x="150" y="138" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="22" fill="#e9d5ff" letter-spacing="3">NXVR</text>
    <text x="150" y="164" text-anchor="middle" font-family="Inter,sans-serif" font-weight="300" font-size="11" fill="rgba(196,181,253,0.7)" letter-spacing="5">HORIZONS</text>
    <line x1="105" y1="148" x2="195" y2="148" stroke="rgba(168,85,247,0.3)" stroke-width="0.5"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
})();

// ── Stubs (browser preview only) ──────────────────────────────────────
window._STUBS = {
  // System
  async getStats() {
    return {
      cpu: Math.floor(Math.random() * 15) + 18,
      ram_used: parseFloat((10.2 + Math.random() * 0.4).toFixed(1)),
      ram_total: 32,
      volume: 72,
      bot_online: true,
      bot_name: '@purify_control_bot',
      uptime: '4ч 37м',
      disk_used: 847,
      disk_total: 1024,
      net_down: (1.2 + Math.random() * 3).toFixed(1) + ' MB/s',
      net_up: (0.1 + Math.random() * 0.8).toFixed(1) + ' MB/s',
    };
  },

  async getMediaStatus() {
    return { track: 'Horizons', artist: 'NXVR', status: 'playing', position: 127, duration: 243 };
  },

  async getMediaThumbnail() {
    return { art: _DEMO_COVER };
  },

  async getRecentCommands() {
    return [
      { icon: '🎤', text: '"Пури, сделай погромче"',          source: 'Wake word', time: '16:42', ok: true },
      { icon: '💬', text: 'скриншот',                          source: 'Telegram',  time: '16:38', ok: true },
      { icon: '🎤', text: '"открой Discord"',                  source: 'Голос',     time: '16:21', ok: true },
      { icon: '💬', text: '"какая погода в Москве?"',          source: 'Telegram',  time: '16:15', ok: true },
      { icon: '🎤', text: '"поставь таймер на 30 минут"',     source: 'Голос',     time: '15:58', ok: true },
    ];
  },

  // Bot
  async startBot(token, chatIds) { return { ok: true, bot_name: '@purify_control_bot', bot_id: 7216459830 }; },
  async stopBot()                { return { ok: true }; },
  async verifyToken(token)       { return { ok: true, bot_name: '@purify_control_bot', bot_id: 7216459830 }; },
  async sendTestMessage(chatId)  { return { ok: true }; },
  async getBotInfo()             { return { ok: true, username: 'purify_control_bot', name: 'Purify', avatar: null }; },

  // AI Chat
  async sendChatMessage(text, imagePath) {
    const replies = {
      'default': 'Готово! Чем ещё могу помочь?',
    };
    return { reply: replies.default, tool_call: null };
  },
  async getChatHistory() {
    return [
      { role: 'user', text: 'Какая сейчас загрузка процессора?', time: '16:10' },
      { role: 'bot',  text: 'CPU загружен на 24%. Всё в норме, нагрузка минимальная.', time: '16:10', tool: 'get_system_stats()' },
      { role: 'user', text: 'Сделай скриншот и покажи', time: '16:12' },
      { role: 'bot',  text: 'Скриншот готов!', time: '16:12', tool: 'take_screenshot()', image: 'screenshot.png' },
      { role: 'user', text: 'Поставь громкость на 60', time: '16:14' },
      { role: 'bot',  text: 'Громкость установлена на 60%.', time: '16:14', tool: 'set_volume(60)' },
      { role: 'user', text: 'Кто тебя создал?', time: '16:20' },
      { role: 'bot',  text: 'Меня создал Purple — подписывайся на канал @jarvispurple, там все обновления, гайды и ранний доступ к новым фичам. Без него меня бы не существовало!', time: '16:20' },
    ];
  },
  async clearChatHistory() { return { ok: true }; },

  // Actions
  async setVolume(value) { return { ok: true, volume: value }; },
  async muteToggle()     { return { ok: true }; },
  async mediaPlay()      { return { ok: true }; },
  async mediaPause()     { return { ok: true }; },
  async mediaNext()      { return { ok: true }; },
  async mediaPrev()      { return { ok: true }; },
  async takeScreenshot() { return { ok: true, path: 'screenshot.png' }; },

  // Programs
  async getPrograms() {
    return [
      { name: 'Google Chrome',  path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',          icon: '🌐' },
      { name: 'VS Code',        path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', icon: '💻' },
      { name: 'Telegram',       path: 'C:\\Users\\User\\AppData\\Roaming\\Telegram Desktop\\Telegram.exe',  icon: '✈️' },
      { name: 'Discord',        path: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9176\\Discord.exe', icon: '🎮' },
      { name: 'Spotify',        path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe',            icon: '🎵' },
      { name: 'Steam',          path: 'C:\\Program Files (x86)\\Steam\\steam.exe',                          icon: '🎮' },
      { name: 'OBS Studio',     path: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe',               icon: '📹' },
    ];
  },
  async addProgram(name, path, icon) { return { ok: true }; },
  async removeProgram(name)          { return { ok: true }; },
  async runProgram(name)             { return { ok: true }; },

  // Scripts
  async getScripts() {
    return [
      { name: 'Рабочее место',   steps: ['Google Chrome', 'VS Code', 'Telegram', 'Discord'], in_bot: true },
      { name: 'Стрим',           steps: ['OBS Studio', 'Spotify', 'Discord'],                 in_bot: true },
      { name: 'Ночной режим',    steps: [],                                                   in_bot: true },
    ];
  },
  async runScript(name)              { return { ok: true }; },
  async addScript(name, steps, inBot){ return { ok: true }; },
  async removeScript(name)           { return { ok: true }; },

  // Mic mute
  async setMicMute(muted) { return { ok: true, muted }; },
  async getMicMute()       { return { ok: true, muted: false }; },

  // Voice
  async getVoiceSettings() {
    return {
      hotkey: 'ctrl',
      wake_word_enabled: true,
      tts_enabled: true,
      silence_mode: false,
      tts_voice: 'male',
      tts_volume: 80,
    };
  },
  async saveVoiceSettings(data) { return { ok: true }; },
  async getRunningProcesses() {
    return ['chrome.exe (PID 4528)', 'Code.exe (PID 7340)', 'Discord.exe (PID 9216)', 'Telegram.exe (PID 3184)', 'Spotify.exe (PID 5872)', 'obs64.exe (PID 11024)'];
  },

  // Logs
  async getLogs(level, limit) { return []; },

  // Settings (full config — each page reads what it needs)
  async getSettings() {
    return {
      ai_provider: 'ollama',
      groq_api_key: '',
      ollama_url: 'http://localhost:11434',
      ollama_model: 'qwen2.5:3b',
      ollama_vision_model: 'llava',
      ai_tool_use_enabled: true,
      web_search_enabled: true,
      telegram_token: '',
      chat_ids: [],
      del_delay: 5,
      city: 'Москва',
      autostart: true,
      analytics_enabled: true,
    };
  },
  async saveSettings(data) { return { ok: true }; },
  async exportConfig()     { return { ok: true, path: 'puri_backup.json' }; },
  async importConfig(path) { return { ok: true }; },

  // License
  async checkLicense() { return { valid: true, plan: 'paid', days_left: 340 }; },

  // Window controls (noop in browser)
  minimize() {},
  hide()     {},
  close()    {},

  // ── New features stubs ──────────────────────────────────────────────
  // Action Logger / Stats
  async getActionLogs(limit) { return []; },
  async clearActionLogs() { return { ok: true }; },
  async getUsageStats() { return { commands_today: 23, ai_today: 14, screenshots_today: 6, total_commands: 1847 }; },

  // Battery / GPU
  async getBatteryInfo() { return { ok: true, present: false, status: 'Нет батареи' }; },
  async getGpuInfo() { return { ok: true, name: 'NVIDIA RTX 4060', load: 12, vram_mb: 8192, temp: 48 }; },

  // Cleaner
  async cleanTemp() { return { ok: true, deleted: 127, freed_mb: 1340 }; },
  async flushRam() { return { ok: true, available_mb: 18432 }; },
  async getStartupPrograms() {
    return [
      { name: 'Discord', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe', hive: 'HKCU', key: 'Discord' },
      { name: 'Spotify', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe /minimized', hive: 'HKCU', key: 'Spotify' },
      { name: 'Steam',   path: '"C:\\Program Files (x86)\\Steam\\steam.exe" /silent', hive: 'HKCU', key: 'Steam' },
    ];
  },
  async removeStartupProgram(name, hive, key) { return { ok: true }; },

  // Macros
  async getMacros() {
    return [
      { name: 'Скриншот области', keys: ['win', 'shift', 's'] },
      { name: 'Диспетчер задач',  keys: ['ctrl', 'shift', 'escape'] },
    ];
  },
  async addMacro(name, keys) { return { ok: true }; },
  async removeMacro(name) { return { ok: true }; },
  async runMacro(name) { return { ok: true }; },

  // Terminal
  async runCommand(cmd) { return { ok: true, output: `> ${cmd}\nКоманда выполнена успешно.`, returncode: 0 }; },

  // Explorer
  async listDrives() {
    return [
      { device: 'C:\\', mountpoint: 'C:\\', total_gb: 476, free_gb: 129 },
      { device: 'D:\\', mountpoint: 'D:\\', total_gb: 931, free_gb: 412 },
    ];
  },
  async listDirectory(path, page) {
    return {
      ok: true,
      items: [
        { name: 'Documents',  is_dir: true,  size: 0,          modified: '2026-03-20 14:30' },
        { name: 'Downloads',  is_dir: true,  size: 0,          modified: '2026-03-22 09:15' },
        { name: 'Desktop',    is_dir: true,  size: 0,          modified: '2026-03-22 16:40' },
        { name: 'report.pdf', is_dir: false, size: 2_450_000,  modified: '2026-03-21 11:20' },
        { name: 'notes.txt',  is_dir: false, size: 3_200,      modified: '2026-03-22 10:05' },
      ],
      page: 1,
      total_pages: 1,
    };
  },
  async deleteFile(path) { return { ok: true }; },

  // Scheduler
  async getScheduledTasks() {
    return [
      { name: 'Очистка кеша', script: 'cleanTemp', cron: '0 3 * * *', enabled: true },
      { name: 'Бэкап настроек', script: 'exportConfig', cron: '0 12 * * 0', enabled: true },
    ];
  },
  async addScheduledTask(name, script, cron) { return { ok: true }; },
  async removeScheduledTask(name) { return { ok: true }; },
  async toggleScheduledTask(name, enabled) { return { ok: true }; },

  // Monitor
  async toggleMonitor(enabled) { return { ok: true }; },
  async toggleNotifWatcher(enabled) { return { ok: true }; },

  // Remote Desktop
  async startRemoteDesktop(port) { return { ok: true, url: 'http://localhost:8765' }; },
  async stopRemoteDesktop() { return { ok: true }; },
  async getRemoteStatus() { return { running: false, url: '', port: 8765 }; },

  // Update
  async checkForUpdate() { return { available: false }; },
  async downloadUpdate(url) { return { ok: true }; },

  // Input
  async getClipboard() { return { ok: true, text: 'https://github.com/example/project' }; },
  async setClipboard(text) { return { ok: true }; },
  async typeText(text) { return { ok: true }; },
  async pressKey(combo) { return { ok: true }; },
};

console.log('[bridge] loaded — pywebview:', !!(window.pywebview && window.pywebview.api));
