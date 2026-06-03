/* ═══════════════════════════════════════════════════════
   VERDICT! GX — COURT.JS
   Courtroom game engine: stages, dialogue, choices, 
   objections, evidence, random events, verdict
   ═══════════════════════════════════════════════════════ */
'use strict';

const Court = {
  canvas: null,
  ctx: null,
  animFrame: null,
  tick: 0,

  // Current session state
  session: null,

  // DOM refs
  dom: {},

  // ── Init ──────────────────────────────────────────────
  init() {
    this.canvas = document.getElementById('court-canvas');
    if (!this.canvas) return;

    this.dom = {
      caseId:       document.getElementById('court-case-id'),
      caseName:     document.getElementById('court-case-name'),
      stageTrack:   document.getElementById('court-stage-track'),
      courtDay:     document.getElementById('court-day'),
      panelSpeaker: document.getElementById('panel-speaker'),
      panelText:    document.getElementById('panel-text'),
      panelHint:    document.getElementById('panel-hint'),
      actionOverlay:document.getElementById('action-overlay'),
      actionTitle:  document.getElementById('action-title'),
      actionChoices:document.getElementById('action-choices'),
      juryFaces:    document.getElementById('jury-faces'),
      evidenceList: document.getElementById('evidence-quick-list'),
      objSplash:    document.getElementById('objection-splash'),
      objWord:      document.getElementById('obj-word'),
      objSource:    document.getElementById('obj-source'),
      verdictReveal:document.getElementById('verdict-reveal'),
      vrResult:     document.getElementById('vr-result'),
      vrDetail:     document.getElementById('vr-detail'),
      vrRewards:    document.getElementById('vr-rewards'),
      vrContinue:   document.getElementById('vr-continue'),
      speechLayer:  document.getElementById('speech-layer'),
    };

    // Panel click to advance
    document.getElementById('court-panel').addEventListener('click', () => {
      if (this.session && this.session.phase === 'dialog') {
        this.advanceDialog();
      }
    });

    // Pause
    document.getElementById('court-pause').addEventListener('click', () => {
      document.getElementById('overlay-pause').style.display = 'flex';
    });

    // Verdict continue
    this.dom.vrContinue.addEventListener('click', () => {
      this.endCase();
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  // ── Start Case ─────────────────────────────────────────
  startCase(caseData) {
    this.session = {
      caseData,
      phase: 'dialog',
      stageIndex: 0,
      dialogIndex: 0,
      dialogQueue: [],
      juryMood: Array(6).fill(0),
      score: 0,
      maxScore: 0,
      evidenceUsed: [],
      objectionCooldown: 0,
      totalObjections: 0,
      day: 1,
      turnCount: 0,
      eventFired: false,
    };

    ScreenManager.goTo('court', { fast: true });
    setTimeout(() => {
      this.buildStageDialogue(0);
      this.updateHUD();
      this.updateStageTrack();
      this.loop();
    }, 300);
  },

  // ── Canvas Loop ───────────────────────────────────────
  loop() {
    if (!this.session) return;
    this.tick++;
    this.drawCourt();
    this.animFrame = requestAnimationFrame(() => this.loop());
  },

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animFrame = null;
  },

  // ── Draw Courtroom ─────────────────────────────────────
  drawCourt() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Floor and walls
    ctx.fillStyle = '#1a1308';
    ctx.fillRect(0, 0, W, H);

    // Back wall
    const wall = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    wall.addColorStop(0, '#26200e');
    wall.addColorStop(1, '#1a1308');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H * 0.6);

    // Wood floor
    const floor = ctx.createLinearGradient(0, H * 0.6, 0, H);
    floor.addColorStop(0, '#2a1e0a');
    floor.addColorStop(1, '#1a1208');
    ctx.fillStyle = floor;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // Floor planks
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const fy = H * 0.6 + i * (H * 0.4 / 20);
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(W, fy);
      ctx.stroke();
    }

    // Tall windows with light shafts
    this.drawWindows(ctx, W, H);

    // Columns
    this.drawColumns(ctx, W, H);

    // Judge's bench (elevated, back center)
    this.drawJudgeBench(ctx, W, H);

    // Witness stand
    this.drawWitnessStand(ctx, W, H);

    // Tables
    this.drawTables(ctx, W, H);

    // Jury box
    this.drawJuryBox(ctx, W, H);

    // Gallery
    this.drawGallery(ctx, W, H);

    // Ambient particles
    this.drawDustMotes(ctx, W, H);
  },

  drawWindows(ctx, W, H) {
    const windows = [0.1, 0.9];
    windows.forEach(wx => {
      const x = wx * W - 30;
      const ww = 60;
      const wh = H * 0.45;
      const wy = H * 0.03;

      // Frame
      ctx.fillStyle = '#3a2e18';
      ctx.fillRect(x - 4, wy - 4, ww + 8, wh + 8);

      // Glass panes
      const grad = ctx.createLinearGradient(x, wy, x + ww, wy + wh);
      grad.addColorStop(0, 'rgba(200,180,100,0.15)');
      grad.addColorStop(1, 'rgba(100,80,40,0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, wy, ww, wh);

      // Pane dividers
      ctx.strokeStyle = '#5a4a28';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + ww/2, wy);
      ctx.lineTo(x + ww/2, wy + wh);
      ctx.moveTo(x, wy + wh/3);
      ctx.lineTo(x + ww, wy + wh/3);
      ctx.moveTo(x, wy + wh * 2/3);
      ctx.lineTo(x + ww, wy + wh * 2/3);
      ctx.stroke();

      // Light shaft
      const shaft = ctx.createLinearGradient(x, wy + wh, x + (wx > 0.5 ? -80 : 80), H * 0.7);
      shaft.addColorStop(0, 'rgba(200,170,80,0.12)');
      shaft.addColorStop(1, 'rgba(200,170,80,0)');
      ctx.fillStyle = shaft;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, wy + wh);
      ctx.lineTo(x + ww, wy + wh);
      ctx.lineTo(x + (wx > 0.5 ? -150 : 150) + ww/2, H * 0.75);
      ctx.lineTo(x + (wx > 0.5 ? -150 : 150) - ww/2, H * 0.75);
      ctx.fill();
      ctx.restore();
    });
  },

  drawColumns(ctx, W, H) {
    const cols = [0.25, 0.75];
    cols.forEach(cx => {
      const x = cx * W - 18;
      const cw = 36;
      const ch = H * 0.58;

      // Column body
      const grad = ctx.createLinearGradient(x, 0, x + cw, 0);
      grad.addColorStop(0, '#4a3820');
      grad.addColorStop(0.3, '#6a5030');
      grad.addColorStop(0.7, '#5a4025');
      grad.addColorStop(1, '#3a2a14');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, cw, ch);

      // Capital
      ctx.fillStyle = '#7a6040';
      ctx.fillRect(x - 6, ch - 18, cw + 12, 18);
      ctx.fillStyle = '#8a7050';
      ctx.fillRect(x - 10, ch - 22, cw + 20, 6);

      // Base
      ctx.fillStyle = '#7a6040';
      ctx.fillRect(x - 4, ch - 4, cw + 8, 6);
    });
  },

  drawJudgeBench(ctx, W, H) {
    const bw = W * 0.42;
    const bh = H * 0.18;
    const bx = (W - bw) / 2;
    const by = H * 0.06;

    // Platform
    ctx.fillStyle = '#2a1e0a';
    ctx.fillRect(bx - 20, by + bh - 10, bw + 40, 20);

    // Bench body
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    grad.addColorStop(0, '#5a3e18');
    grad.addColorStop(0.5, '#7a5828');
    grad.addColorStop(1, '#4a3010');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, [4, 4, 0, 0]);
    ctx.fill();

    // Bench top surface
    ctx.fillStyle = '#8a6535';
    ctx.fillRect(bx - 6, by - 8, bw + 12, 12);

    // Nameplate
    ctx.fillStyle = '#c8a855';
    ctx.fillRect(bx + bw/2 - 70, by + bh - 28, 140, 18);
    ctx.font = `bold 9px 'DM Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1308';
    const judge = this.session ? this.session.caseData.judge : 'HON. JUDGE MORRISON';
    ctx.fillText(judge.replace('The Honorable ', 'HON. ').toUpperCase().slice(0, 24), bx + bw/2, by + bh - 19);

    // Judge figure (small silhouette)
    ctx.fillStyle = '#1a1308';
    ctx.beginPath();
    ctx.arc(bx + bw/2, by - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(bx + bw/2 - 10, by - 8, 20, 18);

    // Gavel
    ctx.fillStyle = '#c8a855';
    ctx.save();
    ctx.translate(bx + bw * 0.7, by + 6);
    ctx.rotate(-0.3);
    ctx.fillRect(-2, -14, 5, 14);
    ctx.fillRect(-6, -18, 13, 7);
    ctx.restore();
  },

  drawWitnessStand(ctx, W, H) {
    const wx = W * 0.35 - 40;
    const wy = H * 0.32;
    const ww = 70;
    const wh = 50;

    ctx.fillStyle = '#5a3e18';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = '#7a5828';
    ctx.fillRect(wx - 4, wy - 6, ww + 8, 10);

    // Label
    ctx.font = `9px 'DM Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(200,168,85,0.6)';
    ctx.fillText('WITNESS', wx + ww/2, wy + wh + 4);
  },

  drawTables(ctx, W, H) {
    const tables = [
      { x: 0.2, label: 'DEFENSE', color: '#1a2e1a' },
      { x: 0.6, label: 'PROSECUTION', color: '#2e1a1a' },
    ];

    tables.forEach(t => {
      const tx = t.x * W;
      const ty = H * 0.46;
      const tw = W * 0.18;
      const th = H * 0.1;

      const grad = ctx.createLinearGradient(tx, ty, tx, ty + th);
      grad.addColorStop(0, Util.adjustColor(t.color, 20));
      grad.addColorStop(1, t.color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 3);
      ctx.fill();

      // Table surface highlight
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(tx + 4, ty + 2, tw - 8, 6);

      // Papers on table
      ctx.fillStyle = 'rgba(240,230,200,0.12)';
      ctx.fillRect(tx + 8, ty + 14, 30, 22);
      ctx.fillRect(tx + tw - 38, ty + 10, 24, 28);

      ctx.font = `8px 'DM Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(200,168,85,0.4)';
      ctx.fillText(t.label, tx + tw/2, ty + th + 6);

      // Player sprite at defense table (left)
      if (t.x < 0.5) {
        const p = GameState.player;
        const skin = DATA.SKIN_COLORS[p.skinIndex]?.hex || '#c8a87a';
        const hair = DATA.HAIR_COLORS[p.hairIndex]?.hex || '#2a1a06';
        const suit = DATA.SUIT_COLORS[p.suitIndex]?.hex || '#1a1a2e';
        Util.drawSprite(ctx, tx + tw/2 - 18, ty - 60, 36, 55, {
          skinColor: skin, hairColor: hair, suitColor: suit,
          highlight: this.session && this.session.phase === 'action',
        });
      } else {
        // Opponent
        Util.drawSprite(ctx, tx + tw/2 - 18, ty - 60, 36, 55, {
          skinColor: '#c8a87a', hairColor: '#1a0a00', suitColor: '#2e1a1a',
        });
      }
    });
  },

  drawJuryBox(ctx, W, H) {
    const jx = W * 0.72;
    const jy = H * 0.3;
    const jw = W * 0.24;
    const jh = H * 0.28;

    ctx.fillStyle = '#2a1e0a';
    ctx.strokeStyle = '#5a4018';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(jx, jy, jw, jh, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = `9px 'DM Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(200,168,85,0.5)';
    ctx.fillText('JURY', jx + jw/2, jy - 8);

    // Juror silhouettes (2 rows of 3)
    const mood = this.session ? this.session.juryMood : [0,0,0,0,0,0];
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const jrx = jx + 16 + col * (jw / 3 - 4);
      const jry = jy + 14 + row * (jh / 2 - 4);

      // Mood color
      const m = mood[i] || 0;
      const moodColor = m > 0 ? `rgba(50,200,80,${0.3 + m * 0.15})` :
                        m < 0 ? `rgba(220,50,50,${0.3 + Math.abs(m) * 0.15})` :
                        'rgba(200,200,200,0.2)';

      // Glow behind juror
      ctx.save();
      ctx.fillStyle = moodColor;
      ctx.beginPath();
      ctx.arc(jrx + 14, jry + 14, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Juror body
      ctx.fillStyle = '#3a3020';
      ctx.fillRect(jrx + 4, jry + 20, 20, 20);
      ctx.fillStyle = '#c8a87a';
      ctx.beginPath();
      ctx.arc(jrx + 14, jry + 14, 8, 0, Math.PI * 2);
      ctx.fill();

      // Mood face
      ctx.strokeStyle = m > 0 ? '#50c860' : m < 0 ? '#c85050' : '#888';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (m > 0) {
        ctx.arc(jrx + 14, jry + 16, 3, 0.1 * Math.PI, 0.9 * Math.PI);
      } else if (m < 0) {
        ctx.arc(jrx + 14, jry + 18, 3, Math.PI * 1.1, Math.PI * 1.9);
      } else {
        ctx.moveTo(jrx + 11, jry + 16);
        ctx.lineTo(jrx + 17, jry + 16);
      }
      ctx.stroke();
    }
  },

  drawGallery(ctx, W, H) {
    const gx = 0;
    const gy = H * 0.62;
    const gw = W * 0.15;
    const gh = H * 0.3;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(gx, gy, gw, gh);

    // Gallery crowd silhouettes
    for (let i = 0; i < 8; i++) {
      const bx = gx + 8 + i * (gw / 8 - 1);
      const by = gy + 12 + (i % 2) * 8;
      ctx.fillStyle = `rgba(40,30,15,${0.6 + (i % 3) * 0.1})`;
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(bx - 6, by + 6, 12, 16);
    }
  },

  drawDustMotes(ctx, W, H) {
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const mx = (Math.sin(this.tick * 0.005 + i * 2.3) * 0.5 + 0.5) * W;
      const my = (Math.sin(this.tick * 0.003 + i * 1.7) * 0.5 + 0.5) * H * 0.6;
      ctx.globalAlpha = 0.08 + 0.04 * Math.sin(this.tick * 0.02 + i);
      ctx.fillStyle = '#c8a855';
      ctx.beginPath();
      ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // ── HUD ───────────────────────────────────────────────
  updateHUD() {
    if (!this.session) return;
    const c = this.session;
    const cd = c.caseData;

    this.dom.caseId.textContent = `Case #${String(GameState.player.casesWon + GameState.player.casesLost + 1).padStart(4,'0')}`;
    this.dom.caseName.textContent = cd.title;
    this.dom.courtDay.textContent = `Day ${c.day}`;
  },

  updateStageTrack() {
    if (!this.session) return;
    const stages = this.session.caseData.stages;
    const current = this.session.stageIndex;

    this.dom.stageTrack.innerHTML = stages.map((s, i) => `
      <div class="stage-dot ${i < current ? 'done' : i === current ? 'active' : ''}">
        <span class="stage-dot-label">${s.name}</span>
      </div>
    `).join('');
  },

  // ── Dialogue ──────────────────────────────────────────
  buildStageDialogue(stageIndex) {
    if (!this.session) return;
    const stage = this.session.caseData.stages[stageIndex];
    if (!stage) { this.triggerVerdict(); return; }

    this.session.dialogQueue = [...stage.dialogue];
    this.session.dialogIndex = 0;
    this.session.phase = 'dialog';
    this.dom.actionOverlay.style.display = 'none';

    // Fire random event occasionally
    if (!this.session.eventFired && stageIndex > 0 && Math.random() > 0.6) {
      const event = Util.randItem(DATA.RANDOM_EVENTS);
      if (event) {
        this.fireRandomEvent(event);
        return;
      }
    }

    this.showNextDialogue();
  },

  showNextDialogue() {
    if (!this.session) return;
    const q = this.session.dialogQueue;
    const i = this.session.dialogIndex;

    if (i >= q.length) {
      // Move to player choice for this stage
      this.showStageChoices();
      return;
    }

    const line = q[i];
    this.dom.panelSpeaker.textContent = line.speaker;
    this.dom.panelHint.textContent = '▼ Click to continue';

    Util.typeText(this.dom.panelText, line.text, 22);
    this.session.dialogIndex++;
  },

  advanceDialog() {
    if (!this.session || this.session.phase !== 'dialog') return;
    this.showNextDialogue();
  },

  // ── Stage Choices ─────────────────────────────────────
  showStageChoices() {
    if (!this.session) return;
    const stage = this.session.caseData.stages[this.session.stageIndex];
    if (!stage) return;

    const choices = stage.choices || [];
    const p = GameState.player;

    this.session.phase = 'action';
    this.dom.panelText.textContent = stage.prompt || 'Choose your approach:';
    this.dom.panelSpeaker.textContent = 'YOUR DECISION';
    this.dom.panelHint.textContent = '';

    // Build choices UI
    this.dom.actionTitle.textContent = stage.prompt || 'Choose your approach:';
    this.dom.actionChoices.innerHTML = choices.map((c, idx) => {
      const locked = this.isChoiceLocked(c);
      return `
        <button class="action-choice-btn ${locked ? 'locked' : ''} ${c.type || ''}" data-idx="${idx}" ${locked ? 'disabled' : ''}>
          <span class="choice-letter">${String.fromCharCode(65 + idx)}</span>
          <div class="choice-body">
            <div class="choice-text">${c.text}</div>
            <div class="choice-hint">${c.hint || ''}</div>
            ${locked ? '<div class="choice-req">🔒 Requirements not met</div>' : ''}
          </div>
          <span class="choice-type-badge ${c.type || 'safe'}">${c.type === 'bold' ? '⚡ Bold' : c.type === 'risk' ? '⚠️ Risk' : '✓ Safe'}</span>
        </button>
      `;
    }).join('');

    // Objection button
    const hasObjLeft = this.session.objectionCooldown <= 0;
    this.dom.actionChoices.innerHTML += `
      <div class="choice-special-row">
        <button class="objection-btn ${!hasObjLeft ? 'used' : ''}" id="court-obj-btn" ${!hasObjLeft ? 'disabled' : ''}>
          ⚡ OBJECTION!
        </button>
        <button class="evidence-btn" id="court-ev-btn">📁 Present Evidence</button>
      </div>
    `;

    // Bind choices
    this.dom.actionChoices.querySelectorAll('.action-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) this.resolveChoice(parseInt(btn.dataset.idx));
      });
    });

    document.getElementById('court-obj-btn')?.addEventListener('click', () => {
      this.triggerObjection();
    });

    document.getElementById('court-ev-btn')?.addEventListener('click', () => {
      this.showEvidenceQuick();
    });

    // Jury display
    this.renderJuryFaces();
    this.renderEvidenceList();

    this.dom.actionOverlay.style.display = 'flex';
  },

  isChoiceLocked(choice) {
    if (!choice.requires) return false;
    const p = GameState.player;
    const reqs = choice.requires;
    if (reqs.skill && p.skill < reqs.skill) return true;
    if (reqs.morale && p.morale < reqs.morale) return true;
    if (reqs.evidence_available && this.session.caseData.evidence.length === 0) return true;
    return false;
  },

  resolveChoice(choiceIdx) {
    if (!this.session) return;
    const stage = this.session.caseData.stages[this.session.stageIndex];
    const choice = stage.choices[choiceIdx];
    if (!choice) return;

    this.dom.actionOverlay.style.display = 'none';
    this.session.phase = 'dialog';
    this.session.turnCount++;

    // Calculate outcome
    const p = GameState.player;
    const skillFactor = p.skill / 100;
    const moraleFactor = p.morale / 100;

    let scoreGain = 0;
    let repGain = 0;

    if (choice.type === 'risk') {
      // High variance
      const roll = Math.random() + skillFactor * 0.3;
      if (roll > 0.5) {
        scoreGain = Util.rand(choice.scoreRange[0], choice.scoreRange[1]);
        repGain = Util.rand(choice.repRange[0], choice.repRange[1]);
      } else {
        scoreGain = choice.scoreRange[0];
        repGain = choice.repRange[0];
      }
    } else if (choice.type === 'bold') {
      const roll = Math.random() + skillFactor * 0.4 + moraleFactor * 0.2;
      const pct = Util.clamp(roll, 0, 1);
      scoreGain = Math.round(Util.lerp(choice.scoreRange[0], choice.scoreRange[1], pct));
      repGain = Math.round(Util.lerp(choice.repRange[0], choice.repRange[1], pct));
    } else {
      // safe
      scoreGain = Util.rand(choice.scoreRange[0], choice.scoreRange[1]);
      repGain = Util.rand(choice.repRange[0], choice.repRange[1]);
    }

    // Morale cost
    if (choice.moraleCost) Stats.modify('morale', -choice.moraleCost);

    this.session.score += scoreGain;
    this.session.maxScore += choice.scoreRange[1];

    // Jury mood
    const juryShift = Math.round(scoreGain / 15);
    const jurorIdx = Math.floor(Math.random() * 6);
    this.session.juryMood[jurorIdx] = Util.clamp(this.session.juryMood[jurorIdx] + juryShift, -3, 3);

    // Show result dialogue
    const resultText = this.getChoiceResultText(choice, scoreGain);
    this.session.dialogQueue = [
      { speaker: this.getChoiceSpeaker(stage), text: resultText },
    ];
    this.session.dialogIndex = 0;

    // Rep gain
    Stats.modify('reputation', repGain);

    // Show outcome toast
    if (scoreGain > 10) {
      UI.toast('Strong Argument', `+${scoreGain} case score`, 'success');
    } else if (scoreGain < 0) {
      UI.toast('Rough Moment', `${scoreGain} case score`, 'danger');
    }

    this.showNextDialogue();

    // Queue advancement to next stage after dialogue
    const origQ = this.session.dialogQueue;
    const self = this;
    const originalAdvance = this.advanceDialog.bind(this);
    this._postChoiceStage = true;
  },

  getChoiceSpeaker(stage) {
    const speakers = ['JUDGE', 'OPPOSING COUNSEL', 'COURT REPORTER'];
    return Util.randItem(speakers);
  },

  getChoiceResultText(choice, score) {
    if (score > 15) return `Excellent. The courtroom stirs. Your argument landed perfectly.`;
    if (score > 8) return `A solid point. The jury listens closely.`;
    if (score > 0) return `Adequate. The argument holds, though it won't be remembered.`;
    if (score === 0) return `Neither side gains ground. The court moves forward.`;
    return `That didn't land. Opposing counsel smirks. Recover quickly.`;
  },

  // ── Objection ─────────────────────────────────────────
  triggerObjection() {
    if (!this.session) return;
    if (this.session.objectionCooldown > 0) {
      UI.toast('Objection Used', 'You\'ve already objected this stage.', 'danger');
      return;
    }

    const roll = Math.random() + GameState.player.skill / 150;
    const sustained = roll > 0.45;

    this.session.objectionCooldown = 1;
    this.session.totalObjections++;
    GameState.player._totalObjections = (GameState.player._totalObjections || 0) + 1;

    // Hide choices
    this.dom.actionOverlay.style.display = 'none';

    // Show splash
    this.dom.objWord.textContent = 'OBJECTION!';
    this.dom.objSource.textContent = sustained ? 'SUSTAINED ✓' : 'OVERRULED ✗';
    this.dom.objSplash.style.display = 'flex';
    this.dom.objSplash.style.background = sustained ? 'rgba(50,180,50,0.95)' : 'rgba(200,30,30,0.95)';

    if (sustained) {
      this.session.score += 12;
      Stats.modify('reputation', Util.rand(3, 6));
      UI.toast('Objection Sustained', '+12 case score. Well argued.', 'success');
    } else {
      this.session.score -= 3;
      Stats.modify('morale', -5);
      UI.toast('Objection Overruled', 'The judge disagrees.', 'danger');
    }

    setTimeout(() => {
      this.dom.objSplash.style.display = 'none';
      this.showStageChoices();
    }, 1800);
  },

  // ── Evidence ──────────────────────────────────────────
  showEvidenceQuick() {
    if (!this.session) return;
    const evidence = this.session.caseData.evidence;

    this.dom.evidenceList.innerHTML = evidence.length === 0
      ? '<div class="ev-empty">No evidence available.</div>'
      : evidence.map((e, i) => `
        <button class="ev-quick-item ${this.session.evidenceUsed.includes(i) ? 'used' : ''}" 
                data-idx="${i}" ${this.session.evidenceUsed.includes(i) ? 'disabled' : ''}>
          <span class="ev-icon">${e.icon}</span>
          <div class="ev-info">
            <div class="ev-name">${e.name}</div>
            <div class="ev-sub">+${e.scoreBonus} score • ${this.session.evidenceUsed.includes(i) ? 'Used' : 'Present'}</div>
          </div>
        </button>
      `).join('');

    this.dom.evidenceList.querySelectorAll('.ev-quick-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.presentEvidence(parseInt(btn.dataset.idx));
      });
    });
  },

  presentEvidence(idx) {
    if (!this.session) return;
    const ev = this.session.caseData.evidence[idx];
    if (!ev) return;

    this.session.evidenceUsed.push(idx);
    this.session.score += ev.scoreBonus;
    Stats.modify('reputation', ev.repBonus || 2);

    const jurorIdx = Math.floor(Math.random() * 6);
    this.session.juryMood[jurorIdx] = Util.clamp(this.session.juryMood[jurorIdx] + 1, -3, 3);

    UI.toast(`Evidence Presented`, `${ev.name} — +${ev.scoreBonus} score, +${ev.repBonus || 2} rep`, 'success');

    this.renderEvidenceList();
    this.renderJuryFaces();
  },

  renderEvidenceList() {
    if (!this.session) return;
    const evidence = this.session.caseData.evidence;
    this.dom.evidenceList.innerHTML = evidence.slice(0, 3).map((e, i) => `
      <div class="ev-mini ${this.session.evidenceUsed.includes(i) ? 'used' : ''}">
        <span>${e.icon}</span> ${e.name}
      </div>
    `).join('');
  },

  renderJuryFaces() {
    if (!this.session) return;
    const mood = this.session.juryMood;
    this.dom.juryFaces.innerHTML = mood.map((m, i) => {
      const face = m > 0 ? '😊' : m < 0 ? '😠' : '😐';
      return `<span class="jury-face" title="Juror ${i+1}">${face}</span>`;
    }).join('');
  },

  // ── Random Events ─────────────────────────────────────
  fireRandomEvent(event) {
    if (!this.session) return;
    this.session.eventFired = true;

    // Apply initial effect
    const eff = event.effect;
    if (eff.juryDelta) {
      const jIdx = Math.floor(Math.random() * 6);
      this.session.juryMood[jIdx] = Util.clamp(this.session.juryMood[jIdx] + eff.juryDelta, -3, 3);
    }
    if (eff.scoreDelta) this.session.score += eff.scoreDelta;
    if (eff.repDelta) Stats.modify('reputation', eff.repDelta);
    if (eff.moraleDelta) Stats.modify('morale', eff.moraleDelta);

    // Show event in dialogue
    this.session.dialogQueue = [
      { speaker: 'COURT CLERK', text: `⚠️ ${event.title}: ${event.text}` },
    ];
    this.session.dialogIndex = 0;
    this.session.phase = 'dialog';
    this.dom.actionOverlay.style.display = 'none';

    UI.toast(event.title, event.text, 'info');

    this.showNextDialogue();

    // After dialogue, show event choices
    this._pendingEventChoices = event.playerChoices;
    this._postEventMode = true;
  },

  // Override advanceDialog to check for post-event mode
  advanceDialog() {
    if (!this.session || this.session.phase !== 'dialog') return;

    const q = this.session.dialogQueue;
    if (this.session.dialogIndex >= q.length) {
      // Check what comes next
      if (this._postEventMode && this._pendingEventChoices) {
        this._postEventMode = false;
        this.showEventChoices(this._pendingEventChoices);
        this._pendingEventChoices = null;
        return;
      }
      if (this._postChoiceStage) {
        this._postChoiceStage = false;
        // Advance to next stage
        this.session.stageIndex++;
        this.session.objectionCooldown = Math.max(0, this.session.objectionCooldown - 1);
        this.updateStageTrack();

        if (this.session.stageIndex >= this.session.caseData.stages.length) {
          this.triggerVerdict();
        } else {
          this.session.day++;
          this.buildStageDialogue(this.session.stageIndex);
        }
        return;
      }
      this.showStageChoices();
      return;
    }

    this.showNextDialogue();
  },

  showEventChoices(choices) {
    if (!choices || choices.length === 0) {
      this._postChoiceStage = true;
      this.showStageChoices();
      return;
    }

    this.session.phase = 'action';
    this.dom.actionTitle.textContent = 'How do you respond?';
    this.dom.actionChoices.innerHTML = choices.map((c, idx) => `
      <button class="action-choice-btn safe" data-event-idx="${idx}">
        <span class="choice-letter">${String.fromCharCode(65 + idx)}</span>
        <div class="choice-body">
          <div class="choice-text">${c.text}</div>
        </div>
      </button>
    `).join('');

    this.dom.actionChoices.querySelectorAll('.action-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventChoice = choices[parseInt(btn.dataset.eventIdx)];
        if (eventChoice && eventChoice.outcome) {
          const o = eventChoice.outcome;
          if (o.scoreDelta) this.session.score += o.scoreDelta;
          if (o.repDelta) Stats.modify('reputation', o.repDelta);
          if (o.moraleDelta) Stats.modify('morale', o.moraleDelta);
          if (o.juryDelta) {
            const jIdx = Math.floor(Math.random() * 6);
            this.session.juryMood[jIdx] = Util.clamp(this.session.juryMood[jIdx] + o.juryDelta, -3, 3);
          }
        }
        this.dom.actionOverlay.style.display = 'none';
        this.session.phase = 'dialog';
        this._postChoiceStage = true;
        this.session.dialogQueue = [{ speaker: 'COURT CLERK', text: 'The court notes your response and continues.' }];
        this.session.dialogIndex = 0;
        this.showNextDialogue();
      });
    });

    this.renderJuryFaces();
    this.dom.actionOverlay.style.display = 'flex';
  },

  // ── Verdict ───────────────────────────────────────────
  triggerVerdict() {
    if (!this.session) return;
    this.session.phase = 'verdict';
    this.dom.actionOverlay.style.display = 'none';

    const c = this.session;
    const p = GameState.player;

    // Calculate total jury mood
    const juryTotal = c.juryMood.reduce((a, b) => a + b, 0);
    const scorePct = c.maxScore > 0 ? c.score / c.maxScore : 0.5;

    // Determine verdict
    const winThreshold = 0.45 + (juryTotal < 0 ? 0.1 : 0);
    const isWin = scorePct >= winThreshold && juryTotal >= -2;
    const isHung = !isWin && juryTotal >= -1 && Math.random() > 0.5;

    const verdictText = isWin ? 'GUILTY' : isHung ? 'HUNG JURY' : 'NOT GUILTY';
    const verdictLabel = isWin ? (p.specialty === 'defense' ? 'CASE LOST' : 'VICTORY!') :
                          isHung ? 'HUNG JURY' :
                          (p.specialty === 'defense' ? 'VICTORY!' : 'CASE LOST');

    const won = (verdictText === 'GUILTY' && p.specialty !== 'civilrights') ||
                (verdictText === 'NOT GUILTY' && p.specialty === 'civilrights') ||
                (verdictText === 'GUILTY' && !isHung);

    // Actually, simplify: score > threshold = win for player
    const playerWon = scorePct >= winThreshold;

    // Rewards
    const baseReward = DATA.CAREER_RANKS[p.rank]?.salary || 5000;
    const bonus = playerWon ? Math.round(baseReward * (0.3 + scorePct * 0.4)) : 0;
    const repGain = playerWon ? Util.rand(5, 15) : Util.rand(-5, 2);
    const skillGain = Util.rand(1, 3);

    // Apply results
    if (playerWon) {
      p.casesWon++;
      p._winStreak = (p._winStreak || 0) + 1;
    } else {
      p.casesLost++;
      p._winStreak = 0;
      Stats.modify('morale', -10);
    }

    if (bonus > 0) Stats.addMoney(bonus);
    Stats.modify('reputation', repGain);
    Stats.modify('skill', skillGain);

    // Perfect case
    if (scorePct >= 0.9) p._lastPerfect = true;
    else p._lastPerfect = false;

    // Remove from docket
    p.docket = p.docket.filter(c => c !== this.session.caseData);
    p.activeCase = null;

    // Show verdict
    this.dom.vrResult.textContent = playerWon ? '⚖️ VICTORY' : '📋 SETBACK';
    this.dom.vrResult.style.color = playerWon ? '#50c860' : '#c85050';

    this.dom.vrDetail.innerHTML = `
      <div>Score: ${Math.round(scorePct * 100)}% effectiveness</div>
      <div>Jury: ${c.juryMood.filter(m => m >= 0).length}/6 favorable</div>
      <div>Verdict: <strong>${verdictText}</strong></div>
    `;

    this.dom.vrRewards.innerHTML = `
      <div class="vr-reward ${bonus > 0 ? 'pos' : ''}">💰 ${bonus > 0 ? '+' + Util.formatMoney(bonus) : 'No bonus'}</div>
      <div class="vr-reward ${repGain > 0 ? 'pos' : 'neg'}">⭐ ${repGain > 0 ? '+' : ''}${repGain} Reputation</div>
      <div class="vr-reward pos">📚 +${skillGain} Skill</div>
    `;

    this.dom.verdictReveal.style.display = 'flex';
    Stats.checkPromotion();
    UI.checkAchievements();
  },

  endCase() {
    this.stop();
    this.session = null;
    this.dom.verdictReveal.style.display = 'none';
    Hub.updateHUD();
    ScreenManager.goTo('hub');

    // Add new case
    if (GameState.player.docket.length < 3) {
      GameState.player.docket.push(
        DATA.generateCase(GameState.player.rank, GameState.player.specialty)
      );
    }
  },
};

// Register init
ScreenManager.registerOnEnter('court', () => {
  Court.resize();
});
