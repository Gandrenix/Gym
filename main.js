/* ==========================================================================
   POWERZONE ⚡ - ULTRA-PREMIUM CYBER-ATHLETIC LOGIC & DYNAMICS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Default contact channels for the gym
  const CONTACT_EMAIL = 'andresgarcia2964@gmail.com';
  const WHATSAPP_NUMBER = '573133340054';

  const openMailto = (subject, bodyLines) => {
    const body = bodyLines.filter(Boolean).join('\n');
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  // ==========================================
  // 0. PRELOADER
  // ==========================================
  const preloader = document.getElementById('pzPreloader');
  const preloaderFill = document.getElementById('pzPreloaderFill');

  if (preloader) {
    let fakeProgress = 0;
    const progressTimer = setInterval(() => {
      fakeProgress += Math.random() * 18;
      if (fakeProgress > 90) fakeProgress = 90;
      if (preloaderFill) preloaderFill.style.width = `${fakeProgress}%`;
    }, 120);

    const finishPreload = () => {
      clearInterval(progressTimer);
      if (preloaderFill) preloaderFill.style.width = '100%';
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, prefersReducedMotion ? 0 : 250);
    };

    if (document.readyState === 'complete') {
      finishPreload();
    } else {
      window.addEventListener('load', finishPreload);
    }
  }

  // ==========================================
  // 1. SOUND FX SYNTHESIZER (WEB AUDIO API)
  // ==========================================
  let audioCtx = null;
  let soundEnabled = false;

  const initAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playUiSound = (type = 'click') => {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.03);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'switch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  };

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioStatusText = document.getElementById('audioStatusText');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        audioToggleBtn.classList.add('active');
        if (audioStatusText) audioStatusText.textContent = 'SFX ON';
        playUiSound('success');
      } else {
        audioToggleBtn.classList.remove('active');
        if (audioStatusText) audioStatusText.textContent = 'SFX OFF';
      }
    });
  }

  // Add hover SFX to buttons and cards
  document.querySelectorAll('.btn, .goal-card, .coach-card, .pricing-card, .filter-pill, .case-pill, .zone-tab-btn').forEach(el => {
    el.addEventListener('mouseenter', () => playUiSound('hover'));
  });

  // ==========================================
  // 2. LENIS SMOOTH SCROLL & SCROLL PROGRESS
  // ==========================================
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Drive Lenis from a single clock. GSAP's ticker already runs on
    // requestAnimationFrame, so if GSAP is present we feed Lenis through
    // it exclusively — running a second parallel rAF loop here would call
    // lenis.raf() twice per frame and make scrolling feel heavy/erratic.
    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // Route in-page anchor links through Lenis so nav jumps stay buttery
    // smooth instead of fighting the browser's native instant jump.
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId.length < 2) return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -84, duration: 1.3 });
        }
      });
    });
  } else {
    document.documentElement.classList.add('no-lenis');
  }

  // Scroll Progress Bar & Header Glass Effect
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && scrollProgressBar) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgressBar.style.width = `${progress}%`;
    }

    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // ==========================================
  // 3. CUSTOM CYBER CURSOR
  // ==========================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover scale on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, select, .class-slot, .trans-compare-box, .zone-hotspot');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
    });
  }

  // ==========================================
  // 4. INTERACTIVE KINETIC HERO CANVAS (PARTICLE MATRIX)
  // ==========================================
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight || window.innerHeight);

    const particles = [];
    const particleCount = Math.min(width > 768 ? 45 : 20, 50);

    let mouse = { x: width / 2, y: height / 2, radius: 160 };

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    });

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 2.2 + 1;
        this.color = Math.random() > 0.4 ? '#bef226' : '#06b6d4';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse repelling / connecting
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(190, 242, 38, ${0.25 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderCanvas);
    };
    renderCanvas();
  }

  // ==========================================
  // 5. ECG HEART RATE MODE SELECTOR
  // ==========================================
  const ecgModes = document.querySelectorAll('.ecg-mode-pill');
  const liveBpmDisplay = document.getElementById('liveBpmDisplay');
  const pulsePath = document.querySelector('.pulse-path');

  if (ecgModes.length > 0 && liveBpmDisplay) {
    ecgModes.forEach(pill => {
      pill.addEventListener('click', () => {
        playUiSound('switch');
        ecgModes.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const bpm = pill.getAttribute('data-bpm');
        liveBpmDisplay.textContent = `${bpm} BPM`;

        if (pulsePath) {
          if (bpm === '186') {
            pulsePath.style.animationDuration = '0.9s';
            liveBpmDisplay.style.color = '#ff5500';
          } else if (bpm === '68') {
            pulsePath.style.animationDuration = '3.2s';
            liveBpmDisplay.style.color = '#22d3ee';
          } else {
            pulsePath.style.animationDuration = '1.8s';
            liveBpmDisplay.style.color = '#bef226';
          }
        }
      });
    });
  }

  // ==========================================
  // 6. POWER CALCULATOR (BIOMECÁNICA & NUTRICIÓN)
  // ==========================================
  let selectedGoal = 'muscle';
  let goalMultiplier = 1.15;

  const goalBtns = document.querySelectorAll('.goal-calc-btn');
  const calcGender = document.getElementById('calcGender');
  const calcLevel = document.getElementById('calcLevel');
  const calcWeight = document.getElementById('calcWeight');
  const calcHeight = document.getElementById('calcHeight');
  const calcDaysRange = document.getElementById('calcDaysRange');
  const daysValBadge = document.getElementById('daysValBadge');
  const recalcBtn = document.getElementById('recalcBtn');
  const claimPlanBtn = document.getElementById('claimPlanBtn');

  // Outputs
  const resGoalTag = document.getElementById('resGoalTag');
  const targetCaloriesDisplay = document.getElementById('targetCaloriesDisplay');
  const macroProtDisplay = document.getElementById('macroProtDisplay');
  const macroCarbDisplay = document.getElementById('macroCarbDisplay');
  const macroFatDisplay = document.getElementById('macroFatDisplay');
  const bench1RM = document.getElementById('bench1RM');
  const squat1RM = document.getElementById('squat1RM');
  const deadlift1RM = document.getElementById('deadlift1RM');

  // Goal switcher
  if (goalBtns.length > 0) {
    goalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiSound('click');
        goalBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGoal = btn.getAttribute('data-calc-goal');
        goalMultiplier = parseFloat(btn.getAttribute('data-mult')) || 1.0;
        calculatePlan();
      });
    });
  }

  if (calcDaysRange && daysValBadge) {
    calcDaysRange.addEventListener('input', (e) => {
      daysValBadge.textContent = `${e.target.value} días / semana`;
      calculatePlan();
    });
  }

  const calculatePlan = (triggerConfetti = false) => {
    const weight = parseFloat(calcWeight ? calcWeight.value : 75) || 75;
    const height = parseFloat(calcHeight ? calcHeight.value : 178) || 178;
    const gender = calcGender ? calcGender.value : 'male';
    const level = calcLevel ? calcLevel.value : 'intermediate';
    const days = parseInt(calcDaysRange ? calcDaysRange.value : 4) || 4;

    // Basal Metabolic Rate (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * 25);
    bmr += (gender === 'male' ? 5 : -161);

    // Activity factor
    const activityFactor = 1.2 + (days * 0.08);
    const tdee = bmr * activityFactor;
    const targetCalories = Math.round(tdee * goalMultiplier);

    // Macronutrient distribution
    let protRatio = 2.2; // g/kg
    if (selectedGoal === 'fatloss') protRatio = 2.4;
    if (selectedGoal === 'muscle') protRatio = 2.2;
    if (selectedGoal === 'performance') protRatio = 2.0;

    const protGrams = Math.round(weight * protRatio);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const remainingCals = targetCalories - (protGrams * 4) - (fatGrams * 9);
    const carbGrams = Math.max(50, Math.round(remainingCals / 4));

    // Estimated 1RM projections
    let expMult = 1.0;
    if (level === 'beginner') expMult = 0.85;
    if (level === 'intermediate') expMult = 1.25;
    if (level === 'advanced') expMult = 1.65;
    if (gender === 'female') expMult *= 0.7;

    const bench = Math.round(weight * 1.15 * expMult);
    const squat = Math.round(weight * 1.55 * expMult);
    const deadlift = Math.round(weight * 1.85 * expMult);

    // Update DOM
    if (targetCaloriesDisplay) targetCaloriesDisplay.textContent = targetCalories.toLocaleString();
    if (macroProtDisplay) macroProtDisplay.textContent = `${protGrams}g`;
    if (macroCarbDisplay) macroCarbDisplay.textContent = `${carbGrams}g`;
    if (macroFatDisplay) macroFatDisplay.textContent = `${fatGrams}g`;

    if (bench1RM) bench1RM.textContent = `${bench} kg`;
    if (squat1RM) squat1RM.textContent = `${squat} kg`;
    if (deadlift1RM) deadlift1RM.textContent = `${deadlift} kg`;

    if (resGoalTag) {
      const goalLabels = {
        muscle: 'OBJETIVO: HIPERTROFIA MIOFIBRILAR',
        fatloss: 'OBJETIVO: DÉFICIT & DEFINICIÓN',
        recomp: 'OBJETIVO: RECOMPOSICIÓN CORPORAL',
        performance: 'OBJETIVO: RENDIMIENTO ATLETA HÍBRIDO'
      };
      resGoalTag.textContent = goalLabels[selectedGoal] || 'OBJETIVO: POWERZONE';
    }

    if (triggerConfetti && typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#bef226', '#22d3ee', '#ffffff']
      });
      playUiSound('success');
    }
  };

  if (recalcBtn) {
    recalcBtn.addEventListener('click', () => {
      calculatePlan(true);
    });
  }

  [calcGender, calcLevel, calcWeight, calcHeight].forEach(input => {
    if (input) {
      input.addEventListener('change', () => calculatePlan(false));
    }
  });

  calculatePlan(); // Initial calculate

  if (claimPlanBtn) {
    claimPlanBtn.addEventListener('click', () => {
      playUiSound('success');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#bef226', '#06b6d4', '#ff5500']
        });
      }
      openModal('Plan Biométrico Personalizado', 'Tu diagnóstico ha sido cargado. Regístrate para sincronizarlo con un Coach.');
    });
  }

  // ==========================================
  // 7. INTERACTIVE 360° ZONE EXPLORER
  // ==========================================
  const zoneData = {
    biomechanics: {
      tag: 'ZONA 01 • FUERZA PURA',
      title: 'Zona Biomecánica Hammer Strength®',
      desc: 'Equipamiento de máxima precisión con curvas de fuerza iso-laterales convergentes y divergentes que protegen tus articulaciones mientras maximizan el estímulo hipertrófico.',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
      specs: [
        '14 Racks olímpicos con plataformas de absorción acústica',
        'Máquinas de palanca con carga en discos oficiales',
        'Zona de peso libre con mancuernas de hasta 65 kg'
      ]
    },
    sprint: {
      tag: 'ZONA 02 • VELOCIDAD & POTENCIA',
      title: 'Pista Sprint & Turf Sleds Track',
      desc: '40 metros lineales de césped sintético de alta densidad para empuje de trineos Prowler, aceleración multidireccional, saltos pliométricos y Assault Bikes.',
      img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
      specs: [
        'Pista de 40m para sprint y trineos pesados (+200kg)',
        'Cajas pliométricas de madera dura y foam absorbente',
        'Medición electrónica de velocidad y aceleración de salida'
      ]
    },
    biohacking: {
      tag: 'ZONA 03 • RECOVERY & LONGEVIDAD',
      title: 'Biohacking, Cryo Plunge & Sauna Spa',
      desc: 'Protocolos de inmersión en agua helada a 3°C, sauna finlandés seco a 90°C y botas de compresión neumática Normatec para reducir inflamación y potenciar la recuperación del SNC.',
      img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
      specs: [
        'Tinas de agua fría controladas digitalmente a 3°C',
        'Sauna finlandés con aromaterapia de eucalipto',
        'Presoterapia Normatec 3 y pistolas de percusión Theragun Pro'
      ]
    },
    functional: {
      tag: 'ZONA 04 • COMBAT & CALISTENIA',
      title: 'Combat Arena & Functional Rig',
      desc: 'Estructura modular Rogue® con anillas olímpicas, cuerdas de batalla, tatami acolchado de 100m² y sacos de boxeo profesionales para atletas integrales.',
      img: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1200&auto=format&fit=crop',
      specs: [
        'Rig modular Rogue con estaciones de dominadas y fondos',
        'Sacos de boxeo pesados de cuero y zona de golpeo',
        'Kettlebells calibradas de competición desde 8kg hasta 48kg'
      ]
    }
  };

  const zoneTabBtns = document.querySelectorAll('.zone-tab-btn');
  const zoneTag = document.getElementById('zoneTag');
  const zoneTitle = document.getElementById('zoneTitle');
  const zoneDesc = document.getElementById('zoneDesc');
  const zoneMainImg = document.getElementById('zoneMainImg');
  const zoneSpecsList = document.getElementById('zoneSpecsList');
  const zoneExploreBtn = document.getElementById('zoneExploreBtn');

  if (zoneTabBtns.length > 0) {
    zoneTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiSound('click');
        zoneTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-zone');
        const data = zoneData[key];

        if (data) {
          if (zoneMainImg) {
            zoneMainImg.style.opacity = '0';
            setTimeout(() => {
              zoneMainImg.src = data.img;
              zoneMainImg.style.opacity = '1';
            }, 200);
          }

          if (zoneTag) zoneTag.textContent = data.tag;
          if (zoneTitle) zoneTitle.textContent = data.title;
          if (zoneDesc) zoneDesc.textContent = data.desc;

          if (zoneSpecsList) {
            zoneSpecsList.innerHTML = data.specs.map(spec => `
              <div class="zone-spec-item">
                <div class="spec-icon">✓</div>
                <span>${spec}</span>
              </div>
            `).join('');
          }
        }
      });
    });
  }

  if (zoneExploreBtn) {
    zoneExploreBtn.addEventListener('click', () => {
      playUiSound('success');
      openModal('Visita Guiada a Instalaciones', 'Reserva un tour privado con un Coach para conocer los 2,200m² de POWERZONE.');
    });
  }

  // ==========================================
  // 8. MULTI-CASE BEFORE / AFTER COMPARISON SLIDER
  // ==========================================
  const casesData = {
    carlos: {
      afterImg: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      beforeImg: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      afterLabel: 'DESPUÉS (SEMANA 16)',
      metrics: [
        { val: '+8.4', unit: 'kg', lbl: 'Masa Muscular' },
        { val: '-7.2', unit: '%', lbl: 'Grasa Corporal' },
        { val: '+38', unit: '%', lbl: 'Fuerza 1RM' },
        { val: '16', unit: '', lbl: 'Semanas' }
      ]
    },
    valentina: {
      afterImg: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
      beforeImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      afterLabel: 'DESPUÉS (SEMANA 20)',
      metrics: [
        { val: '-14.5', unit: 'kg', lbl: 'Grasa Reducida' },
        { val: '+18', unit: '%', lbl: 'Masa Magra' },
        { val: '4.8', unit: 'km', lbl: 'VO2 Máx Run' },
        { val: '20', unit: '', lbl: 'Semanas' }
      ]
    },
    mateo: {
      afterImg: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
      beforeImg: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
      afterLabel: 'DESPUÉS (SEMANA 12)',
      metrics: [
        { val: '+45', unit: 'kg', lbl: 'Sentadilla 1RM' },
        { val: '+30', unit: 'kg', lbl: 'Banca 1RM' },
        { val: '+6.2', unit: 'kg', lbl: 'Masa Muscular' },
        { val: '12', unit: '', lbl: 'Semanas' }
      ]
    }
  };

  const casePills = document.querySelectorAll('.case-pill');
  const compareAfter = document.getElementById('compareAfter');
  const compareBefore = document.getElementById('compareBefore');
  const compareHandle = document.getElementById('compareHandle');
  const compareContainer = document.getElementById('compareContainer');
  const transMetricsList = document.getElementById('transMetricsList');

  if (casePills.length > 0) {
    casePills.forEach(pill => {
      pill.addEventListener('click', () => {
        playUiSound('click');
        casePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const caseKey = pill.getAttribute('data-case');
        const cData = casesData[caseKey];

        if (cData) {
          if (compareAfter) compareAfter.style.backgroundImage = `url('${cData.afterImg}')`;
          if (compareBefore) compareBefore.style.backgroundImage = `url('${cData.beforeImg}')`;

          const labelAfter = compareAfter ? compareAfter.querySelector('.label-after') : null;
          if (labelAfter) labelAfter.textContent = cData.afterLabel;

          if (transMetricsList) {
            transMetricsList.innerHTML = cData.metrics.map(m => `
              <div class="t-metric-item">
                <span class="t-val">${m.val}<span class="t-unit">${m.unit}</span></span>
                <span class="t-lbl">${m.lbl}</span>
              </div>
            `).join('');
          }
        }
      });
    });
  }

  // Draggable Split Logic
  if (compareContainer && compareBefore && compareHandle) {
    let isDragging = false;

    const setPosition = (x) => {
      const rect = compareContainer.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0.05) pos = 0.05;
      if (pos > 0.95) pos = 0.95;

      const pct = (pos * 100).toFixed(2);
      // Reveal the "before" image via clip-path instead of resizing its box —
      // resizing the width made background-size:cover recompute against a
      // shrinking box, so the photo visibly squeezed/zoomed as you dragged.
      // Clipping a full-size image keeps it at its natural scale throughout.
      compareBefore.style.clipPath = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;
      compareHandle.style.left = `${pct}%`;
    };

    compareContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      setPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    compareContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // ==========================================
  // 9. SCHEDULE FILTERING & VIP CLASS BOOKING MODAL
  // ==========================================
  const scheduleFilters = document.querySelectorAll('.schedule-filters .filter-pill');
  const classSlots = document.querySelectorAll('.class-slot');

  if (scheduleFilters.length > 0 && classSlots.length > 0) {
    scheduleFilters.forEach(pill => {
      pill.addEventListener('click', () => {
        playUiSound('click');
        scheduleFilters.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');

        classSlots.forEach(slot => {
          const type = slot.getAttribute('data-type');
          if (filter === 'all' || type === filter) {
            slot.style.display = 'block';
            slot.style.opacity = '1';
            slot.style.transform = 'scale(1)';
            slot.style.filter = 'none';
          } else {
            slot.style.opacity = '0.2';
            slot.style.transform = 'scale(0.96)';
            slot.style.filter = 'grayscale(100%)';
          }
        });
      });
    });
  }

  // Class Slot Click -> Open Booking Modal
  classSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      const className = slot.getAttribute('data-class') || 'Clase VIP';
      const time = slot.getAttribute('data-time') || 'Horario Flexible';
      const coach = slot.getAttribute('data-coach') || 'Head Coach';

      playUiSound('click');
      openModal(
        `Reserva VIP: ${className}`,
        `Sesión programada: ${time} • Con Coach ${coach}. Cupos limitados.`
      );
    });
  });

  // ==========================================
  // 10. PRICING MONTHLY / ANNUAL BILLING SWITCH
  // ==========================================
  const billingToggleTrack = document.getElementById('billingToggleTrack');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelAnnual = document.getElementById('labelAnnual');
  const priceVals = document.querySelectorAll('.price-val');
  let isAnnual = false;

  const toggleBilling = () => {
    isAnnual = !isAnnual;
    playUiSound('switch');

    if (billingToggleTrack) billingToggleTrack.classList.toggle('active', isAnnual);
    if (labelMonthly) labelMonthly.classList.toggle('active', !isAnnual);
    if (labelAnnual) labelAnnual.classList.toggle('active', isAnnual);

    priceVals.forEach(val => {
      const target = isAnnual ? val.getAttribute('data-annual') : val.getAttribute('data-monthly');
      if (target) {
        val.style.transform = 'scale(0.8)';
        val.style.opacity = '0';
        setTimeout(() => {
          val.textContent = target;
          val.style.transform = 'scale(1)';
          val.style.opacity = '1';
        }, 150);
      }
    });
  };

  if (billingToggleTrack) billingToggleTrack.addEventListener('click', toggleBilling);
  if (labelMonthly) labelMonthly.addEventListener('click', () => { if (isAnnual) toggleBilling(); });
  if (labelAnnual) labelAnnual.addEventListener('click', () => { if (!isAnnual) toggleBilling(); });

  // Plan Selection buttons
  document.querySelectorAll('.select-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan') || 'Membresía Powerzone';
      playUiSound('success');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#bef226', '#22d3ee', '#ff5500']
        });
      }
      openModal(`Membresía ${planName}`, `Excelente elección. Ingresa tus datos para activar tu suscripción ${isAnnual ? 'Anual (-20% OFF)' : 'Mensual'}.`);
    });
  });

  // ==========================================
  // 11. FAQ ACCORDION & REAL-TIME SEARCH
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearchInput = document.getElementById('faqSearchInput');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        playUiSound('click');
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // ==========================================
  // 12. TESTIMONIALS CAROUSEL
  // ==========================================
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;

    const updateTestimonials = () => {
      if (window.innerWidth <= 850) {
        cards.forEach((card, idx) => {
          card.style.display = (idx === currentIndex) ? 'flex' : 'none';
        });
      } else {
        cards.forEach(card => card.style.display = 'flex');
      }
    };

    nextBtn.addEventListener('click', () => {
      playUiSound('click');
      currentIndex = (currentIndex + 1) % total;
      updateTestimonials();
    });

    prevBtn.addEventListener('click', () => {
      playUiSound('click');
      currentIndex = (currentIndex - 1 + total) % total;
      updateTestimonials();
    });

    window.addEventListener('resize', updateTestimonials);
    updateTestimonials();
  }

  // ==========================================
  // 13. LIVE SOCIAL PROOF TOAST SIMULATOR
  // ==========================================
  const liveToast = document.getElementById('liveToast');
  const toastAvatar = document.getElementById('toastAvatar');
  const toastTitle = document.getElementById('toastTitle');
  const toastSub = document.getElementById('toastSub');

  const toastNotifications = [
    { avatar: '⚡', title: 'Mateo R. acaba de reservar clase', sub: 'HIIT Metabolic Burn • Hace 2 min' },
    { avatar: '🔥', title: 'Sofía C. completó el reto mensual', sub: 'Powerzone 50 Workouts • Hace 5 min' },
    { avatar: '🏆', title: 'Lucas G. rompió nuevo récord 1RM', sub: 'Sentadilla 185 kg • Hace 12 min' },
    { avatar: '💪', title: 'Daniela V. se unió al Plan Pro Elite', sub: 'Sede Central • Hace 18 min' },
    { avatar: '🧊', title: 'Andrés P. reservó sesión de Criocabina', sub: 'Zona Recovery & Spa • Hace 25 min' }
  ];

  let toastIndex = 0;

  const showNextToast = () => {
    if (!liveToast) return;
    const current = toastNotifications[toastIndex];
    if (toastAvatar) toastAvatar.textContent = current.avatar;
    if (toastTitle) toastTitle.textContent = current.title;
    if (toastSub) toastSub.textContent = current.sub;

    liveToast.classList.add('show');

    setTimeout(() => {
      liveToast.classList.remove('show');
    }, 4500);

    toastIndex = (toastIndex + 1) % toastNotifications.length;
  };

  // Trigger first toast after 4s, then repeat every 14s
  setTimeout(() => {
    showNextToast();
    setInterval(showNextToast, 14000);
  }, 4000);

  // ==========================================
  // 14. INTERACTIVE MODAL CONTROLLER
  // ==========================================
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const bookingForm = document.getElementById('bookingForm');

  const openModal = (title = 'Pase VIP de 1 Día', subtitle = 'Completa tus datos para recibir tu acceso gratuito a POWERZONE.') => {
    if (!bookingModal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalSub) modalSub.textContent = subtitle;
    bookingModal.classList.add('open');
  };

  const closeModal = () => {
    if (bookingModal) bookingModal.classList.remove('open');
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeModal();
    });
  }

  // Trigger buttons that open modal
  const triggers = [
    document.getElementById('navJoinBtn'),
    document.getElementById('mobileNavJoinBtn'),
    document.getElementById('heroJoinNowBtn'),
    document.getElementById('ctaBannerBtn'),
    document.getElementById('joinCommBtn'),
    document.getElementById('joinChallengeBtn')
  ];

  triggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        playUiSound('click');
        openModal('Pase VIP de 1 Día Gratuito', 'Ven a entrenar gratis hoy mismo en el mejor centro biomecánico.');
      });
    }
  });

  document.querySelectorAll('.book-coach-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const coach = btn.getAttribute('data-coach') || 'Coach';
      playUiSound('click');
      openModal(`Sesión 1 a 1 con ${coach}`, 'Diagnóstico biomecánico y entrenamiento personalizado guiado.');
    });
  });

  document.querySelectorAll('.goal-quick-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const goal = btn.getAttribute('data-goal-name') || 'Programa';
      playUiSound('click');
      openModal(`Programa: ${goal}`, 'Recibe el plan completo de sobrecarga progresiva y nutrición.');
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playUiSound('success');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#bef226', '#06b6d4', '#ff5500', '#ffffff']
        });
      }

      const name = document.getElementById('bookingName')?.value || 'Atleta';
      const email = document.getElementById('bookingEmail')?.value || '';
      const phone = document.getElementById('bookingPhone')?.value || '';
      const goal = document.getElementById('bookingGoal')?.value || '';

      openMailto(`Nueva reserva de Pase VIP — ${name}`, [
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `WhatsApp: ${phone}`,
        `Objetivo principal: ${goal}`,
      ]);

      closeModal();

      // Show instant confirmation toast
      if (liveToast) {
        if (toastAvatar) toastAvatar.textContent = '🎉';
        if (toastTitle) toastTitle.textContent = `¡Bienvenido/a, ${name}!`;
        if (toastSub) toastSub.textContent = 'Tu pase VIP ha sido confirmado. Revisa tu WhatsApp/Correo.';
        liveToast.classList.add('show');
        setTimeout(() => liveToast.classList.remove('show'), 6000);
      }
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playUiSound('success');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#bef226', '#ffffff']
        });
      }
      const subscriberEmail = newsletterForm.querySelector('.newsletter-input')?.value || '';
      openMailto('Nueva suscripción al newsletter POWERZONE', [
        `Correo del suscriptor: ${subscriberEmail}`,
      ]);

      alert('¡Gracias por suscribirte a la comunidad POWERZONE! Recibirás los mejores planes en tu bandeja.');
      newsletterForm.reset();
    });
  }

  // ==========================================
  // 15. MOBILE MENU & ACTIVE NAV HIGHLIGHT
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      playUiSound('click');
      navMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link, .nav-menu-footer a, .nav-menu-footer button').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    const scrollY = window.scrollY + 180;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ==========================================
  // 16. GSAP SCROLL ANIMATIONS & COUNT-UPS
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero content stagger reveal
    gsap.from('.hero-tag-badge, .hero-title, .hero-desc, .hero-cta-group, .hero-stats-capsule', {
      duration: 1.0,
      y: 40,
      opacity: 0,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.hero-visual', {
      duration: 1.2,
      scale: 0.92,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.4
    });

    // Animate stats counter numbers on scroll
    document.querySelectorAll('.count-up').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target')) || 0;
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(counter, {
            innerHTML: target,
            duration: 2.0,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            onUpdate: function () {
              counter.innerHTML = (target > 999 ? '+' : '') + Math.round(this.targets()[0].innerHTML).toLocaleString();
            }
          });
        }
      });
    });

    // Section title reveals
    document.querySelectorAll('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
        },
        duration: 0.9,
        y: 30,
        opacity: 0,
        ease: 'power3.out'
      });
    });

    // Parallax drift on the ambient background glows for extra depth while scrolling
    document.querySelectorAll('.ambient-glow').forEach((glow, i) => {
      gsap.to(glow, {
        y: i % 2 === 0 ? -120 : 120,
        ease: 'none',
        scrollTrigger: {
          trigger: glow,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  } else {
    // Reduced motion / no GSAP: make sure counters still show their final values
    document.querySelectorAll('.count-up').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target')) || 0;
      counter.textContent = (target > 999 ? '+' : '') + target.toLocaleString();
    });
  }

  // ==========================================
  // 16b. SCROLL REVEALS FOR CARD GRIDS (IntersectionObserver-based)
  //
  // Deliberately NOT built on GSAP ScrollTrigger: on this page, images finish
  // loading (and shift page height) after ScrollTrigger has already cached
  // pixel-based trigger positions, which left several sections (goal cards,
  // pillars, coaches, pricing, testimonials, FAQ) permanently stuck at
  // opacity:0 — content silently disappeared. IntersectionObserver re-checks
  // against live layout on every frame, so it can't go stale this way. Every
  // target also starts fully visible in CSS; only `.reveal-item` opts an
  // element into the hidden-then-reveal transition, so a JS failure here
  // fails open (content stays visible) instead of failing closed.
  // ==========================================
  const revealTargets = [];
  const revealGroupSelectors = [
    { container: '.goals-cards-grid', items: '.goal-card' },
    { container: '.pillars-grid', items: '.pillar-card' },
    { container: '.coaches-cards-row', items: '.coach-card' },
    { container: '.community-photo-grid', items: '.comm-img-item' },
    { container: '.pricing-cards-grid', items: '.pricing-card' },
    { container: '.testimonials-track', items: '.testimonial-card' },
    { container: '.faq-list', items: '.faq-item' },
  ];
  revealGroupSelectors.forEach(({ container, items }) => {
    const containerEl = document.querySelector(container);
    if (!containerEl) return;
    containerEl.querySelectorAll(items).forEach((el, i) => revealTargets.push({ el, delay: i * 0.08 }));
  });
  [
    '.zone-display-card', '.trans-card', '.schedule-table-wrap', '.challenge-card',
    '.cta-banner-card', '.app-promo-area', '.pricing-header'
  ].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) revealTargets.push({ el, delay: 0 });
  });

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach(({ el, delay }) => {
      el.classList.add('reveal-item');
      el.style.transitionDelay = `${delay}s`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Reveal on intersection, and also as a safety net if a fast jump
        // (nav-link scroll, scrollbar drag, End key) skipped the element
        // past the viewport before it ever registered as intersecting —
        // otherwise it would stay hidden forever even though the user is
        // now scrolled below it.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('reveal-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '15% 0px -5% 0px' });

    revealTargets.forEach(({ el }) => revealObserver.observe(el));

    // Absolute safety net: whatever happens with scroll/observer edge cases,
    // nothing stays invisible forever.
    setTimeout(() => {
      revealTargets.forEach(({ el }) => el.classList.add('reveal-visible'));
    }, 4000);
  }

  // ==========================================
  // 17. VANILLA TILT 3D PHYSICS INITIALIZATION
  // ==========================================
  if (typeof VanillaTilt !== 'undefined' && !prefersReducedMotion) {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      perspective: 1000
    });
  }

  // ==========================================
  // 18. MAGNETIC BUTTON INTERACTION
  // ==========================================
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const magneticTargets = document.querySelectorAll('.btn-primary, .btn-white-pill');

    magneticTargets.forEach(el => {
      el.classList.add('magnetic-btn');
      const strength = 0.3;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        typeof gsap !== 'undefined'
          ? gsap.to(el, { x: relX * strength, y: relY * strength, duration: 0.4, ease: 'power2.out' })
          : (el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`);
      });

      el.addEventListener('mouseleave', () => {
        typeof gsap !== 'undefined'
          ? gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
          : (el.style.transform = 'translate(0, 0)');
      });
    });
  }

});
