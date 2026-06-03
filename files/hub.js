/* ═══════════════════════════════════════════════════════
   VERDICT! GX — HUB.JS
   World map canvas, location panels, weekly cycle
   ═══════════════════════════════════════════════════════ */
'use strict';

const Hub = {
  canvas: null,
  ctx: null,
  animFrame: null,
  tick: 0,
  hoveredLocation: null,
  tooltip: null,
  locationPanel: null,

  // ── Init ──────────────────────────────────────────────
  init() {
    this.canvas = document.getElementById('hub-canvas');
    this.tooltip = document.getElementById('hub-tooltip');
    this.locationPanel = document.getElementById('location-panel');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.onMouseClick(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredLocation = null;
      this.tooltip.style.display = 'none';
    });

    // Quick bar buttons
    document.getElementById('quick-cases').addEventListener('click', () => ScreenManager.goTo('docket'));
    document.getElementById('quick-career').addEventListener('click', () => {
      UI.renderCareer();
      ScreenManager.goTo('career');
    });
    document.getElementById('quick-skills').addEventListener('click', () => {
      UI.renderSkills();
      ScreenManager.goTo('skills');
    });
    document.getElementById('quick-contacts').addEventListener('click', () => {
      UI.renderContacts();
      ScreenManager.goTo('contacts');
    });
    document.getElementById('quick-journal').addEventListener('click', () => {
      UI.toast('Journal', 'Your career journal will be available soon.', 'info');
    });

    // Pause button
    document.getElementById('hub-pause-btn').addEventListener('click', () => {
      document.getElementById('overlay-pause').style.display = 'flex';
    });
    document.getElementById('pause-resume').addEventListener('click', () => {
      document.getElementById('overlay-pause').style.display = 'none';
    });
    document.getElementById('pause-save').addEventListener('click', () => {
      Save.save();
      document.getElementById('overlay-pause').style.display = 'none';
    });
    document.getElementById('pause-main-menu').addEventListener('click', () => {
      document.getElementById('overlay-pause').style.display = 'none';
      ScreenManager.goTo('menu');
    });

    // Location panel close
    document.getElementById('location-close').addEventListener('click', () => {
      this.closePanel();
    });

    this.loop();
    this.updateHUD();
  },

  // ── Canvas Loop ───────────────────────────────────────
  loop() {
    this.tick++;
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.loop());
  },

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  // ── Draw City Map ─────────────────────────────────────
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#050810');
    sky.addColorStop(1, '#0d1628');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.save();
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.508 + 30) % W);
      const sy = ((i * 97.3 + 10) % (H * 0.5));
      const brightness = 0.3 + 0.7 * Math.abs(Math.sin(this.tick * 0.01 + i));
      ctx.globalAlpha = brightness * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Ground / streets
    const ground = ctx.createLinearGradient(0, H * 0.5, 0, H);
    ground.addColorStop(0, '#0a0e18');
    ground.addColorStop(1, '#050810');
    ctx.fillStyle = ground;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    // Draw grid roads
    ctx.strokeStyle = 'rgba(100,120,160,0.12)';
    ctx.lineWidth = 1;
    const gridW = W / 18;
    const gridH = (H * 0.55) / 10;
    for (let gx = 0; gx <= 18; gx++) {
      ctx.beginPath();
      ctx.moveTo(gx * gridW, H * 0.5);
      ctx.lineTo(gx * gridW, H);
      ctx.stroke();
    }
    for (let gy = 0; gy <= 10; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5 + gy * gridH);
      ctx.lineTo(W, H * 0.5 + gy * gridH);
      ctx.stroke();
    }

    // City skyline silhouette
    this.drawSkyline(ctx, W, H);

    // Draw locations
    DATA.HUB_LOCATIONS.forEach(loc => {
      this.drawLocation(ctx, loc, W, H);
    });

    // Ambient glow at bottom
    const glow = ctx.createRadialGradient(W/2, H, 10, W/2, H * 0.8, W * 0.6);
    glow.addColorStop(0, 'rgba(200,168,85,0.06)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
  },

  drawSkyline(ctx, W, H) {
    const horizon = H * 0.5;
    const buildings = [
      { x: 0.02, w: 0.04, h: 0.28, windows: true },
      { x: 0.05, w: 0.03, h: 0.18, windows: true },
      { x: 0.08, w: 0.05, h: 0.35, windows: true },
      { x: 0.13, w: 0.03, h: 0.25, windows: true },
      { x: 0.16, w: 0.04, h: 0.22, windows: true },
      { x: 0.20, w: 0.06, h: 0.40, windows: true },  // courthouse
      { x: 0.26, w: 0.04, h: 0.28, windows: true },
      { x: 0.30, w: 0.03, h: 0.15, windows: true },
      { x: 0.33, w: 0.05, h: 0.33, windows: true },
      { x: 0.38, w: 0.08, h: 0.48, windows: true },  // main tower
      { x: 0.46, w: 0.04, h: 0.30, windows: true },
      { x: 0.50, w: 0.03, h: 0.20, windows: true },
      { x: 0.53, w: 0.05, h: 0.38, windows: true },
      { x: 0.58, w: 0.04, h: 0.22, windows: true },
      { x: 0.62, w: 0.06, h: 0.32, windows: true },
      { x: 0.68, w: 0.03, h: 0.18, windows: true },
      { x: 0.71, w: 0.05, h: 0.28, windows: true },
      { x: 0.76, w: 0.04, h: 0.20, windows: true },
      { x: 0.80, w: 0.07, h: 0.36, windows: true },
      { x: 0.87, w: 0.04, h: 0.24, windows: true },
      { x: 0.91, w: 0.05, h: 0.30, windows: true },
      { x: 0.96, w: 0.04, h: 0.18, windows: true },
    ];

    buildings.forEach(b => {
      const bx = b.x * W;
      const bw = b.w * W;
      const bh = b.h * H;
      const by = horizon - bh;

      // Building body
      const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
      grad.addColorStop(0, '#1a1f30');
      grad.addColorStop(0.5, '#222840');
      grad.addColorStop(1, '#141820');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, bw, bh + 2);

      // Lit windows
      if (b.windows) {
        const wCols = Math.max(2, Math.floor(bw / 12));
        const wRows = Math.max(3, Math.floor(bh / 14));
        for (let wr = 0; wr < wRows; wr++) {
          for (let wc = 0; wc < wCols; wc++) {
            const wx = bx + 4 + wc * (bw - 8) / wCols;
            const wy = by + 6 + wr * (bh - 6) / wRows;
            const lit = Math.sin(bx * 0.3 + wr * 2.1 + wc * 1.7 + this.tick * 0.003) > 0.1;
            if (lit) {
              const warmth = Math.random() > 0.3 ? '#e8d070' : '#a0c8ff';
              ctx.fillStyle = warmth;
              ctx.globalAlpha = 0.5 + 0.3 * Math.abs(Math.sin(this.tick * 0.02 + wr + wc));
              ctx.fillRect(wx, wy, Math.max(3, bw / wCols - 5), Math.max(3, bh / wRows - 6));
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    });
  },

  getLocationRect(loc, W, H) {
    // Map grid (18 wide, 10 tall) to canvas area (bottom 50%)
    const groundY = H * 0.5;
    const mapW = W;
    const mapH = H * 0.5;
    const cellW = mapW / 18;
    const cellH = mapH / 10;

    const x = loc.gridX * cellW;
    const y = groundY + loc.gridY * cellH;
    const w = loc.w * cellW;
    const h = loc.h * cellH;
    return { x, y, w, h };
  },

  drawLocation(ctx, loc, W, H) {
    const r = this.getLocationRect(loc, W, H);
    const isHovered = this.hoveredLocation === loc.id;
    const pulse = 0.5 + 0.5 * Math.sin(this.tick * 0.04);

    // Building footprint
    ctx.save();
    const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
    grad.addColorStop(0, isHovered ? Util.adjustColor(loc.color, 30) : Util.adjustColor(loc.color, 10));
    grad.addColorStop(1, isHovered ? loc.color : Util.adjustColor(loc.color, -15));
    ctx.fillStyle = grad;

    // Glow when hovered
    if (isHovered) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = loc.color;
    }
    ctx.strokeStyle = isHovered ? '#c8a855' : 'rgba(200,168,85,0.3)';
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Rooftop glow ring (pulsing)
    if (isHovered) {
      ctx.save();
      ctx.globalAlpha = 0.4 * pulse;
      ctx.strokeStyle = '#c8a855';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(r.x + r.w / 2, r.y, r.w * 0.4, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Icon
    ctx.save();
    ctx.font = `${Math.min(r.w, r.h) * 0.45}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loc.icon, r.x + r.w / 2, r.y + r.h * 0.45);
    ctx.restore();

    // Name label
    ctx.save();
    ctx.font = `bold ${Math.min(10, r.w * 0.14)}px 'DM Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = isHovered ? '#c8a855' : 'rgba(255,255,255,0.7)';
    ctx.fillText(loc.name, r.x + r.w / 2, r.y + r.h - 3);
    ctx.restore();
  },

  // ── Mouse ──────────────────────────────────────────────
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = this.canvas.width;
    const H = this.canvas.height;

    let found = null;
    DATA.HUB_LOCATIONS.forEach(loc => {
      const r = this.getLocationRect(loc, W, H);
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        found = loc.id;
      }
    });

    this.hoveredLocation = found;

    if (found) {
      const loc = DATA.HUB_LOCATIONS.find(l => l.id === found);
      this.tooltip.style.display = 'block';
      this.tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      this.tooltip.style.top = (e.clientY - rect.top - 36) + 'px';
      this.tooltip.textContent = loc.desc;
      this.canvas.style.cursor = 'pointer';
    } else {
      this.tooltip.style.display = 'none';
      this.canvas.style.cursor = 'default';
    }
  },

  onMouseClick(e) {
    if (!this.hoveredLocation) return;
    const loc = DATA.HUB_LOCATIONS.find(l => l.id === this.hoveredLocation);
    if (loc) this.openLocationPanel(loc);
  },

  // ── Location Panel ─────────────────────────────────────
  openLocationPanel(loc) {
    const panel = document.getElementById('location-panel');
    const inner = document.getElementById('location-panel-inner');

    inner.innerHTML = `
      <div class="loc-panel-header">
        <span class="loc-panel-icon">${loc.icon}</span>
        <div>
          <div class="loc-panel-name">${loc.name}</div>
          <div class="loc-panel-desc">${loc.desc}</div>
        </div>
      </div>
      <div class="loc-panel-actions">
        ${loc.actions.map(a => `
          <button class="loc-action-btn" data-action="${a.action}" data-loc="${loc.id}">
            <span class="loc-action-icon">${a.icon}</span>
            <div class="loc-action-info">
              <div class="loc-action-text">${a.text}</div>
              <div class="loc-action-sub">${a.sub}${a.cost ? ` — $${a.cost}` : ''}</div>
            </div>
            <span class="loc-action-arrow">→</span>
          </button>
        `).join('')}
      </div>
    `;

    inner.querySelectorAll('.loc-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAction(btn.dataset.action, btn.dataset.loc);
      });
    });

    panel.classList.add('open');
  },

  closePanel() {
    document.getElementById('location-panel').classList.remove('open');
  },

  // ── Actions ───────────────────────────────────────────
  handleAction(action, locId) {
    const p = GameState.player;

    switch (action) {
      case 'docket':
        this.closePanel();
        ScreenManager.goTo('docket');
        break;

      case 'study':
        Stats.modify('skill', Util.rand(1, 3));
        Stats.modify('morale', -5);
        UI.toast('Case Study', `+${Util.rand(1,3)} Skill. Eyes blurring slightly.`, 'info');
        this.closePanel();
        this.advanceTime(4);
        break;

      case 'client_meet':
        Stats.modify('morale', 8);
        Stats.modify('reputation', 2);
        UI.toast('Client Meeting', 'Productive conversation. Morale boosted.', 'success');
        this.closePanel();
        this.advanceTime(2);
        break;

      case 'go_to_trial':
        if (!p.activeCase) {
          // Find first docket case
          if (p.docket.length === 0) {
            const newCase = DATA.generateCase(p.rank, p.specialty);
            p.docket.push(newCase);
          }
          p.activeCase = p.docket[0];
        }
        this.closePanel();
        Court.startCase(p.activeCase);
        break;

      case 'file_motions':
        const motionRoll = Math.random() + (p.skill / 200);
        if (motionRoll > 0.6) {
          Stats.modify('reputation', Util.rand(2, 5));
          UI.toast('Motion Filed', 'Motion granted. Case strengthened.', 'success');
        } else {
          UI.toast('Motion Filed', 'Motion denied. You argue on.', 'info');
        }
        this.closePanel();
        this.advanceTime(3);
        break;

      case 'observe':
        Stats.modify('skill', 1);
        UI.toast('Observation', 'You learned something watching from the gallery.', 'info');
        this.closePanel();
        this.advanceTime(3);
        break;

      case 'deep_research':
        if (p.money < 500) { UI.toast('Insufficient Funds', 'Research costs $500.', 'danger'); return; }
        Stats.addMoney(-500);
        Stats.modify('skill', Util.rand(4, 8));
        p._bonusEvidence = true;
        UI.toast('Deep Research', '+5-8 Skill. Your next case gets a bonus evidence item.', 'success');
        this.closePanel();
        this.advanceTime(6);
        break;

      case 'read_precendents':
        Stats.modify('skill', Util.rand(2, 4));
        UI.toast('Legal Reading', 'Precedents absorbed.', 'info');
        this.closePanel();
        this.advanceTime(4);
        break;

      case 'network':
        if (p.money < 120) { UI.toast('Not Enough', 'Drinks cost $120 here.', 'danger'); return; }
        Stats.addMoney(-120);
        Stats.modify('morale', 12);
        Stats.modify('reputation', Util.rand(0, 4));
        if (Math.random() > 0.6) {
          UI.toast('New Contact!', 'You met someone useful tonight.', 'success');
        } else {
          UI.toast('Networking', 'Good drinks. Better connections.', 'info');
        }
        this.closePanel();
        this.advanceTime(3);
        break;

      case 'gossip':
        if (p.money < 40) { UI.toast('Need More', 'Buy them a $40 drink first.', 'danger'); return; }
        Stats.addMoney(-40);
        Stats.modify('morale', 4);
        if (p.docket.length > 0) {
          UI.toast('Courthouse Gossip', 'You hear useful chatter about the judge assigned to your case.', 'info');
        } else {
          UI.toast('Courthouse Gossip', 'Nothing actionable — but entertaining.', 'info');
        }
        this.closePanel();
        this.advanceTime(2);
        break;

      case 'workout':
        if (p.money < 80) { UI.toast('Need More', 'Club membership requires $80.', 'danger'); return; }
        Stats.addMoney(-80);
        Stats.modify('morale', 18);
        Stats.modify('skill', 1);
        UI.toast('Workout', 'Clear mind. Stronger posture. Ready to argue.', 'success');
        this.closePanel();
        this.advanceTime(2);
        break;

      case 'interview':
        const pressRoll = Math.random();
        if (pressRoll > 0.35) {
          const repGain = Util.rand(5, 12);
          Stats.modify('reputation', repGain);
          UI.toast('Good Press', `The article was flattering. +${repGain} Reputation.`, 'success');
        } else {
          Stats.modify('reputation', -4);
          Stats.modify('morale', -6);
          UI.toast('Bad Press', 'They spun it negatively. Lesson learned.', 'danger');
        }
        this.closePanel();
        this.advanceTime(2);
        break;

      case 'press_conf':
        if (!p.activeCase) { UI.toast('No Active Case', 'Need an active case for a press conference.', 'danger'); return; }
        const confRoll = Math.random() + (p.reputation / 200);
        if (confRoll > 0.55) {
          Stats.modify('reputation', Util.rand(8, 18));
          UI.toast('Press Conference', 'Standing ovation from the press. Reputation soars.', 'success');
        } else {
          Stats.modify('reputation', -8);
          Stats.modify('morale', -10);
          UI.toast('Press Disaster', 'Questions you couldn\'t answer. Career hit.', 'danger');
        }
        this.closePanel();
        this.advanceTime(3);
        break;

      default:
        UI.toast('Coming Soon', `${action} is being added.`, 'info');
        break;
    }
  },

  // ── Time ──────────────────────────────────────────────
  advanceTime(hours) {
    GameState.player.hoursSpent = (GameState.player.hoursSpent || 0) + hours;
    if (GameState.player.hoursSpent >= 40) {
      GameState.player.hoursSpent -= 40;
      this.advanceWeek();
    }
    this.updateHUD();
    Stats.checkPromotion();
    UI.checkAchievements();
  },

  advanceWeek() {
    const p = GameState.player;
    p.month++;

    // Add weekly salary
    const rank = DATA.CAREER_RANKS[p.rank];
    const salary = rank ? rank.salary : 3000;
    Stats.addMoney(salary);

    // Slight morale drain from work
    Stats.modify('morale', -5);

    // Add new case to docket occasionally
    if (p.docket.length < 4 && Math.random() > 0.4) {
      const newCase = DATA.generateCase(p.rank, p.specialty);
      p.docket.push(newCase);
      UI.toast('New Case', `A new case has been added to your docket: ${newCase.title}`, 'info');
    }

    UI.toast('Week Passed', `${Util.formatDate(p.month)} — Salary: +${Util.formatMoney(salary)}`, 'info');
    this.updateHUD();
  },

  // ── HUD ───────────────────────────────────────────────
  updateHUD() {
    const p = GameState.player;

    const nameEl = document.getElementById('hub-player-name');
    const rankEl = document.getElementById('hub-player-rank');
    const moneyEl = document.getElementById('hub-money');
    const dateEl = document.getElementById('hub-date');
    if (nameEl) nameEl.textContent = `Atty. ${p.lastName}`;
    if (rankEl) rankEl.textContent = p.rankTitle;
    if (moneyEl) moneyEl.textContent = Util.formatMoney(p.money);
    if (dateEl) dateEl.textContent = Util.formatDate(p.month);

    const setBar = (id, valId, val) => {
      const bar = document.getElementById(id);
      const valEl = document.getElementById(valId);
      if (bar) bar.style.width = Util.clamp(val, 0, 100) + '%';
      if (valEl) valEl.textContent = Math.round(val);
    };

    setBar('hub-rep-bar', 'hub-rep-val', p.reputation);
    setBar('hub-skill-bar', 'hub-skill-val', p.skill);
    setBar('hub-morale-bar', 'hub-morale-val', p.morale);

    // Cases badge
    const badge = document.getElementById('cases-badge');
    if (badge) badge.textContent = p.docket.length;
  },
};

// Register screen entry
ScreenManager.registerOnEnter('hub', () => {
  Hub.resize();
  Hub.updateHUD();
  // Ensure docket has cases
  if (GameState.player.docket.length === 0) {
    for (let i = 0; i < 3; i++) {
      GameState.player.docket.push(
        DATA.generateCase(GameState.player.rank, GameState.player.specialty)
      );
    }
  }
});
