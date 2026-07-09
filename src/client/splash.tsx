import "./index.css";

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/Game";
import { UserData } from "../shared/types";
import {
  buildEmojiGrid,
  calculateScore,
  formatTime,
  getPuzzleNumber,
  getTimeUntilNextPuzzle,
  hasCompletedToday,
} from "./utils/Scoring";
import { ShareScreen } from "./app/ShareScreen";
import { LoadingWheel } from "./utils/icons";
import { ScoreCard } from "./app/ScoreCard";

export const Splash = ({
  userData,
  onStart,
}: {
  userData: UserData;
  onStart: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextPuzzle());
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextPuzzle());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-slate-50 text-slate-800 dark:bg-gray-950 dark:text-slate-100">
      {hasCompletedToday(userData.gameData.completedPuzzleDate) &&
        isShareOpen && (
          <div className="absolute top-4 right-4">
            <ShareScreen
              emojiGrid={userData.gameData.dailyResult?.emojiGrid ?? ""}
              streak={userData.gameData.streak}
              timeTaken={userData.gameData.timeSpent}
              turns={userData.gameData.turns}
              onClose={() => setIsShareOpen(false)}
            />
          </div>
        )}
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

        <ScoreCard userData={userData} />
      </div>
      <div className="flex items-center gap-2 justify-center">
        {hasCompletedToday(userData.gameData.completedPuzzleDate) && (
          <button
            className="flex items-center justify-center bg-slate-200 dark:bg-slate-300 text-slate-900 dark:text-slate-950 hover:bg-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-300 font-semibold duration-500 w-auto h-10 rounded-2xl cursor-pointer transition-colors px-4 "
            onClick={() => setIsShareOpen(!isShareOpen)}
          >
            Share
          </button>
        )}
        <button
          className={` ${hasCompletedToday(userData.gameData.completedPuzzleDate) ? "opacity-50 cursor-default!" : "hover:bg-[#c23300] dark:hover:bg-orange-700"} flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white font-semibold w-auto h-10 rounded-2xl cursor-pointer transition-colors px-4`}
          onClick={() =>
            !hasCompletedToday(userData.gameData.completedPuzzleDate) &&
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
      timeSpent: 0,
      turns: 0,
    },
  });
  const [playGame, setPlayGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/userProfile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUserData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [playGame]);

  // useEffect(() => {
  //   fetch("/api/reset").catch((err) => console.error(err));
  // }, []);

  useEffect(() => {
    fetch(`/api/leaderboard/${getPuzzleNumber()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) console.log(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800 dark:bg-gray-950 dark:text-slate-100">
        <LoadingWheel />
        {/* //   Loading Profile... */}
      </div>
    );
  }
  return playGame ? (
    <App
      onEnd={() => {
        setIsLoading(true);
        setPlayGame(false);
      }}
    />
  ) : (
    <Splash userData={userData} onStart={() => setPlayGame(true)} />
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>
);
