import type { box } from "../hooks/useGradientGame";
import { UserStats } from "../../shared/types";

const START_DATE = new Date("2026-07-10T00:00:00Z");

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

const calculateScore = (turns: number, time: number) => {
  return turns * 100000 + time;
};
const formatTime = (ms: number | null) => {
  if (!ms) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const hasCompletedToday = (completedPuzzleDate: string | null) => {
  return completedPuzzleDate === new Date().toDateString();
};

const handleGameCompletion = async (
  userGrid: box[],
  timeTaken: number,
  turn: number
) => {
  const emojiGrid = buildEmojiGrid(userGrid);

  try {
    const res = await fetch("/api/saveGameData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameData: emojiGrid,
        timeSpent: timeTaken,
        turns: turn,
        puzzleNum: getPuzzleNumber(),
      }),
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
  getPuzzleNumber,
  getTimeUntilNextPuzzle,
  calculateScore,
  formatTime,
  hasCompletedToday,
  handleGameCompletion,
};
