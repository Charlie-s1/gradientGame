import "./index.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/Game";
import { UserData } from "../shared/types";
import {
  buildEmojiGrid,
  getTimeUntilNextPuzzle,
  hasCompletedToday,
} from "./utils/Scoring";

export const Splash = ({
  userData,
  onStart,
}: {
  userData: UserData;
  onStart: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextPuzzle());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextPuzzle());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-slate-50 text-slate-800 dark:bg-gray-950 dark:text-slate-100">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col gap-3">
          <div className="">
            <img
              className="object-contain w-24 h-25 mx-auto"
              src={userData.avatarUrl}
              alt="Snoo"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Hey {userData.username ?? "user"}
            </h1>
            <p className="text-xs uppercase text-center tracking-wider text-slate-500 dark:text-slate-500">
              Welcome back to GradientGrid
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between h-full bg-white border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/50 rounded-2xl border w-full max-2-sm backdrop-blur-sm p-5">
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
                <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  Today's Result
                </p>
                <div className="whitespace-pre-line leading-6 tracking-wide text-center">
                  {userData.gameData.dailyResult?.emojiGrid}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button
          className={` ${hasCompletedToday(userData.gameData.completedPuzzleDate) ? "opacity-50 cursor-default!" : "hover:bg-[#c23300] dark:hover:bg-orange-700"} flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white w-auto h-10 rounded-full cursor-pointer transition-colors px-4`}
          onClick={() =>
            hasCompletedToday(userData.gameData.completedPuzzleDate) &&
            onStart()
          }
        >
          {hasCompletedToday(userData.gameData.completedPuzzleDate) ? (
            <div>
              Next puzzle in{" "}
              <span className="font-mono text-white">
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          ) : (
            "Tap to Start"
          )}
        </button>
      </div>
    </div>
  );
};

const MainApp = () => {
  const [userData, setUserData] = useState<UserData>({
    avatarUrl: "",
    username: "",
    gameData: {
      streak: 0,
      lastPlayed: null,
      completedPuzzleDate: null,
      dailyResult: null,
    },
  });
  const [playGame, setPlayGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("api/userProfile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUserData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800 dark:bg-gray-950 dark:text-slate-100">
        Loading Profile...
      </div>
    );
  }
  return playGame ? (
    <App userData={userData} />
  ) : (
    <Splash userData={userData} onStart={() => setPlayGame(true)} />
  );
  // return <Splash onStart={() => setPlayGame(true)} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>
);
