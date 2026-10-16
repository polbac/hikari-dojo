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

  // 5. Modo Explorar Dojo 3D (Oculta tarjetas para vista limpia 360°)
  const exploreBtn = document.getElementById('btn-explore-mode');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('explore-mode');
      exploreBtn.innerHTML = active
        ? '<span>✕</span> Volver a la Interfaz'
        : '<span>🏯</span> Explorar Dojo 3D';
      if (active && dojo3D) {
        dojo3D.setCameraPreset('orbit');
      } else if (dojo3D) {
        dojo3D.setCameraPreset('general');
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('explore-mode')) {
      document.body.classList.remove('explore-mode');
      if (exploreBtn) exploreBtn.innerHTML = '<span>🏯</span> Explorar Dojo 3D';
      if (dojo3D) dojo3D.setCameraPreset('general');
    }
  });

  // 6. Contador en Tiempo Real para la Próxima Clase (Martes y Viernes 21:00 a 22:30 hs)
  const countdownEl = document.getElementById('next-class-countdown');
  const statusPillEl = document.getElementById('live-class-status');

  function updateClassCountdown() {
    if (!countdownEl) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Dom, 2 = Mar, 5 = Vie
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const classStartMinutes = 21 * 60;      // 21:00 hs
    const classEndMinutes = 22 * 60 + 30;   // 22:30 hs

    if ((day === 2 || day === 5) && currentMinutes >= classStartMinutes && currentMinutes <= classEndMinutes) {
      countdownEl.textContent = '¡CLASE EN CURSO AHORA MISMO! (21:00 a 22:30 hs)';
      if (statusPillEl) {
        statusPillEl.innerHTML = '<span class="live-dot"></span> En el Tatami ahora (21:00 - 22:30 hs)';
      }
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

  // 7. Formulario de Reserva de Clase de Prueba / Consulta vía WhatsApp (Sensei Gustavo Talavera)
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

  // 8. Filtros de Galería de Fotos & Eventos + Visor Lightbox
  const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
  const galleryCards = document.querySelectorAll('.event-photo-card[data-category]');

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
