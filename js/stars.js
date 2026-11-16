(() => {
  const canvas = document.getElementById("starfield-canvas");
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let stars = [];
  let shootingStars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(180, Math.floor((width * height) / 7500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.5,
      alpha: Math.random(),
      delta: (Math.random() * 0.015 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
      color: Math.random() < 0.28 ? "#e9d5ff" : Math.random() < 0.15 ? "#fde047" : "#ffffff",
    }));
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.4,
      len: Math.random() * 90 + 70,
      speed: Math.random() * 7 + 8,
      alpha: 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      s.alpha += s.delta;
      if (s.alpha >= 1 || s.alpha <= 0.15) s.delta *= -1;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const st = shootingStars[i];
      ctx.globalAlpha = st.alpha;
      const grad = ctx.createLinearGradient(st.x, st.y, st.x - st.len, st.y - st.len * 0.45);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "rgba(192, 132, 252, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x - st.len, st.y - st.len * 0.45);
      ctx.stroke();

      st.x += st.speed;
      st.y += st.speed * 0.45;
      st.alpha -= 0.018;
      if (st.alpha <= 0) shootingStars.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  setInterval(() => {
    if (Math.random() < 0.65) spawnShootingStar();
  }, 3600);
  draw();

  // Floating cute particles
  const floatContainer = document.getElementById("floating-elements");
  const symbols = ["✨", "💜", "🤍", "⭐", "🌙", "🐾"];

  function spawnFloatingIcon(burst = false) {
    if (!floatContainer) return;
    const el = document.createElement("span");
    el.className = "floating-particle";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 96 + 2}%`;
    el.style.fontSize = `${(Math.random() * 0.8 + 0.85).toFixed(2)}rem`;
    el.style.animationDuration = `${(burst ? Math.random() * 3 + 3.5 : Math.random() * 6 + 7).toFixed(1)}s`;
    floatContainer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  setInterval(() => spawnFloatingIcon(false), 1400);

  window.launchStarburst = function (count = 20) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnFloatingIcon(true), i * 55);
    }
  };
})();
