import { useGradientGame } from "../hooks/useGradientGame";
import { getTodayResult, hasCompletedToday } from "../utils/Scoring";
import RenderBox from "./Box";
import { EndScreen } from "./EndScreen";
// import HelpScreen from "./HelpScreen";

function App() {
  const game = useGradientGame();
  const savedResult = getTodayResult();

  return (
    <div className=" h-dvh w-screen flex flex-col justify-between pb-5 bg-gray-800">
      {(game.isDone || hasCompletedToday()) && (
        <EndScreen forcedEmoji={savedResult} userGrid={game.user} />
      )}
      <div className="flex-1 flex flex-col justify-center items-center gap-5">
        <div className="grid w-2/3 max-w-250 aspect-square grid-cols-4 gap-2">
          {game.user.map((box, i) => (
            <RenderBox
              key={i}
              col={box.col}
              onClick={box.correct ? () => {} : () => game.takeTurn(i)}
              correct={box.correct}
              customStyle={"border-3 border-white hover:border-white transition-all"}
            />
          ))}
        </div>
      </div>
      <div className="min-h-fit flex flex-wrap justify-center">
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

export default App;
