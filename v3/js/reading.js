import {
  createRng,
  shuffle,
  getWordsByWorld,
  pickRunWords,
  pickDistractors
} from '../../js/words.js';

const READING_CARD_COUNT = 10;

export class ReadingSession {
  constructor() {
    this.seedValue = null;
    this.rng = createRng(null);
    this.worldId = 1;
    this.cards = [];
    this.cardIndex = 0;
    this.firstTryCorrect = 0;
    this.coins = 0;
    this.done = false;
    this.missedIds = [];
    this.wordResults = [];
  }

  setSeed(n) {
    this.seedValue = n === null || n === undefined ? null : Number(n);
  }

  start(worldId, wordScores = {}, lastMissed = []) {
    this.rng = createRng(this.seedValue);
    this.worldId = Number(worldId) || 1;
    this.cardIndex = 0;
    this.firstTryCorrect = 0;
    this.coins = 0;
    this.done = false;
    this.missedIds = [];
    this.wordResults = [];

    const worldWords = getWordsByWorld(this.worldId);
    // Include all words in the world (with emoji or Hebrew fallback when emoji is null)
    const picked = pickRunWords(
      this.worldId,
      wordScores,
      lastMissed,
      this.rng,
      READING_CARD_COUNT,
      'listen'
    );

    this.cards = picked.map((target, idx) => {
      const kind = idx % 2 === 0 ? 'word_to_pic' : 'pic_to_word';
      const distractors = pickDistractors(target, worldWords, this.rng, 2);
      const optionWords = shuffle([target, ...distractors], this.rng);
      const correctIndex = optionWords.findIndex((w) => w.id === target.id);

      const prompt =
        kind === 'word_to_pic'
          ? target.en
          : target.emoji || target.he;

      const options = optionWords.map((w) =>
        kind === 'word_to_pic' ? w.emoji || w.he : w.en
      );

      return {
        index: idx,
        kind,
        target,
        optionWords,
        prompt,
        options,
        correctIndex,
        hadMistake: false,
        answeredCorrectly: false
      };
    });

    return this.getCurrentCard();
  }

  getCurrentCard() {
    if (this.done || this.cardIndex >= this.cards.length) return null;
    return this.cards[this.cardIndex];
  }

  getHookCard() {
    const c = this.getCurrentCard();
    if (!c) return null;
    return {
      kind: c.kind,
      prompt: c.prompt,
      options: [...c.options],
      correctIndex: c.correctIndex
    };
  }

  answer(optionIndex) {
    const card = this.getCurrentCard();
    if (!card) {
      return { correct: false, done: true, correctIndex: -1, firstTry: false, target: null };
    }

    const idx = Number(optionIndex);
    const isCorrect = idx === card.correctIndex;

    if (!isCorrect) {
      if (!card.hadMistake) {
        card.hadMistake = true;
        if (!this.missedIds.includes(card.target.id)) {
          this.missedIds.push(card.target.id);
        }
      }
      return {
        correct: false,
        done: false,
        firstTry: false,
        correctIndex: card.correctIndex,
        chosenIndex: idx,
        target: card.target
      };
    }

    const firstTry = !card.hadMistake;
    if (firstTry) {
      this.firstTryCorrect += 1;
      this.coins += 8;
    } else {
      this.coins += 3;
    }

    card.answeredCorrectly = true;
    this.wordResults.push({
      word: card.target,
      correct: firstTry
    });

    this.cardIndex += 1;
    if (this.cardIndex >= this.cards.length) {
      this.done = true;
    }

    return {
      correct: true,
      done: this.done,
      firstTry,
      correctIndex: card.correctIndex,
      chosenIndex: idx,
      target: card.target
    };
  }

  getStars() {
    if (this.firstTryCorrect >= 10) return 3;
    if (this.firstTryCorrect >= 8) return 2;
    if (this.firstTryCorrect >= 5) return 1;
    return 0;
  }

  getResults() {
    const stars = this.getStars();
    const totalCoins = this.coins + stars * 15;
    return {
      worldId: this.worldId,
      step: 'reading',
      passed: this.firstTryCorrect >= 8,
      firstTryCorrect: this.firstTryCorrect,
      total: this.cards.length,
      stars,
      coins: totalCoins,
      score: this.firstTryCorrect * 100,
      missedIds: [...this.missedIds],
      wordResults: [...this.wordResults]
    };
  }
}
