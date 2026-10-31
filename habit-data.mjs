export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayDates(today = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    return {
      dateKey: getDateKey(date),
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date).slice(0, 2),
      dayNumber: date.getDate(),
      isToday: index === 6,
    };
  });
}

export function getStreak(doneDates, today = new Date()) {
  const completed = new Set(doneDates);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completed.has(getDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (completed.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function summarizeHabits(habits, today = new Date()) {
  const dates = getDayDates(today);
  const completedToday = habits.filter((habit) => habit.doneDates.includes(dates[6].dateKey)).length;
  const checkinsByDate = new Map(dates.map(({ dateKey }) => [dateKey, 0]));

  for (const habit of habits) {
    for (const dateKey of habit.doneDates) {
      if (checkinsByDate.has(dateKey)) {
        checkinsByDate.set(dateKey, checkinsByDate.get(dateKey) + 1);
      }
    }
  }

  const weeklyCheckins = [...checkinsByDate.values()].reduce((sum, count) => sum + count, 0);
  return {
    completedToday,
    totalHabits: habits.length,
    percentComplete: habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100),
    weeklyCheckins,
    days: dates.map((date) => ({ ...date, checkins: checkinsByDate.get(date.dateKey) })),
  };
}

export function parseHabits(json) {
  const habits = JSON.parse(json);
  if (!Array.isArray(habits)) throw new Error("Saved habit data is not a list.");

  const ids = new Set();
  for (const habit of habits) {
    if (
      typeof habit !== "object"
      || habit === null
      || typeof habit.id !== "string"
      || !habit.id
      || ids.has(habit.id)
      || typeof habit.name !== "string"
      || !habit.name.trim()
      || typeof habit.emoji !== "string"
      || !Array.isArray(habit.doneDates)
      || !habit.doneDates.every((date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
    ) {
      throw new Error("Saved habit data is not in the expected format.");
    }
    ids.add(habit.id);
  }
  return habits;
}
