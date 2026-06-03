/* ═══════════════════════════════════════════════════════
   VERDICT! GX — ENGINE.JS
   Core systems: State, Events, Screen management, Transitions
   ═══════════════════════════════════════════════════════ */
'use strict';

// ──────────────────────────────────────────────────────
//  GAME STATE (single source of truth)
// ──────────────────────────────────────────────────────
const GameState = {
  // Session
  currentScreen: 'loading',
  previousScreen: null,

  // Player
  player: {
    firstName: 'Alex',
    lastName: 'Harmon',
    pronoun: 'they',
    age: 27,
    skinIndex: 0,
    hairIndex: 0,
    suitIndex: 0,
    specialty: null,
    backstory: null,
    rank: 0,           // index into CAREER_RANKS
    rankTitle: 'Paralegal',
    money: 12000,
    reputation: 20,
    skill: 15,
    morale: 70,
    skillPoints: 3,
    casesWon: 0,
    casesLost: 0,
    totalEarned: 0,
    month: 0,          // months since start
    contacts: [],
    skills: {},        // skill_id → level
    achievements: [],  // achievement ids
    activeCase: null,
    docket: [],        // pending case objects
  },

  // Current Court Session
  court: {
    active: false,
    caseData: null,
    stageIndex: 0,
    dialogIndex: 0,
    dialogQueue: [],
    phase: 'dialog',   // 'dialog' | 'action' | 'objection' | 'verdict'
    juryMood: [],      // -2..2 per juror
    score: 0,
    maxScore: 0,
    evidenceUsed: [],
    day: 1,
    objectionUsed: false,
    turnCount: 0,
  },

  // Persistence flag
  hasSave: false,
};

// ──────────────────────────────────────────────────────
//  EVENT BUS (simple pub/sub)
// ──────────────────────────────────────────────────────
const Events = {
  _listeners: {},
  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  },
  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== cb);
  },
  emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  }
};

// ──────────────────────────────────────────────────────
//  SAVE / LOAD
// ──────────────────────────────────────────────────────
const Save = {
  KEY: 'verdict_gx_save_v1',
  save() {
    try {
      const data = {
        player: GameState.player,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.KEY, JSON.stringify(data));
      GameState.hasSave = true;
      UI.toast('Game Saved', 'Progress stored.', 'success');
    } catch(e) { console.warn('Save failed:', e); }
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.player) return false;
      Object.assign(GameState.player, data.player);
      GameState.hasSave = true;
      return true;
    } catch(e) { console.warn('Load failed:', e); return false; }
  },
  hasSaved() {
    return !!localStorage.getItem(this.KEY);
  },
  clear() {
    localStorage.removeItem(this.KEY);
    GameState.hasSave = false;
  }
};

// ──────────────────────────────────────────────────────
//  SCREEN MANAGER
// ──────────────────────────────────────────────────────
const ScreenManager = {
  wipe: null,
  _current: null,
  _callbacks: {},

  init() {
    this.wipe = document.getElementById('transition-wipe');
  },

  registerOnEnter(screenId, cb) {
    if (!this._callbacks[screenId]) this._callbacks[screenId] = [];
    this._callbacks[screenId].push(cb);
  },

  goTo(screenId, opts = {}) {
    const delay = opts.fast ? 0 : 200;
    const screens = document.querySelectorAll('.screen');

    // Fade out
    this.wipe.classList.add('wiping');

    setTimeout(() => {
      // Hide all
      screens.forEach(s => {
        s.classList.remove('active');
        s.style.display = '';
      });

      // Show target
      const target = document.getElementById('screen-' + screenId);
      if (target) {
        target.classList.add('active');
        GameState.previousScreen = GameState.currentScreen;
        GameState.currentScreen = screenId;

        // Fire callbacks
        (this._callbacks[screenId] || []).forEach(cb => cb(opts));
        Events.emit('screenChange', { from: GameState.previousScreen, to: screenId });
      }

      // Fade back in
      setTimeout(() => {
        this.wipe.classList.remove('wiping');
      }, delay);
    }, delay + 50);
  }
};

