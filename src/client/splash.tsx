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
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-gray-900">
      <div className="flex gap-2 items-center">
        <img
          className="object-contain w-1/2 max-w-[250px] mx-auto"
          src={userData.avatarUrl}
          alt="Snoo"
        />
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Hey {userData.username ?? "user"}
        </h1>
        <div className="flex flex-col justify-between h-full">
          <p className="text-base text-center text-gray-600 dark:text-gray-300">
            Welcome back to GradientGame
          </p>
          <div>
            <div className="flex justify-between text-base text-center text-gray-600 dark:text-gray-300">
              <p>Streak:</p>
              <p>{userData.gameData.streak || 0} 🔥</p>
            </div>
            {hasCompletedToday(userData.gameData.completedPuzzleDate) && (
              <div>
                <p className="text-base text-center text-gray-600 dark:text-gray-300">
                  Result from today:
                </p>
                <div className="whitespace-pre-line leading-6 tracking-wide text-center">
                  {userData.gameData.dailyResult?.emojiGrid}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className={` ${hasCompletedToday(userData.gameData.completedPuzzleDate) ? "opacity-50 cursor-default!" : "hover:bg-[#c23300] dark:hover:bg-orange-700"} flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white w-auto h-10 rounded-full cursor-pointer transition-colors px-4`}
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
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
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
