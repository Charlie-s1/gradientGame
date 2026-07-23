import { ScoreBoardScore, UserData } from "../../shared/types";
import { calculateScore, getPuzzleNumber } from "../utils/Scoring";

const ScoreBoardTable = ({
  scoreBoard,
  userData,
}: {
  scoreBoard: ScoreBoardScore[];
  userData: UserData;
}) => {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="w-full h-full flex flex-col justify-between text-xs">
      <div className="text-center mb-2">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Leaderboard #{getPuzzleNumber()}
        </span>
      </div>

      {scoreBoard.length === 0 ? (
        <div className="text-center my-auto text-slate-400 text-xs">
          No scores yet today. Be the first!
        </div>
      ) : (
        <div>
          {(() => {
            const top5 = scoreBoard.slice(0, 5);
            const myIndex = scoreBoard.findIndex(
              (entry) =>
                entry.username.toLowerCase() == userData.username.toLowerCase()
            );
            const userInTop5 = myIndex !== -1 && myIndex < 5;
            const myEntry = myIndex !== -1 ? scoreBoard[myIndex] : null;
            return (
              <div className="flex-1 w-full space-y-1.5 pr-1">
                {top5.map((entry, index) => {
                  if (!userInTop5 && index >= 4) return;
                  const isMe =
                    entry.username.toLowerCase() ===
                    userData?.username.toLowerCase();
                  return (
                    <div
                      key={entry.username}
                      className={`flex justify-between w-full items-center px-2 py-1.5 rounded-lg font-medium transition-colors ${
                        isMe
                          ? "bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold"
                          : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <span className="w-5 text-center font-bold text-slate-400">
                          {index < 3 ? medals[index] : `#${index + 1}`}
                        </span>
                        <span className="truncate">{entry.username}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-orange-500">
                        {calculateScore(entry.turns, entry.timeSpent)}
                      </div>
                    </div>
                  );
                })}
                {!userInTop5 && myEntry && (
                  <div className="pt-1 mt-auto">
                    <div className="flex justify-between w-full items-center px-2 py-1.5 rounded-lg font-bold bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400">
                      <div className="flex items-center gap-1 truncate">
                        <span className="w-5 text-center font-bold text-orange-500">
                          #{myIndex + 1}
                        </span>
                        <span className="truncate">{myEntry.username}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-orange-500">
                        {calculateScore(myEntry.turns, myEntry.timeSpent)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export { ScoreBoardTable };
