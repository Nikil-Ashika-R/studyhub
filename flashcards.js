/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Active Recall Flashcards Module
 * - Multi-deck management with preloaded CSE study decks
 * - 3D card flip animation with keyboard navigation (Space / Enter / Arrow keys)
 * - Next, Previous, and Fisher-Yates shuffle
 * - Active recall tracking: "Mastered" vs "Need Review"
 * - Deck mastery progress bar
 * - Add new card and new deck modals
 * - LocalStorage persistence
 */

(function (App) {
  'use strict';

  const DEFAULT_DECKS = {
    'dsa': {
      title: 'Data Structures & Algorithms',
      cards: [
        {
          id: 'c-1',
          question: 'What is the average and worst-case time complexity of QuickSort?',
          answer: 'Average case is O(n log n) with balanced pivots. Worst case is O(n²) when the pivot chosen is consistently the smallest or largest element.',
          mastered: false
        },
        {
          id: 'c-2',
          question: 'What is the key difference between a B-Tree and a B+ Tree?',
          answer: 'In a B-Tree, keys and satellite data are stored in both internal and leaf nodes. In a B+ Tree, data records/pointers are stored ONLY in leaves, and leaves are linked sequentially for fast range scans.',
          mastered: true
        },
        {
          id: 'c-3',
          question: 'What is the time complexity to detect a cycle in a linked list using Floyd\'s Cycle Detection (Tortoise and Hare)?',
          answer: 'Time complexity is O(n) and space complexity is O(1) auxiliary memory.',
          mastered: false
        },
        {
          id: 'c-4',
          question: 'When should you use Dijkstra\'s algorithm vs Bellman-Ford?',
          answer: 'Use Dijkstra when all edge weights are strictly non-negative for faster O((V + E) log V) time. Use Bellman-Ford when graphs have negative edge weights or to detect negative weight cycles.',
          mastered: false
        }
      ]
    },
    'os': {
      title: 'Operating Systems (CSE Core)',
      cards: [
        {
          id: 'c-5',
          question: 'What are the four necessary conditions for Deadlock (Coffman conditions)?',
          answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
          mastered: true
        },
        {
          id: 'c-6',
          question: 'What is Thrashing in virtual memory?',
          answer: 'A condition where a process spends more time swapping pages into and out of memory than actually executing CPU instructions, collapsing system throughput.',
          mastered: false
        },
        {
          id: 'c-7',
          question: 'What is the difference between a Process and a Thread?',
          answer: 'A Process is an executing program instance with independent address space, heap, and open handles. A Thread is a lightweight unit of CPU execution within a process that shares memory and code segments with other sibling threads.',
          mastered: true
        }
      ]
    }
  };

  function initFlashcards() {
    let decks = App.storage.get('flashcard_decks', DEFAULT_DECKS);
    let activeDeckKey = Object.keys(decks)[0] || 'dsa';
    let currentCardIndex = 0;
    let isFlipped = false;

    // DOM Elements
    const deckSelect = document.getElementById('flashcard-deck-select');
    const sceneEl = document.getElementById('flashcard-scene');
    const innerCard = document.getElementById('flashcard-inner');
    const cardQuestion = document.getElementById('flashcard-question');
    const cardAnswer = document.getElementById('flashcard-answer');
    const cardDeckTag = document.getElementById('flashcard-deck-tag');
    const cardCounter = document.getElementById('flashcard-counter');
    const cardStatusTag = document.getElementById('flashcard-status-tag');
    const masteryProgressBar = document.getElementById('flashcard-mastery-fill');
    const masteryText = document.getElementById('flashcard-mastery-text');

    const prevBtn = document.getElementById('card-prev-btn');
    const nextBtn = document.getElementById('card-next-btn');
    const flipBtn = document.getElementById('card-flip-btn');
    const shuffleBtn = document.getElementById('card-shuffle-btn');
    const markMasteredBtn = document.getElementById('card-master-btn');
    const markReviewBtn = document.getElementById('card-review-btn');

    // Add Card Modal Elements
    const addCardBtn = document.getElementById('add-card-btn');
    const addCardModal = document.getElementById('add-card-modal');
    const addCardForm = document.getElementById('add-card-form');
    const closeAddCardModal = document.getElementById('close-add-card-modal');
    const inputQuestion = document.getElementById('card-input-question');
    const inputAnswer = document.getElementById('card-input-answer');

    if (!sceneEl || !innerCard) return;

    function saveDecks() {
      App.storage.set('flashcard_decks', decks);
    }

    function populateDeckSelector() {
      if (!deckSelect) return;
      deckSelect.innerHTML = '';
      Object.keys(decks).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = decks[key].title;
        if (key === activeDeckKey) option.selected = true;
        deckSelect.appendChild(option);
      });
    }

    function getActiveCards() {
      return (decks[activeDeckKey] && decks[activeDeckKey].cards) || [];
    }

    function updateMasteryMetrics() {
      const cards = getActiveCards();
      const total = cards.length;
      const masteredCount = cards.filter(c => c.mastered).length;
      const pct = total === 0 ? 0 : Math.round((masteredCount / total) * 100);

      if (masteryProgressBar) {
        masteryProgressBar.style.width = `${pct}%`;
      }
      if (masteryText) {
        masteryText.textContent = `${masteredCount} of ${total} Mastered (${pct}%)`;
      }
    }

    function renderCurrentCard() {
      const cards = getActiveCards();

      // Reset flip state before updating content
      isFlipped = false;
      innerCard.classList.remove('flipped');

      if (cards.length === 0) {
        if (cardQuestion) cardQuestion.textContent = 'No cards in this deck yet. Click "+ Add Card" to create one!';
        if (cardAnswer) cardAnswer.textContent = 'Write answers on the back!';
        if (cardCounter) cardCounter.textContent = '0 / 0';
        if (cardDeckTag) cardDeckTag.textContent = decks[activeDeckKey]?.title || 'Deck';
        if (cardStatusTag) cardStatusTag.textContent = '';
        updateMasteryMetrics();
        return;
      }

      // Bound index
      if (currentCardIndex >= cards.length) currentCardIndex = 0;
      if (currentCardIndex < 0) currentCardIndex = cards.length - 1;

      const card = cards[currentCardIndex];

      if (cardQuestion) cardQuestion.textContent = card.question;
      if (cardAnswer) cardAnswer.textContent = card.answer;
      if (cardDeckTag) cardDeckTag.textContent = decks[activeDeckKey].title;
      if (cardCounter) cardCounter.textContent = `${currentCardIndex + 1} / ${cards.length}`;

      if (cardStatusTag) {
        if (card.mastered) {
          cardStatusTag.innerHTML = '<span class="badge badge-low"><i class="fa-solid fa-check-double"></i> Mastered</span>';
        } else {
          cardStatusTag.innerHTML = '<span class="badge badge-medium"><i class="fa-solid fa-rotate-right"></i> Needs Review</span>';
        }
      }

      updateMasteryMetrics();
    }

    function toggleFlip() {
      isFlipped = !isFlipped;
      innerCard.classList.toggle('flipped', isFlipped);
    }

    function nextCard() {
      const cards = getActiveCards();
      if (cards.length === 0) return;
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      renderCurrentCard();
    }

    function prevCard() {
      const cards = getActiveCards();
      if (cards.length === 0) return;
      currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
      renderCurrentCard();
    }

    function shuffleCards() {
      const cards = getActiveCards();
      if (cards.length < 2) {
        App.showToast('Need at least 2 cards to shuffle', 'info');
        return;
      }

      // Fisher-Yates Shuffle
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      currentCardIndex = 0;
      saveDecks();
      renderCurrentCard();
      App.showToast('🔀 Deck shuffled!', 'info');
    }

    function markCard(mastered) {
      const cards = getActiveCards();
      if (cards.length === 0) return;

      cards[currentCardIndex].mastered = mastered;
      saveDecks();
      renderCurrentCard();
      App.showToast(mastered ? 'Card marked as Mastered! 🌟' : 'Card flagged for Review', 'info');
    }

    // Card Click & Keyboard interaction
    sceneEl.addEventListener('click', toggleFlip);
    if (flipBtn) flipBtn.addEventListener('click', toggleFlip);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);

    if (markMasteredBtn) {
      markMasteredBtn.addEventListener('click', () => markCard(true));
    }
    if (markReviewBtn) {
      markReviewBtn.addEventListener('click', () => markCard(false));
    }

    // Keyboard Shortcuts for Flashcards
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      // Check if Flashcards section is roughly in view
      const rect = sceneEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      }
    });

    // Deck Selector Change
    if (deckSelect) {
      deckSelect.addEventListener('change', (e) => {
        activeDeckKey = e.target.value;
        currentCardIndex = 0;
        renderCurrentCard();
      });
    }

    // Add Card Modal
    if (addCardBtn && addCardModal) {
      addCardBtn.addEventListener('click', () => {
        addCardModal.classList.add('active');
      });

      if (closeAddCardModal) {
        closeAddCardModal.addEventListener('click', () => {
          addCardModal.classList.remove('active');
        });
      }

      addCardModal.addEventListener('click', (e) => {
        if (e.target === addCardModal) addCardModal.classList.remove('active');
      });

      if (addCardForm) {
        addCardForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const q = inputQuestion.value.trim();
          const a = inputAnswer.value.trim();

          if (!q || !a) {
            App.showToast('Please enter both question and answer', 'warning');
            return;
          }

          const newCard = {
            id: 'c-' + Date.now(),
            question: q,
            answer: a,
            mastered: false
          };

          decks[activeDeckKey].cards.push(newCard);
          saveDecks();
          currentCardIndex = decks[activeDeckKey].cards.length - 1;
          renderCurrentCard();

          addCardModal.classList.remove('active');
          addCardForm.reset();
          App.showToast('New flashcard added to deck!', 'success');
        });
      }
    }

    // Initialize
    populateDeckSelector();
    renderCurrentCard();
  }

  document.addEventListener('DOMContentLoaded', initFlashcards);
})(window.StudyHub);

