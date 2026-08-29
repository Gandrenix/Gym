/* ==========================================================================
   POWERZONE - ADVANCED BIOMETRIC ECG WAVE SYSTEM (CANVAS ENGINE)
   ========================================================================== */

(function() {
  function initECG() {
    // 1. Hero HUD ECG Canvas
    const canvas = document.getElementById('hud-ecg-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let width, height;
      let animId;

      // Heart rate zones configuration
      window.powerzoneECG = {
        bpm: 142,
        zone: 'fatburn', // 'rest' (68bpm), 'fatburn' (142bpm), 'peak' (178bpm)
        color: '#ccff00',
        speedMultiplier: 1.25,
        setZone: function(zoneName) {
          this.zone = zoneName;
          const bpmValDisplay = document.getElementById('hud-live-bpm');
          const zoneBadge = document.getElementById('hud-zone-name');
          
          if (zoneName === 'rest') {
            this.bpm = 68;
            this.color = '#00f0ff';
            this.speedMultiplier = 0.75;
            if (bpmValDisplay) bpmValDisplay.textContent = '68';
            if (zoneBadge) {
              zoneBadge.textContent = 'ZONA 1 • REPOSO';
              zoneBadge.className = 'zone-pill zone-rest';
            }
          } else if (zoneName === 'peak') {
            this.bpm = 178;
            this.color = '#ff0055';
            this.speedMultiplier = 1.95;
            if (bpmValDisplay) bpmValDisplay.textContent = '178';
            if (zoneBadge) {
              zoneBadge.textContent = 'ZONA 5 • PEAK POWER';
              zoneBadge.className = 'zone-pill zone-peak';
            }
          } else {
            this.bpm = 142;
            this.color = '#ccff00';
            this.speedMultiplier = 1.25;
            if (bpmValDisplay) bpmValDisplay.textContent = '142';
            if (zoneBadge) {
              zoneBadge.textContent = 'ZONA 4 • FAT BURN';
              zoneBadge.className = 'zone-pill zone-fatburn';
            }
          }
        }
      };

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = rect.width * dpr;
        height = canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      resize();
      window.addEventListener('resize', resize);

      const history = [];

      // ECG Waveform mathematical model (P-Q-R-S-T sequence)
      function getECGY(t) {
        const cycle = t % 1.0;
        let y = 0;

        // Base baseline jitter
        y += (Math.random() - 0.5) * 0.03;

        if (cycle > 0.15 && cycle < 0.25) {
          // P Wave
          y += Math.sin((cycle - 0.15) * Math.PI / 0.1) * 0.2;
        } else if (cycle >= 0.28 && cycle < 0.32) {
          // Q dip
          y -= Math.sin((cycle - 0.28) * Math.PI / 0.04) * 0.18;
        } else if (cycle >= 0.32 && cycle < 0.40) {
          // R Peak (Massive spike)
          const rT = (cycle - 0.32) / 0.08;
          if (rT < 0.5) {
            y += rT * 2 * 1.0;
          } else {
            y += (1 - (rT - 0.5) * 2) * 1.0;
          }
        } else if (cycle >= 0.40 && cycle < 0.45) {
          // S dip
          y -= Math.sin((cycle - 0.40) * Math.PI / 0.05) * 0.32;
        } else if (cycle >= 0.55 && cycle < 0.72) {
          // T Wave
          y += Math.sin((cycle - 0.55) * Math.PI / 0.17) * 0.35;
        }

        return y;
      }

      let time = 0;
      function draw() {
        const rect = canvas.getBoundingClientRect();
        const cssWidth = rect.width;
        const cssHeight = rect.height;
        if (cssWidth === 0 || cssHeight === 0) return;

        const centerY = cssHeight * 0.55;
        const amplitude = cssHeight * 0.38;

        ctx.clearRect(0, 0, cssWidth, cssHeight);

        // Cyber Grid background in Canvas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 16;
        for (let x = 0; x < cssWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cssHeight);
          ctx.stroke();
        }
        for (let y = 0; y < cssHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cssWidth, y);
          ctx.stroke();
        }

        // Progress wave
        const speed = 0.015 * window.powerzoneECG.speedMultiplier;
        time += speed;

        const currentY = centerY - getECGY(time) * amplitude;
        history.push(currentY);

        if (history.length > cssWidth) {
          history.shift();
        }

        // Draw Main Glow Neon Line
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = window.powerzoneECG.color;
        ctx.shadowColor = window.powerzoneECG.color;
        ctx.shadowBlur = 12;

        for (let i = 0; i < history.length; i++) {
          const x = i;
          const y = history[i];
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Leading pulse dot
        if (history.length > 0) {
          const leadX = history.length - 1;
          const leadY = history[leadX];

          ctx.beginPath();
          ctx.arc(leadX, leadY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = window.powerzoneECG.color;
          ctx.shadowBlur = 16;
          ctx.fill();

          // Outer radar pulse on leading dot
          ctx.beginPath();
          ctx.arc(leadX, leadY, 8.5, 0, Math.PI * 2);
          ctx.strokeStyle = window.powerzoneECG.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        animId = requestAnimationFrame(draw);
      }

      draw();
    }

    // 2. Community Full-Width Continuous ECG Wave
    const commCanvas = document.getElementById('community-ecg-canvas');
    if (commCanvas) {
      const commCtx = commCanvas.getContext('2d');

      function resizeComm() {
        const rect = commCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        commCanvas.width = rect.width * dpr;
        commCanvas.height = rect.height * dpr;
        commCtx.scale(dpr, dpr);
      }

      resizeComm();
      window.addEventListener('resize', resizeComm);

      let commTime = 0;
      function drawComm() {
        const rect = commCanvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w === 0 || h === 0) return;

        commCtx.clearRect(0, 0, w, h);

        commCtx.beginPath();
        commCtx.lineWidth = 2.5;
        commCtx.lineCap = 'round';
        commCtx.lineJoin = 'round';
        commCtx.strokeStyle = '#ccff00';
        commCtx.shadowColor = '#ccff00';
        commCtx.shadowBlur = 14;

        const cY = h * 0.65;
        commTime += 0.025;

        // Draw continuously from x = -5 all the way to beyond the right edge (w + 10)
        for (let x = -5; x <= w + 10; x += 3) {
          const t = (x * 0.012) - commTime;
          const cycle = ((t % 2.5) + 2.5) % 2.5;
          let yOffset = 0;

          // Heartbeat spike sequence
          if (cycle > 0.35 && cycle < 0.43) {
            // P wave
            yOffset = -Math.sin((cycle - 0.35) * Math.PI / 0.08) * 8;
          } else if (cycle >= 0.43 && cycle < 0.46) {
            // Q dip
            yOffset = Math.sin((cycle - 0.43) * Math.PI / 0.03) * 6;
          } else if (cycle >= 0.46 && cycle < 0.53) {
            // R spike (peak)
            const rT = (cycle - 0.46) / 0.07;
            if (rT < 0.5) yOffset = -rT * 2 * 32;
            else yOffset = -(1 - (rT - 0.5) * 2) * 32;
          } else if (cycle >= 0.53 && cycle < 0.57) {
            // S dip
            yOffset = Math.sin((cycle - 0.53) * Math.PI / 0.04) * 10;
          } else if (cycle >= 0.65 && cycle < 0.78) {
            // T wave
            yOffset = -Math.sin((cycle - 0.65) * Math.PI / 0.13) * 12;
          } else {
            yOffset = Math.sin(t * 1.8) * 3;
          }

          const y = cY + yOffset;
          if (x === -5) commCtx.moveTo(x, y);
          else commCtx.lineTo(x, y);
        }

        commCtx.stroke();
        commCtx.shadowBlur = 0;
        requestAnimationFrame(drawComm);
      }

      drawComm();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initECG);
  } else {
    initECG();
  }
})();
