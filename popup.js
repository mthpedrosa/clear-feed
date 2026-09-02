const AVG_REEL_TIME_SECONDS = 30;

const CONFIG_KEYS = {
  'yt-shorts': 'blockYoutubeShorts',
  'yt-comments': 'blockYoutubeComments',
  'yt-home': 'blockYoutubeHome',
  'yt-video-rec': 'blockYoutubeVideoRec',
  'ig-reels': 'blockInstagramReels',
  'fb-reels': 'blockFacebookReels',
  'fb-stories': 'blockFacebookStories'
};

let snoozeTimerInterval = null;

function formatTimeSaved(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function updateSnoozeTimerDisplay(snoozeUntil) {
  const snoozeControls = document.getElementById('snooze-controls');
  const snoozeActiveBox = document.getElementById('snooze-active-box');
  const snoozeTimerEl = document.getElementById('snooze-timer');

  if (snoozeTimerInterval) clearInterval(snoozeTimerInterval);

  if (snoozeUntil && snoozeUntil > Date.now()) {
    if (snoozeControls) snoozeControls.style.display = 'none';
    if (snoozeActiveBox) snoozeActiveBox.style.display = 'block';

    const tick = () => {
      const remainingMs = snoozeUntil - Date.now();
      if (remainingMs <= 0) {
        clearInterval(snoozeTimerInterval);
        chrome.storage.local.remove('snoozeUntil');
        if (snoozeControls) snoozeControls.style.display = 'flex';
        if (snoozeActiveBox) snoozeActiveBox.style.display = 'none';
        return;
      }
      const totalSec = Math.ceil(remainingMs / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (snoozeTimerEl) snoozeTimerEl.textContent = formatted;
    };

    tick();
    snoozeTimerInterval = setInterval(tick, 1000);
  } else {
    if (snoozeControls) snoozeControls.style.display = 'flex';
    if (snoozeActiveBox) snoozeActiveBox.style.display = 'none';
  }
}

function updateUI() {
  const storageKeys = Object.values(CONFIG_KEYS).concat([
    'totalBlocked',
    'statsByPlatform',
    'statsHistory',
    'installDate',
    'isPaidUser',
    'snoozeUntil',
    'focusScheduleEnabled',
    'focusStartTime',
    'focusEndTime',
    'focusDays'
  ]);

  chrome.storage.local.get(storageKeys, (result) => {
    const isPaidUser = result.isPaidUser === true;

    // 1. Tier Badge & Dev Toggle
    const tierBadgeEl = document.getElementById('tier-badge');
    const toggleProModeEl = document.getElementById('toggle-pro-mode');
    const upgradeBannerEl = document.getElementById('upgrade-banner');

    if (toggleProModeEl) toggleProModeEl.checked = isPaidUser;

    if (tierBadgeEl) {
      if (isPaidUser) {
        tierBadgeEl.textContent = chrome.i18n ? (chrome.i18n.getMessage('tierPro') || 'PRO') : 'PRO';
        tierBadgeEl.className = 'tier-badge pro';
      } else {
        tierBadgeEl.textContent = chrome.i18n ? (chrome.i18n.getMessage('tierFree') || 'FREE') : 'FREE';
        tierBadgeEl.className = 'tier-badge free';
      }
    }

    if (upgradeBannerEl) {
      upgradeBannerEl.style.display = isPaidUser ? 'none' : 'block';
    }

    // 2. Lock / Unlock PRO Feature Sections
    const snoozeContentEl = document.getElementById('snooze-content');
    const focusContentEl = document.getElementById('focus-content');
    const tagSnoozePro = document.getElementById('tag-snooze-pro');
    const tagFocusPro = document.getElementById('tag-focus-pro');
    const tagStatsPro = document.getElementById('tag-stats-pro');

    if (isPaidUser) {
      if (snoozeContentEl) snoozeContentEl.classList.remove('pro-locked-mask');
      if (focusContentEl) focusContentEl.classList.remove('pro-locked-mask');
      if (tagSnoozePro) tagSnoozePro.style.display = 'none';
      if (tagFocusPro) tagFocusPro.style.display = 'none';
      if (tagStatsPro) tagStatsPro.style.display = 'none';
    } else {
      if (snoozeContentEl) snoozeContentEl.classList.add('pro-locked-mask');
      if (focusContentEl) focusContentEl.classList.add('pro-locked-mask');
      if (tagSnoozePro) tagSnoozePro.style.display = 'inline-block';
      if (tagFocusPro) tagFocusPro.style.display = 'inline-block';
      if (tagStatsPro) tagStatsPro.style.display = 'inline-block';
    }

    // 3. Load Standard Toggles
    Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
      const defaultTrue = ['blockYoutubeShorts', 'blockInstagramReels', 'blockFacebookReels'].includes(storageKey);
      const isEnabled = result[storageKey] !== undefined ? result[storageKey] : defaultTrue;
      const el = document.getElementById(elementId);
      if (el) el.checked = isEnabled;
    });

    // 4. Load Metrics
    const totalBlocked = result.totalBlocked || 0;
    const timeSavedSeconds = totalBlocked * AVG_REEL_TIME_SECONDS;

    const totalBlockedEl = document.getElementById('total-blocked');
    const timeSavedEl = document.getElementById('time-saved');

    if (totalBlockedEl) totalBlockedEl.textContent = totalBlocked.toLocaleString();
    if (timeSavedEl) timeSavedEl.textContent = formatTimeSaved(timeSavedSeconds);

    // 5. Load Snooze Timer Status
    updateSnoozeTimerDisplay(result.snoozeUntil);

    // 6. Load Focus Schedule Status
    const focusEnabledEl = document.getElementById('focus-schedule-enabled');
    const startTimeEl = document.getElementById('focus-start-time');
    const endTimeEl = document.getElementById('focus-end-time');

    if (focusEnabledEl) focusEnabledEl.checked = result.focusScheduleEnabled === true;
    if (startTimeEl) startTimeEl.value = result.focusStartTime || "09:00";
    if (endTimeEl) endTimeEl.value = result.focusEndTime || "17:00";

    const activeDays = result.focusDays || [1, 2, 3, 4, 5];
    const dayButtons = document.querySelectorAll('.btn-day');
    dayButtons.forEach(btn => {
      const dayNum = parseInt(btn.getAttribute('data-day'), 10);
      if (activeDays.includes(dayNum)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 7. Render Analytics
    renderAnalyticsDashboard(result);
  });
}

function renderAnalyticsDashboard(result) {
  const statsByPlatform = result.statsByPlatform || { youtube: 0, instagram: 0, facebook: 0 };
  const total = (statsByPlatform.youtube || 0) + (statsByPlatform.instagram || 0) + (statsByPlatform.facebook || 0);

  const countYtEl = document.getElementById('stat-count-yt');
  const countIgEl = document.getElementById('stat-count-ig');
  const countFbEl = document.getElementById('stat-count-fb');

  const barYt = document.getElementById('bar-yt');
  const barIg = document.getElementById('bar-ig');
  const barFb = document.getElementById('bar-fb');

  const ytCount = statsByPlatform.youtube || 0;
  const igCount = statsByPlatform.instagram || 0;
  const fbCount = statsByPlatform.facebook || 0;

  if (countYtEl) countYtEl.textContent = ytCount.toLocaleString();
  if (countIgEl) countIgEl.textContent = igCount.toLocaleString();
  if (countFbEl) countFbEl.textContent = fbCount.toLocaleString();

  const maxVal = Math.max(total, 1);
  if (barYt) barYt.style.width = `${Math.round((ytCount / maxVal) * 100)}%`;
  if (barIg) barIg.style.width = `${Math.round((igCount / maxVal) * 100)}%`;
  if (barFb) barFb.style.width = `${Math.round((fbCount / maxVal) * 100)}%`;

  // Render History List (last 7 days)
  const historyContainer = document.getElementById('history-container');
  if (historyContainer) {
    historyContainer.innerHTML = '';
    const statsHistory = result.statsHistory || {};
    const dates = Object.keys(statsHistory).sort().reverse().slice(0, 7);

    if (dates.length === 0) {
      historyContainer.innerHTML = '<div style="color: #999; text-align: center; padding: 10px 0;">Nenhum dado registrado ainda.</div>';
    } else {
      dates.forEach(dateStr => {
        const dayStats = statsHistory[dateStr];
        const dayTotal = (dayStats.youtube || 0) + (dayStats.instagram || 0) + (dayStats.facebook || 0);

        const row = document.createElement('div');
        row.className = 'history-row';
        row.innerHTML = `
          <span>${dateStr}</span>
          <span style="font-weight: 600;">${dayTotal.toLocaleString()} itens</span>
        `;
        historyContainer.appendChild(row);
      });
    }
  }
}

function setupEventListeners() {
  // Toggle standard switches
  Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener('change', (e) => {
        chrome.storage.local.set({ [storageKey]: e.target.checked });
      });
    }
  });

  // Toggle Dev PRO Mode
  const toggleProModeEl = document.getElementById('toggle-pro-mode');
  if (toggleProModeEl) {
    toggleProModeEl.addEventListener('change', (e) => {
      chrome.storage.local.set({ isPaidUser: e.target.checked }, () => {
        updateUI();
      });
    });
  }

  // Upgrade Button Action
  const btnUpgradeAction = document.getElementById('btn-upgrade-action');
  if (btnUpgradeAction) {
    btnUpgradeAction.addEventListener('click', () => {
      // For dev/demo: Activate Pro mode
      chrome.storage.local.set({ isPaidUser: true }, () => {
        updateUI();
      });
    });
  }

  // Temporary Pause (Snooze) Buttons
  const snoozeButtons = document.querySelectorAll('.btn-snooze');
  snoozeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      chrome.storage.local.get(['isPaidUser'], (res) => {
        if (!res.isPaidUser) {
          alert("A Pausa Temporária é um recurso PRO!");
          return;
        }
        const minutes = parseInt(e.target.getAttribute('data-minutes'), 10) || 5;
        const snoozeUntil = Date.now() + minutes * 60 * 1000;

        chrome.storage.local.set({ snoozeUntil }, () => {
          if (chrome.alarms) {
            chrome.alarms.create('endSnooze', { when: snoozeUntil });
          }
          updateUI();
        });
      });
    });
  });

  // Resume Snooze Now Button
  const btnResumeNow = document.getElementById('btn-resume-now');
  if (btnResumeNow) {
    btnResumeNow.addEventListener('click', () => {
      if (chrome.alarms) {
        chrome.alarms.clear('endSnooze');
      }
      chrome.storage.local.remove('snoozeUntil', () => {
        updateUI();
      });
    });
  }

  // Focus Schedule Toggle & Inputs
  const focusEnabledEl = document.getElementById('focus-schedule-enabled');
  if (focusEnabledEl) {
    focusEnabledEl.addEventListener('change', (e) => {
      chrome.storage.local.get(['isPaidUser'], (res) => {
        if (!res.isPaidUser && e.target.checked) {
          alert("O Modo Foco Programado é um recurso PRO!");
          e.target.checked = false;
          return;
        }
        chrome.storage.local.set({ focusScheduleEnabled: e.target.checked });
      });
    });
  }

  const startTimeEl = document.getElementById('focus-start-time');
  if (startTimeEl) {
    startTimeEl.addEventListener('change', (e) => {
      chrome.storage.local.set({ focusStartTime: e.target.value });
    });
  }

  const endTimeEl = document.getElementById('focus-end-time');
  if (endTimeEl) {
    endTimeEl.addEventListener('change', (e) => {
      chrome.storage.local.set({ focusEndTime: e.target.value });
    });
  }

  // Day selector buttons
  const dayButtons = document.querySelectorAll('.btn-day');
  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chrome.storage.local.get(['isPaidUser', 'focusDays'], (res) => {
        if (!res.isPaidUser) {
          alert("O Modo Foco Programado é um recurso PRO!");
          return;
        }
        btn.classList.toggle('active');
        const activeDays = [];
        document.querySelectorAll('.btn-day.active').forEach(b => {
          activeDays.push(parseInt(b.getAttribute('data-day'), 10));
        });
        chrome.storage.local.set({ focusDays: activeDays });
      });
    });
  });

  // Analytics Dashboard Modal Controls
  const btnOpenStats = document.getElementById('btn-open-stats');
  const btnCloseStats = document.getElementById('btn-close-stats');
  const statsModal = document.getElementById('stats-modal');

  if (btnOpenStats && statsModal) {
    btnOpenStats.addEventListener('click', () => {
      chrome.storage.local.get(['isPaidUser'], (res) => {
        if (!res.isPaidUser) {
          if (confirm("Estatísticas Avançadas são um recurso PRO! Deseja ativar a demonstração PRO?")) {
            chrome.storage.local.set({ isPaidUser: true }, () => {
              updateUI();
              statsModal.classList.add('open');
            });
          }
          return;
        }
        statsModal.classList.add('open');
      });
    });
  }

  if (btnCloseStats && statsModal) {
    btnCloseStats.addEventListener('click', () => {
      statsModal.classList.remove('open');
    });
  }
}

function applyI18nTranslations() {
  if (!chrome || !chrome.i18n || !chrome.i18n.getMessage) return;

  const setI18nText = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.textContent = msg;
    }
  };

  setI18nText('lbl-dev-pro', 'toggleDevPro');
  setI18nText('lbl-snooze-title', 'snoozeTitle');
  setI18nText('btn-resume-now', 'btnResume');
  setI18nText('lbl-focus-title', 'focusTitle');
  setI18nText('lbl-focus-enable', 'focusEnable');
  setI18nText('lbl-btn-stats', 'statsTitle');
  setI18nText('lbl-stats-modal-title', 'statsModalTitle');
  setI18nText('msg-upgrade-banner', 'upgradeBanner');
  setI18nText('btn-upgrade-action', 'upgradeBtn');

  try {
    const affiliateEl = document.querySelector('.affiliate-message');
    if (affiliateEl) {
      const msg = chrome.i18n.getMessage('affiliateMessage');
      if (msg) affiliateEl.textContent = msg;
    }
  } catch (e) {
    // ignore
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  setupEventListeners();
  applyI18nTranslations();
});
