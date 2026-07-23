import { useState } from "react";
import { ScoreBoardScore, UserData } from "../../shared/types";
import {
  calculateScore,
  formatTime,
  getPuzzleNumber,
  hasCompletedToday,
} from "../utils/Scoring";
import { ScoreBoardTable } from "./ScoreBoardTable";

const ScoreCard = ({
  userData,
  scoreBoard,
}: {
  userData: UserData;
  scoreBoard: ScoreBoardScore[];
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flex flex-col justify-between items-center w-[300px] h-[250px] cursor-pointer perspective-1000 bg-white border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-2xl border  max-2-sm backdrop-blur-sm p-5"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {!isFlipped ? (
        <div>
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
                <div className="w-full">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                    #{getPuzzleNumber()} Completed in {userData.gameData.turns}{" "}
                    Turns and{" "}
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
              </div>
            )}
          </div>
        </div>
      ) : (
        <ScoreBoardTable scoreBoard={scoreBoard} userData={userData} />
      )}
      <p className="text-center uppercase text-[10px] text-slate-500 tracking-wider pt-2 font-black">
        {isFlipped ? "Tap to view score board" : "Tap to view my score"}
      </p>
    </div>
  );
};

export { ScoreCard };
