import { useEffect, useState } from "react";
import { generateGrid } from "../utils/generateGradient";

export type box = {
  col: string | null;
  correct: boolean;
  turns: number;
};
const CORNERS = [0, 3, 12, 15];

const useGradientGame = () => {
  const [gradient, setGradient] = useState<string[]>([]);
  const [randomG, setRandomG] = useState<box[]>([]);
  const [user, setUser] = useState<box[]>([]);
  const [turn, setTurn] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const g = generateGrid();
    setGradient(g);

    const shuffled = [...g]
      .filter((_, i) => !CORNERS.includes(i))
      .sort(() => 0.5 - Math.random())
      .map((c) => ({ col: c, correct: false, turns: 0 }));

    setRandomG(shuffled);
    setUser(
      Array.from({ length: g.length }, (_, i) =>
        CORNERS.includes(i)
          ? { col: g[i], correct: true, turns: 0 }
          : { col: "", correct: false, turns: 0 }
      )
    );
  }, []);

  const changeTurn = (index: number) => {
    setTurn(index);
  };

  const takeTurn = (index: number) => {
    if (isDone || user[index].col === randomG[turn].col) return;

    const placed = randomG[turn];

    setUser((prev) => {
      const next = [...prev];
      next[index] = {
        ...placed,
        turns: prev[index].turns + 1,
        correct: placed.col === gradient[index],
      };
      return next;
    });

    if (placed.col === gradient[index]) {
      setRandomG((prev) => {
        const next = prev.filter((c) => c.col !== placed.col);
        setTurn((t) => (next.length ? t % next.length : 0));
        return next;
      });
    }
  };
  useEffect(() => {
    if (!gradient.length || gradient.length !== user.length) return;

    if (user.every((b, i) => b.col === gradient[i])) {
      setIsDone(true);
      return;
    }
  }, [user, gradient]);

  return { gradient, randomG, user, turn, isDone, takeTurn, changeTurn };
};

export { useGradientGame };
