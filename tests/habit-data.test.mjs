import test from "node:test";
import assert from "node:assert/strict";
import { getDateKey, getDayDates, getStreak, parseHabits, summarizeHabits } from "../habit-data.mjs";

test("date keys and seven-day window use the local calendar date", () => {
  const today = new Date(2026, 9, 31, 12);
  assert.equal(getDateKey(today), "2026-10-31");
  assert.deepEqual(getDayDates(today).map(({ dateKey }) => dateKey), [
    "2026-10-25",
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
  ]);
});

test("streak remains current through an uncompleted today and stops at a missed day", () => {
  const today = new Date(2026, 9, 31, 12);
  assert.equal(getStreak(["2026-10-29", "2026-10-30"], today), 2);
  assert.equal(getStreak(["2026-10-28", "2026-10-30"], today), 1);
  assert.equal(getStreak(["2026-10-31", "2026-10-30"], today), 2);
});

test("weekly summary counts each habit check-in and calculates today's progress", () => {
  const habits = [
    { doneDates: ["2026-10-31", "2026-10-30"] },
    { doneDates: ["2026-10-31", "2026-10-25"] },
  ];
  assert.deepEqual(summarizeHabits(habits, new Date(2026, 9, 31, 12)), {
    completedToday: 2,
    totalHabits: 2,
    percentComplete: 100,
    weeklyCheckins: 4,
    days: [
      { dateKey: "2026-10-25", label: "Su", dayNumber: 25, isToday: false, checkins: 1 },
      { dateKey: "2026-10-26", label: "Mo", dayNumber: 26, isToday: false, checkins: 0 },
      { dateKey: "2026-10-27", label: "Tu", dayNumber: 27, isToday: false, checkins: 0 },
      { dateKey: "2026-10-28", label: "We", dayNumber: 28, isToday: false, checkins: 0 },
      { dateKey: "2026-10-29", label: "Th", dayNumber: 29, isToday: false, checkins: 0 },
      { dateKey: "2026-10-30", label: "Fr", dayNumber: 30, isToday: false, checkins: 1 },
      { dateKey: "2026-10-31", label: "Sa", dayNumber: 31, isToday: true, checkins: 2 },
    ],
  });
  assert.equal(summarizeHabits([], new Date(2026, 9, 31, 12)).percentComplete, 0);
});

test("saved habits are validated and malformed data is rejected", () => {
  const habits = [{ id: "walk", name: "Take a walk", emoji: "🚶", doneDates: ["2026-10-31"] }];
  assert.deepEqual(parseHabits(JSON.stringify(habits)), habits);
  assert.throws(() => parseHabits('{"id":"walk"}'), /not a list/);
  assert.throws(() => parseHabits('[{"id":"walk","name":" ","emoji":"🚶","doneDates":[]}]'), /expected format/);
  assert.throws(() => parseHabits('[{"id":"walk","name":"Walk","emoji":"🚶","doneDates":[]},{"id":"walk","name":"Read","emoji":"📚","doneDates":[]}]'), /expected format/);
});
