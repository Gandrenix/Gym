/* ==========================================================================
   POWERZONE - ADVANCED CYBER-ATHLETIC LOGIC & INTERACTIONS (JAVASCRIPT)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (CYBER AUDIO FX ENGINE)
  // ========================================================================
  let audioCtx = null;
  let isAudioEnabled = false;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playCyberTone(type = 'click') {
    if (!isAudioEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'hover') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'pulse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  // Audio Toggle Button
  const audioBtn = document.getElementById('btn-audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      initAudioContext();
      isAudioEnabled = !isAudioEnabled;
      audioBtn.classList.toggle('active', isAudioEnabled);
      if (isAudioEnabled) {
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        showToast('Efectos de sonido: ACTIVADOS ⚡', 'fa-solid fa-volume-high');
        playCyberTone('success');
      } else {
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        showToast('Efectos de sonido: SILENCIADOS', 'fa-solid fa-volume-xmark');
      }
    });
  }

  // Attach hover sounds to interactive elements
  const interactiveBtns = document.querySelectorAll('.btn, .nav-link, .goal-card-3d, .split-tab-btn, .tab-btn');
  interactiveBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => playCyberTone('hover'));
    btn.addEventListener('click', () => playCyberTone('click'));
  });

  // ========================================================================
  // 2. TOAST NOTIFICATION HELPER
  // ========================================================================
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
    }, 3800);
  }

  // ========================================================================
  // 3. TOP SCROLL READING PROGRESS INDICATOR
  // ========================================================================
  const scrollProgressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }
  });

  // ========================================================================
  // 4. 3D CARD TILT & SPECULAR HOVER PHYSICS
  // ========================================================================
  const tiltCards = document.querySelectorAll('.goal-card-3d, .hud-card, .plan-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });

  // ========================================================================
  // 5. HERO HUD: ECG ZONE SWITCHER (100% SPANISH)
  // ========================================================================
  const zoneBtns = document.querySelectorAll('.zone-switch-btn');
  const liveBpmText = document.getElementById('hud-live-bpm');
  const zoneNamePill = document.getElementById('hud-zone-name');

  const zoneConfigs = {
    rest: { bpm: 68, label: 'ZONA 1 • REPOSO', pillClass: 'zone-pill zone-rest' },
    fatburn: { bpm: 142, label: 'ZONA 4 • QUEMA DE GRASA', pillClass: 'zone-pill zone-fatburn' },
    peak: { bpm: 178, label: 'ZONA 5 • MÁXIMA POTENCIA', pillClass: 'zone-pill zone-peak' }
  };

  zoneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      zoneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const zone = btn.getAttribute('data-zone');
      const conf = zoneConfigs[zone];

      if (conf) {
        if (liveBpmText) liveBpmText.textContent = conf.bpm;
        if (zoneNamePill) {
          zoneNamePill.textContent = conf.label;
          zoneNamePill.className = conf.pillClass;
        }
      }

      if (window.powerzoneECG && window.powerzoneECG.setZone) {
        window.powerzoneECG.setZone(zone);
        playCyberTone('pulse');
      }
    });
  });

  // ========================================================================
  // 6. INTERACTIVE ANATOMY & ROUTINE BUILDER (WITH FOREARMS & HANDS)
  // ========================================================================
  const routineData = {
    push: {
      musclesActive: ['muscle-shoulders', 'muscle-chest', 'muscle-arms', 'muscle-traps'],
      exercises: [
        { name: 'Press Inclinado con Mancuernas', note: 'Enfoque clavicular & fuerza', meta: '4 SERIES × 8-10 REPS' },
        { name: 'Press Militar con Barra Olímpica', note: 'Deltoides anterior y lateral', meta: '4 SERIES × 6-8 REPS' },
        { name: 'Fondos en Paralelas Lastrados', note: 'Pectoral inferior y tríceps', meta: '3 SERIES × 10-12 REPS' },
        { name: 'Elevaciones Laterales en Polea', note: 'Tensión constante deltoides', meta: '3 SERIES × 15 REPS' }
      ]
    },
    legs: {
      musclesActive: ['muscle-quads', 'muscle-calves', 'muscle-glutes'],
      exercises: [
        { name: 'Sentadilla Trasera Profunda', note: 'Fuerza máxima y cuádriceps', meta: '4 SERIES × 6-8 REPS' },
        { name: 'Prensa Inclinada 45°', note: 'Hipertrofia cuádriceps & glúteos', meta: '4 SERIES × 10-12 REPS' },
        { name: 'Peso Muerto Rumano con Barra', note: 'Isquiosurales y cadena posterior', meta: '3 SERIES × 8-10 REPS' },
        { name: 'Elevaciones de Talón de Pie', note: 'Gemelos y sóleo', meta: '4 SERIES × 15-20 REPS' }
      ]
    },
    recovery: {
      musclesActive: ['muscle-back', 'muscle-abs', 'muscle-shoulders', 'muscle-traps', 'muscle-forearms'],
      exercises: [
        { name: 'Descompresión Espinal & Foam Roller', note: 'Recuperación miofascial activa', meta: '15 MINUTOS' },
        { name: 'Protocolo de Movilidad Escapular & Cadera', note: 'Rango articular dinámico', meta: '20 MINUTOS' },
        { name: 'Sauna Infrarrojo & Baño Frío', note: 'Reducción de inflamación', meta: '2 CICLOS' }
      ]
    },
    pull: {
      musclesActive: ['muscle-back', 'muscle-arms', 'muscle-forearms', 'muscle-hands', 'muscle-traps'],
      exercises: [
        { name: 'Dominadas con Lastre Pronas', note: 'Dorsal ancho y bíceps', meta: '4 SERIES × 6-8 REPS' },
        { name: 'Remo con Barra 90°', note: 'Densidad de espalda media', meta: '4 SERIES × 8-10 REPS' },
        { name: 'Jalón al Pecho Agarre Neutro', note: 'Aislamiento dorsal y antebrazos', meta: '3 SERIES × 10-12 REPS' },
        { name: 'Curl Bíceps con Barra Z', note: 'Pico de bíceps & flexores de muñeca', meta: '3 SERIES × 10-12 REPS' }
      ]
    },
    fullbody: {
      musclesActive: ['muscle-chest', 'muscle-back', 'muscle-quads', 'muscle-abs', 'muscle-shoulders', 'muscle-arms', 'muscle-forearms', 'muscle-hands'],
      exercises: [
        { name: 'Hyrox Sled Push & Pull', note: 'Potencia metabólica y agarre', meta: '4 ROUNDS × 50M' },
        { name: 'Kettlebell Clean & Press', note: 'Fuerza neuromuscular híbrida', meta: '4 SERIES × 10 REPS' },
        { name: 'Burpee Box Jump Overs', note: 'Capacidad anaeróbica peak', meta: '3 SERIES × 12 REPS' },
        { name: 'SkiErg Intervalos Máximos', note: 'Sprint metabólico 500m', meta: '3 INTERVALOS' }
      ]
    }
  };

  const splitTabs = document.querySelectorAll('.split-tab-btn');
  const routineListBox = document.getElementById('routine-list-box');
  const allMuscleGroups = document.querySelectorAll('.muscle-group');

  splitTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      splitTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const splitKey = tab.getAttribute('data-split');
      const data = routineData[splitKey];
      if (!data) return;

      allMuscleGroups.forEach(m => m.classList.remove('active'));
      data.musclesActive.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
      });

      if (routineListBox) {
        routineListBox.innerHTML = data.exercises.map(ex => `
          <div class="exercise-item">
            <div>
              <div class="exercise-name">${ex.name}</div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">${ex.note}</div>
            </div>
            <div class="exercise-meta">${ex.meta}</div>
          </div>
        `).join('');
      }

      playCyberTone('click');
      showToast(`Rutina actualizada: ${tab.textContent}`);
    });
  });

  // ========================================================================
  // 7. COMPREHENSIVE ATHLETIC MACRO & CALORIE CALCULATOR
  // ========================================================================
  const inputSex = document.getElementById('calc-sex');
  const inputAge = document.getElementById('calc-age');
  const inputWeight = document.getElementById('calc-weight');
  const inputHeight = document.getElementById('calc-height');
  const inputActivity = document.getElementById('calc-activity');
  const inputGoal = document.getElementById('calc-target-goal');

  const resTdee = document.getElementById('res-tdee-val');
  const resProtein = document.getElementById('res-protein-val');
  const resCarbs = document.getElementById('res-carbs-val');
  const resWater = document.getElementById('res-water-val');

  function calculateMacros() {
    const sex = inputSex?.value || 'male';
    const age = parseFloat(inputAge?.value) || 26;
    const weight = parseFloat(inputWeight?.value) || 78;
    const height = parseFloat(inputHeight?.value) || 178;
    const activity = parseFloat(inputActivity?.value) || 1.55;
    const goal = inputGoal?.value || 'deficit';

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (sex === 'male') ? 5 : -161;

    let tdee = bmr * activity;

    let targetCalories = tdee;
    if (goal === 'deficit') {
      targetCalories = tdee - 400;
    } else if (goal === 'surplus') {
      targetCalories = tdee + 350;
    }

    targetCalories = Math.round(targetCalories);

    const proteinGrams = Math.round(weight * 2.2);
    const proteinKcal = proteinGrams * 4;

    const fatGrams = Math.round(weight * 0.9);
    const fatKcal = fatGrams * 9;

    let remainingKcal = targetCalories - (proteinKcal + fatKcal);
    if (remainingKcal < 200) remainingKcal = 200;
    const carbsGrams = Math.round(remainingKcal / 4);

    const waterLitres = ((weight * 40) / 1000).toFixed(1);

    if (resTdee) resTdee.textContent = targetCalories.toLocaleString() + ' kcal';
    if (resProtein) resProtein.textContent = proteinGrams + ' g';
    if (resCarbs) resCarbs.textContent = carbsGrams + ' g';
    if (resWater) resWater.textContent = waterLitres + ' L';
  }

  [inputSex, inputAge, inputWeight, inputHeight, inputActivity, inputGoal].forEach(input => {
    if (input) {
      input.addEventListener('input', calculateMacros);
      input.addEventListener('change', calculateMacros);
    }
  });

  calculateMacros();

  // ========================================================================
  // 8. RADIAL SCORE DONUT & DIAGNOSTIC ASSESSMENT ENGINE
  // ========================================================================
  const scoreDonut = document.querySelector('.radial-meter');
  const scoreValDisplay = document.querySelector('.radial-score-val');

  function updateScore(score) {
    if (!scoreDonut) return;
    const maxDash = 376.99;
    const offset = maxDash - (maxDash * (score / 100));
    scoreDonut.style.strokeDashoffset = offset;
    if (scoreValDisplay) {
      scoreValDisplay.textContent = score;
    }
  }

  updateScore(87);

  // Diagnostic Modal Test
  const openCalcBtn = document.getElementById('btn-open-calc');
  const calcModal = document.getElementById('score-calc-modal');
  const closeCalcBtn = document.getElementById('btn-close-calc');
  const applyCalcBtn = document.getElementById('btn-apply-calc');
  const diagForm = document.getElementById('diagnostic-test-form');

  const diagPreviewScore = document.getElementById('diag-preview-score');
  const diagPreviewStatus = document.getElementById('diag-preview-status');

  function calculateDiagnosticScore() {
    const expVal = parseInt(document.querySelector('input[name="diag-exp"]:checked')?.value || 85, 10);
    const fuerzaVal = parseInt(document.querySelector('input[name="diag-fuerza"]:checked')?.value || 88, 10);
    const cardioVal = parseInt(document.querySelector('input[name="diag-cardio"]:checked')?.value || 82, 10);
    const movVal = parseInt(document.querySelector('input[name="diag-mov"]:checked')?.value || 84, 10);

    const potenciaCalculada = Math.round((fuerzaVal * 0.6) + (cardioVal * 0.4));
    const totalScore = Math.round((expVal * 0.15) + (fuerzaVal * 0.35) + (cardioVal * 0.30) + (movVal * 0.20));

    let statusText = 'Nivel Intermedio-Alto • Potencial Pro';
    if (totalScore >= 92) {
      statusText = 'Nivel Élite Hyrox • Rendimiento Sobresaliente';
    } else if (totalScore >= 80) {
      statusText = 'Nivel Avanzado • Excelente Fuerza & Capacidad';
    } else if (totalScore < 70) {
      statusText = 'Nivel Inicial • Alto Margen de Transformación';
    }

    if (diagPreviewScore) diagPreviewScore.textContent = `${totalScore} PTS`;
    if (diagPreviewStatus) diagPreviewStatus.textContent = statusText;

    return {
      total: totalScore,
      fuerza: fuerzaVal,
      cardio: cardioVal,
      movilidad: movVal,
      potencia: potenciaCalculada
    };
  }

  if (diagForm) {
    diagForm.addEventListener('change', calculateDiagnosticScore);
  }

  if (openCalcBtn && calcModal) {
    openCalcBtn.addEventListener('click', () => {
      calculateDiagnosticScore();
      calcModal.classList.add('active');
      playCyberTone('click');
    });

    closeCalcBtn.addEventListener('click', () => {
      calcModal.classList.remove('active');
    });

    calcModal.addEventListener('click', (e) => {
      if (e.target === calcModal) calcModal.classList.remove('active');
    });

    if (applyCalcBtn) {
      applyCalcBtn.addEventListener('click', () => {
        const res = calculateDiagnosticScore();
        updateScore(res.total);

        const sf = document.getElementById('stat-fuerza-val');
        const sc = document.getElementById('stat-resistencia-val');
        const sm = document.getElementById('stat-movilidad-val');
        const sp = document.getElementById('stat-potencia-val');

        if (sf) sf.textContent = `${res.fuerza} PTS`;
        if (sc) sc.textContent = `${res.cardio} PTS`;
        if (sm) sm.textContent = `${res.movilidad} PTS`;
        if (sp) sp.textContent = `${res.potencia} PTS`;

        calcModal.classList.remove('active');
        playCyberTone('success');
        showToast(`¡Diagnóstico completado! Powerzone Score: ${res.total} PTS ⚡`);
      });
    }
  }

  // ========================================================================
  // 9. DYNAMIC TESTIMONIALS CAROUSEL (3 VERIFIED ATHLETES)
  // ========================================================================
  const testSlides = document.querySelectorAll('.testimonial-slide');
  const testDots = document.querySelectorAll('.testimonials-dots .dot');
  const testPrevBtn = document.getElementById('test-prev-btn');
  const testNextBtn = document.getElementById('test-next-btn');

  let currentTestIndex = 0;
  let testInterval = null;

  function showTestimonial(index) {
    currentTestIndex = (index + testSlides.length) % testSlides.length;

    testSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentTestIndex);
    });

    testDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentTestIndex);
    });
  }

  if (testNextBtn && testPrevBtn && testSlides.length > 0) {
    testNextBtn.addEventListener('click', () => {
      showTestimonial(currentTestIndex + 1);
      playCyberTone('click');
      resetTestTimer();
    });

    testPrevBtn.addEventListener('click', () => {
      showTestimonial(currentTestIndex - 1);
      playCyberTone('click');
      resetTestTimer();
    });

    testDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        showTestimonial(idx);
        playCyberTone('click');
        resetTestTimer();
      });
    });

    function startTestTimer() {
      testInterval = setInterval(() => {
        showTestimonial(currentTestIndex + 1);
      }, 5500);
    }

    function resetTestTimer() {
      clearInterval(testInterval);
      startTestTimer();
    }

    startTestTimer();

    const testCard = document.querySelector('.testimonials-carousel-card');
    if (testCard) {
      testCard.addEventListener('mouseenter', () => clearInterval(testInterval));
      testCard.addEventListener('mouseleave', () => resetTestTimer());
    }
  }

  // ========================================================================
  // 10. BEFORE / AFTER INTERACTIVE IMAGE SLIDER (SMOOTH CLIP-PATH REVEAL)
  // ========================================================================
  const sliderBox = document.getElementById('transform-slider');
  const sliderHandle = document.getElementById('transform-handle');
  const sliderAfterLayer = document.getElementById('transform-after');

  if (sliderBox && sliderHandle && sliderAfterLayer) {
    let isDragging = false;

    function setSliderPos(x) {
      const rect = sliderBox.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0.02) pos = 0.02;
      if (pos > 0.98) pos = 0.98;
      const percentage = pos * 100;
      sliderHandle.style.left = `${percentage}%`;
      sliderAfterLayer.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }

    sliderBox.addEventListener('mousedown', (e) => {
      isDragging = true;
      sliderBox.classList.add('dragging');
      setSliderPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      sliderBox.classList.remove('dragging');
    });

    sliderBox.addEventListener('touchstart', (e) => {
      isDragging = true;
      sliderBox.classList.add('dragging');
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
      sliderBox.classList.remove('dragging');
    });
  }

  // ========================================================================
  // 11. CLASS SCHEDULE FILTER TABS
  // ========================================================================
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
          slot.style.opacity = '0.3';
        }
      });
    });
  });

  // ========================================================================
  // 12. COACHES CAROUSEL NAVIGATION
  // ========================================================================
  const coachTrack = document.querySelector('.coaches-carousel');
  const btnPrevCoach = document.getElementById('coach-prev');
  const btnNextCoach = document.getElementById('coach-next');

  if (coachTrack && btnPrevCoach && btnNextCoach) {
    let coachIndex = 0;
    const maxCoaches = 3;

    btnNextCoach.addEventListener('click', () => {
      coachIndex = (coachIndex + 1) % maxCoaches;
      coachTrack.style.transform = `translateX(-${coachIndex * 100}%)`;
      playCyberTone('click');
    });

    btnPrevCoach.addEventListener('click', () => {
      coachIndex = (coachIndex - 1 + maxCoaches) % maxCoaches;
      coachTrack.style.transform = `translateX(-${coachIndex * 100}%)`;
      playCyberTone('click');
    });
  }

  // ========================================================================
  // 13. BILLING TOGGLE SWITCH (MONTHLY / ANNUAL -25% OFF)
  // ========================================================================
  const billingSwitch = document.getElementById('billing-toggle-switch');
  const monthlyLabel = document.getElementById('billing-monthly-label');
  const annualLabel = document.getElementById('billing-annual-label');

  const priceBasic = document.getElementById('price-basic');
  const pricePrem = document.getElementById('price-premium');
  const pricePro = document.getElementById('price-pro');

  let isAnnual = false;
  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      isAnnual = !isAnnual;
      billingSwitch.classList.toggle('annual', isAnnual);
      monthlyLabel.classList.toggle('active', !isAnnual);
      annualLabel.classList.toggle('active', isAnnual);

      if (isAnnual) {
        priceBasic.textContent = '$22';
        pricePrem.textContent = '$37';
        pricePro.textContent = '$59';
        showToast('Descuento anual del -25% aplicado 🔥');
      } else {
        priceBasic.textContent = '$29';
        pricePrem.textContent = '$49';
        pricePro.textContent = '$79';
      }
      playCyberTone('success');
    });
  }

  // ========================================================================
  // 14. FAQ ACCORDION & SMART SEARCH
  // ========================================================================
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
      playCyberTone('click');
    });
  });

  const faqSearch = document.getElementById('faq-search');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      const query = faqSearch.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // ========================================================================
  // 15. DIGITAL TICKET BOOKING MODAL
  // ========================================================================
  const bookingModal = document.getElementById('booking-modal');
  const closeBookingBtn = document.getElementById('btn-close-booking');
  const confirmTicketBtn = document.getElementById('btn-confirm-ticket');
  const bookingTriggers = document.querySelectorAll('.btn-booking');

  bookingTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (bookingModal) {
        bookingModal.classList.add('active');
        playCyberTone('success');
      }
    });
  });

  if (closeBookingBtn && bookingModal) {
    closeBookingBtn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
    });
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) bookingModal.classList.remove('active');
    });
  }

  if (confirmTicketBtn && bookingModal) {
    confirmTicketBtn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
      playCyberTone('success');
      showToast('¡Pase VIP guardado con éxito! Te esperamos en la sede.', 'fa-solid fa-qrcode');
    });
  }

  // Plan select buttons
  const planSelectBtns = document.querySelectorAll('.btn-select-plan');
  planSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.closest('.plan-card')?.querySelector('.plan-tag')?.textContent || 'Membresía';
      playCyberTone('success');
      showToast(`¡Plan ${planName} seleccionado! Preparando registro seguro...`);
    });
  });

  // Goal Cards selection
  const goalCards = document.querySelectorAll('.goal-card-3d');
  goalCards.forEach(card => {
    card.addEventListener('click', () => {
      const goalTitle = card.querySelector('.goal-card-title')?.textContent || 'Objetivo';
      playCyberTone('success');
      showToast(`Enfoque seleccionado: ${goalTitle} 🔥`);
    });
  });

  // Hotspots clicks
  const hotspots = document.querySelectorAll('.gym-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const zone = spot.getAttribute('data-zone') || 'Instalaciones';
      playCyberTone('pulse');
      showToast(`Zona destacada: ${zone}`, 'fa-solid fa-location-dot');
    });
  });

  // Newsletter submit (delivers to andresgarcia2964@gmail.com via FormSubmit)
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = newsForm.querySelector('.newsletter-input');
      const email = input?.value.trim();
      if (!email) return;

      const submitBtn = newsForm.querySelector('.newsletter-btn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const formData = new FormData(newsForm);
        const response = await fetch('https://formsubmit.co/ajax/andresgarcia2964@gmail.com', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if (!response.ok) throw new Error('Request failed');
        playCyberTone('success');
        showToast(`¡Bienvenido al equipo! ${email} registrado.`);
        newsForm.reset();
      } catch (err) {
        showToast('No se pudo enviar. Escríbenos por WhatsApp para ayudarte.', 'fa-solid fa-triangle-exclamation');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ========================================================================
  // 16. MOBILE NAVIGATION MENU (HAMBURGER TOGGLE)
  // ========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn && navMenu) {
    function closeMobileMenu() {
      navMenu.classList.remove('mobile-active');
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      document.body.classList.remove('mobile-nav-open');
    }

    function openMobileMenu() {
      navMenu.classList.add('mobile-active');
      mobileMenuBtn.classList.add('active');
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      document.body.classList.add('mobile-nav-open');
    }

    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('mobile-active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
        playCyberTone('click');
      }
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('mobile-active') &&
          !navMenu.contains(e.target) &&
          !mobileMenuBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMobileMenu();
    });
  }

  console.log('⚡ POWERZONE CYBER-ATHLETIC ENGINE v4.2 LOADED 100%');
});
