/* ==========================================================================
   HIKARI DOJO - CONTROLADOR DE INTERFAZ, HORARIOS EN VIVO Y EVENTOS 3D
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Pantalla de carga y arranque de escena Three.js
  const loaderScreen = document.getElementById('loader-screen');
  const loaderBar = document.getElementById('loader-bar');

  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 28 + 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      if (loaderBar) loaderBar.style.width = '100%';
      setTimeout(() => {
        if (loaderScreen) loaderScreen.classList.add('hidden');
      }, 350);
    } else if (loaderBar) {
      loaderBar.style.width = `${Math.floor(progress)}%`;
    }
  }, 120);

  // Inicializar escena 3D
  const dojo3D = new window.HikariDojoScene('webgl-container');

  // 2. Sincronizar scroll con la cámara 3D
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    if (dojo3D) {
      dojo3D.updateScrollCamera(fraction);
    }
  });

  // 3. Botones del Dock Inferior 3D y Tarjetas de Emblemas en el Hero
  const camButtons = document.querySelectorAll('.cam-btn[data-cam]');
  const triggerButtons = document.querySelectorAll('[data-cam-trigger]');

  function activateCameraPreset(preset) {
    camButtons.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-cam') === preset);
    });
    triggerButtons.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-cam-trigger') === preset);
    });
    if (dojo3D) {
      dojo3D.setCameraPreset(preset);
    }
  }

  camButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateCameraPreset(btn.getAttribute('data-cam'));
    });
  });

  triggerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateCameraPreset(btn.getAttribute('data-cam-trigger'));
    });
  });

  const kiaiBtn = document.getElementById('btn-kiai');
  if (kiaiBtn) {
    kiaiBtn.addEventListener('click', () => {
      if (dojo3D) dojo3D.triggerKiaiWave();
    });
  }

  // 4. Botón de Ambiente Lumínico Pastel (Cálido Pastel vs Brisa Celeste Pastel)
  const ambianceBtn = document.getElementById('btn-ambiance');
  if (ambianceBtn) {
    ambianceBtn.addEventListener('click', () => {
      if (!dojo3D) return;
      const isCoolPastel = dojo3D.toggleAmbiance();
      ambianceBtn.textContent = isCoolPastel
        ? '🎐 Modo: Brisa Celeste Pastel'
        : '🌅 Modo: Cálido Pastel';
    });
  }

  // 5. Modo Explorar Dojo (muestra dock Vista 3D)
  const exploreBtn = document.getElementById('btn-explore-mode');
  function setExploreMode(active) {
    document.body.classList.toggle('explore-mode', active);
    if (exploreBtn) exploreBtn.textContent = active ? 'Volver' : 'Explorar Dojo';
    if (dojo3D) {
      dojo3D.setCameraPreset(active ? 'orbit' : 'general');
      if (active) {
        dojo3D.scene.background.setHex(0xffffff);
      }
    }
  }

  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      setExploreMode(!document.body.classList.contains('explore-mode'));
    });
  }

  const exitExploreBtn = document.getElementById('btn-exit-explore');
  if (exitExploreBtn) {
    exitExploreBtn.addEventListener('click', () => setExploreMode(false));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('explore-mode')) {
      setExploreMode(false);
    }
  });

  // 5b. Música de fondo (koto / shakuhachi)
  const musicBtn = document.getElementById('btn-music');
  const bgMusic = document.getElementById('bg-music');
  if (musicBtn && bgMusic) {
    bgMusic.volume = 0.35;

    async function toggleMusic() {
      try {
        if (bgMusic.paused) {
          await bgMusic.play();
          musicBtn.classList.add('is-playing');
          musicBtn.setAttribute('aria-pressed', 'true');
        } else {
          bgMusic.pause();
          musicBtn.classList.remove('is-playing');
          musicBtn.setAttribute('aria-pressed', 'false');
        }
      } catch {
        musicBtn.classList.remove('is-playing');
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    }

    musicBtn.addEventListener('click', toggleMusic);
  }

  // 6. Nav activa al scrollear + menú hamburguesa
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const navBurger = document.getElementById('nav-burger');
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setNavOpen(open) {
    document.body.classList.toggle('nav-open', open);
    if (navBurger) {
      navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
      navBurger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
  }

  if (navBurger) {
    navBurger.addEventListener('click', () => {
      setNavOpen(!document.body.classList.contains('nav-open'));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setNavOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) setNavOpen(false);
  });

  function updateNavState() {
    if (navbar) {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    const marker = window.scrollY + window.innerHeight * 0.28;
    let currentId = sections[0]?.id;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  function onScrollUi() {
    updateNavState();
  }

  onScrollUi();
  window.addEventListener('scroll', onScrollUi, { passive: true });

  // 7. Contador para la próxima clase (Martes y Viernes 21:00–22:30)
  const countdownEl = document.getElementById('next-class-countdown');

  function updateClassCountdown() {
    if (!countdownEl) return;
    const now = new Date();
    const day = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const classStartMinutes = 21 * 60;
    const classEndMinutes = 22 * 60 + 30;

    if ((day === 2 || day === 5) && currentMinutes >= classStartMinutes && currentMinutes <= classEndMinutes) {
      countdownEl.textContent = '¡CLASE EN CURSO AHORA MISMO! (21:00 a 22:30 hs)';
      return;
    }

    const targetDays = [2, 5];
    let nextDate = null;

    for (let addDays = 0; addDays <= 7; addDays++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + addDays);
      candidate.setHours(21, 0, 0, 0);

      if (targetDays.includes(candidate.getDay()) && candidate > now) {
        nextDate = candidate;
        break;
      }
    }

    if (!nextDate) return;

    const diffMs = nextDate - now;
    const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diffMs / (1000 * 60)) % 60);
    const s = Math.floor((diffMs / 1000) % 60);
    const dayLabel = nextDate.getDay() === 2 ? 'Martes' : 'Viernes';
    const dText = d > 0 ? `${d}d ` : '';
    countdownEl.textContent = `${dayLabel} 21:00 hs — Faltan ${dText}${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  updateClassCountdown();
  setInterval(updateClassCountdown, 1000);

  // 8. Formulario de reserva / consulta vía WhatsApp
  const form = document.getElementById('trial-class-form');
  const feedbackEl = document.getElementById('form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('input-nombre').value.trim() || 'Practicante';
      const dia = document.getElementById('input-dia').value;
      const nivel = document.getElementById('input-nivel').value;

      if (dojo3D) {
        dojo3D.triggerKiaiWave();
      }

      const mensaje = `Hola Sensei Gustavo Talavera! Mi nombre es ${nombre}. Quisiera consultar/reservar una clase en Karate Do - Shorin Ryu Shinshukan - Hikari Dojo para los días ${dia} (21:00 a 22:30 hs). Nivel: ${nivel}.`;
      const whatsappUrl = `https://wa.me/5491122636846?text=${encodeURIComponent(mensaje)}`;

      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = `
          <strong>¡Rei, ${nombre}! 🥋</strong> Redirigiendo al WhatsApp del <strong>Sensei Gustavo Talavera (+54 9 11 2263-6846)</strong> para coordinar tu clase del <strong>${dia} (21:00 a 22:30 hs)</strong>...
        `;
      }

      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener');
      }, 900);
    });
  }

  // 8. Filtros de Galería + scroll horizontal con drag + Lightbox
  const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
  const galleryCards = document.querySelectorAll('.event-photo-card[data-category]');
  const galleryTrack = document.getElementById('events-gallery-grid');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filterValue = chip.getAttribute('data-filter');

      galleryCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const show = filterValue === 'todos' || category === filterValue;
        card.classList.toggle('hidden-card', !show);
      });
    });
  });

  if (galleryTrack) {
    let isDragging = false;
    let didDrag = false;
    let startX = 0;
    let scrollStart = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumId = 0;

    const stopMomentum = () => {
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = 0;
      }
    };

    const runMomentum = () => {
      stopMomentum();
      const step = () => {
        if (Math.abs(velocity) < 0.15) {
          velocity = 0;
          momentumId = 0;
          return;
        }
        galleryTrack.scrollLeft -= velocity;
        velocity *= 0.94;
        momentumId = requestAnimationFrame(step);
      };
      momentumId = requestAnimationFrame(step);
    };

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      stopMomentum();
      isDragging = true;
      didDrag = false;
      startX = lastX = e.clientX;
      lastTime = performance.now();
      scrollStart = galleryTrack.scrollLeft;
      velocity = 0;
      galleryTrack.classList.add('is-dragging');
      galleryTrack.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dx = e.clientX - startX;
      const frameDx = e.clientX - lastX;
      const dt = Math.max(now - lastTime, 1);
      if (Math.abs(dx) > 4) didDrag = true;
      galleryTrack.scrollLeft = scrollStart - dx;
      velocity = (frameDx / dt) * 16;
      lastX = e.clientX;
      lastTime = now;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      galleryTrack.classList.remove('is-dragging');
      try {
        galleryTrack.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      if (didDrag) runMomentum();
    };

    galleryTrack.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    galleryTrack.addEventListener(
      'click',
      (e) => {
        if (didDrag) {
          e.preventDefault();
          e.stopPropagation();
          didDrag = false;
        }
      },
      true
    );
  }

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  function openLightbox(src, title, desc) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || 'Foto del Dojo';
    if (lightboxTitle) lightboxTitle.textContent = title || '';
    if (lightboxDesc) lightboxDesc.textContent = desc || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.event-img-box[data-lightbox-src]').forEach((box) => {
    box.addEventListener('click', () => {
      openLightbox(
        box.getAttribute('data-lightbox-src'),
        box.getAttribute('data-lightbox-title'),
        box.getAttribute('data-lightbox-desc')
      );
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

});
