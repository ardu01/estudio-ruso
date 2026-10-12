(function (root) {
  function todayKey(date) {
    const value = date || new Date();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return value.getFullYear() + '-' + month + '-' + day;
  }

  function addDays(iso, days) {
    const parts = String(iso).split('-').map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    date.setDate(date.getDate() + (days || 0));
    return todayKey(date);
  }

  function blankCard() {
    return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: null };
  }

  function schedule(previous, grade, today) {
    const day = today || todayKey();
    const card = Object.assign(blankCard(), previous || {});
    if (grade === 'again') {
      card.reps = 0;
      card.lapses = (Number(card.lapses) || 0) + 1;
      card.interval = 0;
      card.ease = Math.max(1.3, (Number(card.ease) || 2.5) - 0.2);
      card.due = day;
      return card;
    }
    if (grade === 'hard') {
      card.reps = (Number(card.reps) || 0) + 1;
      card.ease = Math.max(1.3, (Number(card.ease) || 2.5) - 0.15);
      card.interval = Math.max(1, Math.round((Number(card.interval) || 1) * 1.2));
      card.due = addDays(day, card.interval);
      return card;
    }
    if (grade === 'easy') {
      const base = card.reps === 0 ? 3 : Math.max(1, Math.round((Number(card.interval) || 1) * (Number(card.ease) || 2.5) * 1.3));
      card.reps = (Number(card.reps) || 0) + 1;
      card.interval = base;
      card.ease = Math.min(3, (Number(card.ease) || 2.5) + 0.15);
      card.due = addDays(day, card.interval);
      return card;
    }
    let interval;
    if (!card.reps) interval = 1;
    else if (card.reps === 1) interval = 3;
    else interval = Math.max(1, Math.round((Number(card.interval) || 1) * (Number(card.ease) || 2.5)));
    card.reps = (Number(card.reps) || 0) + 1;
    card.interval = interval;
    card.due = addDays(day, card.interval);
    return card;
  }

  function dueLabel(interval) {
    if (!interval) return 'hoy';
    if (interval === 1) return 'mañana';
    return 'en ' + interval + ' días';
  }

  function isDue(card, today) {
    if (!card || !card.due) return false;
    return card.due <= today;
  }

  root.RusoSrs = {
    todayKey: todayKey,
    addDays: addDays,
    blankCard: blankCard,
    schedule: schedule,
    dueLabel: dueLabel,
    isDue: isDue
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
