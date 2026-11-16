window.BirthdayGames = (() => {
  const WISHES = [
    "เค้ารักตัวนะครับ ขอให้ตัวมีความสุขมากๆ 💜✨",
    "ขอให้ตัวยิ้มสดใสแบบนี้ไปทุกๆ วันเลยนะ 🌙",
    "ไม่ว่าวันไหน เค้าก็จะอยู่ข้างๆ ตัวตรงนี้เสมอเลย 🤍",
    "ขอให้ปีที่ 21 ของตัวมีแต่เรื่องราวดีๆ เข้ามานะ 🎂",
    "ตัวคือดวงดาวราศีพิจิกที่สว่างที่สุดในใจเค้าเลย ♏✨",
    "ขอบคุณที่เกิดมาให้เค้ารักนะคนดีของเค้า 💜",
    "ขอให้ทุกความฝันของตัวเป็นจริงในเร็ววันนะค้าบ 🌟",
    "เหนื่อยเมื่อไหร่ก็หันมากอดเค้าได้ตลอดเลยนะ 🫂💜",
    "น่ารักขึ้นทุกวันเลยนะรู้ตัวมั้ย ✨",
    "รักตัวมากๆ ที่สุดในจักรวาลเลยนะรู้ป่าว 🪐💜",
  ];

  function pickWish(index) {
    return WISHES[index % WISHES.length];
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  let customFolderPhotos = [];

  function getAvailablePhotos() {
    if (customFolderPhotos.length >= 6) {
      return customFolderPhotos;
    }
    return window.BIRTHDAY_PHOTOS || [];
  }

  // ==================== MEMORY GAME ====================
  let memoryPairCount = 6;
  let flippedCards = [];
  let matchedPairs = 0;
  let memoryMoves = 0;
  let memoryLocked = false;
  let memoryWishIdx = 0;

  function setupMemoryGame() {
    const grid = document.getElementById("memory-grid");
    const matchesEl = document.getElementById("memory-matches");
    const totalEl = document.getElementById("memory-total");
    const movesEl = document.getElementById("memory-moves");
    const completeBar = document.getElementById("memory-complete-bar");
    const wishBanner = document.getElementById("memory-wish-banner");

    if (!grid) return;

    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    memoryLocked = false;

    matchesEl.textContent = "0";
    totalEl.textContent = String(memoryPairCount);
    movesEl.textContent = "0";
    completeBar.classList.add("hidden");
    wishBanner.textContent = "💜 เปิดการ์ดจับคู่ภาพของเรา เพื่อรับข้อความอวยพรพิเศษในทุกๆ คู่เลยนะ!";

    const pool = shuffleArray(getAvailablePhotos()).slice(0, memoryPairCount);
    const deck = shuffleArray([...pool, ...pool]);

    grid.innerHTML = "";
    deck.forEach((src, idx) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.src = src;
      card.dataset.index = String(idx);
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-face memory-front">
            <span>✨</span>
            <small>DA ♏</small>
          </div>
          <div class="memory-face memory-back">
            <img src="${src}" alt="ภาพความทรงจำ" loading="lazy" />
          </div>
        </div>
      `;
      card.addEventListener("click", () => handleMemoryCardClick(card));
      grid.appendChild(card);
    });
  }

  function handleMemoryCardClick(card) {
    if (memoryLocked) return;
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

    window.BirthdayAudio.playKeyTap();
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length < 2) return;

    memoryMoves += 1;
    document.getElementById("memory-moves").textContent = String(memoryMoves);
    memoryLocked = true;

    const [first, second] = flippedCards;
    if (first.dataset.src === second.dataset.src) {
      first.classList.add("matched");
      second.classList.add("matched");
      matchedPairs += 1;
      document.getElementById("memory-matches").textContent = String(matchedPairs);

      const wish = pickWish(memoryWishIdx++);
      document.getElementById("memory-wish-banner").textContent = `✨ ${wish}`;
      window.showWishToast(wish);
      window.BirthdayAudio.playMatchChime();

      flippedCards = [];
      memoryLocked = false;

      if (matchedPairs === memoryPairCount) {
        window.BirthdayAudio.playSuccessFanfare();
        window.launchStarburst(28);
        document.getElementById("memory-complete-bar").classList.remove("hidden");
      }
    } else {
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        flippedCards = [];
        memoryLocked = false;
      }, 720);
    }
  }

  // ==================== PUZZLE GAME (3x3 SWAP) ====================
  let puzzleOrder = [];
  let selectedTileIndex = null;
  let puzzleMoves = 0;
  let currentPuzzlePhoto = "";
  let bestCorrectCount = 0;
  let puzzleWishIdx = 3;

  function setupPuzzleGame(forcedPhoto = null) {
    const board = document.getElementById("puzzle-board");
    const refImg = document.getElementById("puzzle-ref-img");
    const completeBar = document.getElementById("puzzle-complete-bar");
    const wishBanner = document.getElementById("puzzle-wish-banner");

    if (!board) return;

    const photos = getAvailablePhotos();
    currentPuzzlePhoto = forcedPhoto || photos[Math.floor(Math.random() * photos.length)] || "";
    if (refImg && currentPuzzlePhoto) {
      refImg.src = currentPuzzlePhoto;
    }

    selectedTileIndex = null;
    puzzleMoves = 0;
    bestCorrectCount = 0;
    document.getElementById("puzzle-moves").textContent = "0";
    completeBar.classList.add("hidden");
    wishBanner.textContent = "✨ แตะชิ้นส่วน 2 ชิ้นเพื่อสลับตำแหน่งกัน ต่อให้ครบ 9 ช่องนะที่รัก!";

    // Create shuffled order that isn't already solved
    do {
      puzzleOrder = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    } while (puzzleOrder.every((val, idx) => val === idx));

    renderPuzzleBoard();
  }

  function renderPuzzleBoard() {
    const board = document.getElementById("puzzle-board");
    board.innerHTML = "";

    let correctCount = 0;
    puzzleOrder.forEach((pieceIdx, posIdx) => {
      const tile = document.createElement("div");
      tile.className = "puzzle-tile";
      if (pieceIdx === posIdx) {
        tile.classList.add("correct");
        correctCount += 1;
      }
      if (selectedTileIndex === posIdx) {
        tile.classList.add("selected");
      }

      const row = Math.floor(pieceIdx / 3);
      const col = pieceIdx % 3;
      tile.style.backgroundImage = `url("${currentPuzzlePhoto}")`;
      tile.style.backgroundSize = "300% 300%";
      tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

      tile.addEventListener("click", () => handlePuzzleTileClick(posIdx));
      board.appendChild(tile);
    });

    document.getElementById("puzzle-correct").textContent = String(correctCount);

    if (correctCount > bestCorrectCount && correctCount < 9 && puzzleMoves > 0) {
      bestCorrectCount = correctCount;
      const wish = pickWish(puzzleWishIdx++);
      document.getElementById("puzzle-wish-banner").textContent = `💜 ${wish}`;
      window.showWishToast(wish);
    }

    if (correctCount === 9) {
      window.BirthdayAudio.playSuccessFanfare();
      window.launchStarburst(30);
      const finalWish = "เก่งที่สุดเลยคนเก่งของเค้า! พร้อมเปิดกล่องของขวัญแล้วนะ 🎁💜";
      document.getElementById("puzzle-wish-banner").textContent = finalWish;
      window.showWishToast(finalWish);
      document.getElementById("puzzle-complete-bar").classList.remove("hidden");
    }
  }

  function handlePuzzleTileClick(posIdx) {
    window.BirthdayAudio.playKeyTap();
    if (selectedTileIndex === null) {
      selectedTileIndex = posIdx;
      renderPuzzleBoard();
      return;
    }

    if (selectedTileIndex === posIdx) {
      selectedTileIndex = null;
      renderPuzzleBoard();
      return;
    }

    [puzzleOrder[selectedTileIndex], puzzleOrder[posIdx]] = [
      puzzleOrder[posIdx],
      puzzleOrder[selectedTileIndex],
    ];
    selectedTileIndex = null;
    puzzleMoves += 1;
    document.getElementById("puzzle-moves").textContent = String(puzzleMoves);
    renderPuzzleBoard();
  }

  function init() {
    // Difficulty chips
    document.querySelectorAll("[data-pairs]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-pairs]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        memoryPairCount = Number(btn.dataset.pairs);
        setupMemoryGame();
      });
    });

    document.getElementById("btn-memory-shuffle")?.addEventListener("click", setupMemoryGame);
    document.getElementById("btn-memory-replay")?.addEventListener("click", setupMemoryGame);

    document.getElementById("memory-folder-input")?.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
      if (files.length < 2) {
        window.showWishToast("เลือกรูปอย่างน้อย 2 รูปขึ้นไปนะค้าบ 💜");
        return;
      }
      customFolderPhotos = files.map((f) => URL.createObjectURL(f));
      window.showWishToast(`โหลดรูปจากโฟลเดอร์แล้ว ${files.length} รูป! ✨`);
      setupMemoryGame();
    });

    // Puzzle controls
    document.getElementById("btn-puzzle-new")?.addEventListener("click", () => setupPuzzleGame());
    document.getElementById("btn-puzzle-replay")?.addEventListener("click", () => setupPuzzleGame());
    document.getElementById("btn-puzzle-preview")?.addEventListener("click", () => {
      document.getElementById("puzzle-reference-box")?.classList.toggle("hidden-preview");
    });

    document.getElementById("puzzle-file-input")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setupPuzzleGame(url);
    });

    setupMemoryGame();
    setupPuzzleGame();
  }

  return {
    init,
    setupMemoryGame,
    setupPuzzleGame,
  };
})();
