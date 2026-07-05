export interface UserData {
  avatarUrl: string;
  username: string;
  gameData: UserStats;
}

export interface UserStats {
  streak: number;
  lastPlayed: string | null;
  completedPuzzleDate: string | null;
  dailyResult: { date: string; emojiGrid: string } | null;
}
