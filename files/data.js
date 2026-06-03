/* ═══════════════════════════════════════════════════════
   VERDICT! GX — DATA.JS
   All game content: cases, characters, skills, career, etc.
   ═══════════════════════════════════════════════════════ */
'use strict';

const DATA = {

  // ──────────────────────────────────────────────────────
  //  AVATAR OPTIONS
  // ──────────────────────────────────────────────────────
  SKIN_COLORS: [
    { name: 'Ivory',      hex: '#f2d9b8' },
    { name: 'Sand',       hex: '#d4a876' },
    { name: 'Caramel',    hex: '#b8793a' },
    { name: 'Mahogany',   hex: '#7a3d1a' },
    { name: 'Ebony',      hex: '#3d1f0a' },
    { name: 'Olive',      hex: '#c4a46a' },
  ],
  HAIR_COLORS: [
    { name: 'Jet Black', hex: '#0d0a06' },
    { name: 'Dark Brown', hex: '#2a1a06' },
    { name: 'Auburn',     hex: '#6b2d0a' },
    { name: 'Blonde',     hex: '#c8a040' },
    { name: 'Platinum',   hex: '#e8e0d0' },
    { name: 'Silver',     hex: '#909090' },
  ],
  SUIT_COLORS: [
    { name: 'Navy',       hex: '#0f1a2e', label: 'Navy' },
    { name: 'Charcoal',   hex: '#2a2a2e', label: 'Charcoal' },
    { name: 'Midnight',   hex: '#0a0a1a', label: 'Midnight' },
    { name: 'Dark Forest',hex: '#0a1e0f', label: 'Forest' },
    { name: 'Burgundy',   hex: '#2e0a0a', label: 'Burgundy' },
    { name: 'Tan',        hex: '#3a2e1a', label: 'Tan' },
  ],

  // ──────────────────────────────────────────────────────
  //  SPECIALTIES
  // ──────────────────────────────────────────────────────
  SPECIALTIES: [
    {
      id: 'criminal',
      name: 'Criminal Law',
      icon: '⚖️',
      desc: 'Prosecution and defense of criminal cases. High stakes, high drama.',
      bonus: '+15 Persuasion, +10 Evidence Analysis',
      stats: { skill: 5, reputation: 0, morale: 5 },
      startingMoney: 8000,
    },
    {
      id: 'corporate',
      name: 'Corporate Law',
      icon: '🏢',
      desc: 'Complex business disputes and regulatory compliance. Lucrative work.',
      bonus: '+20 Research, +10 Negotiation',
      stats: { skill: 8, reputation: 5, morale: -5 },
      startingMoney: 18000,
    },
    {
      id: 'constitutional',
      name: 'Constitutional Law',
      icon: '📜',
      desc: 'Landmark cases that shape the nation. Prestige over profit.',
      bonus: '+25 Reputation, +15 Public Speaking',
      stats: { skill: 3, reputation: 15, morale: 10 },
      startingMoney: 5000,
    },
    {
      id: 'civilrights',
      name: 'Civil Rights',
      icon: '✊',
      desc: 'Fighting for justice. Lower pay, but enormous satisfaction.',
      bonus: '+20 Morale, +15 Jury Appeal',
      stats: { skill: 5, reputation: 10, morale: 20 },
      startingMoney: 4000,
    },
    {
      id: 'familylaw',
      name: 'Family Law',
      icon: '👨‍👩‍👧',
      desc: 'Divorce, custody, and mediation. Emotionally demanding work.',
      bonus: '+10 Empathy, +10 Negotiation',
      stats: { skill: 6, reputation: 3, morale: 0 },
      startingMoney: 10000,
    },
    {
      id: 'immigration',
      name: 'Immigration Law',
      icon: '🌐',
      desc: 'Complex international cases. Requires deep legal knowledge.',
      bonus: '+15 Research, +10 Documentation',
      stats: { skill: 10, reputation: 0, morale: 8 },
      startingMoney: 9000,
    },
  ],

  // ──────────────────────────────────────────────────────
  //  BACKSTORIES
  // ──────────────────────────────────────────────────────
  BACKSTORIES: [
    {
      id: 'top_law',
      icon: '🎓',
      title: 'Ivy League Graduate',
      text: 'Yale Law, top of your class. Every door was open—you chose the hard cases anyway. You arrive with pedigree but must prove you are more than a name.',
      perks: ['Strong Networker', 'Academic Edge'],
      stats: { skill: 10, reputation: 5, morale: -5, money: 5000 },
    },
    {
      id: 'public_defender',
      icon: '🛡️',
      title: 'Former Public Defender',
      text: 'Six years in the trenches, 40 cases at a time. Underpaid, overworked, and unstoppable. You know the systems cracks better than anyone.',
      perks: ['Street Smart', 'Iron Will'],
      stats: { skill: 5, reputation: 0, morale: 15, money: -3000 },
    },
    {
      id: 'prosecutor',
      icon: '⚖️',
      title: 'Ex-Prosecutor',
      text: 'You built the states cases for a decade before switching sides. You know exactly how the opposition thinks—because you were them.',
      perks: ['Inside Knowledge', 'Cross-Exam Expert'],
      stats: { skill: 8, reputation: 8, morale: 0, money: 2000 },
    },
    {
      id: 'corporate_refugee',
      icon: '💼',
      title: 'Corporate Dropout',
      text: 'BigLaw made you rich and miserable. You quit a seven-figure partnership to do work that matters. Your war chest is fat; your ego needs rebuilding.',
      perks: ['Deep Pockets', 'Resource Access'],
      stats: { skill: 0, reputation: -5, morale: 10, money: 20000 },
    },
    {
      id: 'self_made',
      icon: '🔥',
      title: 'Self-Made Fighter',
      text: 'No connections, no trust fund. Night school while working three jobs. Everything you have, you earned the hard way. The courtroom is your arena.',
      perks: ['Resilience', 'Underdog Aura'],
      stats: { skill: 3, reputation: 3, morale: 20, money: -5000 },
    },
    {
      id: 'late_bloomer',
      icon: '🌱',
      title: 'Career Changer',
      text: 'You were a doctor, cop, or journalist before law school. Your past life is your competitive advantage—the law is new; your judgment is seasoned.',
      perks: ['Domain Expert', 'Fresh Perspective'],
      stats: { skill: 6, reputation: 0, morale: 12, money: 1000 },
    },
  ],

  // ──────────────────────────────────────────────────────
  //  CAREER RANKS
  // ──────────────────────────────────────────────────────
  CAREER_RANKS: [
    {
      id: 'paralegal',
      title: 'Paralegal',
      icon: '📋',
      desc: 'Entry-level legal support. You file, research, and observe.',
      salary: 3200,
      requirements: { reputation: 0, casesWon: 0, skill: 0 },
    },
    {
      id: 'associate',
      title: 'Associate Attorney',
      icon: '⚖️',
      desc: 'You handle smaller cases independently and assist on major ones.',
      salary: 6800,
      requirements: { reputation: 15, casesWon: 2, skill: 20 },
    },
    {
      id: 'junior_partner',
      title: 'Junior Partner',
      icon: '🏛️',
      desc: 'A seat at the table. You lead cases and mentor junior staff.',
      salary: 12000,
      requirements: { reputation: 35, casesWon: 8, skill: 40 },
    },
    {
      id: 'senior_partner',
      title: 'Senior Partner',
      icon: '🦅',
      desc: 'Your name is on the letterhead. The city knows your name.',
      salary: 22000,
      requirements: { reputation: 60, casesWon: 20, skill: 60 },
    },
    {
      id: 'named_partner',
      title: 'Named Partner',
      icon: '👑',
      desc: 'The firm bears your name. You make the rules.',
      salary: 45000,
      requirements: { reputation: 80, casesWon: 40, skill: 75 },
    },
    {
      id: 'judge',
      title: 'Circuit Judge',
      icon: '⚖️',
      desc: 'A lifetime appointment. From the bench, you shape the law itself.',
      salary: 18000,
      requirements: { reputation: 90, casesWon: 60, skill: 85 },
    },
  ],

  // ──────────────────────────────────────────────────────
  //  SKILL TREES
  // ──────────────────────────────────────────────────────
  SKILLS: [
    {
      category: 'Courtroom',
      icon: '🎙️',
      skills: [
        { id: 'persuasion', name: 'Persuasion', maxLevel: 5, desc: 'Your words carry more weight. Jury is more receptive to your arguments.', effect: 'jury_bonus', value: 2 },
        { id: 'objection_timing', name: 'Objection Timing', maxLevel: 3, desc: 'Better instincts for when to object. Fewer missteps.', effect: 'objection_accuracy', value: 15 },
        { id: 'cross_exam', name: 'Cross-Examination', maxLevel: 5, desc: 'Break down hostile witnesses more effectively.', effect: 'cross_bonus', value: 3 },
      ]
    },
    {
      category: 'Research',
      icon: '📚',
      skills: [
        { id: 'case_research', name: 'Case Research', maxLevel: 4, desc: 'Uncover more evidence before trial begins.', effect: 'evidence_bonus', value: 1 },
        { id: 'precedent', name: 'Precedent Knowledge', maxLevel: 3, desc: 'Cite past rulings to strengthen arguments.', effect: 'score_bonus', value: 5 },
        { id: 'loophole', name: 'Loophole Finder', maxLevel: 2, desc: 'Spot procedural weaknesses in opposing cases.', effect: 'procedure_bonus', value: 8 },
      ]
    },
    {
      category: 'Networking',
      icon: '🤝',
      skills: [
        { id: 'negotiation', name: 'Negotiation', maxLevel: 4, desc: 'Secure better plea deals and out-of-court settlements.', effect: 'deal_bonus', value: 10 },
        { id: 'media_relations', name: 'Media Relations', maxLevel: 3, desc: 'Shape public perception. Reputation gains are amplified.', effect: 'rep_mult', value: 0.2 },
        { id: 'witness_prep', name: 'Witness Prep', maxLevel: 5, desc: 'Your witnesses are more credible and composed.', effect: 'witness_bonus', value: 3 },
      ]
    },
  ],

  // ──────────────────────────────────────────────────────
  //  CONTACTS
  // ──────────────────────────────────────────────────────
  CONTACTS: [
    {
      id: 'judge_morrison',
      name: 'Judge Diane Morrison',
      role: 'Circuit Court Judge',
      icon: '👩‍⚖️',
      skinColor: '#d4a876',
      hairColor: '#5a3a20',
      suitColor: '#1a0a2e',
      relation: 0,
      bio: 'Tough but fair. Twenty years on the bench. Respects preparation above all else. Known for her no-nonsense rulings.',
      effect: 'If relation ≥ 3: Judge is slightly more receptive to your procedural motions.',
      specialDialogue: [
        "Counselor, I hope you have done your homework.",
        "This court will not tolerate delay tactics.",
        "An interesting argument. Continue.",
      ]
    },
    {
      id: 'da_chen',
      name: 'D.A. Marcus Chen',
      role: 'District Attorney',
      icon: '👨‍⚖️',
      skinColor: '#c8a87a',
      hairColor: '#1a0f00',
      suitColor: '#0f1a2e',
      relation: 0,
      bio: 'Political animal. He prosecutes to advance his career, not for justice. Sharp mind and sharper elbows.',
      effect: 'If relation ≥ 3: Occasionally tips you off to prosecution strategy.',
      specialDialogue: [
        "The people will not be denied justice today.",
        "We have an ironclad case. Prepare yourself.",
        "You think you can win this? Interesting.",
      ]
    },
    {
      id: 'forensics_elara',
      name: 'Dr. Elara Moss',
      role: 'Forensics Expert',
      icon: '👩‍🔬',
      skinColor: '#f2d9b8',
      hairColor: '#8a3a10',
      suitColor: '#1a2e1a',
      relation: 0,
      bio: 'Former FBI lab director. Brilliant and meticulous. Can make or break a case with physical evidence.',
      effect: 'If relation ≥ 2: Can be called as expert witness. Adds +12 to case score.',
      specialDialogue: [
        "The evidence does not lie. People do.",
        "I can analyze that for you, but it will take time.",
        "The DNA results are... complicated.",
      ]
    },
    {
      id: 'investigator_jose',
      name: 'Jose Vargas',
      role: 'Private Investigator',
      icon: '🕵️',
      skinColor: '#b8793a',
      hairColor: '#0d0a06',
      suitColor: '#2a2a2e',
      relation: 0,
      bio: 'Ex-cop who went private after seeing too much. Knows every street corner and every dirty secret in this city.',
      effect: 'If relation ≥ 2: Can dig up hidden evidence before trial. +1 evidence item.',
      specialDialogue: [
        "Found something interesting. You're not gonna like it.",
        "Tailing someone runs $400 a day. Worth it?",
        "The witness has a history. I can get the files.",
      ]
    },
    {
      id: 'media_petra',
      name: 'Petra Langley',
      role: 'Court Reporter, NY Times',
      icon: '📰',
      skinColor: '#e8d0b0',
      hairColor: '#c8a040',
      suitColor: '#2e1a0a',
      relation: 0,
      bio: 'Pulitzer-nominated journalist covering the courts. A favorable story from her can launch a career. An unfavorable one can end it.',
      effect: 'If relation ≥ 3: Win cases yield +8 extra reputation. Lose cases -5 instead of -10.',
      specialDialogue: [
        "Any comment for the record, Counselor?",
        "This case has the city watching. No pressure.",
        "I am running a profile piece. Care to be featured?",
      ]
    },
    {
      id: 'opponent_west',
      name: 'Theodore West III',
      role: 'Senior Opposing Counsel',
      icon: '👔',
      skinColor: '#d8c098',
      hairColor: '#888',
      suitColor: '#1e1e1e',
      relation: 0,
      bio: 'Old money, Harvard law. He plays the long game. Beneath the polished exterior is a ruthless courtroom strategist.',
      effect: 'If relation ≥ 2: Occasional out-of-court settlements on your terms.',
      specialDialogue: [
        "Ah. We meet again. How unfortunate for you.",
        "You're out of your depth, Counselor.",
        "I have broken better lawyers than you.",
      ]
    },
  ],

  // ──────────────────────────────────────────────────────
  //  CASE TEMPLATES (procedurally flavored)
  // ──────────────────────────────────────────────────────
  CASE_TEMPLATES: [
    {
      id: 'tpl_murder_1',
      type: 'criminal',
      charge: 'First-Degree Murder',
      difficulty: 4,
      urgency: 'high',
      feeRange: [15000, 40000],
      icon: '🔪',
      facts: [
        'The defendant was found at the scene with the murder weapon.',
        'Security footage places them near the location.',
        'A witness claims to have heard an argument earlier that day.',
      ],
      defendantNames: ['Marcus Thorne', 'Elena Voss', 'Daniel Park', 'Rayna Mills'],
      victimNames: ['the victim, Andrew Holt', 'Grace Carver', 'the deceased, Ryan Shah'],
      stageTemplates: ['opening', 'witness_direct', 'cross_exam', 'expert_testimony', 'closing'],
    },
    {
      id: 'tpl_fraud_1',
      type: 'corporate',
      charge: 'Securities Fraud',
      difficulty: 3,
      urgency: 'med',
      feeRange: [25000, 80000],
      icon: '💰',
      facts: [
        'Defendant allegedly manipulated quarterly earnings reports.',
        'Internal emails suggest foreknowledge of the stock drop.',
        'Key witness: the companys former CFO.',
      ],
      defendantNames: ['Victor Caldwell', 'Sasha Noor', 'The Mercer Corporation'],
      victimNames: ['retail investors totaling $4.2M', 'pension fund holders', 'the market itself'],
      stageTemplates: ['opening', 'document_review', 'expert_testimony', 'cross_exam', 'closing'],
    },
    {
      id: 'tpl_assault_1',
      type: 'criminal',
      charge: 'Aggravated Assault',
      difficulty: 2,
      urgency: 'med',
      feeRange: [5000, 15000],
      icon: '👊',
      facts: [
        'Bar fight escalated. Defendant claims self-defense.',
        'Victim sustained a broken orbital bone.',
        'Three witnesses, two contradicting each other.',
      ],
      defendantNames: ['Tommy Briggs', 'Alicia Rowe', 'Devon Nash'],
      victimNames: ['the complainant, Patrick Foley', 'an off-duty officer', 'a civilian bystander'],
      stageTemplates: ['opening', 'witness_direct', 'cross_exam', 'closing'],
    },
    {
      id: 'tpl_wrongful_1',
      type: 'civil',
      charge: 'Wrongful Termination',
      difficulty: 2,
      urgency: 'low',
      feeRange: [8000, 20000],
      icon: '📄',
      facts: [
        'Client was fired two weeks after filing an HR complaint.',
        'No performance improvement plan was documented.',
        'HR manager deleted relevant emails—possibly.',
      ],
      defendantNames: ['NovaTech Industries', 'Greystone Capital', 'Harmon & Associates'],
      victimNames: ['plaintiff Jess Caldwell', 'the former employee', 'plaintiff Maria Santos'],
      stageTemplates: ['opening', 'document_review', 'witness_direct', 'closing'],
    },
    {
      id: 'tpl_drug_1',
      type: 'criminal',
      charge: 'Drug Trafficking',
      difficulty: 3,
      urgency: 'high',
      feeRange: [12000, 35000],
      icon: '💊',
      facts: [
        'DEA agents conducted a warrantless search—possibly.',
        '8 kilograms of fentanyl found in the defendants warehouse.',
        'A confidential informants identity may blow the case open.',
      ],
      defendantNames: ['The Solano Organization', 'Carl "Ace" Bishop', 'Nadia Reyes'],
      victimNames: ['the state', 'the federal government', 'public health'],
      stageTemplates: ['opening', 'cross_exam', 'expert_testimony', 'witness_direct', 'closing'],
    },
    {
      id: 'tpl_constitutional_1',
      type: 'constitutional',
      charge: 'First Amendment Violation',
      difficulty: 5,
      urgency: 'low',
      feeRange: [3000, 8000],
      icon: '🗽',
      facts: [
        'City ordinance bans protest within 200 feet of government buildings.',
        'Client arrested for peaceful demonstration.',
        'Similar ordinance was overturned in 3rd Circuit in 2019.',
      ],
      defendantNames: ['The City of New Haven', 'Governor\s Office', 'State Police Dept.'],
      victimNames: ['activist Rosa Tran', 'student organizer group "Voice Now"', 'journalist David Kim'],
      stageTemplates: ['opening', 'witness_direct', 'expert_testimony', 'closing'],
    },
    {
      id: 'tpl_corruption_1',
      type: 'criminal',
      charge: 'Public Corruption',
      difficulty: 5,
      urgency: 'high',
      feeRange: [40000, 120000],
      icon: '🏛️',
      facts: [
        'The defendant, a sitting councilman, allegedly accepted $1.2M in bribes.',
        'FBI wiretaps are central—but their legality is contested.',
        'Key witness is in witness protection. Can you compel testimony?',
      ],
      defendantNames: ['Councilman Edgar Blake', 'Commissioner Ruth Hale', 'Mayor Desmond Price'],
      victimNames: ['the public', 'city taxpayers', 'the electoral process'],
      stageTemplates: ['opening', 'cross_exam', 'witness_direct', 'expert_testimony', 'closing'],
    },
  ],

  // ──────────────────────────────────────────────────────
  //  STAGE DIALOGUE TEMPLATES
  // ──────────────────────────────────────────────────────
  STAGE_DIALOGS: {
    opening: {
      prosecution: [
        { speaker: 'Judge', text: 'This court is now in session. {case_name}. Counsel for the prosecution, your opening statement.' },
        { speaker: 'Judge', text: 'You may approach the jury.' },
      ],
      defense: [
        { speaker: 'Judge', text: 'Counsel for the defense, your opening statement.' },
      ],
      transition: { speaker: 'Judge', text: 'Thank you, Counselor. We will proceed.' },
    },
    witness_direct: {
      intro: [
        { speaker: 'Judge', text: 'Please call your next witness.' },
        { speaker: '{role}', text: 'The {side} calls {witness_name} to the stand.' },
        { speaker: 'Judge', text: '{witness_name}, you are under oath. Counselor, you may proceed.' },
      ],
    },
    cross_exam: {
      intro: [
        { speaker: 'Judge', text: 'Opposing counsel, you may cross-examine.' },
        { speaker: 'Opposition', text: 'Thank you, Your Honor.' },
      ],
    },
    expert_testimony: {
      intro: [
        { speaker: '{role}', text: 'Your Honor, we call our expert witness, {expert_name}.' },
        { speaker: 'Judge', text: 'Please state your qualifications for the record.' },
        { speaker: '{expert_name}', text: 'I have a doctorate in {field} with {years} years of forensic experience.' },
      ],
    },
    document_review: {
      intro: [
        { speaker: '{role}', text: 'Your Honor, I\'d like to enter Exhibit {num} into evidence.' },
        { speaker: 'Judge', text: 'Any objection from opposing counsel?' },
        { speaker: 'Opposition', text: 'The defense reserves the right to cross-examine this exhibit.' },
      ],
    },
    closing: {
      intro: [
        { speaker: 'Judge', text: 'We\'ve heard all the evidence. Closing arguments will now begin. Counselor?' },
      ],
      outro: [
        { speaker: 'Judge', text: 'Thank you both. The jury will now deliberate. Court is in recess.' },
        { speaker: 'Bailiff', text: 'All rise.' },
      ],
    },
  },

  // ──────────────────────────────────────────────────────
  //  ACTION CHOICES (per stage type)
  // ──────────────────────────────────────────────────────
  ACTIONS: {
    opening: [
      {
        id: 'bold_opening',
        text: 'Deliver a bold, dramatic opening statement',
        hint: 'High risk, high reward. Jury either loves it or dismisses it.',
        type: 'bold',
        scoreRange: [-5, 18],
        repRange: [-3, 10],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'methodical_opening',
        text: 'Present a methodical, evidence-focused opening',
        hint: 'Steady and reliable. Builds credibility with the jury.',
        type: 'safe',
        scoreRange: [5, 12],
        repRange: [2, 6],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'narrative_opening',
        text: 'Tell the story of what happened — humanize your case',
        hint: 'Appeals to emotion. Works best with high jury sympathy.',
        type: 'bold',
        scoreRange: [2, 16],
        repRange: [0, 8],
        moraleCost: 0,
        requires: { morale: 40 },
      },
      {
        id: 'concede_opening',
        text: 'Acknowledge weaknesses, then pivot to your strengths',
        hint: 'Builds trust with the jury by showing honesty. Long game.',
        type: 'safe',
        scoreRange: [6, 14],
        repRange: [5, 12],
        moraleCost: 5,
        requires: { skill: 30 },
      },
    ],
    witness_direct: [
      {
        id: 'lead_questions',
        text: 'Use leading questions to guide the witness',
        hint: 'Efficient but can be objected to. Opposition will push back.',
        type: 'risk',
        scoreRange: [-8, 15],
        repRange: [-2, 5],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'open_questions',
        text: 'Ask open-ended questions and let the witness speak',
        hint: 'Authentic but unpredictable. Could reveal new info.',
        type: 'safe',
        scoreRange: [3, 14],
        repRange: [1, 7],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'emotional_testimony',
        text: 'Draw out the emotional impact of events',
        hint: 'Powerful with sympathetic jury. Backfires if jury is skeptical.',
        type: 'bold',
        scoreRange: [-3, 20],
        repRange: [-2, 10],
        moraleCost: 8,
        requires: {},
      },
      {
        id: 'redirect_damage',
        text: 'Quickly address damaging testimony with a redirect',
        hint: 'Damage control. Steady but capped upside.',
        type: 'safe',
        scoreRange: [4, 10],
        repRange: [2, 5],
        moraleCost: 0,
        requires: { skill: 20 },
      },
    ],
    cross_exam: [
      {
        id: 'aggressive_cross',
        text: 'Aggressively challenge every answer',
        hint: 'Risky. Could alienate jury if witness seems sympathetic.',
        type: 'risk',
        scoreRange: [-12, 22],
        repRange: [-5, 8],
        moraleCost: 10,
        requires: {},
      },
      {
        id: 'methodical_cross',
        text: 'Methodically expose contradictions in their story',
        hint: 'Steady dismantling. Best if you have strong prior research.',
        type: 'safe',
        scoreRange: [5, 16],
        repRange: [2, 8],
        moraleCost: 5,
        requires: {},
      },
      {
        id: 'brief_cross',
        text: 'Keep it short — minimize the witnesss impact',
        hint: 'Safe play. You lose the chance to score big, but avoid disaster.',
        type: 'safe',
        scoreRange: [2, 8],
        repRange: [0, 3],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'trap_cross',
        text: 'Set a trap — let them lie, then produce evidence',
        hint: 'Spectacular if it works. Requires hard evidence in hand.',
        type: 'bold',
        scoreRange: [-5, 30],
        repRange: [-3, 15],
        moraleCost: 15,
        requires: { skill: 40, evidence_available: true },
      },
    ],
    expert_testimony: [
      {
        id: 'embrace_expert',
        text: 'Let the expert speak at length to establish credibility',
        hint: 'Best with a well-prepared witness. Risk of losing the jury.',
        type: 'safe',
        scoreRange: [4, 14],
        repRange: [1, 6],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'guide_expert',
        text: 'Carefully guide the expert to your key conclusions',
        hint: 'Controlled and efficient. High skill ceiling.',
        type: 'bold',
        scoreRange: [6, 20],
        repRange: [3, 10],
        moraleCost: 5,
        requires: { skill: 30 },
      },
      {
        id: 'challenge_expert',
        text: 'Challenge the opposing experts credentials',
        hint: 'Devastating if their qualifications are weak. Backfires if solid.',
        type: 'risk',
        scoreRange: [-10, 20],
        repRange: [-5, 10],
        moraleCost: 5,
        requires: {},
      },
    ],
    document_review: [
      {
        id: 'enter_evidence',
        text: 'Present the document clearly and walk the jury through it',
        hint: 'Reliable. Requires clear documentation.',
        type: 'safe',
        scoreRange: [5, 12],
        repRange: [1, 5],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'highlight_key',
        text: 'Highlight one devastating piece of the document',
        hint: 'Precision strike. All or nothing on that one clause.',
        type: 'bold',
        scoreRange: [-3, 20],
        repRange: [-1, 10],
        moraleCost: 5,
        requires: {},
      },
      {
        id: 'chain_of_custody',
        text: 'Establish an unbroken chain of custody for the document',
        hint: 'Locks in the evidences validity. Strong legal foundation.',
        type: 'safe',
        scoreRange: [6, 14],
        repRange: [3, 8],
        moraleCost: 0,
        requires: { skill: 20 },
      },
    ],
    closing: [
      {
        id: 'passionate_closing',
        text: 'Give a passionate, emotionally resonant closing argument',
        hint: 'Goes out with a bang. The jury will remember it.',
        type: 'bold',
        scoreRange: [0, 25],
        repRange: [0, 12],
        moraleCost: 15,
        requires: { morale: 50 },
      },
      {
        id: 'evidence_closing',
        text: 'Walk through every piece of evidence methodically',
        hint: 'Solid and logical. Appeals to analytical jurors.',
        type: 'safe',
        scoreRange: [8, 18],
        repRange: [2, 8],
        moraleCost: 0,
        requires: {},
      },
      {
        id: 'narrative_closing',
        text: 'Frame the entire trial as a story with a clear conclusion',
        hint: 'Memorable and persuasive. Requires strong morale and skill.',
        type: 'bold',
        scoreRange: [5, 22],
        repRange: [5, 15],
        moraleCost: 10,
        requires: { skill: 35 },
      },
      {
        id: 'brief_closing',
        text: 'Keep it tight — three points, no fluff',
        hint: 'Respects the jurys time. Conservative but competent.',
        type: 'safe',
        scoreRange: [6, 14],
        repRange: [1, 6],
        moraleCost: 0,
        requires: {},
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  //  EVIDENCE POOL
  // ──────────────────────────────────────────────────────
  EVIDENCE_TYPES: [
    { id: 'photo', name: 'Crime Scene Photo', icon: '📷', scoreBonus: 8, repBonus: 3, desc: 'Visual evidence placing events in context.' },
    { id: 'document', name: 'Signed Document', icon: '📄', scoreBonus: 12, repBonus: 5, desc: 'Paper trail that is hard to dispute.' },
    { id: 'video', name: 'Surveillance Footage', icon: '📹', scoreBonus: 15, repBonus: 6, desc: 'Captures a moment of truth. Powerful in closing.' },
    { id: 'dna', name: 'DNA Report', icon: '🧬', scoreBonus: 18, repBonus: 4, desc: 'Scientific certainty. Can define the case.' },
    { id: 'financial', name: 'Financial Records', icon: '💳', scoreBonus: 14, repBonus: 6, desc: 'Money follows motive. Follow the money.' },
    { id: 'testimony', name: 'Prior Statement', icon: '📋', scoreBonus: 10, repBonus: 4, desc: 'A prior sworn statement. Contradiction is deadly.' },
    { id: 'phone', name: 'Phone Records', icon: '📱', scoreBonus: 11, repBonus: 4, desc: 'Location and communication data. Modern alibi-breaker.' },
    { id: 'email', name: 'Email Thread', icon: '✉️', scoreBonus: 9, repBonus: 3, desc: 'Digital breadcrumbs. People say too much in writing.' },
    { id: 'weapon', name: 'Physical Item', icon: '🔧', scoreBonus: 16, repBonus: 5, desc: 'Tangible. The jury can see it. Real. Damning.' },
    { id: 'medical', name: 'Medical Report', icon: '🏥', scoreBonus: 13, repBonus: 5, desc: 'Establishes injury, timeline, and causation.' },
  ],

  // ──────────────────────────────────────────────────────
  //  RANDOM EVENTS (courtroom surprises)
  // ──────────────────────────────────────────────────────
  RANDOM_EVENTS: [
    {
      id: 'surprise_witness',
      title: 'Surprise Witness',
      text: 'Opposition announces a previously undisclosed witness.',
      icon: '👤',
      effect: { juryDelta: -2, scoreDelta: -8, oppDelta: 15 },
      playerChoices: [
        { text: 'Challenge the late disclosure', outcome: { scoreDelta: 10, repDelta: 5 } },
        { text: 'Request a continuance to prepare', outcome: { scoreDelta: 3, repDelta: -2 } },
        { text: 'Accept and adapt your strategy', outcome: { scoreDelta: 6, moraleDelta: -5 } },
      ],
    },
    {
      id: 'media_circus',
      title: 'Media Frenzy',
      text: 'A news crew caught your client outside making a statement. It\s all over the 6 o\'clock news.',
      icon: '📺',
      effect: { juryDelta: 0, scoreDelta: 0, repDelta: -5 },
      playerChoices: [
        { text: 'Address it head-on in court', outcome: { repDelta: 8, moraleDelta: -3 } },
        { text: 'Ignore it and stay focused', outcome: { repDelta: -3, scoreDelta: 5 } },
        { text: 'Move for a mistrial on prejudice grounds', outcome: { repDelta: 3, scoreDelta: -5 } },
      ],
    },
    {
      id: 'evidence_challenged',
      title: 'Key Evidence Challenged',
      text: 'The opposition challenges the admissibility of your strongest piece of evidence.',
      icon: '⚠️',
      effect: { juryDelta: 0, scoreDelta: -10, oppDelta: 10 },
      playerChoices: [
        { text: 'Argue foundation and chain of custody', outcome: { scoreDelta: 12, repDelta: 4 } },
        { text: 'Offer an alternative basis for admission', outcome: { scoreDelta: 8, repDelta: 2 } },
        { text: 'Withdraw and pivot to other evidence', outcome: { scoreDelta: 2, moraleDelta: -8 } },
      ],
    },
    {
      id: 'witness_recants',
      title: 'Witness Recants',
      text: 'Your key witness has changed their story overnight.',
      icon: '😱',
      effect: { juryDelta: -3, scoreDelta: -12, moraleDelta: -10 },
      playerChoices: [
        { text: 'Impeach the witness with their prior statement', outcome: { scoreDelta: 14, repDelta: 6 } },
        { text: 'Request a recess to speak with the witness', outcome: { scoreDelta: 5, moraleDelta: 5 } },
        { text: 'Quickly pivot to physical evidence', outcome: { scoreDelta: 8, moraleDelta: -3 } },
      ],
    },
    {
      id: 'judge_friendly',
      title: 'Judicial Favor',
      text: 'The judge rules in your favor on a procedural motion, striking opposition testimony.',
      icon: '⚖️',
      effect: { juryDelta: 1, scoreDelta: 10, oppDelta: -10 },
      playerChoices: [
        { text: 'Capitalize on the momentum immediately', outcome: { scoreDelta: 8, repDelta: 3 } },
        { text: 'Thank the court professionally', outcome: { repDelta: 5, moraleDelta: 5 } },
      ],
    },
    {
      id: 'juror_dismissed',
      title: 'Juror Dismissed',
      text: 'A juror is dismissed for cause after conduct outside the courthouse.',
      icon: '🚫',
      effect: { juryDelta: 0, scoreDelta: 0 },
      playerChoices: [
        { text: 'Use a preemptory challenge on the alternate', outcome: { juryDelta: 2 } },
        { text: 'Accept the alternate juror as-is', outcome: { scoreDelta: 3 } },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────
  //  HUB LOCATIONS
  // ──────────────────────────────────────────────────────
  HUB_LOCATIONS: [
    {
      id: 'firm',
      name: 'Your Law Firm',
      icon: '🏢',
      desc: 'Your home base. Review cases, meet with clients, and develop your career.',
      color: '#c8a855',
      gridX: 4, gridY: 3,
      w: 3, h: 2,
      actions: [
        { icon: '📋', text: 'Review Docket', sub: 'See active and pending cases', action: 'docket' },
        { icon: '📚', text: 'Study Case Law', sub: 'Gain +2 Skill (cost: 4h)', action: 'study', cost: 0 },
        { icon: '🤝', text: 'Meet with Client', sub: '+5 Morale, reveals case info', action: 'client_meet', cost: 0 },
      ],
    },
    {
      id: 'courthouse',
      name: 'City Courthouse',
      icon: '⚖️',
      desc: 'The seat of justice. Where careers are made and broken.',
      color: '#888866',
      gridX: 10, gridY: 2,
      w: 4, h: 3,
      actions: [
        { icon: '⚖️', text: 'Go to Trial', sub: 'Start your current active case', action: 'go_to_trial' },
        { icon: '📁', text: 'File Motions', sub: 'Pre-trial motions (skill check)', action: 'file_motions', cost: 0 },
        { icon: '👁️', text: 'Observe Trial', sub: 'Learn from others. +1 Skill', action: 'observe', cost: 0 },
      ],
    },
    {
      id: 'library',
      name: 'Law Library',
      icon: '📚',
      desc: 'Stacks of case law, precedent, and legal theory. Quiet here. Effective.',
      color: '#5a4a2a',
      gridX: 2, gridY: 7,
      w: 2, h: 2,
      actions: [
        { icon: '🔍', text: 'Deep Research', sub: '+5 Skill, +1 Evidence item on next case', action: 'deep_research', cost: 500 },
        { icon: '📖', text: 'Read Precedents', sub: '+3 Skill, costs time', action: 'read_precendents', cost: 0 },
      ],
    },
    {
      id: 'bar',
      name: 'The Verdict Bar',
      icon: '🍸',
      desc: 'Where lawyers go after hard days. Talk shop. Build relationships.',
      color: '#3a2010',
      gridX: 14, gridY: 7,
      w: 2, h: 2,
      actions: [
        { icon: '🍺', text: 'Network', sub: '+10 Morale, chance to meet contacts', action: 'network', cost: 120 },
        { icon: '🗣️', text: 'Overhear Gossip', sub: 'Learn about upcoming cases', action: 'gossip', cost: 40 },
      ],
    },
    {
      id: 'gym',
      name: 'Athletic Club',
      icon: '🏋️',
      desc: 'Stress relief. Lawyers who maintain their health maintain their edge.',
      color: '#2a3a2a',
      gridX: 8, gridY: 8,
      w: 2, h: 2,
      actions: [
        { icon: '💪', text: 'Work Out', sub: '+15 Morale, costs time', action: 'workout', cost: 80 },
      ],
    },
    {
      id: 'media',
      name: 'Press Club',
      icon: '📺',
      desc: 'Press conferences, interviews. Shape your public narrative.',
      color: '#2a2a3a',
      gridX: 0, gridY: 4,
      w: 2, h: 2,
      actions: [
        { icon: '📰', text: 'Give Interview', sub: '+8 Reputation, risk of bad coverage', action: 'interview', cost: 0 },
        { icon: '📢', text: 'Press Conference', sub: 'Higher risk/reward. Requires active case', action: 'press_conf', cost: 0 },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────
  //  ACHIEVEMENTS
  // ──────────────────────────────────────────────────────
  ACHIEVEMENTS: [
    { id: 'first_win',    icon: '⚖️', name: 'First Verdict',       desc: 'Win your first case.',                     check: (p) => p.casesWon >= 1 },
    { id: 'win_streak_3', icon: '🔥', name: 'On Fire',              desc: 'Win 3 cases in a row.',                    check: (p) => p._winStreak >= 3 },
    { id: 'top_firm',     icon: '🏛️', name: 'Named Partner',        desc: 'Reach Named Partner rank.',               check: (p) => p.rank >= 4 },
    { id: 'the_judge',    icon: '⚖️', name: 'The Bench',            desc: 'Become a Circuit Judge.',                 check: (p) => p.rank >= 5 },
    { id: 'millionaire',  icon: '💰', name: 'Seven Figures',        desc: 'Earn $1,000,000 cumulative.',             check: (p) => p.totalEarned >= 1000000 },
    { id: 'perfect_trial',icon: '⭐', name: 'Flawless Argument',    desc: 'Win a case with max score.',              check: (p) => p._lastPerfect === true },
    { id: 'objection_ace',icon: '📢', name: 'Objection Sustained',  desc: 'Successfully object 10 times total.',     check: (p) => p._totalObjections >= 10 },
    { id: 'all_contacts', icon: '👥', name: 'Connected',            desc: 'Max relationship with any 3 contacts.',   check: (p) => (p.contacts.filter(c=>c.relation>=5).length) >= 3 },
    { id: 'pro_bono',     icon: '✊', name: 'Pro Bono Hero',         desc: 'Win 3 civil rights cases.',              check: (p) => p._civilRightsWins >= 3 },
    { id: 'shark',        icon: '🦈', name: 'Shark',                 desc: 'Win 20 cases total.',                    check: (p) => p.casesWon >= 20 },
  ],

  // ──────────────────────────────────────────────────────
  //  WITNESS POOL
  // ──────────────────────────────────────────────────────
  WITNESS_NAMES: [
    'Officer K. Reyes', 'Dr. Sandra Bloom', 'Forensics Tech. Arnold',
    'Witness Carla Ibsen', 'Accountant Pete Moreno', 'Neighbor Ruth Chang',
    'Security Guard Damian', 'Informant John Doe', 'Expert Dr. Patel',
    'CEO Elaine Kraft', 'Secretary Tom Wallis', 'Professor Lisa Dunne',
  ],

  EXPERT_FIELDS: [
    'Forensic Toxicology', 'Digital Forensics', 'Behavioral Psychology',
    'Ballistics Analysis', 'Financial Fraud Detection', 'DNA Analysis',
    'Structural Engineering', 'Cybersecurity', 'Criminal Profiling',
  ],

  JUDGE_NAMES: [
    'The Honorable Diane Morrison',
    'The Honorable Robert Tanaka',
    'The Honorable Carmen Reyes',
    'The Honorable Oliver Haas',
  ],

  OPPOSITION_NAMES: [
    'Theodore West III',
    'Victoria Hawke',
    'D.A. Marcus Chen',
    'Priya Mehta, Esq.',
    'William "Bull" Donnelly',
  ],

  // ──────────────────────────────────────────────────────
  //  CASE CRIMES
  // ──────────────────────────────────────────────────────
  CRIME_TYPES: [
    { name: 'Grand Larceny', icon: '💰', severity: 'felony', oppStyle: 'methodical' },
    { name: 'Corporate Fraud', icon: '📊', severity: 'felony', oppStyle: 'aggressive' },
    { name: 'Assault & Battery', icon: '⚔️', severity: 'misdemeanor', oppStyle: 'emotional' },
    { name: 'Insider Trading', icon: '📈', severity: 'felony', oppStyle: 'methodical' },
    { name: 'Wrongful Termination', icon: '📋', severity: 'civil', oppStyle: 'calm' },
    { name: 'Insurance Fraud', icon: '📝', severity: 'felony', oppStyle: 'methodical' },
    { name: 'Drug Possession', icon: '💊', severity: 'misdemeanor', oppStyle: 'aggressive' },
    { name: 'Breach of Contract', icon: '🤝', severity: 'civil', oppStyle: 'calm' },
    { name: 'Manslaughter', icon: '⚖️', severity: 'felony', oppStyle: 'emotional' },
    { name: 'Embezzlement', icon: '💸', severity: 'felony', oppStyle: 'methodical' },
    { name: 'Civil Rights Violation', icon: '✊', severity: 'civil', oppStyle: 'aggressive' },
    { name: 'Tax Evasion', icon: '🏛️', severity: 'felony', oppStyle: 'calm' },
  ],

  DEFENDANT_FIRST: ['Marcus','Elena','Robert','Jasmine','Victor','Patricia','Leon','Angela','Gerald','Susan','Anton','Diane','Felix','Carla','Howard'],
  DEFENDANT_LAST: ['Thornton','Vasquez','Kim','Okafor','Brennan','Patel','Nguyen','Marshall','Chen','Rosario','Walsh','Kovacs','Ibrahim','Hartley'],

  // ──────────────────────────────────────────────────────
  //  CASE GENERATOR
  // ──────────────────────────────────────────────────────
  generateCase(rank, specialty) {
    const crime = Util.randItem(this.CRIME_TYPES);
    const firstName = Util.randItem(this.DEFENDANT_FIRST);
    const lastName = Util.randItem(this.DEFENDANT_LAST);
    const judge = Util.randItem(this.JUDGE_NAMES);
    const opponent = Util.randItem(this.OPPOSITION_NAMES);

    // Scale difficulty with rank
    const difficulty = Util.clamp(rank + 1, 1, 5);

    // Pick 3-5 evidence items
    const evidencePool = [...this.EVIDENCE_TYPES];
    Util.shuffle(evidencePool);
    const evidenceCount = Util.rand(2, Math.min(5, 2 + difficulty));
    const evidence = evidencePool.slice(0, evidenceCount);

    // Build stages
    const stageTemplates = [
      {
        name: 'Opening',
        prompt: 'Deliver your opening statement. Set the tone for the entire trial.',
        getDialogue: (d, o, j) => [
          { speaker: judge, text: `Court is now in session. The People versus ${d.firstName} ${d.lastName} on charges of ${d.crime}. Counselors, are you ready?` },
          { speaker: 'BAILIFF', text: 'All rise. Court is in session.' },
          { speaker: opponent, text: `Your Honor, the prosecution is ready. We will prove beyond any reasonable doubt that ${d.firstName} ${d.lastName} is guilty of ${d.crime}.` },
          { speaker: 'YOUR INNER VOICE', text: 'Their opening was strong. Now it\s your turn. Make the jury believe in your client.' },
        ],
        getChoices: () => this.ACTIONS.opening,
      },
      {
        name: 'Witness Exam',
        prompt: 'Your first witness is on the stand. Choose how to approach their testimony.',
        getDialogue: (d, o, j) => {
          const witness = Util.randItem(this.WITNESS_NAMES);
          return [
            { speaker: judge, text: `The court calls its first witness. ${witness}, please take the stand.` },
            { speaker: witness, text: `I swear to tell the truth, the whole truth, and nothing but the truth.` },
            { speaker: opponent, text: `${witness}, can you describe what you observed on the night in question?` },
            { speaker: witness, text: `I saw the defendant. It was clear. There was no mistaking it.` },
          ];
        },
        getChoices: () => this.ACTIONS.witness_direct,
      },
      {
        name: 'Expert Testimony',
        prompt: 'An expert witness takes the stand. How do you handle this?',
        getDialogue: (d, o, j) => {
          const field = Util.randItem(this.EXPERT_FIELDS);
          return [
            { speaker: judge, text: `The court recognizes the next witness as an expert in ${field}.` },
            { speaker: opponent, text: `Doctor, in your professional opinion, what does the evidence tell us?` },
            { speaker: 'EXPERT WITNESS', text: `The data is unambiguous. My analysis of the ${field.toLowerCase()} evidence points clearly toward the defendants guilt.` },
          ];
        },
        getChoices: () => this.ACTIONS.expert_testimony,
      },
      {
        name: 'Cross-Exam',
        prompt: 'Your chance to cross-examine. The jury is watching your every move.',
        getDialogue: (d, o, j) => {
          const witness = Util.randItem(this.WITNESS_NAMES);
          return [
            { speaker: judge, text: 'Counselor, you may begin your cross-examination.' },
            { speaker: 'YOUR INNER VOICE', text: 'You\'ve prepared for this. Find the cracks. Find the inconsistencies. Make them count.' },
            { speaker: witness, text: 'I\'ve already told you everything I know.' },
          ];
        },
        getChoices: () => this.ACTIONS.cross_exam,
      },
      {
        name: 'Closing',
        prompt: 'Deliver your closing argument. The last thing the jury hears before deliberating.',
        getDialogue: (d, o, j) => [
          { speaker: opponent, text: `Ladies and gentlemen of the jury, the evidence is overwhelming. You have heard the testimony. You have seen the documentation. Return the only verdict that justice demands: guilty.` },
          { speaker: judge, text: `Counselor, you may deliver your closing argument.` },
          { speaker: 'YOUR INNER VOICE', text: 'This is your moment. Everything you\'ve argued, every piece of evidence, every witness — it all comes down to this. Make it count.' },
        ],
        getChoices: () => this.ACTIONS.closing,
      },
    ];

    const defendant = { firstName, lastName, crime: crime.name };
    const stages = stageTemplates.map(tmpl => ({
      name: tmpl.name,
      prompt: tmpl.prompt,
      dialogue: tmpl.getDialogue(defendant, opponent, judge),
      choices: tmpl.getChoices(),
    }));

    // Fee scales with rank and crime severity
    const baseFee = crime.severity === 'felony' ? 8000 :
                    crime.severity === 'civil' ? 12000 : 3500;
    const fee = Math.round(baseFee * (0.8 + difficulty * 0.15));

    return {
      id: Util.uid(),
      title: `People v. ${lastName}`,
      crime: crime.name,
      crimeIcon: crime.icon,
      severity: crime.severity,
      defendant,
      judge,
      opponent,
      evidence,
      stages,
      fee,
      difficulty,
      status: 'pending',
    };
  },
};
