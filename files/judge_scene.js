/* ═══════════════════════════════════════════════════════
   VERDICT! GX — JUDGE_SCENE.JS
   3D Judge background scene + Credits animation
   Uses Three.js r128 (loaded globally)
   ═══════════════════════════════════════════════════════ */
'use strict';

const JudgeScene = (() => {

  /* ── internal state ── */
  let renderer, scene, camera, clock;
  let judge, bench, gavel, gavelHead, gavelHandle;
  let docket, docketPaper;
  let judgeRightArmPivot;
  let isCreditsMode = false;
  let creditsEl = null;
  let creditsVisible = false;

  // Animation state machine
  const Anim = {
    phase: 'idle',
    t: 0,
    gavelSlamCount: 0,
    gavelRestY: 0,
    gavelRestRot: 0,
    armRestRot: -0.55,
  };

  const Idle = { breathT: 0 };

  /* ────────────────────────────────────────────
     INIT
  ──────────────────────────────────────────── */
  function init(canvasEl) {
    if (!window.THREE) { console.error('JudgeScene: Three.js not loaded'); return; }

    const W = canvasEl.width  = window.innerWidth;
    const H = canvasEl.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0608, 12, 28);

    camera = new THREE.PerspectiveCamera(56, W / H, 0.05, 100);
    camera.position.set(0, 3.6, 5.0);
    camera.lookAt(0, 3.2, 0);

    clock = new THREE.Clock();

    _buildLighting();
    _buildScene();
    _buildCreditsOverlay();

    window.addEventListener('resize', _onResize);
    _loop();
  }

  function _onResize() {
    if (!renderer) return;
    const W = window.innerWidth, H = window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  /* ────────────────────────────────────────────
     LIGHTING
  ──────────────────────────────────────────── */
  function _buildLighting() {
    scene.add(new THREE.AmbientLight(0x1a1008, 0.6));

    const key = new THREE.SpotLight(0xffd080, 2.8, 18, Math.PI / 6, 0.4, 1.2);
    key.position.set(0, 9, 3);
    key.target.position.set(0, 2, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key); scene.add(key.target);

    const fill = new THREE.DirectionalLight(0x4060a0, 0.35);
    fill.position.set(-6, 4, 2);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffaa40, 0.8, 8);
    rim.position.set(0, 4.5, -2.5);
    scene.add(rim);

    const lamp = new THREE.PointLight(0x80c080, 0.4, 4);
    lamp.position.set(-1.2, 2.8, 1.5);
    scene.add(lamp);
  }

  /* ────────────────────────────────────────────
     SCENE
  ──────────────────────────────────────────── */
  function _buildScene() {
    _buildBench();
    _buildJudge();
    _buildGavel();
    _buildDocket();
    _buildRoomDetails();
  }

  function _buildBench() {
    const darkWood  = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.6, metalness: 0.05 });
    const medWood   = new THREE.MeshStandardMaterial({ color: 0x3d2510, roughness: 0.5, metalness: 0.05 });
    const lightWood = new THREE.MeshStandardMaterial({ color: 0x5c3318, roughness: 0.45, metalness: 0.1 });

    bench = new THREE.Group();
    scene.add(bench);

    const top = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.22, 2.2), lightWood);
    top.position.set(0, 2.08, 0.9); top.castShadow = true; top.receiveShadow = true;
    bench.add(top);

    const front = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.6, 0.18), darkWood);
    front.position.set(0, 1.3, 2.0); front.castShadow = true;
    bench.add(front);

    for (let i = -2; i <= 2; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.04), medWood);
      panel.position.set(i * 1.5, 1.3, 2.08);
      bench.add(panel);
    }

    [-3.2, 3.2].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.1, 1.9), darkWood);
      leg.position.set(x, 1.0, 0.8); leg.castShadow = true;
      bench.add(leg);
    });

    const dais = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.45, 4.5), darkWood);
    dais.position.set(0, -0.03, -0.5); dais.receiveShadow = true;
    bench.add(dais);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.24; floor.receiveShadow = true;
    scene.add(floor);
  }

  /* ── BLOCK-STYLE JUDGE (like Ace Attorney / Verdict GX lawyers) ── */
  function _buildJudge() {
    judge = new THREE.Group();
    scene.add(judge);
    judge.position.set(0, 0.22, 0.0);

    const robeMat  = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.85 });
    const skinMat  = new THREE.MeshStandardMaterial({ color: 0xc8a070, roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf0eeea, roughness: 0.8 });
    const wigMat   = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.95 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a0f00, roughness: 0.2, metalness: 0.7 });
    const browMat  = new THREE.MeshStandardMaterial({ color: 0x3a2800, roughness: 0.9 });
    const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a3020, roughness: 0.9 });
    const eyeWMat  = new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.8 });
    const lensIMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.3, transparent: true, opacity: 0.35 });

    // Helper
    const box = (w, h, d, mat, px, py, pz, rx=0, ry=0, rz=0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      return m;
    };

    // Torso — tall wide flat block
    judge.add(box(1.5, 1.8, 0.55, robeMat, 0, 2.75, -0.1));

    // Shoulders — wider slab on top of torso
    judge.add(box(1.95, 0.38, 0.52, robeMat, 0, 3.58, -0.1));

    // White jabot (shirt ruffle at collar)
    judge.add(box(0.38, 0.52, 0.08, shirtMat, 0, 3.4, 0.3));
    judge.add(box(0.14, 0.22, 0.06, shirtMat, -0.08, 3.14, 0.3));
    judge.add(box(0.14, 0.22, 0.06, shirtMat,  0.08, 3.14, 0.3));

    // Neck — flat block
    judge.add(box(0.28, 0.28, 0.22, skinMat, 0, 3.82, 0.16));

    // ── HEAD: rectangular block (the key "block character" feature) ──
    judge.add(box(0.84, 0.78, 0.54, skinMat, 0, 4.34, 0.04));

    // ── WIG: flat blocks stacked ──
    judge.add(box(0.94, 0.32, 0.60, wigMat, 0, 4.78, 0.0));   // top dome
    judge.add(box(0.90, 0.14, 0.18, wigMat, 0, 4.63, 0.28));  // forehead roll

    // Side curl columns (rectangular slabs)
    for (const s of [-1, 1]) {
      judge.add(box(0.18, 0.52, 0.22, wigMat, s * 0.56, 4.42, -0.02));
      judge.add(box(0.16, 0.30, 0.20, wigMat, s * 0.55, 4.08, 0.0));
    }

    // ── FACE (all flat blocks) ──
    // Eye whites
    judge.add(box(0.14, 0.12, 0.04, eyeWMat, -0.19, 4.38, 0.275));
    judge.add(box(0.14, 0.12, 0.04, eyeWMat,  0.19, 4.38, 0.275));
    // Pupils
    judge.add(box(0.10, 0.08, 0.06, eyeMat, -0.19, 4.38, 0.30));
    judge.add(box(0.10, 0.08, 0.06, eyeMat,  0.19, 4.38, 0.30));
    // Eyebrows (angled inward for stern expression)
    judge.add(box(0.18, 0.05, 0.06, browMat, -0.19, 4.50, 0.30, 0, 0,  0.18));
    judge.add(box(0.18, 0.05, 0.06, browMat,  0.19, 4.50, 0.30, 0, 0, -0.18));
    // Nose
    judge.add(box(0.10, 0.10, 0.10, skinMat, 0, 4.28, 0.30));
    // Mouth
    judge.add(box(0.22, 0.038, 0.05, mouthMat, 0, 4.16, 0.29));

    // ── GLASSES (flat rectangular frames) ──
    judge.add(box(0.18, 0.12, 0.03, glassMat, -0.19, 4.38, 0.32));
    judge.add(box(0.18, 0.12, 0.03, glassMat,  0.19, 4.38, 0.32));
    // Lens tint
    judge.add(box(0.13, 0.08, 0.04, lensIMat, -0.19, 4.38, 0.34));
    judge.add(box(0.13, 0.08, 0.04, lensIMat,  0.19, 4.38, 0.34));
    // Bridge
    judge.add(box(0.10, 0.03, 0.03, glassMat, 0, 4.38, 0.32));

    // ── LEFT ARM: flat block resting on bench ──
    judge.add(box(0.28, 0.30, 0.78, robeMat, -0.78, 2.22, 0.55));
    judge.add(box(0.24, 0.20, 0.28, skinMat, -0.78, 2.22, 1.05));

    // ── RIGHT ARM: pivot-based for gavel slam animation ──
    judgeRightArmPivot = new THREE.Group();
    judgeRightArmPivot.position.set(0.88, 3.58, -0.1); // shoulder
    judge.add(judgeRightArmPivot);

    // Upper arm (hangs downward from pivot)
    judgeRightArmPivot.add(box(0.28, 0.72, 0.28, robeMat, 0, -0.36, 0));
    // Forearm (angled slightly forward)
    judgeRightArmPivot.add(box(0.26, 0.65, 0.26, robeMat, 0, -1.0,  0.22));
    // Hand
    judgeRightArmPivot.add(box(0.22, 0.18, 0.28, skinMat, 0, -1.38, 0.42));

    // Set resting angle
    judgeRightArmPivot.rotation.x = Anim.armRestRot;
  }

  /* ── Gavel ── */
  function _buildGavel() {
    gavel = new THREE.Group();
    scene.add(gavel);

    const woodMat     = new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.55, metalness: 0.05 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d1e08, roughness: 0.5 });
    const bandMat     = new THREE.MeshStandardMaterial({ color: 0xc8a855, roughness: 0.3, metalness: 0.8 });

    gavelHandle = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.05, 12), woodMat);
    handle.castShadow = true;
    gavelHandle.add(handle);

    gavelHead = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 14), darkWoodMat);
    headMesh.rotation.z = Math.PI / 2;
    headMesh.castShadow = true;
    gavelHead.add(headMesh);

    [-0.14, 0.14].forEach(ox => {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.06, 14), bandMat);
      band.rotation.z = Math.PI / 2;
      band.position.x = ox;
      gavelHead.add(band);
    });

    gavel.add(gavelHandle);
    gavel.add(gavelHead);

    // Sounding block
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x4a2510, roughness: 0.6 }));
    block.position.set(1.8, 2.24, 0.6);
    block.receiveShadow = true;
    scene.add(block);

    gavel.position.set(1.72, 2.36, 0.6);
    gavel.rotation.z = -0.55;
    gavel.rotation.y = 0.3;
    gavelHandle.position.set(0, 0, 0);
    gavelHead.position.set(0, 0.52, 0);

    Anim.gavelRestY   = gavel.position.y;
    Anim.gavelRestRot = gavel.rotation.z;
  }

  /* ── Docket / Manila Folder with ink scribbles ── */
  function _buildDocket() {
    docket = new THREE.Group();
    scene.add(docket);

    const folderMat  = new THREE.MeshStandardMaterial({ color: 0xc8902a, roughness: 0.82 });
    const folderDark = new THREE.MeshStandardMaterial({ color: 0xa0701a, roughness: 0.85 });
    const paperMat   = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 });
    const inkMat     = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 });

    // Back cover (flat on desk)
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.025, 1.02), folderMat);
    backCover.castShadow = true;
    docket.add(backCover);

    // Paper pages inside (visible when folder closed — ink on top)
    const page = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.022, 0.94), paperMat);
    page.position.set(0.03, 0.025, 0);
    docket.add(page);

    // ── RANDOM INK SCRIBBLES (handwritten text simulation) ──
    const lines = [
      [0.0, -0.38, 0.88, 0.014,  0.000],
      [0.0, -0.30, 0.76, 0.013,  0.004],
      [0.0, -0.22, 0.82, 0.014, -0.003],
      [0.0, -0.14, 0.70, 0.013,  0.006],
      [0.0, -0.06, 0.85, 0.014, -0.004],
      [0.0,  0.02, 0.68, 0.013,  0.000],
      [0.0,  0.10, 0.80, 0.014,  0.005],
      [0.0,  0.18, 0.74, 0.013, -0.005],
      [0.0,  0.26, 0.78, 0.014,  0.003],
      // Header block
      [0.0, -0.44, 0.48, 0.020,  0.000],
      // Signature
      [-0.28, 0.38, 0.36, 0.018, -0.05],
      // Dots
      [ 0.32, 0.38, 0.05, 0.018,  0.00],
    ];
    lines.forEach(([ix, iz, iw, ih, ir]) => {
      const ln = new THREE.Mesh(new THREE.BoxGeometry(iw, 0.006, ih), inkMat);
      ln.position.set(ix, 0.038, iz);
      ln.rotation.y = ir;
      docket.add(ln);
    });

    // Short crossing strokes (like handwriting serifs/tails)
    [
      [ 0.40, -0.38, 0.06, 0.012,  0.30],
      [-0.38, -0.30, 0.05, 0.010, -0.22],
      [ 0.34, -0.06, 0.07, 0.012,  0.38],
      [-0.32,  0.10, 0.05, 0.010, -0.33],
    ].forEach(([ix, iz, iw, ih, ir]) => {
      const cr = new THREE.Mesh(new THREE.BoxGeometry(iw, 0.006, ih), inkMat);
      cr.position.set(ix, 0.038, iz);
      cr.rotation.y = ir;
      docket.add(cr);
    });

    // ── FRONT COVER FLAP (pivots open from the spine edge) ──
    const frontCoverGroup = new THREE.Group();
    frontCoverGroup.position.set(-0.775, 0.025, 0); // spine = left edge
    docket.add(frontCoverGroup);

    const frontFlap = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.025, 1.02), folderMat);
    frontFlap.position.set(0.775, 0, 0); // offset so pivot is at left edge
    frontCoverGroup.add(frontFlap);

    // Spine
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 1.02), folderDark);
    spine.position.set(-0.775, 0.025, 0);
    docket.add(spine);

    // Tab
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.022, 0.14), folderDark);
    tab.position.set(0.45, 0.025, -0.58);
    docket.add(tab);

    docket.userData.frontCoverGroup = frontCoverGroup;

    docket.position.set(-1.1, 2.2, 0.55);
    docket.rotation.y = 0.15;
  }

  /* ── Room details ── */
  function _buildRoomDetails() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.95 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 0.25), wallMat);
    wall.position.set(0, 3, -3.5); wall.receiveShadow = true;
    scene.add(wall);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(13.5, 3.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x261807, roughness: 0.8 }));
    panel.position.set(0, 0.4, -3.4);
    scene.add(panel);

    const sealMat = new THREE.MeshStandardMaterial({ color: 0xc8a855, roughness: 0.4, metalness: 0.4, emissive: 0x1a0e00, emissiveIntensity: 0.3 });
    const seal = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.06, 10, 32), sealMat);
    seal.position.set(0, 5.5, -3.35);
    scene.add(seal);

    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32),
      new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9, side: THREE.FrontSide }));
    inner.position.set(0, 5.5, -3.3);
    scene.add(inner);

    const scaleBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xc8a855, roughness: 0.3, metalness: 0.6 }));
    scaleBar.position.set(0, 5.6, -3.26);
    scene.add(scaleBar);

    const colMat = new THREE.MeshStandardMaterial({ color: 0x1e1005, roughness: 0.7 });
    [-5, -2.8, 2.8, 5].forEach(x => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 9, 12), colMat);
      col.position.set(x, 2.5, -3.3); col.castShadow = true;
      scene.add(col);
    });

    const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.5, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x1a0e08 }));
    bookshelf.position.set(-5.5, 1.0, -1.5);
    scene.add(bookshelf);
  }

  /* ────────────────────────────────────────────
     CREDITS OVERLAY
  ──────────────────────────────────────────── */
  function _buildCreditsOverlay() {
    creditsEl = document.createElement('div');
    creditsEl.id = 'judge-credits-overlay';
    creditsEl.innerHTML = `
      <div class="credits-paper">
        <div class="credits-header">⚖ VERDICT! GX</div>
        <div class="credits-rule"></div>
        <div class="credits-section">
          <div class="credits-label">Game Design &amp; Programming</div>
          <div class="credits-name">Rahul Awasthi</div>
        </div>
        <div class="credits-rule"></div>
        <div class="credits-section">
          <div class="credits-label">Music</div>
          <div class="credits-name">Open-source Tracks</div>
          <div class="credits-sub">
            "Screen Saver" by Kevin MacLeod (incompetech.com)<br>
            Licensed under Creative Commons: By Attribution 3.0<br>
            <span class="credits-url">creativecommons.org/licenses/by/3.0</span>
          </div>
        </div>
        <div class="credits-rule"></div>
        <div class="credits-section">
          <div class="credits-label">Special Thanks</div>
          <div class="credits-name">Everyone Who Supported Us</div>
        </div>
        <div class="credits-rule"></div>
        <div class="credits-stamp">COURT IS ADJOURNED</div>
        <button class="credits-close" id="credits-close-btn">✕ Close</button>
      </div>
    `;
    creditsEl.style.cssText = `
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none; opacity: 0;
      transition: opacity 0.6s ease;
      z-index: 10;
    `;

    const style = document.createElement('style');
    style.textContent = `
      #judge-credits-overlay .credits-paper {
        background: #f8f4eb;
        border: 2px solid #c8a855;
        border-radius: 2px;
        padding: 1.5rem 2rem;
        max-width: min(400px, 80vw);
        max-height: 82vh;
        overflow-y: auto;
        width: 86%;
        box-sizing: border-box;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7), inset 0 0 60px rgba(200,168,85,0.08);
        text-align: center;
        font-family: 'Georgia', serif;
        position: relative;
        transform: rotate(-1.2deg) translateY(10px);
        transition: transform 0.8s cubic-bezier(0.23,1,0.32,1);
      }
      #judge-credits-overlay.visible .credits-paper {
        transform: rotate(-1.2deg) translateY(0);
      }
      .credits-header {
        font-size: clamp(1.0rem, 4vw, 1.6rem);
        font-weight: bold; letter-spacing: 0.12em;
        color: #2a1a00; text-transform: uppercase; margin-bottom: 0.4rem;
      }
      .credits-rule {
        height: 1px; background: linear-gradient(90deg, transparent, #c8a855, transparent);
        margin: 0.6rem 0;
      }
      .credits-section { margin: 0.5rem 0; }
      .credits-label {
        font-size: clamp(0.55rem, 1.8vw, 0.65rem); letter-spacing: 0.18em;
        text-transform: uppercase; color: #8a6a30; margin-bottom: 0.12rem;
      }
      .credits-name { font-size: clamp(0.85rem, 3vw, 1.05rem); color: #1a0e00; font-style: italic; }
      .credits-sub { font-size: clamp(0.62rem, 2vw, 0.72rem); color: #5a4020; margin-top: 0.3rem; line-height: 1.5; }
      .credits-url { color: #8a5020; }
      .credits-stamp {
        margin-top: 0.8rem;
        font-size: clamp(0.68rem, 2.2vw, 0.85rem); letter-spacing: 0.2em; color: #8a1515;
        text-transform: uppercase; border: 2px solid #8a1515;
        display: inline-block; padding: 0.22rem 0.8rem;
        transform: rotate(2deg); opacity: 0.75;
      }
      .credits-close {
        display: block; margin: 1rem auto 0;
        background: #2a1a00; color: #c8a855; border: 1px solid #c8a855;
        padding: 0.4rem 1.4rem; font-family: 'Georgia', serif;
        font-size: clamp(0.7rem, 2.2vw, 0.8rem); letter-spacing: 0.1em; cursor: pointer;
        transition: background 0.2s;
      }
      .credits-close:hover { background: #3d2a08; }
    `;
    document.head.appendChild(style);

    const canvasEl = renderer.domElement;
    const parent = canvasEl.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(creditsEl);
    }

    document.getElementById('credits-close-btn')?.addEventListener('click', _hideCredits);
  }

  function _showCredits() {
    if (!creditsEl) return;
    creditsEl.style.pointerEvents = 'auto';
    creditsEl.style.opacity = '1';
    creditsEl.classList.add('visible');
    creditsVisible = true;
  }

  function _hideCredits() {
    if (!creditsEl) return;
    creditsEl.style.opacity = '0';
    creditsEl.style.pointerEvents = 'none';
    creditsEl.classList.remove('visible');
    creditsVisible = false;

    // Close the folder cover
    if (docket && docket.userData.frontCoverGroup) {
      docket.userData.frontCoverGroup.rotation.z = 0;
    }

    // Start smooth camera return
    Anim.phase = 'returnOrbit';
    Anim.t = 0;
  }

  /* ────────────────────────────────────────────
     PUBLIC: Trigger credits sequence
  ──────────────────────────────────────────── */
  function playCredits() {
    if (isCreditsMode) return;
    isCreditsMode = true;
    Anim.phase = 'gavelRaise';
    Anim.t = 0;
    Anim.gavelSlamCount = 0;
  }

  /* ────────────────────────────────────────────
     ANIMATION LOOP
  ──────────────────────────────────────────── */
  function _loop() {
    requestAnimationFrame(_loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    _updateIdle(dt);
    _updateCreditsAnim(dt);
    renderer.render(scene, camera);
  }

  function _updateIdle(dt) {
    if (isCreditsMode) return;
    Idle.breathT += dt;
    const breath = Math.sin(Idle.breathT * 0.7) * 0.004;
    const sway   = Math.sin(Idle.breathT * 0.3) * 0.006;
    if (judge) { judge.rotation.y = sway; judge.position.y = 0.22 + breath * 2; }
    if (gavel) { gavel.rotation.z = Anim.gavelRestRot + Math.sin(Idle.breathT * 0.4) * 0.015; }
    camera.position.x = Math.sin(Idle.breathT * 0.12) * 0.08;
    camera.position.y = 3.6 + Math.sin(Idle.breathT * 0.2) * 0.04;
    camera.lookAt(0, 3.2, 0);
  }

  function _updateCreditsAnim(dt) {
    if (!isCreditsMode) return;
    Anim.t += dt;
    // Ensure world matrices are fresh so we can read arm position
    scene.updateMatrixWorld(true);

    switch (Anim.phase) {

      /* ── 1. ARM RAISES + GAVEL LIFTS ── */
      case 'gavelRaise': {
        const prog = Math.min(Anim.t / 0.35, 1);
        const e = _easeOut(prog);
        judgeRightArmPivot.rotation.x = Anim.armRestRot - e * 0.9;
        // Compute where the hand is in world space and move gavel there
        const handLocal = new THREE.Vector3(0, -1.38, 0.42);
        const handWorld = handLocal.clone().applyMatrix4(judgeRightArmPivot.matrixWorld);
        gavel.position.set(handWorld.x, handWorld.y, handWorld.z);
        gavel.rotation.z   = Anim.gavelRestRot - e * 0.9;
        if (prog >= 1) { Anim.phase = 'gavelSlam'; Anim.t = 0; }
        break;
      }

      /* ── 2. ARM SLAMS DOWN + GAVEL HITS ── */
      case 'gavelSlam': {
        const prog = Math.min(Anim.t / 0.20, 1);
        const e = _easeIn(prog);
        judgeRightArmPivot.rotation.x = (Anim.armRestRot - 0.9) + e * 1.1;
        // Track hand world position
        const handLocal = new THREE.Vector3(0, -1.38, 0.42);
        const handWorld = handLocal.clone().applyMatrix4(judgeRightArmPivot.matrixWorld);
        gavel.position.set(handWorld.x, handWorld.y, handWorld.z);
        gavel.rotation.z   = (Anim.gavelRestRot - 0.9) + e * 0.85;
        if (prog >= 1) { Anim.phase = 'gavelSettle'; Anim.t = 0; }
        break;
      }

      /* ── 3. SETTLE / BOUNCE ── */
      case 'gavelSettle': {
        const prog = Math.min(Anim.t / 0.32, 1);
        const bounce = Math.sin(prog * Math.PI) * 0.04 * (1 - prog);
        gavel.position.y   = Anim.gavelRestY + bounce;
        gavel.rotation.z   = Anim.gavelRestRot;
        judgeRightArmPivot.rotation.x = Anim.armRestRot + bounce * 0.3;
        if (prog >= 1) { Anim.gavelSlamCount++; Anim.phase = 'gavelPause'; Anim.t = 0; }
        break;
      }

      /* ── 4. PAUSE BETWEEN SLAMS ── */
      case 'gavelPause': {
        if (Anim.t >= 0.28) {
          if (Anim.gavelSlamCount < 3) {
            Anim.phase = 'gavelRaise'; Anim.t = 0;
          } else {
            Anim.phase = 'orbit'; Anim.t = 0;
          }
        }
        break;
      }

      /* ── 5. ORBIT: camera sweeps around judge ── */
      case 'orbit': {
        const prog = Math.min(Anim.t / 2.2, 1);
        const e = _easeInOut(prog);
        const angle = (Math.PI * 0.55) * e;
        const radius = 6.5;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = Math.cos(angle) * radius;
        camera.position.y = 2.8 + e * 0.8;
        camera.lookAt(0, 2.8, 0);
        if (prog >= 1) { Anim.phase = 'pickupFile'; Anim.t = 0; }
        break;
      }

      /* ── 6. PICK UP FILE: docket lifts, camera zooms in ── */
      case 'pickupFile': {
        const prog = Math.min(Anim.t / 1.0, 1);
        const e = _easeInOut(prog);
        docket.position.y = 2.2 + e * 0.30;
        docket.rotation.x = -e * 0.20;
        // Camera smoothly moves toward docket
        const tpx = -1.1, tpy = 4.2, tpz = 3.8;
        camera.position.x += (tpx - camera.position.x) * e * 0.055;
        camera.position.y += (tpy - camera.position.y) * e * 0.055;
        camera.position.z += (tpz - camera.position.z) * e * 0.055;
        camera.lookAt(-1.1, 2.5, 0.5);
        if (prog >= 1) { Anim.phase = 'openFile'; Anim.t = 0; }
        break;
      }

      /* ── 7. OPEN FILE: folder flap swings open ── */
      case 'openFile': {
        const prog = Math.min(Anim.t / 1.1, 1);
        const e = _easeInOut(prog);
        if (docket && docket.userData.frontCoverGroup) {
          // Rotate the front cover ~160° open (flips back to reveal paper inside)
          docket.userData.frontCoverGroup.rotation.z = e * Math.PI * 0.88;
        }
        if (prog >= 1 && Anim.t >= 1.5) { Anim.phase = 'credits'; _showCredits(); }
        break;
      }

      case 'credits':
        // Waiting for user to close
        break;

      /* ── 8. RETURN ORBIT: smooth camera sweep back to front ── */
      case 'returnOrbit': {
        const prog = Math.min(Anim.t / 2.0, 1);
        const e = _easeInOut(prog);

        // Sweep camera from orbit position (angle ~100deg) back to front (angle 0)
        const fromAngle = Math.PI * 0.55 * (1 - e);
        const radius = 6.5 * (1 - e) + 0 * e;
        camera.position.x = Math.sin(fromAngle) * 6.5 * (1 - e);
        camera.position.z = Math.cos(fromAngle) * 6.5 * (1 - e) + 5.0 * e;
        camera.position.y = (2.8 + 0.8) * (1 - e) + 3.6 * e;
        camera.lookAt(0, 3.2, 0);

        // Lower docket back to bench
        docket.position.y = (2.2 + 0.30) + (2.2 - (2.2 + 0.30)) * e;
        docket.rotation.x = -0.20 * (1 - e);

        if (prog >= 1) { Anim.phase = 'returnSnap'; Anim.t = 0; }
        break;
      }

      /* ── 9. SNAP back exactly, re-enable idle ── */
      case 'returnSnap': {
        camera.position.set(0, 3.6, 5.0);
        camera.lookAt(0, 3.2, 0);
        gavel.position.set(1.72, Anim.gavelRestY, 0.6);
        gavel.rotation.set(0, 0.3, Anim.gavelRestRot);
        judgeRightArmPivot.rotation.x = Anim.armRestRot;
        docket.position.set(-1.1, 2.2, 0.55);
        docket.rotation.set(0, 0.15, 0);
        isCreditsMode = false;
        Anim.phase = 'idle';
        Anim.t = 0;
        break;
      }
    }
  }

  function _easeOut(t)   { return 1 - Math.pow(1 - t, 2); }
  function _easeIn(t)    { return t * t; }
  function _easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  /* ────────────────────────────────────────────
     PUBLIC API
  ──────────────────────────────────────────── */
  return { init, playCredits };

})();