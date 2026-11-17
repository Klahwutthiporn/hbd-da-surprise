(() => {
  const CORRECT_PIN = "191148";
  let currentPin = "";
  let toastTimeout = null;
  let giftOpened = false;

  const BALLOON_PHOTOS = [
    "assets/photos/photo_01.jpg?v=3",
    "assets/photos/photo_02.jpg?v=3",
    "assets/photos/photo_31.jpg?v=3",
    "assets/photos/photo_32.jpg?v=3",
    "assets/photos/photo_37.jpg?v=3",
    "assets/photos/photo_41.jpg?v=3",
    "assets/photos/photo_47.png?v=3",
    "assets/photos/photo_51.jpg?v=3",
    "assets/photos/photo_53.jpg?v=3",
    "assets/photos/photo_55.jpg?v=3",
  ];

  const KITTY_WISHES = {
    1: [
      "เมี๊ยว~ สุขสันต์วันเกิดนะครับแม่! โอเลี้ยงรักแม่ที่สุดเลย 🎂🖤",
      "ขอให้แม่ยิ้มกว้างๆ ทุกวันเลยนะครับ โอเลี้ยงจะคอยอ้อนแม่เอง! ✨",
      "โอเลี้ยงขอให้แม่สุขภาพแข็งแรง แล้วกอดโอเลี้ยงบ่อยๆ นะงับ 🖤🐾",
    ],
    2: [
      "แง้ว~ ขอให้แม่มีความสุขมากๆ สมหวังทุกอย่างเลยนะงับ! 🧡✨",
      "วันเกิดปีนี้ขอให้แม่เฮงๆ ปังๆ มีขนมให้ชาไทยกินเยอะๆ น้า 🍰",
      "ชาไทยรักแม่ที่สุดในโลกเลยนะครับแม่! 👑🧡",
    ],
    3: [
      "ม้าว~ ขอให้แม่สุขภาพแข็งแรง ยิ้มเยอะๆ อยู่กับพวกหนูไปนานๆ นะ! 🤎🐾",
      "ขอให้แม่หลับฝันดีทุกคืน ตื่นมาสดใสทุกวันเลยนะครับ 🌙",
      "ช๊อกโกแลตกับพี่ๆ รักแม่มากๆ เลยนะครับแม่! 💜🌟",
    ],
  };

  // ==================== WISH TOAST ====================
  window.showWishToast = function (message) {
    const toast = document.getElementById("wish-toast");
    const textEl = document.getElementById("wish-toast-text");
    if (!toast || !textEl) return;

    textEl.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add("hidden");
    }, 3400);
  };

  // ==================== STAGE NAVIGATION ====================
  const TARGET_TIME = new Date("2026-11-19T00:00:00+07:00").getTime();
  const IS_PREVIEW = new URLSearchParams(window.location.search).get("preview") === "1";

  function isTimeReached() {
    return IS_PREVIEW || Date.now() >= TARGET_TIME;
  }

  function goToStage(stageId) {
    if (!isTimeReached() && stageId !== "stage-countdown") {
      return;
    }

    document.querySelectorAll(".stage").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(stageId);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.dataset.target === stageId);
    });

    if (stageId === "stage-gift" || stageId === "stage-finale") {
      window.BirthdayAudio.stopBackgroundMusic();
    } else if (stageId !== "stage-pin" && stageId !== "stage-countdown") {
      window.BirthdayAudio.startBackgroundMusic();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==================== COUNTDOWN & FLOATING BALLOONS ====================
  function spawnCountdownBalloons() {
    const layer = document.getElementById("countdown-balloons");
    if (!layer) return;

    const createDrifter = (src, leftPct, durationSec, delaySec) => {
      const el = document.createElement("div");
      el.className = "drift-balloon";
      el.style.left = `${leftPct}%`;
      el.style.animationDuration = `${durationSec}s`;
      el.style.animationDelay = `${delaySec}s`;
      el.innerHTML = `
        <div class="balloon-orb">
          <img src="${src}" alt="ความทรงจำ" />
        </div>
        <div class="balloon-knot"></div>
        <div class="balloon-string"></div>
      `;
      layer.appendChild(el);
    };

    BALLOON_PHOTOS.forEach((src, i) => {
      const leftPct = 4 + ((i * 11) % 86);
      const duration = 11 + (i % 5) * 2.2;
      const delay = i * 1.4;
      createDrifter(src, leftPct, duration, delay);
    });
  }

  function setupCountdown() {
    if (isTimeReached()) {
      goToStage("stage-pin");
      return;
    }

    spawnCountdownBalloons();

    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-minutes");
    const secsEl = document.getElementById("cd-seconds");

    const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

    const tick = () => {
      const diff = TARGET_TIME - Date.now();
      if (diff <= 0) {
        clearInterval(cdTimer);
        window.launchStarburst(36);
        goToStage("stage-pin");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minsEl) minsEl.textContent = pad(mins);
      if (secsEl) secsEl.textContent = pad(secs);
    };

    tick();
    const cdTimer = setInterval(tick, 1000);
  }

  // ==================== PIN LOGIC ====================
  function updatePinDots() {
    const dots = document.querySelectorAll("#pin-dots .pin-dot");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("filled", idx < currentPin.length);
    });
  }

  function handlePinInput(key) {
    window.BirthdayAudio.playKeyTap();
    const feedback = document.getElementById("pin-feedback");
    const dotsWrap = document.getElementById("pin-dots");

    if (key === "clear") {
      currentPin = "";
      feedback.textContent = "";
      updatePinDots();
      return;
    }

    if (key === "back") {
      currentPin = currentPin.slice(0, -1);
      feedback.textContent = "";
      updatePinDots();
      return;
    }

    if (currentPin.length >= 6) return;
    currentPin += key;
    updatePinDots();

    if (currentPin.length === 6) {
      if (currentPin === CORRECT_PIN) {
        feedback.textContent = "";
        unlockApp();
      } else {
        dotsWrap.classList.add("shake");
        feedback.textContent = "อ๊ะ ยังไม่ใช่รหัสนี้น้า ลองนึกถึงวันเกิดตัวดูสิ (191148) 💜";
        setTimeout(() => {
          dotsWrap.classList.remove("shake");
          currentPin = "";
          updatePinDots();
        }, 520);
      }
    }
  }

  function unlockApp() {
    document.getElementById("top-bar").classList.remove("hidden");
    window.BirthdayAudio.startBackgroundMusic();
    window.BirthdayAudio.playSuccessFanfare();
    window.launchStarburst(32);
    goToStage("stage-greeting");
    setTimeout(() => {
      window.showWishToast("Happy Birthday นะที่รัก! เค้ารักตัวนะครับ 💜✨");
    }, 500);
  }

  // ==================== PHOTO BALLOONS & GIFT BOX ====================
  function createPhotoBalloon(src, index) {
    const balloon = document.createElement("div");
    balloon.className = "photo-balloon";
    balloon.style.animationDelay = `${(index * 0.28).toFixed(2)}s`;
    balloon.innerHTML = `
      <div class="balloon-orb">
        <img src="${src}" alt="ความทรงจำของเรา ${index + 1}" />
      </div>
      <div class="balloon-knot"></div>
      <div class="balloon-string"></div>
    `;
    return balloon;
  }

  function renderGiftBalloons() {
    const slots = [
      { id: "gift-balloons-top", slice: [0, 3], offset: 0 },
      { id: "gift-balloons-left", slice: [3, 5], offset: 3 },
      { id: "gift-balloons-right", slice: [5, 7], offset: 5 },
      { id: "gift-balloons-bottom", slice: [7, 10], offset: 7 },
    ];

    slots.forEach(({ id, slice, offset }) => {
      const container = document.getElementById(id);
      if (!container) return;
      container.innerHTML = "";
      BALLOON_PHOTOS.slice(slice[0], slice[1]).forEach((src, i) => {
        container.appendChild(createPhotoBalloon(src, offset + i));
      });
    });
  }

  function openGiftBox() {
    if (giftOpened) return;
    giftOpened = true;

    const box = document.getElementById("gift-box");
    const instruction = document.getElementById("gift-instruction");
    const reveal = document.getElementById("gift-reveal");
    const embedWrap = document.getElementById("youtube-embed-wrap");

    box.classList.add("opened");
    window.BirthdayAudio.stopBackgroundMusic();
    window.BirthdayAudio.playSuccessFanfare();
    window.launchStarburst(36);

    renderGiftBalloons();

    setTimeout(() => {
      document.getElementById("gift-box-wrapper").classList.add("hidden");
      instruction.textContent = "เซอร์ไพรส์! เปิดท่อนฮุกเพลงรักรออยู่ไม่ไกลฟังไปด้วยกันนะตัว 💜🎶";
      reveal.classList.remove("hidden");

      // Inject PURPEECH - รักรออยู่ไม่ไกล (wind) starting at hook (1:10 = 70s)
      if (embedWrap && !embedWrap.querySelector("iframe")) {
        embedWrap.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/uRXC213cMPg?start=70&autoplay=1&rel=0"
            title="รักรออยู่ไม่ไกล (wind) - PURPEECH"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        `;
      }
    }, 550);
  }

  // ==================== FINALE: REAL KITTIES ====================
  function setupKitties() {
    const kittyCounters = { 1: 0, 2: 0, 3: 0 };

    document.querySelectorAll(".kitty-actor").forEach((actor) => {
      const id = Number(actor.dataset.kitty);
      const triggerKitty = () => {
        window.BirthdayAudio.playMeow(id - 1);
        actor.classList.remove("jumping");
        void actor.offsetWidth;
        actor.classList.add("jumping");

        const wishes = KITTY_WISHES[id];
        kittyCounters[id] = (kittyCounters[id] + 1) % wishes.length;
        const bubble = document.getElementById(`kitty-bubble-${id}`);
        if (bubble) bubble.textContent = wishes[kittyCounters[id]];
        window.launchStarburst(8);
      };

      actor.addEventListener("click", triggerKitty);
      actor.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerKitty();
        }
      });
    });

    document.getElementById("btn-kitty-cheer")?.addEventListener("click", () => {
      document.querySelectorAll(".kitty-actor").forEach((actor, idx) => {
        setTimeout(() => actor.click(), idx * 220);
      });
      window.showWishToast("เมี๊ยวๆ! โอเลี้ยง ชาไทย ช๊อกโกแลต รักแม่ที่สุดเลยงับ 🐾💜🎉");
      window.launchStarburst(32);
    });
  }

  // ==================== INIT ====================
  function init() {
    document.querySelectorAll(".key-btn").forEach((btn) => {
      btn.addEventListener("click", () => handlePinInput(btn.dataset.key));
    });

    document.addEventListener("keydown", (e) => {
      const pinStage = document.getElementById("stage-pin");
      if (!pinStage.classList.contains("active")) return;
      if (/^[0-9]$/.test(e.key)) handlePinInput(e.key);
      else if (e.key === "Backspace") handlePinInput("back");
      else if (e.key === "Escape") handlePinInput("clear");
    });

    document.querySelectorAll(".nav-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        window.BirthdayAudio.playKeyTap();
        goToStage(pill.dataset.target);
      });
    });

    document.getElementById("music-toggle-btn")?.addEventListener("click", () => {
      window.BirthdayAudio.toggleBackgroundMusic();
    });

    document.getElementById("btn-go-memory")?.addEventListener("click", () => goToStage("stage-memory"));
    document.getElementById("btn-go-puzzle")?.addEventListener("click", () => goToStage("stage-puzzle"));
    document.getElementById("btn-skip-to-gift")?.addEventListener("click", () => goToStage("stage-gift"));
    document.getElementById("btn-memory-next")?.addEventListener("click", () => goToStage("stage-puzzle"));
    document.getElementById("btn-puzzle-next")?.addEventListener("click", () => goToStage("stage-gift"));
    document.getElementById("btn-go-finale")?.addEventListener("click", () => {
      goToStage("stage-finale");
      window.launchStarburst(28);
    });

    const giftWrap = document.getElementById("gift-box-wrapper");
    giftWrap?.addEventListener("click", openGiftBox);
    giftWrap?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGiftBox();
      }
    });

    setupCountdown();
    window.BirthdayGames.init();
    setupKitties();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
