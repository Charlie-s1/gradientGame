import { useGradientGame } from "../hooks/useGradientGame";
import RenderBox from "./Box";
import { EndScreen } from "./EndScreen";
import { UserData } from "../../shared/types";
import { hasCompletedToday } from "../utils/Scoring";

// import HelpScreen from "./HelpScreen";

function App({ userData }: { userData: UserData }) {
  const game = useGradientGame();
  console.log(
    "userData in App.tsx",
    userData,
    hasCompletedToday(userData.gameData.completedPuzzleDate)
  );
  return (
    <div className=" h-dvh w-screen flex flex-col justify-between items-center bg-white dark:bg-gray-900 gap-5">
      {(game.isDone ||
        hasCompletedToday(userData.gameData.completedPuzzleDate)) && (
        <EndScreen userGrid={game.user} userData={userData.gameData} />
      )}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="grid grid-cols-4 gap-2 aspect-square w-full h-full mx-auto pt-5">
          {game.user.map((box, i) => (
            <RenderBox
              key={i}
              col={box.col}
              onClick={box.correct ? () => {} : () => game.takeTurn(i)}
              correct={box.correct}
              customStyle={
                "border-3 border-gray-900 dark:border-white transition-all "
              }
            />
          ))}
        </div>
      </div>
      <div className="flex-srink-0 min-h-1/4 flex flex-wrap justify-center items-center">
        {game.randomG.map((b, i) => {
          return b.col ? (
            <RenderBox
              key={i}
              col={b.col}
              selected={i === game.turn}
              customStyle={"w-14! h-14! m-1 transition-all"}
              onClick={() => game.changeTurn(i)}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}

export { App };
