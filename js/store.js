(function (root) {
  const KEY = 'estudio-ruso';

  function blank() {
    return {
      v: 1,
      theme: 'system',
      streak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      reviews: 0,
      quizCorrect: 0,
      quizAnswered: 0,
      quizzes: 0,
      known: {},
      seenLetters: {},
      lastPlace: null,
      deckState: {}
    };
  }

  function todayKey(date) {
    const value = date || new Date();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return value.getFullYear() + '-' + month + '-' + day;
  }

  function prevDate(iso) {
    const parts = String(iso || '').split('-').map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    date.setDate(date.getDate() - 1);
    return todayKey(date);
  }

  function markStudy(state, today) {
    const day = today || todayKey();
    if (state.lastStudyDate === day) return state;
    state.streak = state.lastStudyDate === prevDate(day) ? (Number(state.streak) || 0) + 1 : 1;
    state.bestStreak = Math.max(Number(state.bestStreak) || 0, state.streak);
    state.lastStudyDate = day;
    return state;
  }

  function sanitize(raw) {
    const base = blank();
    if (!raw || typeof raw !== 'object') return base;
    const theme = raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'system' ? raw.theme : 'system';
    return {
      v: 1,
      theme: theme,
      streak: Number(raw.streak) || 0,
      bestStreak: Number(raw.bestStreak) || 0,
      lastStudyDate: typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : null,
      reviews: Number(raw.reviews) || 0,
      quizCorrect: Number(raw.quizCorrect) || 0,
      quizAnswered: Number(raw.quizAnswered) || 0,
      quizzes: Number(raw.quizzes) || 0,
      known: raw.known && typeof raw.known === 'object' ? raw.known : {},
      seenLetters: raw.seenLetters && typeof raw.seenLetters === 'object' ? raw.seenLetters : {},
      lastPlace: raw.lastPlace && typeof raw.lastPlace === 'object' ? raw.lastPlace : null,
      deckState: raw.deckState && typeof raw.deckState === 'object' ? raw.deckState : {}
    };
  }

  let memory = null;

  function read() {
    try {
      if (typeof localStorage === 'undefined') return blank();
      return sanitize(JSON.parse(localStorage.getItem(KEY) || 'null'));
    } catch (error) {
      return blank();
    }
  }

  function persist(state) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      /* The session still works if storage is full or blocked. */
    }
  }

  function load() {
    if (!memory) memory = read();
    return memory;
  }

  function update(mutator) {
    const state = load();
    mutator(state);
    persist(state);
    return state;
  }

  function reset() {
    const theme = load().theme;
    memory = blank();
    memory.theme = theme;
    persist(memory);
    return memory;
  }

  root.RusoStore = {
    KEY: KEY,
    blank: blank,
    todayKey: todayKey,
    prevDate: prevDate,
    markStudy: markStudy,
    sanitize: sanitize,
    load: load,
    update: update,
    reset: reset
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
