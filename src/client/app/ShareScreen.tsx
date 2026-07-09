import { useState } from "react";
import { calculateScore, formatTime, getPuzzleNumber } from "../utils/Scoring";

interface ShareMenuProps {
  emojiGrid: string;
  streak: number;
  timeTaken: number;
  turns: number;
  onClose: () => void;
}

const ShareScreen = ({
  emojiGrid,
  streak,
  timeTaken,
  turns,
  onClose,
}: ShareMenuProps) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "copied" | "posted"
  >("idle");
  const puzzleNumber = getPuzzleNumber();
  // Format the time text cleanly

  const shareText = `Gradient Grid #${puzzleNumber}\n🎯 Score: ${calculateScore(turns, timeTaken)}\n🔄️ Turns: ${turns}\n⏱️ Time: ${formatTime(timeTaken)}\n🔥 Streak: ${streak}\n\n${emojiGrid}\n`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        shareText + "https://www.reddit.com/r/GradientGrid"
      );
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-center text-slate-400 uppercase tracking-wider">
          Share Score
        </h3>

        <button
          onClick={() => {}}
          disabled={status === "loading"}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow cursor-pointer disabled:opacity-50"
        >
          {status === "loading"
            ? "Publishing..."
            : status === "posted"
              ? "Posted Successfully!"
              : "Create Post"}
        </button>

        <button
          onClick={handleCopy}
          className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-sm transition cursor-pointer"
        >
          {status === "copied" ? "Copied to Clipboard!" : "Copy Score Text"}
        </button>

        <button
          onClick={onClose}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-400 mt-1 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export { ShareScreen };
