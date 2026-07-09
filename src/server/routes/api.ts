import { Hono } from "hono";
import { context, redis, reddit } from "@devvit/web/server";
import { UserStats } from "../../shared/types";

export const api = new Hono();

/**
 * get user profile from redis
 */
api.get("/userProfile", async (c) => {
  const username = context.username;
  if (!username) {
    return c.json({ error: "User not logged in" }, 401);
  }
  try {
    const user = await reddit.getUserByUsername(username);
    const avatarUrl = await user?.getSnoovatarUrl();
    const rawGameData = await redis.get(`userStats:${username}`);
    const gameData: UserStats = rawGameData
      ? JSON.parse(rawGameData)
      : {
          streak: 0,
          lastPlayed: null,
          completedPuzzleDate: null,
          dailyResult: null,
          timeSpent: 0,
        };

    return c.json({ ...user, avatarUrl, gameData });
  } catch (error) {
    console.error(`Error fetching user avatar: ${error}`);
    return c.json({ error: "Failed to fetch user avatar" }, 500);
  }
});

/**
 * save game data to redis
 */
api.post("/saveGameData", async (c) => {
  const username = context.username;
  if (!username) {
    return c.json({ error: "User not logged in" }, 401);
  }
  try {
    const { gameData, timeSpent, turns, puzzleNum } = await c.req.json();
    const today = new Date().toDateString();
    const yesturday = new Date(Date.now() - 86400000).toDateString();

    const rawData = await redis.get(`userStats:${username}`);
    const stats: UserStats = rawData
      ? JSON.parse(rawData)
      : {
          streak: 0,
          lastPlayed: null,
          completedPuzzleDate: null,
          dailyResult: null,
          timeSpent: 0,
          turns: 0,
        };

    if (stats.lastPlayed !== today) {
      stats.streak = stats.lastPlayed === yesturday ? stats.streak + 1 : 1;
    }

    stats.lastPlayed = today;
    stats.completedPuzzleDate = today;
    stats.dailyResult = { date: today, emojiGrid: gameData };
    stats.timeSpent = timeSpent;
    stats.turns = turns;

    await redis.set(`userStats:${username}`, JSON.stringify(stats));

    await redis.hSet(`puzzle:${puzzleNum}:leaderboard`, {
      [username]: JSON.stringify({ turns: turns, timeSpent }),
    });
    return c.json({ success: true, streak: stats.streak, gameData });
  } catch (error) {
    console.error(`Error saving game data: ${error}`);
    return c.json({ error: "Failed to save game data" }, 500);
  }
});

api.get("leaderboard/:puzzleNum", async (c) => {
  const puzzleNum = c.req.param("puzzleNum");

  const rawLeaderboard = await redis.hGetAll(`puzzle:${puzzleNum}:leaderboard`);

  const leaderboard = Object.entries(rawLeaderboard).map(
    ([username, stringifiedData]) => {
      const data = JSON.parse(stringifiedData);
      return {
        username,
        turns: data.turns,
        timeMs: data.timeSpent,
      };
    }
  );

  return c.json(leaderboard);
});

/**
 * DEBUG
 */
api.get("/reset", async (c) => {
  const username = context.username;
  if (!username) return c.json({ error: "Unauthorized" }, 401);

  try {
    await redis.del(`userStats:${username}`);

    return c.json({
      success: true,
      message: `Cleared Redis data for u/${username}`,
    });
  } catch (err) {
    return c.json({ error: "Failed to reset test account" }, 500);
  }
});
