import type { box } from "../hooks/useGradientGame";
import { UserStats } from "../../shared/types";

const START_DATE = new Date("2026-01-16T00:00:00Z");

const scoreEmoji = (totalTurns: number) => {
  if (totalTurns <= 1) return "🟩";
  if (totalTurns <= 3) return "🟨";
  return "🟥";
};

const buildEmojiGrid = (user: box[]) => {
  let output = "";
  user.forEach((b, i) => {
    if (i % 4 === 0 && i !== 0) output += "\n";
    output += b.turns !== 0 ? scoreEmoji(b.turns) : "⬛";
  });

  return output;
};

const getPuzzleNumber = () => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - START_DATE.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getTimeUntilNextPuzzle = () => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { hours, minutes, seconds };
};

// const updateStreak = () => {
//   const today = new Date().toDateString();
//   const last = localStorage.getItem("lastPlayed");
//   let streak = parseInt(localStorage.getItem("streak") || "0");

//   if (last !== today) {
//     streak =
//       last === new Date(Date.now() - 86400000).toDateString() ? streak + 1 : 1;
//   }
//   localStorage.setItem("streak", streak.toString());
//   localStorage.setItem("lastPlayed", today);
//   return streak;
// };

// const markCompletedToday = () => {
//   const today = new Date().toDateString();
//   localStorage.setItem("completedPuzzle", today);
// };

const hasCompletedToday = (completedPuzzleDate: string | null) => {
  return completedPuzzleDate === new Date().toDateString();
};

// const saveTodayResult = (emojiGrid: string) => {
//   const today = new Date().toDateString();
//   localStorage.setItem(
//     "dailyResult",
//     JSON.stringify({ date: today, emojiGrid })
//   );
// };

// const getTodayResult = (): string | null => {
//   const raw = localStorage.getItem("dailyResult");
//   if (!raw) return null;

//   const parsed = JSON.parse(raw);
//   return parsed.date === new Date().toDateString() ? parsed.emojiGrid : null;
// };

const handleGameCompletion = async (userGrid: box[]) => {
  const emojiGrid = buildEmojiGrid(userGrid);

  try {
    const res = await fetch("/api/saveGameData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameData: emojiGrid }),
    });
    const data = await res.json();
    if (data.success) {
    }
  } catch (err) {
    console.log("failed to save daily result", err);
  }
};

export {
  scoreEmoji,
  buildEmojiGrid,
  // updateStreak,
  getPuzzleNumber,
  getTimeUntilNextPuzzle,
  // markCompletedToday,
  hasCompletedToday,
  // saveTodayResult,
  // getTodayResult,
  handleGameCompletion,
};
