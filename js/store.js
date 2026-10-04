(function (root) {
  const KEY = 'estudio-ruso';

  function blank() {
    return {
      v: 2,
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
      deckState: {},
      srs: {},
      favorites: {},
      goal: 15,
      goalCount: 0,
      goalDate: null,
      goalStreak: 0,
      bestGoalStreak: 0,
      goalStreakDate: null,
      goalMetDate: null,
      newCount: 0,
      newDate: null,
      pathDone: {}
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
    const goals = [5, 10, 15, 20, 30];
    const known = raw.known && typeof raw.known === 'object' ? raw.known : {};
    let srs = raw.srs && typeof raw.srs === 'object' ? raw.srs : null;
    if (!srs) {
      srs = {};
      const today = todayKey();
      Object.keys(known).forEach(function (id) {
        srs[id] = { ease: 2.5, interval: 3, reps: 2, lapses: 0, due: addDays(today, 3) };
      });
    }
    return {
      v: 2,
      theme: theme,
      streak: Number(raw.streak) || 0,
      bestStreak: Number(raw.bestStreak) || 0,
      lastStudyDate: typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : null,
      reviews: Number(raw.reviews) || 0,
      quizCorrect: Number(raw.quizCorrect) || 0,
      quizAnswered: Number(raw.quizAnswered) || 0,
      quizzes: Number(raw.quizzes) || 0,
      known: known,
      seenLetters: raw.seenLetters && typeof raw.seenLetters === 'object' ? raw.seenLetters : {},
      lastPlace: raw.lastPlace && typeof raw.lastPlace === 'object' ? raw.lastPlace : null,
      deckState: raw.deckState && typeof raw.deckState === 'object' ? raw.deckState : {},
      srs: srs,
      favorites: raw.favorites && typeof raw.favorites === 'object' ? raw.favorites : {},
      goal: goals.indexOf(Number(raw.goal)) >= 0 ? Number(raw.goal) : 15,
      goalCount: Number(raw.goalCount) || 0,
      goalDate: typeof raw.goalDate === 'string' ? raw.goalDate : null,
      goalStreak: Number(raw.goalStreak) || 0,
      bestGoalStreak: Number(raw.bestGoalStreak) || 0,
      goalStreakDate: typeof raw.goalStreakDate === 'string' ? raw.goalStreakDate : null,
      goalMetDate: typeof raw.goalMetDate === 'string' ? raw.goalMetDate : null,
      newCount: Number(raw.newCount) || 0,
      newDate: typeof raw.newDate === 'string' ? raw.newDate : null,
      pathDone: raw.pathDone && typeof raw.pathDone === 'object' ? raw.pathDone : {}
    };
  }

  function addDays(iso, days) {
    const parts = String(iso).split('-').map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    date.setDate(date.getDate() + (days || 0));
    return todayKey(date);
  }

  function bumpGoal(state, amount) {
    const today = todayKey();
    if (state.goalDate !== today) {
      state.goalDate = today;
      state.goalCount = 0;
    }
    state.goalCount += amount || 1;
    const target = state.goal || 15;
    if (state.goalCount >= target && state.goalMetDate !== today) {
      state.goalMetDate = today;
      if (state.goalStreakDate === prevDate(today)) state.goalStreak = (Number(state.goalStreak) || 0) + 1;
      else state.goalStreak = 1;
      state.goalStreakDate = today;
      state.bestGoalStreak = Math.max(Number(state.bestGoalStreak) || 0, state.goalStreak);
    }
    return state;
  }

  let memory = null;

  function read() {
    try {
      if (typeof localStorage === 'undefined') return blank();
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      const state = sanitize(raw);
      if (!raw || raw.v !== 2) persist(state);
      return state;
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
    const current = load();
    memory = blank();
    memory.theme = current.theme;
    memory.goal = current.goal || 15;
    persist(memory);
    return memory;
  }

  root.RusoStore = {
    KEY: KEY,
    blank: blank,
    todayKey: todayKey,
    prevDate: prevDate,
    addDays: addDays,
    markStudy: markStudy,
    bumpGoal: bumpGoal,
    sanitize: sanitize,
    load: load,
    update: update,
    reset: reset
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
