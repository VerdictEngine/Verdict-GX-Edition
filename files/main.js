/* ═══════════════════════════════════════════════════════
   VERDICT! GX — MAIN.JS
   Entry point: loading, menus, new game flow, screen wiring
   ═══════════════════════════════════════════════════════ */
'use strict';

// ── Boot ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  Main.boot();
});

const Main = {

  // ── Boot Sequence ─────────────────────────────────────
  boot() {
    // Init core systems
    ScreenManager.init();
    UI.initToasts();

    // Init canvas-based systems (non-blocking)
    try { Court.init(); } catch(e) { console.warn('Court init:', e); }

    // Wire up all screens
    this.wireMenuButtons();
    this.wireCreateScreen();
    this.wireDocketScreen();
    this.wireSkillsScreen();
    this.wireCareerScreen();
    this.wireContactsScreen();
    this.wireBackButtons();

    // Hub registers its own enter callback
    try { Hub.init(); } catch(e) { console.warn('Hub init:', e); }

    // Settings system
    try { Settings.init(); } catch(e) { console.warn('Settings init:', e); }

    // Start loading
    this.runLoadingSequence();
  },

  // ── Loading Sequence ──────────────────────────────────
  runLoadingSequence() {
    const fill = document.getElementById('loading-fill');
    const pct = document.getElementById('loading-percent');
    const flavor = document.getElementById('loading-flavor');

    const flavors = [
      'Summoning the jury...',
      'Reviewing case files...',
      'Pressing the suit...',
      'Briefing your client...',
      'Consulting precedents...',
      'Polishing the gavel...',
      'Preparing opening arguments...',
      'Reviewing the evidence...',
    ];

    let progress = 0;
    let flavorIdx = 0;

    // Animate loading canvas
    this.initLoadingCanvas();

    const tick = () => {
      const step = Util.randFloat(6, 18);
      progress = Math.min(100, progress + step);

      if (fill) fill.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';
      if (flavor && flavorIdx < flavors.length) {
        flavor.textContent = flavors[flavorIdx++];
      }

      if (progress < 100) {
        setTimeout(tick, Util.rand(250, 600));
      } else {
        // Loading done
        setTimeout(() => {
          this.showMenu();
        }, 600);
      }
    };

    setTimeout(tick, 400);
  },

  initLoadingCanvas() {
    const canvas = document.getElementById('loading-canvas');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    let tick = 0;
    const particles = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Util.randFloat(-0.3, 0.3),
        vy: Util.randFloat(-0.6, -0.1),
        size: Util.randFloat(1, 3),
        life: Math.random(),
        decay: Util.randFloat(0.002, 0.006),
        color: Math.random() > 0.5 ? '#c8a855' : '#ffffff',
      });
    }

    const loop = () => {
      if (!document.getElementById('screen-loading')?.classList.contains('active')) return;

      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial gradient background
      const grad = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width * 0.7
      );
      grad.addColorStop(0, 'rgba(30,22,10,1)');
      grad.addColorStop(0.6, 'rgba(10,8,5,1)');
      grad.addColorStop(1, 'rgba(5,4,2,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = Util.randFloat(0.5, 1.0);
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Subtle scales icon pulse
      const pulse = 0.9 + 0.1 * Math.sin(tick * 0.04);
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.font = `${canvas.height * 0.5 * pulse}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c8a855';
      ctx.fillText('⚖', canvas.width / 2, canvas.height / 2);
      ctx.restore();

      requestAnimationFrame(loop);
    };

    loop();
  },

  // ── Menu ──────────────────────────────────────────────
  showMenu() {
    ScreenManager.goTo('menu');
    this.initMenuCanvas();

    // Check for save
    if (Save.hasSaved()) {
      document.getElementById('btn-continue')?.classList.add('has-save');
    }
  },

  initMenuCanvas() {
    const canvas = document.getElementById('menu-canvas');
    if (!canvas) return;

    // Only initialise the 3-D scene once — JudgeScene runs its own rAF loop
    // and stays idle until JudgeScene.playCredits() is explicitly called.
    if (this._judgeSceneReady) return;
    this._judgeSceneReady = true;

    if (typeof JudgeScene !== 'undefined') {
      JudgeScene.init(canvas);
    } else {
      console.warn('JudgeScene not loaded — falling back to blank canvas.');
    }
  },

  // ── Menu Buttons ──────────────────────────────────────
  wireMenuButtons() {
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      if (Save.hasSaved()) {
        this.continueGame();
      } else {
        UI.toast('No Save Found', 'Start a new career first.', 'info');
      }
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      Settings.open();
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      if (typeof JudgeScene !== 'undefined') {
        JudgeScene.playCredits();
      }
    });
  },

  // ── New Game ──────────────────────────────────────────
  startNewGame() {
    // Reset player
    GameState.player = {
      firstName: 'Alex',
      lastName: 'Harmon',
      pronoun: 'they',
      age: 27,
      skinIndex: 0,
      hairIndex: 0,
      suitIndex: 0,
      specialty: null,
      backstory: null,
      rank: 0,
      rankTitle: 'Paralegal',
      money: 12000,
      reputation: 20,
      skill: 15,
      morale: 70,
      skillPoints: 3,
      casesWon: 0,
      casesLost: 0,
      totalEarned: 0,
      month: 0,
      contacts: [],
      skills: {},
      achievements: [],
      activeCase: null,
      docket: [],
      hoursSpent: 0,
      _winStreak: 0,
      _totalObjections: 0,
    };

    UI.initCreateScreen();
    ScreenManager.goTo('create');
  },

  continueGame() {
    if (Save.load()) {
      UI.toast('Welcome Back', `Resuming career of ${GameState.player.firstName} ${GameState.player.lastName}`, 'success');
      Hub.updateHUD();
      ScreenManager.goTo('hub');
    } else {
      UI.toast('Load Failed', 'Could not load save data.', 'danger');
    }
  },

  // ── Character Creation ────────────────────────────────
  wireCreateScreen() {
    ScreenManager.registerOnEnter('create', () => {
      UI.initCreateScreen();
    });
  },

  // ── Docket Screen ─────────────────────────────────────
  wireDocketScreen() {
    ScreenManager.registerOnEnter('docket', () => {
      UI.renderDocket();
    });

    document.getElementById('docket-back')?.addEventListener('click', () => {
      ScreenManager.goTo('hub');
    });
  },

  // ── Skills Screen ─────────────────────────────────────
  wireSkillsScreen() {
    ScreenManager.registerOnEnter('skills', () => {
      UI.renderSkillsScreen();
    });

    document.getElementById('skills-back')?.addEventListener('click', () => {
      ScreenManager.goTo('hub');
    });
  },

  // ── Career Screen ─────────────────────────────────────
  wireCareerScreen() {
    ScreenManager.registerOnEnter('career', () => {
      UI.renderCareerScreen();
    });

    document.getElementById('career-back')?.addEventListener('click', () => {
      ScreenManager.goTo('hub');
    });
  },

  // ── Contacts Screen ───────────────────────────────────
  wireContactsScreen() {
    ScreenManager.registerOnEnter('contacts', () => {
      UI.renderContactsScreen();
    });

    document.getElementById('contacts-back')?.addEventListener('click', () => {
      ScreenManager.goTo('hub');
    });
  },

  // ── Back Buttons (generic) ────────────────────────────
  wireBackButtons() {
    document.querySelectorAll('.back-btn[data-screen]').forEach(btn => {
      btn.addEventListener('click', () => {
        ScreenManager.goTo(btn.dataset.screen);
      });
    });

    // Casefile back
    document.getElementById('casefile-back')?.addEventListener('click', () => {
      ScreenManager.goTo('docket');
    });
  },
};

// ── Hub alias helpers ──────────────────────────────────────
// Hub buttons reference UI.renderContacts etc.
// Map shorter names used in hub.js
UI.renderCareer = function() { UI.renderCareerScreen(); };
UI.renderSkills = function() { UI.renderSkillsScreen(); };
UI.renderContacts = function() { UI.renderContactsScreen(); };
Main.beginCareer = function() {
  const p = GameState.player;
  const firstName = document.getElementById('char-first')?.value.trim() || p.firstName;
  const lastName  = document.getElementById('char-last')?.value.trim()  || p.lastName;
  if (firstName) p.firstName = firstName;
  if (lastName)  p.lastName  = lastName;

  if (!p.specialty)  { UI.toast('Missing', 'Choose a specialty first.', 'danger'); return; }
  if (!p.backstory)  { UI.toast('Missing', 'Choose a backstory first.', 'danger'); return; }

  p.rankTitle = DATA.CAREER_RANKS[0].title;

  // Generate starting docket
  for (let i = 0; i < 3; i++) {
    p.docket.push(DATA.generateCase(p.rank, p.specialty));
  }

  UI.toast('Career Started', `Welcome, ${p.firstName} ${p.lastName}. The courtroom awaits.`, 'success', 4000);
  Hub.updateHUD();
  ScreenManager.goTo('hub');
};
// ── Settings System ────────────────────────────────────────
const Settings = {
  DEFAULTS: {
    masterVol: 80,
    musicVol: 60,
    sfxVol: 80,
    mute: false,
    textSpeed: 'fast',
    screenShake: true,
    particles: true,
    reduceMotion: false,
    difficulty: 'normal',
    autosave: true,
    skipDialogue: false,
    hints: true,
  },

  _data: {},

  load() {
    try {
      const raw = localStorage.getItem('verdict_settings_v1');
      this._data = raw ? { ...this.DEFAULTS, ...JSON.parse(raw) } : { ...this.DEFAULTS };
    } catch(e) {
      this._data = { ...this.DEFAULTS };
    }
  },

  save() {
    try {
      localStorage.setItem('verdict_settings_v1', JSON.stringify(this._data));
    } catch(e) { console.warn('Settings save failed:', e); }
  },

  get(key) {
    return this._data[key] ?? this.DEFAULTS[key];
  },

  set(key, val) {
    this._data[key] = val;
  },

  reset() {
    this._data = { ...this.DEFAULTS };
    this._applyToDOM();
  },

  open() {
    this.load();
    this._applyToDOM();
    document.getElementById('overlay-settings').style.display = 'flex';
  },

  close() {
    document.getElementById('overlay-settings').style.display = 'none';
  },

  _applyToDOM() {
    // Sliders
    const sliders = [
      ['setting-master-vol', 'val-master-vol', 'masterVol'],
      ['setting-music-vol',  'val-music-vol',  'musicVol'],
      ['setting-sfx-vol',    'val-sfx-vol',    'sfxVol'],
    ];
    sliders.forEach(([sliderId, valId, key]) => {
      const el = document.getElementById(sliderId);
      const val = document.getElementById(valId);
      if (el) el.value = this.get(key);
      if (val) val.textContent = this.get(key) + '%';
    });

    // Toggles
    const toggles = [
      ['setting-mute',          'mute'],
      ['setting-screenshake',   'screenShake'],
      ['setting-particles',     'particles'],
      ['setting-reduce-motion', 'reduceMotion'],
      ['setting-autosave',      'autosave'],
      ['setting-skip-dialogue', 'skipDialogue'],
      ['setting-hints',         'hints'],
    ];
    toggles.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const on = this.get(key);
      el.dataset.on = on;
      el.textContent = on ? 'ON' : 'OFF';
      el.classList.toggle('toggle-on', on);
    });

    // Choice groups
    ['text-speed', 'difficulty'].forEach(group => {
      const key = group === 'text-speed' ? 'textSpeed' : 'difficulty';
      document.querySelectorAll(`[data-group="${group}"]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === this.get(key));
      });
    });
  },

  init() {
    this.load();

    // Sliders
    [
      ['setting-master-vol', 'val-master-vol', 'masterVol'],
      ['setting-music-vol',  'val-music-vol',  'musicVol'],
      ['setting-sfx-vol',    'val-sfx-vol',    'sfxVol'],
    ].forEach(([sliderId, valId, key]) => {
      const el = document.getElementById(sliderId);
      if (!el) return;
      el.addEventListener('input', () => {
        this.set(key, parseInt(el.value));
        const v = document.getElementById(valId);
        if (v) v.textContent = el.value + '%';
      });
    });

    // Toggles
    [
      ['setting-mute',          'mute'],
      ['setting-screenshake',   'screenShake'],
      ['setting-particles',     'particles'],
      ['setting-reduce-motion', 'reduceMotion'],
      ['setting-autosave',      'autosave'],
      ['setting-skip-dialogue', 'skipDialogue'],
      ['setting-hints',         'hints'],
    ].forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        const next = !this.get(key);
        this.set(key, next);
        el.dataset.on = next;
        el.textContent = next ? 'ON' : 'OFF';
        el.classList.toggle('toggle-on', next);
      });
    });

    // Choice groups
    document.querySelectorAll('.settings-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = group === 'text-speed' ? 'textSpeed' : 'difficulty';
        this.set(key, btn.dataset.val);
      });
    });

    // Close / Save / Reset
    document.getElementById('settings-close')?.addEventListener('click', () => {
      this.save();
      this.close();
    });
    document.getElementById('settings-save')?.addEventListener('click', () => {
      this.save();
      this.close();
      UI.toast('Settings Saved', 'Your preferences have been saved.', 'success');
    });
    document.getElementById('settings-reset')?.addEventListener('click', () => {
      this.reset();
      UI.toast('Settings Reset', 'All settings restored to defaults.', 'info');
    });

    // Click outside to close
    document.getElementById('overlay-settings')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('overlay-settings')) {
        this.save();
        this.close();
      }
    });
  },
};