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
    if (exploreBtn) {
      exploreBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      exploreBtn.title = active ? 'Salir del modo 3D' : 'Explorar el Dojo en 3D';
      exploreBtn.setAttribute(
        'aria-label',
        active ? 'Salir del modo 3D' : 'Explorar el Dojo en 3D'
      );
    }
    if (dojo3D) {
      dojo3D.setCameraPreset(active ? 'orbit' : 'general');
      if (active) {
        dojo3D.scene.background.setHex(0xfaf6ee);
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

  // 8. Galería infinita (auto RTL + pausa hover + drag con inercia) + filtros + Lightbox
  const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
  const galleryViewport = document.getElementById('events-gallery-grid');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  function initGalleryMarquee(viewport) {
    let track = viewport.querySelector('.events-gallery-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'events-gallery-track';
      while (viewport.firstChild) track.appendChild(viewport.firstChild);
      viewport.appendChild(track);
    }

    const originals = Array.from(
      track.querySelectorAll('.event-photo-card[data-category]:not([data-marquee-clone])')
    );

    let offset = 0;
    let loopWidth = 0;
    let velocity = 0;
    let isStatic = false;
    let hovering = false;
    let isDragging = false;
    let pendingDrag = false;
    let didDrag = false;
    let startX = 0;
    let startY = 0;
    let offsetStart = 0;
    let lastX = 0;
    let lastTime = 0;
    let activePointerId = null;
    let rafId = 0;
    let lastTick = 0;

    const AUTO_SPEED = 0.55; // px por frame (~60fps) → derecha a izquierda
    const DRAG_THRESHOLD = 6;

    const getVisible = () =>
      originals.filter((c) => !c.classList.contains('hidden-card'));

    const getGap = () => {
      const styles = getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 0;
    };

    const measureContentWidth = (visible) => {
      if (!visible.length) return 0;
      const gap = getGap();
      return visible.reduce((sum, card, i) => {
        return sum + card.offsetWidth + (i < visible.length - 1 ? gap : 0);
      }, 0);
    };

    const applyTransform = () => {
      if (isStatic) {
        track.style.transform = '';
        return;
      }
      if (loopWidth > 0) {
        offset = ((offset % loopWidth) + loopWidth) % loopWidth;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const measureLoop = () => {
      const visible = getVisible();
      if (!visible.length || isStatic) {
        loopWidth = 0;
        return;
      }
      const gap = getGap();
      const first = visible[0];
      const last = visible[visible.length - 1];
      loopWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
      applyTransform();
    };

    const appendCloneSet = (visible) => {
      visible.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute('data-marquee-clone', 'true');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        track.appendChild(clone);
      });
    };

    const setStaticMode = (staticMode) => {
      isStatic = staticMode;
      viewport.classList.toggle('is-static', staticMode);
      if (staticMode) {
        offset = 0;
        velocity = 0;
        loopWidth = 0;
        track.style.transform = '';
        viewport.classList.remove('is-dragging');
        isDragging = false;
      }
    };

    const rebuild = () => {
      track.querySelectorAll('[data-marquee-clone]').forEach((el) => el.remove());
      const visible = getVisible();
      if (!visible.length) {
        setStaticMode(true);
        return;
      }

      // Medir solo originales visibles (sin clones)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const contentWidth = measureContentWidth(visible);
          const viewportW = viewport.clientWidth;

          if (contentWidth <= viewportW) {
            setStaticMode(true);
            return;
          }

          setStaticMode(false);
          appendCloneSet(visible);
          measureLoop();

          let guard = 0;
          while (loopWidth > 0 && track.scrollWidth < viewportW * 2 + loopWidth && guard < 6) {
            appendCloneSet(visible);
            measureLoop();
            guard += 1;
          }
        });
      });
    };

    const tick = (now) => {
      const dt = lastTick ? Math.min(now - lastTick, 48) : 16.67;
      lastTick = now;
      const frameScale = dt / 16.67;

      if (!isStatic && !isDragging && loopWidth > 0) {
        if (Math.abs(velocity) > 0.05) {
          offset += -velocity * frameScale;
          velocity *= Math.pow(0.94, frameScale);
          if (Math.abs(velocity) < 0.05) velocity = 0;
          applyTransform();
        } else if (!hovering && !reduceMotion) {
          offset += AUTO_SPEED * frameScale;
          applyTransform();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const endPointerGesture = (e) => {
      if (!pendingDrag && !isDragging) return;
      pendingDrag = false;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      try {
        if (activePointerId != null) {
          viewport.releasePointerCapture?.(activePointerId);
        }
      } catch {
        /* ignore */
      }
      activePointerId = null;
      if (!didDrag) velocity = 0;
      // Liberar didDrag en el próximo tick para no tapar el click
      if (didDrag) {
        requestAnimationFrame(() => {
          didDrag = false;
        });
      }
    };

    const onPointerDown = (e) => {
      if (isStatic) return;
      if (e.button != null && e.button !== 0) return;
      // No iniciar drag sobre controles interactivos (Ver foto, etc.)
      if (e.target.closest('button, a, input, select, textarea')) return;

      pendingDrag = true;
      isDragging = false;
      didDrag = false;
      velocity = 0;
      startX = lastX = e.clientX;
      startY = e.clientY;
      offsetStart = offset;
      lastTime = performance.now();
      activePointerId = e.pointerId;
    };

    const onPointerMove = (e) => {
      if (isStatic || (!pendingDrag && !isDragging)) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        isDragging = true;
        didDrag = true;
        pendingDrag = false;
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture?.(activePointerId ?? e.pointerId);
      }

      const now = performance.now();
      const frameDx = e.clientX - lastX;
      const dt = Math.max(now - lastTime, 1);
      offset = offsetStart - dx;
      velocity = (frameDx / dt) * 16;
      lastX = e.clientX;
      lastTime = now;
      applyTransform();
    };

    const onPointerUp = (e) => endPointerGesture(e);

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('pointerenter', () => {
      hovering = true;
    });
    viewport.addEventListener('pointerleave', () => {
      hovering = false;
      if (pendingDrag || isDragging) endPointerGesture();
    });

    const findLightboxBox = (e) => {
      const direct = e.target.closest?.('.event-img-box[data-lightbox-src]');
      if (direct && viewport.contains(direct)) return direct;
      const hit = document.elementsFromPoint(e.clientX, e.clientY);
      return (
        hit.find(
          (el) =>
            el instanceof Element &&
            el.matches('.event-img-box[data-lightbox-src]') &&
            viewport.contains(el)
        ) || null
      );
    };

    viewport.addEventListener(
      'click',
      (e) => {
        if (didDrag) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const box = findLightboxBox(e);
        if (!box) return;
        e.preventDefault();
        const img = box.querySelector('img');
        openLightbox(
          img?.currentSrc || img?.src || box.getAttribute('data-lightbox-src'),
          box.getAttribute('data-lightbox-title'),
          box.getAttribute('data-lightbox-desc')
        );
      },
      true
    );

    window.addEventListener('resize', () => {
      rebuild();
    });

    rebuild();
    rafId = requestAnimationFrame(tick);

    return {
      applyFilter(filterValue) {
        originals.forEach((card) => {
          const category = card.getAttribute('data-category');
          const show = filterValue === 'todos' || category === filterValue;
          card.classList.toggle('hidden-card', !show);
        });
        offset = 0;
        velocity = 0;
        rebuild();
      },
      destroy() {
        cancelAnimationFrame(rafId);
      },
    };
  }

  const galleryMarquee = galleryViewport ? initGalleryMarquee(galleryViewport) : null;

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filterValue = chip.getAttribute('data-filter');
      if (galleryMarquee) {
        galleryMarquee.applyFilter(filterValue);
      } else {
        document.querySelectorAll('.event-photo-card[data-category]').forEach((card) => {
          const category = card.getAttribute('data-category');
          const show = filterValue === 'todos' || category === filterValue;
          card.classList.toggle('hidden-card', !show);
        });
      }
    });
  });

});