// ──────────────────────────────────────────────────────
//  MATH / UTIL
// ──────────────────────────────────────────────────────
const Util = {
  clamp: (n, min, max) => Math.min(Math.max(n, min), max),
  rand: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  randFloat: (min, max) => Math.random() * (max - min) + min,
  randItem: (arr) => arr[Math.floor(Math.random() * arr.length)],
  lerp: (a, b, t) => a + (b - a) * t,
  formatMoney: (n) => '$' + n.toLocaleString('en-US'),
  formatDate: (months) => {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return names[months % 12] + ' ' + (2025 + Math.floor(months / 12));
  },
  uid: () => Math.random().toString(36).slice(2, 10),
  capitalize: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  shuffle: (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Draw a pixel-art-style character sprite on canvas
  drawSprite(ctx, x, y, w, h, opts = {}) {
    const {
      skinColor = '#c8a87a',
      suitColor = '#1a1a2e',
      hairColor = '#2a1a00',
      facing = 'front',
      highlight = false,
      shadow = true
    } = opts;

    ctx.save();
    ctx.translate(x, y);

    // Shadow under character
    if (shadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(w/2, h - 4, w * 0.35, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Suit body
    const bodyW = w * 0.55;
    const bodyH = h * 0.48;
    const bodyX = (w - bodyW) / 2;
    const bodyY = h * 0.38;

    // Legs
    ctx.fillStyle = suitColor;
    const legW = bodyW * 0.38;
    ctx.fillRect(bodyX + bodyW * 0.08, bodyY + bodyH - 4, legW, h * 0.25);
    ctx.fillRect(bodyX + bodyW * 0.54, bodyY + bodyH - 4, legW, h * 0.25);

    // Shoes
    ctx.fillStyle = '#111';
    ctx.fillRect(bodyX + bodyW * 0.06, bodyY + bodyH + h * 0.21, legW + 4, 6);
    ctx.fillRect(bodyX + bodyW * 0.52, bodyY + bodyH + h * 0.21, legW + 4, 6);

    // Jacket body
    ctx.fillStyle = suitColor;
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

    // Shirt / tie
    ctx.fillStyle = '#f0f0ee';
    ctx.fillRect(bodyX + bodyW * 0.38, bodyY + 3, bodyW * 0.24, bodyH - 4);
    ctx.fillStyle = '#8a2020';
    ctx.fillRect(bodyX + bodyW * 0.44, bodyY + 4, bodyW * 0.12, bodyH * 0.7);

    // Lapels highlight
    ctx.fillStyle = Util.adjustColor(suitColor, 25);
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyW * 0.38, bodyY);
    ctx.lineTo(bodyX + bodyW * 0.2, bodyY + 10);
    ctx.lineTo(bodyX, bodyY + 5);
    ctx.lineTo(bodyX, bodyY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyW * 0.62, bodyY);
    ctx.lineTo(bodyX + bodyW * 0.8, bodyY + 10);
    ctx.lineTo(bodyX + bodyW, bodyY + 5);
    ctx.lineTo(bodyX + bodyW, bodyY);
    ctx.fill();

    // Arms
    ctx.fillStyle = suitColor;
    ctx.fillRect(bodyX - bodyW * 0.12, bodyY + 4, bodyW * 0.16, bodyH * 0.75);
    ctx.fillRect(bodyX + bodyW * 0.96, bodyY + 4, bodyW * 0.16, bodyH * 0.75);

    // Hands
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(bodyX - bodyW * 0.04, bodyY + 4 + bodyH * 0.75, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bodyX + bodyW * 1.04, bodyY + 4 + bodyH * 0.75, 5, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = skinColor;
    const headW = w * 0.32;
    const headH = h * 0.28;
    const headX = (w - headW) / 2;
    const headY = h * 0.08;
    ctx.fillRect(w/2 - 7, bodyY - 12, 14, 16);

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.roundRect(headX, headY, headW, headH, 8);
    ctx.fill();

    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.roundRect(headX - 2, headY - 4, headW + 4, headH * 0.45, [8, 8, 0, 0]);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.32, headY + headH * 0.52, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.68, headY + headH * 0.52, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = Util.adjustColor(skinColor, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX + headW / 2, headY + headH * 0.75, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Highlight (speaking glow)
    if (highlight) {
      ctx.strokeStyle = 'rgba(200,168,85,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-3, -3, w + 6, h + 6, 8);
      ctx.stroke();
    }

    ctx.restore();
  },

  adjustColor(hex, amount) {
    let r = parseInt(hex.slice(1,3), 16);
    let g = parseInt(hex.slice(3,5), 16);
    let b = parseInt(hex.slice(5,7), 16);
    r = Util.clamp(r + amount, 0, 255);
    g = Util.clamp(g + amount, 0, 255);
    b = Util.clamp(b + amount, 0, 255);
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  },

  // Typewriter text effect
  typeText(el, text, speed = 20, onDone) {
    el.textContent = '';
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
  },

  // Particle system for canvas effects
  Particles: {
    list: [],
    spawn(x, y, opts = {}) {
      const count = opts.count || 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Util.randFloat(0, 0.5);
        const speed = Util.randFloat(opts.minSpeed || 1, opts.maxSpeed || 4);
        this.list.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: Util.randFloat(0.02, 0.05),
          size: Util.randFloat(2, 6),
          color: opts.color || '#c8a855',
        });
      }
    },
    update() {
      this.list = this.list.filter(p => p.life > 0);
      this.list.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= p.decay;
      });
    },
    draw(ctx) {
      this.list.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }
};

