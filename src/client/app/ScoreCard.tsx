import { useState } from "react";
import { UserData } from "../../shared/types";
import {
  calculateScore,
  formatTime,
  getPuzzleNumber,
  hasCompletedToday,
} from "../utils/Scoring";

const ScoreCard = ({ userData }: { userData: UserData }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flex flex-col justify-between h-full perspective-1000 bg-white border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-2xl border w-full max-2-sm backdrop-blur-sm p-5"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flex flex-col gap-3 items-center">
        <div className="flex items-center px-4 text-sm py-1.5 border-orange-500/20 border rounded-full bg-amber-500/10">
          <p className="text-orange-400 font-bold uppercase">
            Current Streak{" "}
            <span className="text-slate-950 dark:text-white">
              {userData.gameData.streak || 0}
            </span>
            🔥
          </p>
        </div>
        {hasCompletedToday(userData.gameData.completedPuzzleDate) && (
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
              #{getPuzzleNumber()} Completed in {userData.gameData.turns} Turns
              and{" "}
              <span className="lowercase">
                {formatTime(userData.gameData.timeSpent) || "N/A"}
              </span>
            </p>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500 text-center">
              score:{" "}
              {calculateScore(
                userData.gameData.turns,
                userData.gameData.timeSpent
              )}
            </p>
            <div className="whitespace-pre-line leading-6 tracking-wide text-center">
              {userData.gameData.dailyResult?.emojiGrid}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ScoreCard };
