/* ==========================================================================
   KARATE DO - SHORIN RYU SHINSHUKAN - HIKARI DOJO (ESCENA 3D EN THREE.JS)
   Estética Luminosa en Tonos Pasteles, Madera Hinoki Clara y Acuarela
   ========================================================================== */

(function () {
  'use strict';

  class HikariDojoScene {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container || typeof THREE === 'undefined') return;

      this.clock = new THREE.Clock();
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.isDragging = false;
      this.prevPointer = { x: 0, y: 0 };
      this.orbitAngle = { theta: 0, phi: 0.22, radius: 12.0 };
      this.currentPreset = 'general';
      this.pastelEveningMode = false;
      this.scrollFraction = 0;

      // Posiciones de cámara interpoladas
      this.camPos = new THREE.Vector3(0, 3.4, 11.2);
      this.camTargetPos = new THREE.Vector3(0, 3.4, 11.2);
      this.lookAtPos = new THREE.Vector3(0, 2.7, -3.5);
      this.lookAtTarget = new THREE.Vector3(0, 2.7, -3.5);

      this.shockwaves = [];
      this.lanterns = [];

      this.initScene();
      this.createLights();
      this.createTextures();
      this.buildDojoArchitecture();
      this.buildShomenAndAuthenticEmblems();
      this.buildMakiwaraAndKobudo();
      this.buildFloatingLanterns();
      this.buildHikariParticles();
      this.bindEvents();
      this.animate();
    }

    initScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xffffff);

      this.camera = new THREE.PerspectiveCamera(
        46,
        window.innerWidth / window.innerHeight,
        0.1,
        120
      );
      this.camera.position.copy(this.camPos);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;

      this.container.appendChild(this.renderer.domElement);
      this.dojoGroup = new THREE.Group();
      this.scene.add(this.dojoGroup);
    }

    createLights() {
      // Iluminación natural suave y luminosa para resaltar los tonos pasteles
      this.ambientLight = new THREE.AmbientLight(0xfffbf2, 0.95);
      this.scene.add(this.ambientLight);

      // Luz principal cálida desde arriba/frente
      this.sunLight = new THREE.DirectionalLight(0xfff5e4, 0.9);
      this.sunLight.position.set(4, 9, 6);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.scene.add(this.sunLight);

      // Luz cenital suave sobre el tatami
      this.dojoTopLight = new THREE.PointLight(0xffe4b5, 0.85, 28, 1.2);
      this.dojoTopLight.position.set(0, 6.8, 1.0);
      this.scene.add(this.dojoTopLight);

      // Luces laterales sage / clay
      this.cyanLightLeft = new THREE.PointLight(0xadc178, 0.7, 20);
      this.cyanLightLeft.position.set(-6.0, 3.5, -1.0);
      this.scene.add(this.cyanLightLeft);

      this.goldLightRight = new THREE.PointLight(0xa98467, 0.7, 20);
      this.goldLightRight.position.set(6.5, 3.0, -1.0);
      this.scene.add(this.goldLightRight);
    }

    /* ========================================================================
       CARGA DE LOGOS ORIGINALES EXACTOS + TEXTURAS PASTELES DEL DOJO
       ======================================================================== */
    createTextures() {
      const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const loader = new THREE.TextureLoader();

      if (window.HIKARI_LOGOS) {
        this.shinshukanTexture = loader.load(window.HIKARI_LOGOS.shinshukan);
        this.shinshukanTexture.anisotropy = maxAnisotropy;

        this.hikariTexture = loader.load(window.HIKARI_LOGOS.hikari);
        this.hikariTexture.anisotropy = maxAnisotropy;
      }

      // Textura de Tatami en verde salvia pastel suave
      const tatamiCanvas = document.createElement('canvas');
      tatamiCanvas.width = 512;
      tatamiCanvas.height = 256;
      const tCtx = tatamiCanvas.getContext('2d');
      tCtx.fillStyle = '#dde5b6'; // Sage soft
      tCtx.fillRect(0, 0, 512, 256);
      for (let y = 0; y < 256; y += 3) {
        tCtx.fillStyle = y % 6 === 0 ? 'rgba(255,255,245,0.22)' : 'rgba(95,115,80,0.08)';
        tCtx.fillRect(0, y, 512, 2);
      }
      for (let x = 0; x < 512; x += 16) {
        tCtx.fillStyle = 'rgba(70,85,60,0.04)';
        tCtx.fillRect(x, 0, 2, 256);
      }
      // Borde tradicional (Heri) en tono gris pizarra azulado suave (como el texto del post de IG)
      tCtx.fillStyle = '#6c808c';
      tCtx.fillRect(0, 0, 512, 15);
      tCtx.fillRect(0, 241, 512, 15);
      tCtx.strokeStyle = '#d4b46a';
      tCtx.lineWidth = 1.5;
      tCtx.strokeRect(2, 15, 508, 226);

      this.tatamiTexture = new THREE.CanvasTexture(tatamiCanvas);

      // Textura Sol Naciente Acuarela Pastel (Coral / Salmón fiel al post de Instagram)
      const sunCanvas = document.createElement('canvas');
      sunCanvas.width = 512;
      sunCanvas.height = 512;
      const sunCtx = sunCanvas.getContext('2d');
      const cx = 256, cy = 256;
      const grad = sunCtx.createRadialGradient(cx, cy, 18, cx, cy, 245);
      grad.addColorStop(0, 'rgba(236, 122, 108, 0.92)');
      grad.addColorStop(0.62, 'rgba(232, 134, 118, 0.82)');
      grad.addColorStop(0.9, 'rgba(238, 158, 144, 0.35)');
      grad.addColorStop(1, 'rgba(238, 158, 144, 0)');
      sunCtx.fillStyle = grad;
      sunCtx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 185;
        const rx = cx + Math.cos(angle) * dist;
        const ry = cy + Math.sin(angle) * dist;
        const rad = 22 + Math.random() * 55;
        const wGrad = sunCtx.createRadialGradient(rx, ry, 2, rx, ry, rad);
        wGrad.addColorStop(0, 'rgba(255, 195, 180, 0.22)');
        wGrad.addColorStop(1, 'rgba(236, 122, 108, 0)');
        sunCtx.fillStyle = wGrad;
        sunCtx.beginPath();
        sunCtx.arc(rx, ry, rad, 0, Math.PI * 2);
        sunCtx.fill();
      }
      this.sunTexture = new THREE.CanvasTexture(sunCanvas);
    }

    createCalligraphyScrollTexture(kanjiText, subText) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      // Marco de seda pastel gris azulado / dorado suave
      ctx.fillStyle = '#8fa3b0';
      ctx.fillRect(0, 0, 256, 768);
      ctx.strokeStyle = '#d9b36c';
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, 236, 748);

      // Papel Washi crema claro
      ctx.fillStyle = '#fffdf8';
      ctx.fillRect(26, 56, 204, 656);

      // Caligrafía en tono grafito suave
      ctx.fillStyle = '#2d3a45';
      ctx.font = '900 84px "Noto Serif JP", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const chars = kanjiText.split('');
      const startY = 145;
      const spacing = 115;
      chars.forEach((ch, idx) => {
        ctx.fillText(ch, 128, startY + idx * spacing);
      });

      // Sello Hanko coral pastel
      ctx.fillStyle = '#e06d63';
      ctx.fillRect(103, 635, 50, 50);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px "Noto Serif JP", serif';
      ctx.fillText(subText || '新', 128, 660);

      return new THREE.CanvasTexture(canvas);
    }

    /* ========================================================================
       ARQUITECTURA DEL DOJO EN MADERA HINOKI CLARA Y TONOS PASTELES
       ======================================================================== */
    buildDojoArchitecture() {
      // Madera Hinoki clara japonesa (tono miel/arena pastel)
      const hinokiWoodMat = new THREE.MeshStandardMaterial({
        color: 0xd8b894,
        roughness: 0.55,
        metalness: 0.05
      });

      const basePlatform = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 15), hinokiWoodMat);
      basePlatform.position.set(0, -0.18, 0);
      basePlatform.receiveShadow = true;
      this.dojoGroup.add(basePlatform);

      // Suelo exterior crema claro (fondo legible al scrollear)
      this.outerFloorMat = new THREE.MeshStandardMaterial({
        color: 0xf7f3ea,
        emissive: 0xf2eee4,
        emissiveIntensity: 0.15,
        roughness: 0.7,
        metalness: 0.02
      });
      const outerFloor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), this.outerFloorMat);
      outerFloor.rotation.x = -Math.PI / 2;
      outerFloor.position.y = -0.35;
      outerFloor.receiveShadow = true;
      this.dojoGroup.add(outerFloor);

      // Esteras de Tatami (4x3)
      const matGeo = new THREE.BoxGeometry(3.2, 0.08, 1.6);
      const matMaterial = new THREE.MeshStandardMaterial({
        map: this.tatamiTexture,
        roughness: 0.7,
        metalness: 0.02
      });

      const tatamiGroup = new THREE.Group();
      for (let row = -1; row <= 1; row++) {
        for (let col = -1.5; col <= 1.5; col += 1) {
          const tatami = new THREE.Mesh(matGeo, matMaterial);
          tatami.position.set(col * 3.24, 0.04, row * 2.65 + 0.5);
          tatami.scale.z = 1.62;
          tatami.receiveShadow = true;
          tatamiGroup.add(tatami);
        }
      }
      this.dojoGroup.add(tatamiGroup);

      // Círculo central sutil en el Tatami
      const centerRingGeo = new THREE.RingGeometry(1.85, 1.93, 64);
      centerRingGeo.rotateX(-Math.PI / 2);
      this.tatamiCenterRing = new THREE.Mesh(
        centerRingGeo,
        new THREE.MeshBasicMaterial({
          color: 0x4dd0e1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45
        })
      );
      this.tatamiCenterRing.position.set(0, 0.09, 0.5);
      this.dojoGroup.add(this.tatamiCenterRing);

      // Pilares de madera Hinoki clara (Hashira)
      const pillarGeo = new THREE.BoxGeometry(0.38, 6.8, 0.38);
      const pillarPositions = [
        [-8.8, 3.4, -6.5],
        [-4.8, 3.4, -6.5],
        [4.8, 3.4, -6.5],
        [8.8, 3.4, -6.5],
        [-8.8, 3.4, -1.5],
        [8.8, 3.4, -1.5],
        [-8.8, 3.4, 3.5],
        [8.8, 3.4, 3.5]
      ];
      pillarPositions.forEach(([x, y, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, hinokiWoodMat);
        pillar.position.set(x, y, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        this.dojoGroup.add(pillar);
      });

      const beam = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.42, 0.48), hinokiWoodMat);
      beam.position.set(0, 6.2, -6.5);
      this.dojoGroup.add(beam);

      // Paneles Shoji laterales en papel de arroz blanco cálido luminoso
      this.shojiMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffdf9,
        emissive: 0xfff3dc,
        emissiveIntensity: 0.35,
        roughness: 0.85
      });

      this.createShojiWall(-8.8, 2.8, -4.0, Math.PI / 2);
      this.createShojiWall(-8.8, 2.8, 1.0, Math.PI / 2);
      this.createShojiWall(8.8, 2.8, -4.0, -Math.PI / 2);
      this.createShojiWall(8.8, 2.8, 1.0, -Math.PI / 2);
    }

    createShojiWall(x, y, z, rotY) {
      const group = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 5.2), this.shojiMaterial);
      group.add(panel);

      const frameMat = new THREE.MeshBasicMaterial({ color: 0xc4a27a });
      for (let h = -2.2; h <= 2.2; h += 0.88) {
        const barH = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.05, 0.04), frameMat);
        barH.position.y = h;
        group.add(barH);
      }
      for (let v = -1.8; v <= 1.8; v += 0.9) {
        const barV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 5.2, 0.04), frameMat);
        barV.position.x = v;
        group.add(barV);
      }

      group.position.set(x, y, z);
      group.rotation.y = rotY;
      this.dojoGroup.add(group);
    }

    /* ========================================================================
       SHOMEN CLARO, SOL ACUARELA PASTEL Y MEDALLONES 3D DEL MISMO TAMAÑO
       ======================================================================== */
    buildShomenAndAuthenticEmblems() {
      // Pared de fondo marfil (también sirve de fondo claro al scrollear)
      this.backWallMat = new THREE.MeshStandardMaterial({
        color: 0xfaf6ee,
        emissive: 0xf5f0e6,
        emissiveIntensity: 0.12,
        roughness: 0.85
      });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), this.backWallMat);
      backWall.position.set(0, 3.4, -6.7);
      this.dojoGroup.add(backWall);

      // 1. Sol Naciente Acuarela Pastel (Hinomaru) central
      const sunGeo = new THREE.PlaneGeometry(7.2, 7.2);
      const sunMat = new THREE.MeshBasicMaterial({
        map: this.sunTexture,
        transparent: true,
        depthWrite: false
      });
      this.risingSun = new THREE.Mesh(sunGeo, sunMat);
      this.risingSun.position.set(0, 3.5, -6.3);
      this.dojoGroup.add(this.risingSun);

      // Anillo energético pastel alrededor del sol
      const haloGeo = new THREE.RingGeometry(2.95, 3.03, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xe6b85c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      this.sunHalo = new THREE.Mesh(haloGeo, haloMat);
      this.sunHalo.position.set(0, 3.5, -6.22);
      this.dojoGroup.add(this.sunHalo);

      // 2. PRIMERO (Izquierda): Medallón 3D Oficial SHORIN RYU SHINSHUKAN ARGENTINA (Mismo tamaño: 1.55)
      this.shinshukanEmblem = this.createAuthentic3DMedallion(
        this.shinshukanTexture,
        0xadc178, // Borde sage Shinshukan
        1.55
      );
      this.shinshukanEmblem.position.set(-2.55, 3.55, -4.6);
      this.shinshukanEmblem.rotation.y = 0.16;
      this.dojoGroup.add(this.shinshukanEmblem);

      // 3. SEGUNDO (Derecha): Medallón 3D Oficial HIKARI DOJO (光) (Mismo tamaño: 1.55)
      this.hikariEmblem = this.createAuthentic3DMedallion(
        this.hikariTexture,
        0xa98467, // Borde clay Hikari
        1.55
      );
      this.hikariEmblem.position.set(2.55, 3.55, -4.6);
      this.hikariEmblem.rotation.y = -0.16;
      this.dojoGroup.add(this.hikariEmblem);

      // 4. Pergaminos Colgantes (Kakemono): Izquierda = Shorin Ryu Shinshukan, Derecha = Hikari Dojo
      const scrollTexLeft = this.createCalligraphyScrollTexture('小林流新秀館', '新');
      const scrollTexRight = this.createCalligraphyScrollTexture('空手道光道場', '光');

      const scrollGeo = new THREE.BoxGeometry(0.95, 2.85, 0.04);
      const scrollLeft = new THREE.Mesh(
        scrollGeo,
        new THREE.MeshStandardMaterial({ map: scrollTexLeft, roughness: 0.6 })
      );
      scrollLeft.position.set(-6.4, 3.6, -6.25);
      this.dojoGroup.add(scrollLeft);

      const scrollRight = new THREE.Mesh(
        scrollGeo,
        new THREE.MeshStandardMaterial({ map: scrollTexRight, roughness: 0.6 })
      );
      scrollRight.position.set(6.4, 3.6, -6.25);
      this.dojoGroup.add(scrollRight);

      // Mesa baja de altar en madera natural media
      const altarMat = new THREE.MeshStandardMaterial({
        color: 0x9c7a54,
        roughness: 0.45,
        metalness: 0.1
      });
      const altarTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 0.95), altarMat);
      altarTop.position.set(0, 1.05, -5.6);
      this.dojoGroup.add(altarTop);

      const legGeo = new THREE.BoxGeometry(0.16, 1.0, 0.8);
      const legL = new THREE.Mesh(legGeo, altarMat);
      legL.position.set(-1.65, 0.5, -5.6);
      const legR = new THREE.Mesh(legGeo, altarMat);
      legR.position.set(1.65, 0.5, -5.6);
      this.dojoGroup.add(legL, legR);
    }

    createAuthentic3DMedallion(texture, rimColorHex, radius) {
      const group = new THREE.Group();

      const rimGeo = new THREE.CylinderGeometry(radius * 1.03, radius * 1.03, 0.16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: rimColorHex,
        metalness: 0.3,
        roughness: 0.35
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.castShadow = true;
      group.add(rim);

      const backingGeo = new THREE.CircleGeometry(radius, 64);
      const backingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const frontBacking = new THREE.Mesh(backingGeo, backingMat);
      frontBacking.position.z = 0.081;
      group.add(frontBacking);

      const backBacking = new THREE.Mesh(backingGeo, backingMat);
      backBacking.rotation.y = Math.PI;
      backBacking.position.z = -0.081;
      group.add(backBacking);

      const faceGeo = new THREE.CircleGeometry(radius * 0.98, 64);
      const faceMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      });
      const frontFace = new THREE.Mesh(faceGeo, faceMat);
      frontFace.position.z = 0.083;
      group.add(frontFace);

      const backFace = new THREE.Mesh(faceGeo, faceMat);
      backFace.rotation.y = Math.PI;
      backFace.position.z = -0.083;
      group.add(backFace);

      return group;
    }

    /* ========================================================================
       MAKIWARA TRADICIONAL DE OKINAWA Y BUKI-KAKE
       ======================================================================== */
    buildMakiwaraAndKobudo() {
      this.makiwaraGroup = new THREE.Group();
      this.makiwaraGroup.position.set(5.4, 0, -1.2);
      this.makiwaraGroup.rotation.y = -0.45;

      const woodMat = new THREE.MeshStandardMaterial({ color: 0xc29b6c, roughness: 0.6 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), woodMat);
      base.position.y = 0.06;
      this.makiwaraGroup.add(base);

      const postGeo = new THREE.BoxGeometry(0.28, 2.25, 0.12);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.y = 1.15;
      post.castShadow = true;
      this.makiwaraGroup.add(post);

      const padMat = new THREE.MeshStandardMaterial({
        color: 0xe6be7a,
        roughness: 0.85
      });
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.2), padMat);
      pad.position.set(0, 1.72, 0.02);
      this.makiwaraGroup.add(pad);

      const ropeMat = new THREE.MeshBasicMaterial({ color: 0x5c6b73 });
      const ropeTop = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.04, 0.21), ropeMat);
      ropeTop.position.set(0, 1.92, 0.02);
      const ropeBot = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.04, 0.21), ropeMat);
      ropeBot.position.set(0, 1.52, 0.02);
      this.makiwaraGroup.add(ropeTop, ropeBot);

      const boStaff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.7, 16),
        new THREE.MeshStandardMaterial({ color: 0xb0855b, roughness: 0.45 })
      );
      boStaff.position.set(0.85, 1.38, -0.3);
      boStaff.rotation.z = 0.08;
      this.makiwaraGroup.add(boStaff);

      this.dojoGroup.add(this.makiwaraGroup);
    }

    /* ========================================================================
       LINTERNAS JAPONESAS (ANDON) EN MADERA CLARA
       ======================================================================== */
    buildFloatingLanterns() {
      const lanternCoords = [
        [-5.8, 0.55, 2.4],
        [5.8, 0.55, 2.4],
        [-5.8, 0.55, -3.2]
      ];
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xb8926a, roughness: 0.5 });
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0xfff9e6,
        emissive: 0xffd580,
        emissiveIntensity: 0.6,
        roughness: 0.4
      });

      lanternCoords.forEach(([x, y, z]) => {
        const lGroup = new THREE.Group();
        const core = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.65, 0.36), glowMat);
        lGroup.add(core);

        const capTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.46), frameMat);
        capTop.position.y = 0.35;
        const capBot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.46), frameMat);
        capBot.position.y = -0.35;
        lGroup.add(capTop, capBot);

        lGroup.position.set(x, y, z);
        this.dojoGroup.add(lGroup);
        this.lanterns.push(lGroup);
      });
    }

    /* ========================================================================
       PARTÍCULAS SUAVES EN TONOS PASTELES
       ======================================================================== */
    buildHikariParticles() {
      const count = 260;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const colorPastelCyan = new THREE.Color(0x4dd0e1);
      const colorPastelCoral = new THREE.Color(0xf08080);
      const colorPastelGold = new THREE.Color(0xe6be5a);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

        const rand = Math.random();
        const chosen = rand < 0.45 ? colorPastelCyan : rand < 0.75 ? colorPastelCoral : colorPastelGold;
        colors[i * 3] = chosen.r;
        colors[i * 3 + 1] = chosen.g;
        colors[i * 3 + 2] = chosen.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.65
      });

      this.particles = new THREE.Points(geo, mat);
      this.scene.add(this.particles);
    }

    triggerKiaiWave() {
      const ringGeo = new THREE.RingGeometry(0.4, 0.58, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x4dd0e1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.position.set(0, 0.12, 0.5);
      this.dojoGroup.add(mesh);
      this.shockwaves.push({ mesh, scale: 1, opacity: 0.85 });
    }

    toggleAmbiance() {
      this.pastelEveningMode = !this.pastelEveningMode;
      if (this.pastelEveningMode) {
        this.scene.background.setHex(0xdde5b6);
        this.ambientLight.color.setHex(0xf0ead2);
        this.ambientLight.intensity = 0.88;
        this.dojoTopLight.color.setHex(0xadc178);
        this.shojiMaterial.emissive.setHex(0xdde5b6);
        this.shojiMaterial.emissiveIntensity = 0.4;
      } else {
        this.scene.background.setHex(0xffffff);
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.95;
        this.dojoTopLight.color.setHex(0xa98467);
        this.shojiMaterial.emissive.setHex(0xffffff);
        this.shojiMaterial.emissiveIntensity = 0.35;
      }
      return this.pastelEveningMode;
    }

    setCameraPreset(preset) {
      this.currentPreset = preset;
      switch (preset) {
        case 'general':
          this.camTargetPos.set(0, 3.4, 11.2);
          this.lookAtTarget.set(0, 2.7, -3.5);
          break;
        case 'shinshukan':
          this.camTargetPos.set(-2.3, 3.55, -0.5);
          this.lookAtTarget.set(-2.55, 3.55, -4.6);
          break;
        case 'hikari':
          this.camTargetPos.set(2.3, 3.55, -0.5);
          this.lookAtTarget.set(2.55, 3.55, -4.6);
          break;
        case 'shomen':
          this.camTargetPos.set(0, 3.55, 0.8);
          this.lookAtTarget.set(0, 3.55, -5.2);
          break;
        case 'makiwara':
          this.camTargetPos.set(2.2, 2.2, 3.2);
          this.lookAtTarget.set(5.4, 1.35, -1.2);
          break;
        case 'orbit':
          this.orbitAngle.theta = 0.35;
          this.orbitAngle.phi = 0.28;
          this.orbitAngle.radius = 12.0;
          break;
      }
    }

    updateScrollCamera(scrollFraction) {
      if (document.body.classList.contains('explore-mode') || this.currentPreset !== 'general') {
        return;
      }
      const t = Math.max(0, Math.min(1, scrollFraction));
      this.scrollFraction = t;

      // Recorrido hacia superficies claras: shoji → piso crema → pared marfil → shoji
      if (t < 0.22) {
        // Hero → pared shoji izquierda (papel blanco)
        const p = t / 0.22;
        this.camTargetPos.set(
          THREE.MathUtils.lerp(0, -4.2, p),
          THREE.MathUtils.lerp(3.4, 2.85, p),
          THREE.MathUtils.lerp(11.2, 2.4, p)
        );
        this.lookAtTarget.set(
          THREE.MathUtils.lerp(0, -8.6, p),
          THREE.MathUtils.lerp(2.7, 2.7, p),
          THREE.MathUtils.lerp(-3.5, 0.2, p)
        );
      } else if (t < 0.45) {
        // Shoji → piso crema (fuera del tatami, más claro)
        const p = (t - 0.22) / 0.23;
        this.camTargetPos.set(
          THREE.MathUtils.lerp(-4.2, 0.4, p),
          THREE.MathUtils.lerp(2.85, 6.4, p),
          THREE.MathUtils.lerp(2.4, 9.2, p)
        );
        this.lookAtTarget.set(
          THREE.MathUtils.lerp(-8.6, 0, p),
          THREE.MathUtils.lerp(2.7, -0.25, p),
          THREE.MathUtils.lerp(0.2, 5.5, p)
        );
      } else if (t < 0.68) {
        // Piso → pared marfil del shomen (fondo casi blanco)
        const p = (t - 0.45) / 0.23;
        this.camTargetPos.set(
          THREE.MathUtils.lerp(0.4, 0, p),
          THREE.MathUtils.lerp(6.4, 3.2, p),
          THREE.MathUtils.lerp(9.2, 2.8, p)
        );
        this.lookAtTarget.set(
          0,
          THREE.MathUtils.lerp(-0.25, 3.2, p),
          THREE.MathUtils.lerp(5.5, -6.5, p)
        );
      } else {
        // Cierre: papel shoji derecho llena el frame
        const p = (t - 0.68) / 0.32;
        this.camTargetPos.set(
          THREE.MathUtils.lerp(0, 6.2, p),
          THREE.MathUtils.lerp(3.2, 2.7, p),
          THREE.MathUtils.lerp(2.8, 0.4, p)
        );
        this.lookAtTarget.set(
          THREE.MathUtils.lerp(0, 8.8, p),
          THREE.MathUtils.lerp(3.2, 2.65, p),
          THREE.MathUtils.lerp(-6.5, 0.5, p)
        );
      }

      // Más brillo en superficies claras a medida que scrolleás
      if (!this.pastelEveningMode) {
        if (this.shojiMaterial) {
          this.shojiMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.35, 0.9, t);
        }
        if (this.outerFloorMat) {
          this.outerFloorMat.emissiveIntensity = THREE.MathUtils.lerp(0.15, 0.45, t);
        }
        if (this.backWallMat) {
          this.backWallMat.emissiveIntensity = THREE.MathUtils.lerp(0.12, 0.4, t);
        }
        if (this.ambientLight) {
          this.ambientLight.intensity = THREE.MathUtils.lerp(0.95, 1.35, t);
        }
        if (this.renderer) {
          this.renderer.toneMappingExposure = THREE.MathUtils.lerp(1.08, 1.28, t);
        }
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

        if (this.isDragging) {
          const dx = e.clientX - this.prevPointer.x;
          const dy = e.clientY - this.prevPointer.y;
          this.orbitAngle.theta -= dx * 0.007;
          this.orbitAngle.phi = Math.max(0.08, Math.min(1.15, this.orbitAngle.phi + dy * 0.006));
          this.prevPointer.x = e.clientX;
          this.prevPointer.y = e.clientY;
        }
      });

      this.renderer.domElement.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.prevPointer.x = e.clientX;
        this.prevPointer.y = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      this.renderer.domElement.addEventListener(
        'wheel',
        (e) => {
          if (document.body.classList.contains('explore-mode') || this.currentPreset === 'orbit') {
            e.preventDefault();
            this.orbitAngle.radius = Math.max(4.0, Math.min(20, this.orbitAngle.radius + e.deltaY * 0.01));
          }
        },
        { passive: false }
      );
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      const elapsed = this.clock.getElapsedTime();

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

      if (this.shinshukanEmblem && this.hikariEmblem) {
        this.shinshukanEmblem.position.y = 3.55 + Math.sin(elapsed * 1.5) * 0.07;
        this.shinshukanEmblem.rotation.y = 0.16 + Math.sin(elapsed * 0.8) * 0.12;

        this.hikariEmblem.position.y = 3.55 + Math.cos(elapsed * 1.5) * 0.07;
        this.hikariEmblem.rotation.y = -0.16 + Math.cos(elapsed * 0.8) * 0.12;
      }

      if (this.risingSun && this.sunHalo) {
        const pulse = 1 + Math.sin(elapsed * 1.8) * 0.025;
        this.risingSun.scale.set(pulse, pulse, 1);
        this.sunHalo.scale.set(pulse * 1.02, pulse * 1.02, 1);
        this.sunHalo.rotation.z = elapsed * 0.15;
      }

      if (this.tatamiCenterRing) {
        this.tatamiCenterRing.rotation.z = -elapsed * 0.1;
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.scale += 0.22;
        sw.opacity -= 0.025;
        sw.mesh.scale.set(sw.scale, sw.scale, 1);
        sw.mesh.material.opacity = Math.max(0, sw.opacity);
        if (sw.opacity <= 0) {
          this.dojoGroup.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          sw.mesh.material.dispose();
          this.shockwaves.splice(i, 1);
        }
      }

      if (this.particles) {
        const posAttr = this.particles.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          let y = posAttr.getY(i);
          y += 0.008;
          if (y > 8) y = 0.1;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
        this.particles.rotation.y = elapsed * 0.03 + this.mouse.x * 0.12;
      }

      if (this.currentPreset === 'orbit' || document.body.classList.contains('explore-mode')) {
        if (!this.isDragging) {
          this.orbitAngle.theta += 0.0025;
        }
        const r = this.orbitAngle.radius;
        this.camTargetPos.set(
          Math.sin(this.orbitAngle.theta) * Math.cos(this.orbitAngle.phi) * r,
          Math.max(1.2, Math.sin(this.orbitAngle.phi) * r + 1.2),
          Math.cos(this.orbitAngle.theta) * Math.cos(this.orbitAngle.phi) * r
        );
        this.lookAtTarget.set(0, 2.2, -2.0);
      }

      // Menos parallax al scrollear para no “ensuciar” el fondo claro detrás del texto
      const parallaxFade = 1 - this.scrollFraction * 0.85;
      const parallaxX = this.mouse.x * 0.5 * parallaxFade;
      const parallaxY = -this.mouse.y * 0.3 * parallaxFade;

      this.camPos.x += (this.camTargetPos.x + parallaxX - this.camPos.x) * 0.05;
      this.camPos.y += (this.camTargetPos.y + parallaxY - this.camPos.y) * 0.05;
      this.camPos.z += (this.camTargetPos.z - this.camPos.z) * 0.05;

      this.lookAtPos.lerp(this.lookAtTarget, 0.06);

      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.lookAtPos);

      this.renderer.render(this.scene, this.camera);
    }
  }

  window.HikariDojoScene = HikariDojoScene;
})();