// ──────────────────────────────────────────────────────
//  STAT SYSTEM
// ──────────────────────────────────────────────────────
const Stats = {
  modify(stat, delta) {
    const p = GameState.player;
    const before = p[stat];
    p[stat] = Util.clamp(before + delta, 0, 100);
    const actual = p[stat] - before;
    if (actual !== 0) Events.emit('statChange', { stat, delta: actual, value: p[stat] });
    return actual;
  },
  addMoney(amount) {
    GameState.player.money += amount;
    GameState.player.totalEarned += Math.max(0, amount);
    Events.emit('moneyChange', { amount, total: GameState.player.money });
  },
  checkPromotion() {
    const p = GameState.player;
    const rank = DATA.CAREER_RANKS[p.rank + 1];
    if (!rank) return false;
    const reqs = rank.requirements;
    if (p.reputation >= reqs.reputation &&
        p.casesWon >= reqs.casesWon &&
        p.skill >= reqs.skill) {
      p.rank++;
      p.rankTitle = DATA.CAREER_RANKS[p.rank].title;
      UI.toast('Promoted!', `You are now: ${p.rankTitle}`, 'success');
      Events.emit('rankUp', { rank: p.rank, title: p.rankTitle });
      return true;
    }
    return false;
  },
  getSkillLevel(id) {
    return GameState.player.skills[id] || 0;
  },
  upgradeSkill(id) {
    const p = GameState.player;
    const skillDef = DATA.SKILLS.flatMap(s => s.skills).find(s => s.id === id);
    if (!skillDef) return false;
    const current = p.skills[id] || 0;
    if (current >= skillDef.maxLevel) { UI.toast('Maxed', 'This skill is already at max level.', 'info'); return false; }
    const cost = current + 1; // 0→1 costs 1pt, 1→2 costs 2pt, 2→3 costs 3pt, etc.
    if (p.skillPoints < cost) { UI.toast('Not Enough Points', `Upgrading to level ${current + 1} costs ${cost} skill point${cost > 1 ? 's' : ''}.`, 'danger'); return false; }
    p.skills[id] = current + 1;
    p.skillPoints -= cost;
    Events.emit('skillUpgrade', { id, level: p.skills[id] });
    UI.toast('Skill Upgraded', `${skillDef.name} → Level ${p.skills[id]} (−${cost} pt${cost > 1 ? 's' : ''})`, 'success');
    return true;
  }
};