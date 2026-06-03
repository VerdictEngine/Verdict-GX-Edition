/* ═══════════════════════════════════════════════════════
   VERDICT! GX — UI.JS
   All UI rendering: screens, components, character creation
   ═══════════════════════════════════════════════════════ */
'use strict';

const UI = {

  // ──────────────────────────────────────────────────────
  //  TOAST SYSTEM
  // ──────────────────────────────────────────────────────
  _toastContainer: null,
  initToasts() {
    this._toastContainer = document.getElementById('toast-container');
  },
  toast(title, message, type = 'info', duration = 3500) {
    const el = document.createElement('div');
    el.className = `toast type-${type}`;
    el.innerHTML = `<div class="toast-title">${title}</div><div>${message}</div>`;
    this._toastContainer.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, duration);
  },

  // ──────────────────────────────────────────────────────
  //  HUB HEADER UPDATE
  // ──────────────────────────────────────────────────────
  updateHubHeader() {
    const p = GameState.player;
    const nameEl = document.getElementById('hub-player-name');
    const rankEl = document.getElementById('hub-player-rank');
    const moneyEl = document.getElementById('hub-money');
    const dateEl = document.getElementById('hub-date');
    if (nameEl) nameEl.textContent = `Atty. ${p.lastName}`;
    if (rankEl) rankEl.textContent = p.rankTitle;
    if (moneyEl) moneyEl.textContent = Util.formatMoney(p.money);
    if (dateEl) dateEl.textContent = Util.formatDate(p.month);

    // Bars
    this._setBar('hub-rep-bar', p.reputation, 'hub-rep-val');
    this._setBar('hub-skill-bar', p.skill, 'hub-skill-val');
    this._setBar('hub-morale-bar', p.morale, 'hub-morale-val');

    // Cases badge
    const badge = document.getElementById('cases-badge');
    if (badge) badge.textContent = p.docket.length;

    // Mini avatar
    this.renderMiniAvatar('hub-avatar-mini');
  },

  _setBar(barId, value, valId) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    if (bar) bar.style.width = Util.clamp(value, 0, 100) + '%';
    if (val) val.textContent = Math.round(value);
  },

  // ──────────────────────────────────────────────────────
  //  CHARACTER CREATION
  // ──────────────────────────────────────────────────────
  initCreateScreen() {
    this._setupSkinSwatches();
    this._setupHairOptions();
    this._setupSuitOptions();
    this._setupRadioGroups();
    this._setupAgeSlider();
    this._setupSpecialtyGrid();
    this._setupBackstoryGrid();
    this._setupCreateNavigation();
    this._updateStatPreview();
    this._updateAvatarPreview();
  },

  _setupSkinSwatches() {
    const container = document.getElementById('skin-swatches');
    if (!container) return;
    container.innerHTML = '<div class="swatch-label">Skin</div>';
    DATA.SKIN_COLORS.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'swatch' + (i === 0 ? ' active' : '');
      el.style.background = s.hex;
      el.title = s.name;
      el.addEventListener('click', () => {
        container.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        GameState.player.skinIndex = i;
        this._updateAvatarPreview();
      });
      container.appendChild(el);
    });
  },

  _setupHairOptions() {
    const container = document.getElementById('hair-options');
    if (!container) return;
    container.innerHTML = '<div class="swatch-label">Hair</div>';
    DATA.HAIR_COLORS.forEach((h, i) => {
      const el = document.createElement('div');
      el.className = 'swatch' + (i === 0 ? ' active' : '');
      el.style.background = h.hex;
      el.title = h.name;
      el.addEventListener('click', () => {
        container.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        GameState.player.hairIndex = i;
        this._updateAvatarPreview();
      });
      container.appendChild(el);
    });
  },

  _setupSuitOptions() {
    const container = document.getElementById('suit-options');
    if (!container) return;
    container.innerHTML = '<div class="swatch-label">Suit</div>';
    DATA.SUIT_COLORS.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'suit-btn' + (i === 0 ? ' active' : '');
      btn.textContent = s.label;
      btn.style.borderLeftColor = s.hex;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.suit-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        GameState.player.suitIndex = i;
        this._updateAvatarPreview();
      });
      container.appendChild(btn);
    });
  },

  _setupRadioGroups() {
    document.querySelectorAll('.radio-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const group = opt.closest('.radio-group');
        group.querySelectorAll('.radio-opt').forEach(x => x.classList.remove('active'));
        opt.classList.add('active');
        GameState.player.pronoun = opt.dataset.val;
      });
    });
  },

  _setupAgeSlider() {
    const slider = document.getElementById('char-age');
    const val = document.getElementById('char-age-val');
    if (!slider) return;
    slider.addEventListener('input', () => {
      GameState.player.age = parseInt(slider.value);
      val.textContent = slider.value;
    });
  },

  _updateAvatarPreview() {
    const container = document.getElementById('avatar-body');
    if (!container) return;

    const p = GameState.player;
    const skin = DATA.SKIN_COLORS[p.skinIndex]?.hex || '#c8a87a';
    const hair = DATA.HAIR_COLORS[p.hairIndex]?.hex || '#2a1a00';
    const suit = DATA.SUIT_COLORS[p.suitIndex]?.hex || '#1a1a2e';

    // Draw on a small canvas
    const canvas = document.createElement('canvas');
    canvas.width = 140; canvas.height = 220;
    const ctx = canvas.getContext('2d');
    Util.drawSprite(ctx, 10, 10, 120, 200, { skinColor: skin, hairColor: hair, suitColor: suit });

    // Show as img
    container.innerHTML = '';
    container.appendChild(canvas);

    // Name tag
    const nameTag = document.getElementById('avatar-name-tag');
    const first = document.getElementById('char-first')?.value || 'Attorney';
    const last = document.getElementById('char-last')?.value || '';
    if (nameTag) nameTag.textContent = `${first} ${last}`.trim();
  },

  _updateStatPreview() {
    const container = document.getElementById('stat-bars-preview');
    if (!container) return;
    const p = GameState.player;
    const specialty = DATA.SPECIALTIES.find(s => s.id === p.specialty) || DATA.SPECIALTIES[0];
    const backstory = DATA.BACKSTORIES.find(b => b.id === p.backstory);

    const stats = [
      { name: 'Reputation', base: 20 + (specialty?.stats.reputation || 0) + (backstory?.stats.reputation || 0) },
      { name: 'Skill',      base: 15 + (specialty?.stats.skill || 0)      + (backstory?.stats.skill || 0) },
      { name: 'Morale',     base: 70 + (specialty?.stats.morale || 0)     + (backstory?.stats.morale || 0) },
    ];

    container.innerHTML = stats.map(s => {
      const v = Util.clamp(s.base, 0, 100);
      return `<div class="stat-bar-row">
        <span class="stat-bar-name">${s.name}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill-inner" style="width:${v}%"></div></div>
        <span class="stat-bar-val">${v}</span>
      </div>`;
    }).join('');
  },

  _setupSpecialtyGrid() {
    const grid = document.getElementById('specialty-grid');
    if (!grid) return;
    grid.innerHTML = DATA.SPECIALTIES.map(s => `
      <div class="specialty-card" data-id="${s.id}">
        <div class="specialty-icon">${s.icon}</div>
        <div class="specialty-name">${s.name}</div>
        <div class="specialty-desc">${s.desc}</div>
        <div class="specialty-bonus">${s.bonus}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.specialty-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        GameState.player.specialty = card.dataset.id;
        const spec = DATA.SPECIALTIES.find(s => s.id === card.dataset.id);
        document.getElementById('specialty-selected').textContent =
          `Selected: ${spec.name} — ${spec.bonus}`;
        this._updateStatPreview();
      });
    });
  },

  _setupBackstoryGrid() {
    const grid = document.getElementById('backstory-grid');
    if (!grid) return;
    grid.innerHTML = DATA.BACKSTORIES.map(b => `
      <div class="backstory-card" data-id="${b.id}">
        <div class="backstory-icon">${b.icon}</div>
        <div>
          <div class="backstory-title">${b.title}</div>
          <div class="backstory-text">${b.text}</div>
          <div class="backstory-perks">
            ${b.perks.map(p => `<span class="perk-tag">${p}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.backstory-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.backstory-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        GameState.player.backstory = card.dataset.id;
        this._updateStatPreview();
      });
    });
  },

  _setupCreateNavigation() {
    const steps = [1, 2, 3];

    // Name inputs update avatar
    ['char-first', 'char-last'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this._updateAvatarPreview());
    });

    document.getElementById('step1-next')?.addEventListener('click', () => {
      const first = document.getElementById('char-first')?.value?.trim();
      const last = document.getElementById('char-last')?.value?.trim();
      if (!first || !last) { this.toast('Required', 'Please enter your character name.', 'danger'); return; }
      GameState.player.firstName = first;
      GameState.player.lastName = last;
      this._goCreateStep(2);
    });

    document.getElementById('step2-back')?.addEventListener('click', () => this._goCreateStep(1));
    document.getElementById('step2-next')?.addEventListener('click', () => {
      if (!GameState.player.specialty) { this.toast('Required', 'Please choose a specialty.', 'danger'); return; }
      this._goCreateStep(3);
    });

    document.getElementById('step3-back')?.addEventListener('click', () => this._goCreateStep(2));
    document.getElementById('step3-begin')?.addEventListener('click', () => {
      if (!GameState.player.backstory) { this.toast('Required', 'Please choose a backstory.', 'danger'); return; }
      Main.beginCareer();
    });
  },

  _goCreateStep(n) {
    document.querySelectorAll('.create-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`create-step-${n}`)?.classList.remove('hidden');

    document.querySelectorAll('.create-step-indicator .step').forEach(s => {
      const stepN = parseInt(s.dataset.step);
      s.classList.toggle('active', stepN === n);
    });
  },

  // ──────────────────────────────────────────────────────
  //  DOCKET SCREEN
  // ──────────────────────────────────────────────────────
  renderDocket() {
    const list = document.getElementById('docket-list');
    if (!list) return;
    const cases = GameState.player.docket;

    if (cases.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--c-text3);padding:40px;font-style:italic;">No cases in your docket. Visit the courthouse.</div>';
      return;
    }

    list.innerHTML = cases.map((c, i) => {
      const difficulty = c.difficulty ?? 1;
      const pips = Array.from({length: 5}, (_, j) =>
        `<div class="diff-pip ${j < difficulty ? 'filled' : ''}"></div>`
      ).join('');

      return `
        <div class="docket-item urgency-${c.severity || 'felony'}" data-case-index="${i}">
          <div class="docket-case-num">
            <span>${c.id}</span>
            <strong>${c.crimeIcon || '⚖️'}</strong>
          </div>
          <div class="docket-info">
            <div class="docket-case-name">${c.title}</div>
            <div class="docket-case-meta">
              <span>${c.crime}</span>
              <span>·</span>
              <span>${c.severity}</span>
              <span>·</span>
              <span>Fee: ${Util.formatMoney(c.fee)}</span>
            </div>
            <div class="docket-case-desc">Defendant: ${c.defendant.firstName} ${c.defendant.lastName} · Judge: ${c.judge}</div>
            <div class="docket-difficulty" style="margin-top:8px">${pips}</div>
          </div>
          <div class="docket-actions">
            <button class="docket-btn docket-btn-view" data-case-index="${i}">View File</button>
            ${c.active ? 
              `<button class="docket-btn docket-btn-accept" data-case-index="${i}" data-action="trial">Go to Trial →</button>` :
              `<button class="docket-btn docket-btn-accept" data-case-index="${i}" data-action="accept">Accept Case</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.docket-btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.caseIndex);
        UI.showCaseFile(GameState.player.docket[idx]);
      });
    });

    list.querySelectorAll('[data-action="accept"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.caseIndex);
        const c = GameState.player.docket[idx];
        c.active = true;
        this.toast('Case Accepted', c.title, 'success');
        this.renderDocket();
      });
    });

    list.querySelectorAll('[data-action="trial"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.caseIndex);
        Court.startCase(GameState.player.docket[idx]);
      });
    });
  },

  // ──────────────────────────────────────────────────────
  //  CASE FILE SCREEN
  // ──────────────────────────────────────────────────────
  showCaseFile(caseData) {
    GameState._caseFileData = caseData;
    ScreenManager.goTo('casefile');
    // Render after transition so the screen is visible
    setTimeout(() => this.renderCaseFile(caseData), 80);
  },

  renderCaseFile(caseData) {
    const tabRow = document.getElementById('casefile-tabs');
    const body = document.getElementById('casefile-body');
    const stamp = document.getElementById('casefile-stamp');

    if (!tabRow || !body || !caseData) return;

    const tabs = ['Summary', 'Evidence', 'Witnesses', 'Strategy'];
    let activeTab = 0;

    stamp.textContent = caseData.active ? 'OPEN' : 'PENDING';
    stamp.className = 'casefile-stamp' + (caseData.result === 'won' ? ' closed' : '');

    tabRow.innerHTML = tabs.map((t, i) =>
      `<div class="casefile-tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${t}</div>`
    ).join('');

    const renderTab = (idx) => {
      tabRow.querySelectorAll('.casefile-tab').forEach(t => t.classList.remove('active'));
      tabRow.querySelectorAll('.casefile-tab')[idx]?.classList.add('active');

      if (idx === 0) {
        const diff = caseData.difficulty ?? 1;
        body.innerHTML = `
          <div class="cf-section">
            <div class="cf-section-title">Case Information</div>
            <div class="cf-field-row">
              <div class="cf-field"><div class="cf-field-label">Case ID</div><div class="cf-field-val">${caseData.id}</div></div>
              <div class="cf-field"><div class="cf-field-label">Charge</div><div class="cf-field-val">${caseData.crime}</div></div>
              <div class="cf-field"><div class="cf-field-label">Severity</div><div class="cf-field-val">${caseData.severity}</div></div>
            </div>
            <div class="cf-field-row">
              <div class="cf-field"><div class="cf-field-label">Defendant</div><div class="cf-field-val">${caseData.defendant.firstName} ${caseData.defendant.lastName}</div></div>
              <div class="cf-field"><div class="cf-field-label">Opposing Counsel</div><div class="cf-field-val">${caseData.opponent}</div></div>
              <div class="cf-field"><div class="cf-field-label">Presiding Judge</div><div class="cf-field-val">${caseData.judge}</div></div>
            </div>
            <div class="cf-field-row">
              <div class="cf-field"><div class="cf-field-label">Case Fee</div><div class="cf-field-val">${Util.formatMoney(caseData.fee)}</div></div>
              <div class="cf-field"><div class="cf-field-label">Difficulty</div><div class="cf-field-val">${'★'.repeat(diff)}${'☆'.repeat(5-diff)}</div></div>
            </div>
          </div>
          <div class="cf-section">
            <div class="cf-section-title">Tags & Classification</div>
            <div class="cf-tag-list">
              <span class="cf-tag">${caseData.severity.toUpperCase()}</span>
              <span class="cf-tag">DIFFICULTY: ${diff}/5</span>
              <span class="cf-tag">FEE: ${Util.formatMoney(caseData.fee)}</span>
              ${caseData.active ? '<span class="cf-tag">ACTIVE</span>' : '<span class="cf-tag">PENDING</span>'}
            </div>
          </div>
        `;
      } else if (idx === 1) {
        body.innerHTML = `
          <div class="cf-section">
            <div class="cf-section-title">Evidence Inventory</div>
            <div class="cf-evidence-grid">
              ${caseData.evidence.map(ev => `
                <div class="cf-evidence-item">
                  <div class="cf-evidence-photo">${ev.icon}</div>
                  <div class="cf-evidence-caption">
                    <strong>${ev.name}</strong><br>
                    ${ev.desc}<br>
                    <span style="color:#8a6a30">Score: +${ev.scoreBonus} | Rep: +${ev.repBonus}</span>
                    ${ev.used ? '<br><em style="color:#8a3a3a">USED IN TRIAL</em>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (idx === 2) {
        // Extract witness names mentioned in stage dialogue
        const witnessNames = [];
        (caseData.stages || []).forEach(stage => {
          (stage.dialogue || []).forEach(line => {
            if (line.speaker && line.speaker !== 'YOUR INNER VOICE' && line.speaker !== 'BAILIFF' &&
                line.speaker !== caseData.judge && line.speaker !== caseData.opponent &&
                !line.speaker.startsWith('YOUR')) {
              if (!witnessNames.includes(line.speaker)) witnessNames.push(line.speaker);
            }
          });
        });
        body.innerHTML = `
          <div class="cf-section">
            <div class="cf-section-title">Witness List</div>
            ${witnessNames.length ? witnessNames.map(name => `
              <div style="margin-bottom:16px;padding:16px;background:#e8d8b0;border:1px solid #c8b48a;border-radius:6px;">
                <div style="font-size:18px;font-weight:700;color:#1a0a00;margin-bottom:4px;">${name}</div>
                <div style="font-size:13px;color:#5a3a10;margin-bottom:8px;">Trial Witness</div>
                <div style="font-size:14px;color:#2a1a00;line-height:1.6;">Scheduled to testify. Review their role in each stage carefully.</div>
              </div>
            `).join('') : '<p style="color:#5a3a10;font-style:italic">No witnesses identified yet.</p>'}
          </div>
        `;
      } else if (idx === 3) {
        body.innerHTML = `
          <div class="cf-section">
            <div class="cf-section-title">Trial Strategy Overview</div>
            <p class="cf-paragraph">This case proceeds through ${(caseData.stages || []).length} stages. Plan your approach for each phase below.</p>
          </div>
          <div class="cf-section">
            <div class="cf-section-title">Stage Breakdown</div>
            ${(caseData.stages || []).map((s, i) => `
              <div style="margin-bottom:12px;padding:12px 16px;background:#e8d8b0;border-left:3px solid #8a6a30;border-radius:4px;">
                <strong>Stage ${i+1}: ${s.name || s}</strong>
                <br><span style="font-size:13px;color:#5a3a10;">${s.prompt || 'Select from multiple actions. Skill and morale affect outcomes.'}</span>
              </div>
            `).join('')}
          </div>
          <div class="cf-section">
            <div class="cf-section-title">Recommended Approach</div>
            <p class="cf-paragraph">As Defense, sow reasonable doubt from the opening. Challenge the credibility of opposition witnesses. Close by returning to the presumption of innocence.</p>
          </div>
        `;
      }
    };

    renderTab(0);

    tabRow.querySelectorAll('.casefile-tab').forEach(tab => {
      tab.addEventListener('click', () => renderTab(parseInt(tab.dataset.tab)));
    });
  },

  // ──────────────────────────────────────────────────────
  //  SKILLS SCREEN
  // ──────────────────────────────────────────────────────
  renderSkillsScreen() {
    const grid = document.getElementById('skills-grid');
    const pointsDisplay = document.getElementById('skill-points-display');
    if (!grid) return;

    const p = GameState.player;
    if (pointsDisplay) pointsDisplay.textContent = p.skillPoints;

    grid.innerHTML = DATA.SKILLS.map(category => `
      <div class="skill-tree-section">
        <div class="skill-tree-title">${category.icon} ${category.category}</div>
        ${category.skills.map(skill => {
          const level = Stats.getSkillLevel(skill.id);
          const maxed = level >= skill.maxLevel;
          const cost = level + 1; // matches upgradeSkill cost formula
          const canAfford = p.skillPoints >= cost;
          const pips = Array.from({length: skill.maxLevel}, (_, i) =>
            `<div class="skill-level-pip ${i < level ? 'filled' : ''}"></div>`
          ).join('');

          return `
            <div class="skill-node ${maxed ? 'maxed' : ''}" data-skill="${skill.id}">
              <div class="skill-node-cost ${canAfford && !maxed ? 'can-afford' : ''}">
                ${maxed ? '✓ MAX' : `${cost} pt${cost > 1 ? 's' : ''}`}
              </div>
              <div class="skill-node-name">${skill.name}</div>
              <div class="skill-node-desc">${skill.desc}</div>
              <div class="skill-node-level">${pips}</div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');

    grid.querySelectorAll('.skill-node:not(.maxed)').forEach(node => {
      node.addEventListener('click', () => {
        if (Stats.upgradeSkill(node.dataset.skill)) {
          this.renderSkillsScreen();
        }
      });
    });
  },

  // ──────────────────────────────────────────────────────
  //  CAREER SCREEN
  // ──────────────────────────────────────────────────────
  renderCareerScreen() {
    const track = document.getElementById('career-track');
    const achieve = document.getElementById('career-achievements');
    if (!track) return;

    const p = GameState.player;

    track.innerHTML = DATA.CAREER_RANKS.map((rank, i) => {
      const achieved = i <= p.rank;
      const current = i === p.rank;
      const reqs = rank.requirements;
      const repMet = p.reputation >= reqs.reputation;
      const wonMet = p.casesWon >= reqs.casesWon;
      const skillMet = p.skill >= reqs.skill;

      return `
        <div class="career-rank-item ${achieved ? 'achieved' : ''} ${current ? 'current' : ''}">
          <div class="career-rank-icon">${rank.icon}</div>
          <div class="career-rank-info">
            <div class="career-rank-name">${rank.title} ${current ? '← YOU' : ''}</div>
            <div class="career-rank-desc">${rank.desc}</div>
            <div class="career-rank-requirements">
              <span class="career-req ${repMet ? 'met' : ''}">Rep: ${reqs.reputation}</span>
              <span class="career-req ${wonMet ? 'met' : ''}">Wins: ${reqs.casesWon}</span>
              <span class="career-req ${skillMet ? 'met' : ''}">Skill: ${reqs.skill}</span>
            </div>
            <div class="career-rank-salary">Monthly: ${Util.formatMoney(rank.salary)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Achievements
    if (achieve) {
      achieve.innerHTML = `
        <h3>Achievements</h3>
        <div class="achieve-grid">
          ${DATA.ACHIEVEMENTS.map(a => {
            const unlocked = p.achievements.includes(a.id);
            return `
              <div class="achieve-item ${unlocked ? 'unlocked' : ''}">
                <div class="achieve-icon">${a.icon}</div>
                <div class="achieve-name">${a.name}</div>
                <div class="achieve-desc">${a.desc}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  },

  // ──────────────────────────────────────────────────────
  //  CONTACTS SCREEN
  // ──────────────────────────────────────────────────────
  renderContactsScreen() {
    const grid = document.getElementById('contacts-grid');
    if (!grid) return;

    grid.innerHTML = DATA.CONTACTS.map(c => {
      const playerContact = GameState.player.contacts.find(pc => pc.id === c.id);
      const relation = playerContact?.relation || 0;
      const pips = Array.from({length: 5}, (_, i) =>
        `<div class="relation-pip ${i < relation ? 'filled' : ''}"></div>`
      ).join('');

      // Draw contact avatar
      const canvasId = `contact-canvas-${c.id}`;

      return `
        <div class="contact-card" data-contact="${c.id}">
          <div class="contact-avatar" id="${canvasId}">
            <span style="font-size:36px;display:flex;align-items:center;justify-content:center;height:100%">${c.icon}</span>
          </div>
          <div class="contact-name">${c.name}</div>
          <div class="contact-role">${c.role}</div>
          <div class="contact-relation">${pips}</div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.contact-card').forEach(card => {
      card.addEventListener('click', () => {
        const contact = DATA.CONTACTS.find(c => c.id === card.dataset.contact);
        this._showContactDetail(contact);
      });
    });
  },

  _showContactDetail(contact) {
    const panel = document.getElementById('contact-detail');
    if (!panel || !contact) return;

    const playerContact = GameState.player.contacts.find(c => c.id === contact.id);
    const relation = playerContact?.relation || 0;

    panel.style.display = 'block';
    panel.innerHTML = `
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start">
        <div></div>
        <button onclick="document.getElementById('contact-detail').style.display='none'" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;width:32px;height:32px;color:var(--c-text2);cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="text-align:center;font-size:60px;margin-bottom:16px">${contact.icon}</div>
      <div style="font-family:var(--font-serif);font-size:22px;font-weight:700;color:var(--c-text);margin-bottom:4px">${contact.name}</div>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--c-gold);letter-spacing:0.08em;margin-bottom:16px">${contact.role}</div>
      <div style="font-size:14px;color:var(--c-text2);line-height:1.6;margin-bottom:16px">${contact.bio}</div>
      <div style="background:var(--c-card);border:1px solid var(--c-border);border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--c-text3);margin-bottom:6px">RELATIONSHIP EFFECT</div>
        <div style="font-size:13px;color:var(--c-text2)">${contact.effect}</div>
      </div>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--c-text3);margin-bottom:8px">RELATIONSHIP: ${relation}/5</div>
      <div style="display:flex;gap:4px">
        ${Array.from({length:5},(_,i)=>`<div style="flex:1;height:6px;border-radius:4px;background:${i<relation?'var(--c-gold)':'rgba(255,255,255,0.06)'}"></div>`).join('')}
      </div>
      <div style="margin-top:16px;font-style:italic;font-size:13px;color:var(--c-text3)">
        "${Util.randItem(contact.specialDialogue)}"
      </div>
    `;
  },

  // ──────────────────────────────────────────────────────
  //  MINI AVATAR (for hub header)
  // ──────────────────────────────────────────────────────
  renderMiniAvatar(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container._rendered) return;
    const p = GameState.player;
    const skin = DATA.SKIN_COLORS[p.skinIndex]?.hex || '#c8a87a';
    const hair = DATA.HAIR_COLORS[p.hairIndex]?.hex || '#2a1a00';
    const suit = DATA.SUIT_COLORS[p.suitIndex]?.hex || '#1a1a2e';

    const canvas = document.createElement('canvas');
    canvas.width = 36; canvas.height = 36;
    canvas.style.width = '36px';
    canvas.style.height = '36px';
    canvas.style.borderRadius = '50%';
    const ctx = canvas.getContext('2d');
    Util.drawSprite(ctx, 2, 0, 32, 36, { skinColor: skin, hairColor: hair, suitColor: suit, shadow: false });
    container.innerHTML = '';
    container.appendChild(canvas);
    container._rendered = true;
  },

  // ──────────────────────────────────────────────────────
  //  ACHIEVEMENT CHECK & TOAST
  // ──────────────────────────────────────────────────────
  checkAchievements() {
    const p = GameState.player;
    DATA.ACHIEVEMENTS.forEach(ach => {
      if (!p.achievements.includes(ach.id) && ach.check(p)) {
        p.achievements.push(ach.id);
        this.toast(`🏆 Achievement Unlocked!`, `${ach.icon} ${ach.name}: ${ach.desc}`, 'success', 5000);
      }
    });
  },
};