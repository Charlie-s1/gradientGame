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
    <div>
      {game.isDone ||
      hasCompletedToday(userData.gameData.completedPuzzleDate) ? (
        <EndScreen userGrid={game.user} userData={userData} />
      ) : (
        <div className="h-dvh w-screen flex flex-col justify-between items-center bg-slate-50 dark:bg-gray-950 text-slate-800  dark:text-slate-100 gap-5">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="grid grid-cols-4 gap-2 aspect-square w-full h-full mx-auto pt-5">
              {game.user.map((box, i) => (
                <RenderBox
                  key={i}
                  col={box.col}
                  onClick={box.correct ? () => {} : () => game.takeTurn(i)}
                  correct={box.correct}
                  customStyle={
                    "border-3 border-slate-800 dark:border-slate-100 transition-all "
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
      )}
    </div>
  );
}

export { App };
