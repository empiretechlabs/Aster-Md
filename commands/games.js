/**
 * Empire-Md games: Tic-Tac-Toe (ttt) and Word Chain Game (wcg).
 * Game state is stored in DB (gamedb). conn.ev in index.js calls handleGameMessage for moves without prefix.
 */
const config = require("../config");
const { cmd, commands, games: gamedb } = require("../lib");

// --- Helpers ---
function renderBoard(board) {
  return (
    `${board[0]} | ${board[1]} | ${board[2]}\n` +
    `---------\n` +
    `${board[3]} | ${board[4]} | ${board[5]}\n` +
    `---------\n` +
    `${board[6]} | ${board[7]} | ${board[8]}`
  );
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function parseGameState(doc) {
  if (!doc || !doc.state) return null;
  const state = typeof doc.state === "string" ? JSON.parse(doc.state || "{}") : doc.state;
  return state;
}

async function saveGame(chatId, type, state) {
  await gamedb.findOneAndUpdate(
    { id: chatId },
    { type, state: JSON.stringify(state) },
    { upsert: true, new: true }
  );
}

async function deleteGame(chatId) {
  await gamedb.deleteMany({ id: chatId });
}

// --- Tic-Tac-Toe ---
cmd({
  pattern: "ttt",
  desc: "Play Tic Tac Toe (start or play cell 1–9)",
  category: "games",
  filename: __filename,
}, async (conn, mek, m, { from, q, sender, reply, isGroup }) => {
  const chatId = from;
  const existing = await gamedb.findOne({ id: chatId });
  const state = existing ? parseGameState(existing) : null;
  const isTTT = state && existing && existing.type === "ttt";

  // Start new game
  if (!isTTT || !state || !state.board) {
    const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const players = [sender];
    const symbol = { [sender]: "❌" };
    await saveGame(chatId, "ttt", { board, turn: sender, players, symbol });
    return reply(
      `🎮 Tic Tac Toe started!\n` +
        `Player 1: @${sender.split("@")[0]} (❌)\n\n` +
        renderBoard(board) +
        `\n\nReply with a number *1–9* to play (or wait for Player 2 to join).`,
      { mentions: [sender] }
    );
  }

  const game = state;
  const players = game.players || [];
  const symbol = game.symbol || {};

  // Second player joins
  if (players.length === 1 && !players.includes(sender)) {
    players.push(sender);
    symbol[sender] = "⭕";
    game.players = players;
    game.symbol = symbol;
    await saveGame(chatId, "ttt", game);
    return reply(`Player 2 joined: @${sender.split("@")[0]} (⭕)`, { mentions: [sender] });
  }

  if (!players.includes(sender)) return reply("❌ This game has two players already.");

  const cell = parseInt(q, 10);
  if (!q || !(cell >= 1 && cell <= 9)) return reply("⚠️ Use a number 1–9 to play a cell.");

  if (game.turn !== sender) return reply("⏳ Wait for your turn!");
  if (["❌", "⭕"].includes(game.board[cell - 1])) return reply("❌ Cell already taken!");

  game.board[cell - 1] = symbol[sender];
  game.turn = players.find((p) => p !== sender);
  await saveGame(chatId, "ttt", game);

  const winner = checkWinner(game.board);
  if (winner) {
    await deleteGame(chatId);
    return reply(
      `🎉 @${sender.split("@")[0]} (${symbol[sender]}) wins!\n\n` + renderBoard(game.board),
      { mentions: [sender] }
    );
  }

  if (!game.board.some((c) => !["❌", "⭕"].includes(c))) {
    await deleteGame(chatId);
    return reply(`🤝 It's a draw!\n\n` + renderBoard(game.board));
  }

  reply(
    renderBoard(game.board) +
      `\n\n👉 @${game.turn.split("@")[0]}'s turn (${symbol[game.turn]})`,
    { mentions: [game.turn] }
  );
});

// --- Word Chain Game (WCG) ---
cmd({
  pattern: "wcg",
  desc: "Start Word Chain Game: each word must start with the last letter of the previous",
  category: "games",
  filename: __filename,
}, async (conn, mek, m, { from, sender, reply }) => {
  const chatId = from;
  const existing = await gamedb.findOne({ id: chatId });
  const state = existing ? parseGameState(existing) : null;
  const isWCG = state && existing && existing.type === "wcg" && state.usedWords;

  if (isWCG) {
    return reply(
      `⚠️ Word Chain Game already running!\n` +
        `Last word: *${state.lastWord || "(none)"}*\n` +
        `Send a word starting with *${(state.lastWord || "?").slice(-1).toUpperCase()}*`
    );
  }

  const newState = {
    lastWord: "",
    players: [sender],
    scores: { [sender]: 0 },
    usedWords: [],
    lastPlayer: null,
  };
  await saveGame(chatId, "wcg", newState);
  return reply(
    `📖 *Word Chain Game* started!\n` +
      `Player 1: @${sender.split("@")[0]}\n\n` +
      `Send any word to start. Next word must begin with the last letter of the previous word.`
  );
});

cmd({
  pattern: "wcgend",
  desc: "End the Word Chain Game and show scores",
  category: "games",
  filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
  const doc = await gamedb.findOne({ id: from });
  const state = doc && doc.type === "wcg" ? parseGameState(doc) : null;
  if (!state || !state.scores) return reply("❌ No Word Chain Game in this chat.");
  const entries = Object.entries(state.scores || {}).sort((a, b) => b[1] - a[1]);
  const scoresText = entries.map(([jid, n]) => `• ${jid.split("@")[0]}: ${n}`).join("\n");
  await deleteGame(from);
  return reply(`📖 *Word Chain Game* ended.\n\n*Scores:*\n${scoresText}`);
});

/**
 * Called from index.js conn.ev when a non-command message is received.
 * Returns true if the message was handled as a game move.
 */
async function handleGameMessage(conn, from, sender, body, reply, mek) {
  if (!body || typeof body !== "string") return false;
  const text = body.trim();
  if (!text) return false;

  const doc = await gamedb.findOne({ id: from });
  if (!doc) return false;

  const state = parseGameState(doc);

  // TTT: single digit 1-9 from a player counts as move
  if (doc.type === "ttt" && state && state.board) {
    const players = state.players || [];
    if (!players.includes(sender)) return false;
    const cell = parseInt(text, 10);
    if (!(cell >= 1 && cell <= 9)) return false;
    if (state.turn !== sender) {
      reply("⏳ Wait for your turn!");
      return true;
    }
    if (["❌", "⭕"].includes(state.board[cell - 1])) {
      reply("❌ Cell already taken!");
      return true;
    }

    const symbol = state.symbol || {};
    state.board[cell - 1] = symbol[sender];
    state.turn = players.find((p) => p !== sender);
    await saveGame(from, "ttt", state);

    const winner = checkWinner(state.board);
    if (winner) {
      await deleteGame(from);
      reply(
        `🎉 @${sender.split("@")[0]} (${symbol[sender]}) wins!\n\n` + renderBoard(state.board),
        { mentions: [sender] }
      );
      return true;
    }
    if (!state.board.some((c) => !["❌", "⭕"].includes(c))) {
      await deleteGame(from);
      reply(`🤝 It's a draw!\n\n` + renderBoard(state.board));
      return true;
    }
    reply(
      renderBoard(state.board) +
        `\n\n👉 @${state.turn.split("@")[0]}'s turn (${state.symbol[state.turn]})`,
      { mentions: [state.turn] }
    );
    return true;
  }

  // WCG: word must start with last letter of previous (or any if first)
  if (doc.type === "wcg" && state && Array.isArray(state.usedWords)) {
    const word = text.toLowerCase().replace(/\s+/g, "");
    if (word.length < 2) return false;
    if (!/^[a-z]+$/.test(word)) return false;

    const last = (state.lastWord || "").toLowerCase();
    const lastLetter = last.slice(-1);
    if (last && word[0] !== lastLetter) {
      reply(`❌ Word must start with *${lastLetter.toUpperCase()}* (last letter of "${last}").`);
      return true;
    }
    if (state.usedWords.includes(word)) {
      reply(`❌ "${word}" was already used.`);
      return true;
    }

    state.usedWords.push(word);
    state.lastWord = word;
    state.lastPlayer = sender;
    if (!state.players.includes(sender)) state.players.push(sender);
    state.scores = state.scores || {};
    state.scores[sender] = (state.scores[sender] || 0) + 1;
    await saveGame(from, "wcg", state);

    const nextLetter = word.slice(-1);
    reply(
      `✅ *${word}* (+1)\n` +
        `Next word must start with: *${nextLetter.toUpperCase()}*\n` +
        `Scores: ${Object.entries(state.scores).map(([j, n]) => `${j.split("@")[0]}:${n}`).join(", ")}`
    );
    return true;
  }

  return false;
}

module.exports = { handleGameMessage };
