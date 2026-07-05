import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { UserStats } from "../shared/types";
import {
  context,
  reddit,
  redis,
  createServer,
  getServerPort,
} from "@devvit/web/server";
import { api } from "./routes/api";
import { forms } from "./routes/forms";
import { menu } from "./routes/menu";
import { triggers } from "./routes/triggers";

const app = new Hono();
const internal = new Hono();

internal.route("/menu", menu);
internal.route("/form", forms);
internal.route("/triggers", triggers);

app.route("/api", api);
app.route("/internal", internal);

app.get("/api/userProfile", async (c) => {
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
        };

    return c.json({ ...user, avatarUrl, gameData });
  } catch (error) {
    console.error(`Error fetching user avatar: ${error}`);
    return c.json({ error: "Failed to fetch user avatar" }, 500);
  }
});

app.post("/api/saveGameData", async (c) => {
  const username = context.username;
  if (!username) {
    return c.json({ error: "User not logged in" }, 401);
  }
  try {
    const { gameData } = await c.req.json();
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
        };

    if (stats.lastPlayed !== today) {
      stats.streak = stats.lastPlayed === yesturday ? stats.streak + 1 : 1;
    }

    stats.lastPlayed = today;
    stats.completedPuzzleDate = today;
    stats.dailyResult = { date: today, emojiGrid: gameData };

    await redis.set(`userStats:${username}`, JSON.stringify(stats));
    return c.json({ success: true, streak: stats.streak, gameData });
  } catch (error) {
    console.error(`Error saving game data: ${error}`);
    return c.json({ error: "Failed to save game data" }, 500);
  }
});

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
