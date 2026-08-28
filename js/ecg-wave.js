/* ==========================================================================
   POWERZONE - ECG WAVE SIMULATOR (CANVAS REALTIME ANIMATION)
   ========================================================================== */

function initECGCanvas(canvasId, lineColor = '#ccff00', speed = 2) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  resize();
  window.addEventListener('resize', resize);

  let x = 0;
  const points = [];
  const maxPoints = 200;
  let phase = 0;

  // Generate continuous heartbeat pattern
  function getECGValue(t) {
    const cycle = t % 100;
    if (cycle > 25 && cycle < 30) {
      return -5; // P wave
    } else if (cycle > 33 && cycle < 36) {
      return 6; // Q dip
    } else if (cycle >= 36 && cycle <= 40) {
      return -32; // R spike high
    } else if (cycle > 40 && cycle <= 44) {
      return 14; // S dip low
    } else if (cycle > 50 && cycle < 62) {
      return -8; // T wave
    }
    return (Math.sin(t * 0.1) * 1.5); // subtle baseline noise
  }

  let step = 0;

  function animate() {
    step += speed;
    const midY = height / 2;
    const val = getECGValue(step);

    points.push({ x: width, y: midY + val });

    // Move all points to the left
    for (let i = 0; i < points.length; i++) {
      points[i].x -= speed;
    }

    // Remove off-screen points
    while (points.length > 0 && points[0].x < -10) {
      points.shift();
    }

    ctx.clearRect(0, 0, width, height);

    if (points.length > 1) {
      // Draw glow trace
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Lead cursor dot
      if (points.length > 0) {
        const lead = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lead.x, lead.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 12;
        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  initECGCanvas('hud-ecg-canvas', '#ccff00', 1.8);
  initECGCanvas('community-ecg-canvas', 'rgba(204, 255, 0, 0.7)', 2.2);
});
