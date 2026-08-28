/* ==========================================================================
   POWERZONE - INTERACTIVIDAD PRINCIPAL (JAVASCRIPT)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification Helper
  function showToast(message, icon = 'fa-solid fa-check-circle') {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 2. Score Donut Meter & Calculator Logic
  const scoreDonut = document.querySelector('.radial-meter');
  const scoreValDisplay = document.querySelector('.radial-score-val');
  
  function updateScore(score) {
    if (!scoreDonut) return;
    const maxDash = 314;
    const offset = maxDash - (maxDash * (score / 100));
    scoreDonut.style.strokeDashoffset = offset;
    if (scoreValDisplay) {
      scoreValDisplay.textContent = score;
    }
  }

  // Initialize Score
  updateScore(87);

  // Score Calculator Modal
  const openCalcBtn = document.getElementById('btn-open-calc');
  const calcModal = document.getElementById('score-calc-modal');
  const closeCalcBtn = document.getElementById('btn-close-calc');
  const applyCalcBtn = document.getElementById('btn-apply-calc');

  if (openCalcBtn && calcModal) {
    openCalcBtn.addEventListener('click', () => {
      calcModal.classList.add('active');
    });

    closeCalcBtn.addEventListener('click', () => {
      calcModal.classList.remove('active');
    });

    calcModal.addEventListener('click', (e) => {
      if (e.target === calcModal) {
        calcModal.classList.remove('active');
      }
    });

    // Modal input sliders
    const sliderFuerza = document.getElementById('calc-fuerza');
    const sliderResistencia = document.getElementById('calc-resistencia');
    const sliderMovilidad = document.getElementById('calc-movilidad');
    const sliderPotencia = document.getElementById('calc-potencia');
    const sliderRecup = document.getElementById('calc-recuperacion');

    function calculateLiveScore() {
      const f = parseInt(sliderFuerza.value, 10) || 85;
      const r = parseInt(sliderResistencia.value, 10) || 80;
      const m = parseInt(sliderMovilidad.value, 10) || 75;
      const p = parseInt(sliderPotencia.value, 10) || 90;
      const rc = parseInt(sliderRecup.value, 10) || 85;

      document.getElementById('val-fuerza').textContent = f;
      document.getElementById('val-resistencia').textContent = r;
      document.getElementById('val-movilidad').textContent = m;
      document.getElementById('val-potencia').textContent = p;
      document.getElementById('val-recuperacion').textContent = rc;

      const avg = Math.round((f + r + m + p + rc) / 5);
      return { avg, f, r, m, p, rc };
    }

    [sliderFuerza, sliderResistencia, sliderMovilidad, sliderPotencia, sliderRecup].forEach(slider => {
      if (slider) {
        slider.addEventListener('input', calculateLiveScore);
      }
    });

    if (applyCalcBtn) {
      applyCalcBtn.addEventListener('click', () => {
        const res = calculateLiveScore();
        updateScore(res.avg);
        
        // Update stats breakdown list
        const statF = document.getElementById('stat-fuerza-val');
        const statR = document.getElementById('stat-resistencia-val');
        const statM = document.getElementById('stat-movilidad-val');
        const statP = document.getElementById('stat-potencia-val');
        const statRc = document.getElementById('stat-recuperacion-val');

        if (statF) statF.textContent = res.f;
        if (statR) statR.textContent = res.r;
        if (statM) statM.textContent = res.m;
        if (statP) statP.textContent = res.p;
        if (statRc) statRc.textContent = res.rc;

        calcModal.classList.remove('active');
        showToast(`Powerzone Score actualizado: ${res.avg} PTS`);
      });
    }
  }

  // 3. Program Builder: Day Tabs & Filter Pills
  const dayCards = document.querySelectorAll('.day-card');
  dayCards.forEach(card => {
    card.addEventListener('click', () => {
      dayCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const day = card.getAttribute('data-day');
      const focus = card.querySelector('.day-focus')?.textContent || '';
      showToast(`Día seleccionado: ${day} - Enfoque ${focus}`);
    });
  });

  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      const progressFill = document.querySelector('.prog-bar-fill');
      const progressPercent = document.querySelector('.prog-percent');
      
      const activeCount = document.querySelectorAll('.filter-pill.active').length;
      let newPct = 70 + (activeCount * 5);
      if (newPct > 98) newPct = 98;
      
      if (progressFill && progressPercent) {
        progressFill.style.width = `${newPct}%`;
        progressPercent.textContent = `${newPct}%`;
      }
    });
  });

  // 4. Before / After Interactive Image Slider
  const sliderBox = document.querySelector('.transform-slider-box');
  const sliderHandle = document.querySelector('.transform-handle');
  const imgAfter = document.querySelector('.transform-slider-box .img-after');

  if (sliderBox && sliderHandle) {
    let isDragging = false;

    function setSliderPos(x) {
      const rect = sliderBox.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0.05) pos = 0.05;
      if (pos > 0.95) pos = 0.95;
      const percentage = pos * 100;
      sliderHandle.style.left = `${percentage}%`;
      if (imgAfter) {
        imgAfter.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
      }
    }

    sliderBox.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    sliderBox.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // 5. Class Schedule Filter Tabs
  const scheduleTabs = document.querySelectorAll('.schedule-tabs .tab-btn');
  const schedSlots = document.querySelectorAll('.sched-cell.slot-data');

  scheduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      scheduleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-filter');

      schedSlots.forEach(slot => {
        const slotType = slot.getAttribute('data-type');
        if (category === 'all' || slotType === category) {
          slot.classList.add('active-slot');
          slot.style.opacity = '1';
        } else {
          slot.classList.remove('active-slot');
          slot.style.opacity = '0.35';
        }
      });
    });
  });

  // 6. Coaches Carousel Navigation
  const coachTrack = document.querySelector('.coaches-carousel');
  const btnPrevCoach = document.getElementById('coach-prev');
  const btnNextCoach = document.getElementById('coach-next');

  if (coachTrack && btnPrevCoach && btnNextCoach) {
    let coachIndex = 0;
    const maxCoaches = 3;

    btnNextCoach.addEventListener('click', () => {
      coachIndex = (coachIndex + 1) % maxCoaches;
      coachTrack.style.transform = `translateX(-${coachIndex * 10}px)`;
      showToast('Navegando entrenadores');
    });

    btnPrevCoach.addEventListener('click', () => {
      coachIndex = (coachIndex - 1 + maxCoaches) % maxCoaches;
      coachTrack.style.transform = `translateX(-${coachIndex * 10}px)`;
      showToast('Navegando entrenadores');
    });
  }

  // 7. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        const b = i.querySelector('.faq-body');
        if (b) b.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // 8. Gym Hotspots Interactions
  const hotspots = document.querySelectorAll('.gym-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const zone = spot.getAttribute('data-zone') || 'Zona de entrenamiento';
      showToast(`Explorando: ${zone}`);
    });
  });

  // 9. Newsletter Subscription
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsForm.querySelector('.newsletter-input');
      if (input && input.value.trim()) {
        showToast(`¡Gracias! ${input.value} ha sido registrado.`);
        input.value = '';
      }
    });
  }

  // 10. General CTA Booking buttons
  const bookingBtns = document.querySelectorAll('.btn-booking');
  bookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('¡Reserva iniciada! Elige tu horario preferido.');
    });
  });

  // 11. Plan Selection buttons
  const planBtns = document.querySelectorAll('.btn-select-plan');
  planBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planName = btn.closest('.plan-card')?.querySelector('.plan-tag')?.textContent || 'Plan';
      showToast(`¡Has seleccionado ${planName}! Redirigiendo a registro...`);
    });
  });
});
