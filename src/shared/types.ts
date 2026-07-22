interface UserData {
  avatarUrl: string;
  username: string;
  gameData: UserStats;
}
interface ScoreBoardScore {
  timeSpent: number;
  turns: number;
  username: string;
}
interface UserStats {
  streak: number;
  lastPlayed: string | null;
  completedPuzzleDate: string | null;
  dailyResult: { date: string; emojiGrid: string } | null;
  timeSpent: number;
  turns: number;
}

export type { UserData, UserStats, ScoreBoardScore };
