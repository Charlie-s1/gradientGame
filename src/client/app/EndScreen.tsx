import { useEffect, useState } from "react";
import { UserData, UserStats } from "../../shared/types";

import {
  buildEmojiGrid,
  getPuzzleNumber,
  // updateStreak,
  // markCompletedToday,
  getTimeUntilNextPuzzle,
  // saveTodayResult,
  // handleGameCompletion,
} from "../utils/Scoring";
import type { box } from "../hooks/useGradientGame";
import { Splash } from "../splash";

const EndScreen = ({
  userGrid,
  userData,
}: {
  userGrid: box[];
  userData: UserData;
}) => {
  const userStats: UserStats = userData.gameData;
  const scoreEmoji =
    userStats.dailyResult?.emojiGrid ?? buildEmojiGrid(userGrid);
  const puzzleNumber = getPuzzleNumber();
  // const streak = updateStreak();
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">(
    "idle"
  );

  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextPuzzle());

  const shareText = `Gradient Grid #${puzzleNumber}\n🔥 Streak: ${userStats.streak}\n\n${scoreEmoji}\n`;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextPuzzle());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `Gradient Grid #${puzzleNumber}`,
      text: shareText,
      url: "https://charlie-s.com/gradientGame",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("shared");
        return;
      }
      throw new Error("Share not supported");
    } catch {
      await navigator.clipboard.writeText(
        shareText + "https://charlie-s.com/gradientGame"
      );
      setShareStatus("copied");
    }

    setTimeout(() => setShareStatus("idle"), 2000);
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md">
    //   <div className="w-full max-w-sm rounded-2xl p-6 text-slate-800 dark:text-slate-100">
    //     {/* Title */}
    //     <h1 className="text-center text-3xl font-bold">Gradient Grid</h1>
    //     <p className="text-center text-sm text-gray-400">
    //       Puzzle #{puzzleNumber}
    //     </p>

    //     {/* Emoji Grid */}
    //     <div className="my-6 flex flex-col gap-1">
    //       {scoreEmoji.split("\n").map((line, i) => (
    //         <div key={i} className="text-center text-2xl leading-6">
    //           {line}
    //         </div>
    //       ))}
    //     </div>

    //     {/* Stats */}
    //     <div className="mb-4 flex justify-between text-sm text-gray-300">
    //       <span>🔥 Streak</span>
    //       <span className="font-semibold">{userStats.streak}</span>
    //     </div>

    //     {/* Countdown */}
    //     <div className="mb-4 text-center text-sm text-gray-400">
    //       Next puzzle in{" "}
    //       <span className="font-mono text-white">
    //         {String(timeLeft.hours).padStart(2, "0")}:
    //         {String(timeLeft.minutes).padStart(2, "0")}:
    //         {String(timeLeft.seconds).padStart(2, "0")}
    //       </span>
    //     </div>

    //     {/* Actions */}
    //     <button
    //       className="w-full rounded-lg bg-white cursor-pointer py-2 font-semibold text-black hover:bg-gray-200 transition"
    //       onClick={handleShare}
    //     >
    //       {shareStatus === "shared"
    //         ? "Shared"
    //         : shareStatus === "copied"
    //           ? "Copied"
    //           : "Share"}
    //     </button>
    //   </div>
    // </div>
    <Splash userData={userData} onStart={() => {}} />
  );
};

export { EndScreen };
