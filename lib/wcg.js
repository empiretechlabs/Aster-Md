const axios = require("axios");
const { tempdb } = require("./database");

class WCGDatabase {
  _key(groupId) {
    return "wcg_" + groupId;
  }

  async _getDoc(groupId) {
    return (await tempdb.findOne({ id: this._key(groupId) })) || null;
  }

  async getActiveGame(groupId) {
    const doc = await this._getDoc(groupId);
    if (!doc || !doc.data) return null;
    const data = doc.data;
    if (!data.is_active && !data.is_joining) return null;
    return { id: data.internal_id, ...data };
  }

  async createGame(groupId) {
    const internalId = Date.now();
    const data = {
      internal_id: internalId,
      group_id: groupId,
      is_joining: true,
      is_active: false,
      current_word: "",
      next_letter: "",
      word_size: 4,
      timer_seconds: 45,
      successful_words: 0,
      current_turn: 0,
      used_words: [],
      players: [],
    };
    await tempdb.updateOne({ id: this._key(groupId) }, { data, creator: "Empire-Md" });
    return { lastInsertRowid: internalId };
  }

  async saveGame(groupId, data) {
    await tempdb.updateOne({ id: this._key(groupId) }, { data, creator: "Empire-Md" });
    return data;
  }

  async addPlayer(groupId, playerJid, playerName) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data?.is_joining) return false;
    const data = doc.data;
    if (data.players.some((p) => p.player_jid === playerJid)) return false;
    data.players.push({
      player_jid: playerJid,
      player_name: playerName || "Player",
      score: 0,
    });
    await this.saveGame(groupId, data);
    return true;
  }

  async getPlayerCount(groupId) {
    const doc = await this._getDoc(groupId);
    return doc?.data?.players?.length || 0;
  }

  async getGamePlayers(groupId) {
    const doc = await this._getDoc(groupId);
    return doc?.data?.players || [];
  }

  async startGame(groupId, startingWord) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return null;
    const word = startingWord.toLowerCase();
    const data = doc.data;
    data.is_joining = false;
    data.is_active = true;
    data.current_word = word;
    data.next_letter = WordChainGame.getSmartNextLetter(word);
    data.used_words = [word];
    data.current_turn = 0;
    await this.saveGame(groupId, data);
    return data;
  }

  async setCurrentTurn(groupId, turnIndex) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return;
    doc.data.current_turn = turnIndex;
    await this.saveGame(groupId, doc.data);
  }

  async removePlayer(groupId, playerJid) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return false;
    const data = doc.data;
    data.players = data.players.filter((p) => p.player_jid !== playerJid);
    if (data.current_turn >= data.players.length) {
      data.current_turn = 0;
    }
    await this.saveGame(groupId, data);
    return true;
  }

  async isWordUsed(groupId, word) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return false;
    return (doc.data.used_words || []).includes(word.toLowerCase());
  }

  async updateGameWord(groupId, word, nextLetter) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return null;
    const data = doc.data;
    const cleanWord = word.toLowerCase();
    data.current_word = cleanWord;
    data.next_letter = nextLetter;
    data.used_words = [...(data.used_words || []), cleanWord];
    data.successful_words = (data.successful_words || 0) + 1;
    if (data.successful_words % 5 === 0) data.word_size = (data.word_size || 4) + 1;
    if (data.successful_words % 10 === 0 && data.timer_seconds > 15) {
      data.timer_seconds -= 5;
    }
    await this.saveGame(groupId, data);
    return data;
  }

  async updatePlayerScore(groupId, playerJid) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return null;
    const data = doc.data;
    const player = data.players.find((p) => p.player_jid === playerJid);
    if (player) player.score = (player.score || 0) + 1;
    await this.saveGame(groupId, data);
    return player;
  }

  async endGame(groupId) {
    const doc = await this._getDoc(groupId);
    if (!doc?.data) return null;
    const data = doc.data;
    const players = [...(data.players || [])];
    const winner = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;
    const result = {
      game: {
        successful_words: data.successful_words || 0,
        word_size: data.word_size || 4,
      },
      winner: winner
        ? { player_jid: winner.player_jid, player_name: winner.player_name, score: winner.score || 0 }
        : null,
      players,
    };
    await tempdb.delete({ id: this._key(groupId) });
    return result;
  }

  async deleteGame(groupId) {
    return tempdb.delete({ id: this._key(groupId) });
  }
}

class WordChainGame {
  constructor(groupId) {
    this.groupId = groupId;
    this.db = new WCGDatabase();
    this._lastApiCall = 0;
    this._apiDelay = 100;
  }

  static _cache = new Map();

  static extractPhone(jid) {
    return jid.split("@")[0];
  }

  async refresh() {
    this._game = await this.db.getActiveGame(this.groupId);
    return this._game;
  }

  get game() {
    return this._game;
  }

  get playerCount() {
    return this._game?.players?.length || 0;
  }

  get state() {
    if (!this._game) return "NONE";
    if (this._game.is_joining) return "JOINING";
    if (this._game.is_active) return "PLAYING";
    return "ENDED";
  }

  get currentWord() {
    return this._game?.current_word || "";
  }

  get nextLetter() {
    return this._game?.next_letter || "";
  }

  get wordSize() {
    return this._game?.word_size || 4;
  }

  get timerSeconds() {
    return this._game?.timer_seconds || 45;
  }

  get successfulWords() {
    return this._game?.successful_words || 0;
  }

  get currentTurn() {
    return this._game?.current_turn || 0;
  }

  get players() {
    return (this._game?.players || []).map((p) => ({
      jid: p.player_jid,
      name: p.player_name,
      score: p.score || 0,
    }));
  }

  static async create(groupId) {
    const game = new WordChainGame(groupId);
    await game.db.createGame(groupId);
    await game.refresh();
    return game;
  }

  async addPlayer(jid, name = "Player") {
    const joined = await this.db.addPlayer(this.groupId, jid, name);
    if (joined) await this.refresh();
    return joined;
  }

  async removePlayer(jid) {
    const removed = await this.db.removePlayer(this.groupId, jid);
    if (removed) await this.refresh();
    return removed;
  }

  getPlayerIndex(jid) {
    return (this._game?.players || []).findIndex((p) => p.player_jid === jid);
  }

  getCurrentPlayer() {
    const players = this._game?.players || [];
    return players[this.currentTurn]
      ? {
          jid: players[this.currentTurn].player_jid,
          name: players[this.currentTurn].player_name,
          score: players[this.currentTurn].score || 0,
        }
      : null;
  }

  getNextPlayer() {
    const players = this._game?.players || [];
    if (!players.length) return null;
    const index = (this.currentTurn + 1) % players.length;
    return {
      jid: players[index].player_jid,
      name: players[index].player_name,
      score: players[index].score || 0,
    };
  }

  async start(startingWord = WordChainGame.getRandomStartingWord(4)) {
    await this.db.startGame(this.groupId, startingWord);
    await this.refresh();
    return this.currentWord;
  }

  async setCurrentTurn(index) {
    await this.db.setCurrentTurn(this.groupId, index);
    await this.refresh();
  }

  static getSmartNextLetter(word) {
    const lastLetter = word[word.length - 1].toLowerCase();
    const avoidLetters = ["z", "x", "q"];
    if (avoidLetters.includes(lastLetter)) {
      const commonLetters = ["s", "t", "n", "r", "l", "d", "c", "m", "p", "b"];
      return commonLetters[Math.floor(Math.random() * commonLetters.length)];
    }
    return lastLetter;
  }

  static getRandomStartingWord(minLength = 4) {
    const words = {
      4: ["word", "game", "play", "time", "love", "life", "work", "home", "book", "tree"],
      5: ["happy", "world", "music", "dream", "light", "peace", "magic", "smile", "heart", "space"],
      6: ["friend", "family", "nature", "wonder", "beauty", "wisdom", "future", "summer", "castle", "jungle"],
      7: ["amazing", "awesome", "perfect", "journey", "rainbow", "diamond", "freedom", "harmony", "victory", "mystery"],
    };
    const availableWords = words[minLength] || words[4];
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }

  basicValidation(word, requiredStartLetter, minLength) {
    if (!word || word.length === 0) {
      return { valid: false, errorKey: "error_empty" };
    }
    if (!/^[a-zA-Z]+$/.test(word)) {
      return { valid: false, errorKey: "error_letters" };
    }
    if (word.length < minLength) {
      return { valid: false, errorKey: "error_min_length", vars: { size: minLength } };
    }
    if (!word.startsWith(requiredStartLetter.toLowerCase())) {
      return { valid: false, errorKey: "error_wrong_letter", vars: { letter: requiredStartLetter.toUpperCase() } };
    }
    if (word.length < 2) {
      return { valid: false, errorKey: "error_min_length", vars: { size: 2 } };
    }
    return { valid: true };
  }

  async apiValidation(word) {
    try {
      const now = Date.now();
      if (now - this._lastApiCall < this._apiDelay) {
        await new Promise((resolve) => setTimeout(resolve, this._apiDelay));
      }
      this._lastApiCall = Date.now();

      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        { timeout: 5000 }
      );

      if (response.status === 200 && response.data && response.data.length > 0) {
        return { valid: true, word };
      }
      return { valid: false, errorKey: "error_not_english", vars: { word } };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { valid: false, errorKey: "error_not_english", vars: { word } };
      }
      console.error("Dictionary API error:", error.message);
      return { valid: true, word, warning: true };
    }
  }

  async validateWord(word, requiredStartLetter, minLength) {
    const cleanWord = word.toLowerCase().trim();
    const basicValidation = this.basicValidation(cleanWord, requiredStartLetter, minLength);
    if (!basicValidation.valid) return basicValidation;

    if (WordChainGame._cache.has(cleanWord)) {
      return { valid: true, word: cleanWord, fromCache: true };
    }

    const apiValidation = await this.apiValidation(cleanWord);
    if (apiValidation.valid) WordChainGame._cache.set(cleanWord, true);
    return apiValidation;
  }

  async playWord(jid, word) {
    await this.refresh();
    if (this.state !== "PLAYING") return { processed: false };

    const playerIndex = this.getPlayerIndex(jid);
    if (playerIndex === -1) return { processed: false };

    if (playerIndex !== this.currentTurn) {
      return { processed: true, errorKey: "not_your_turn" };
    }

    const validation = await this.validateWord(word, this.nextLetter, this.wordSize);
    if (!validation.valid) {
      return { processed: true, errorKey: validation.errorKey, vars: validation.vars || {} };
    }

    if (await this.db.isWordUsed(this.groupId, validation.word)) {
      return {
        processed: true,
        errorKey: "error_already_used",
        vars: { word: validation.word },
      };
    }

    await this.db.updateGameWord(
      this.groupId,
      validation.word,
      WordChainGame.getSmartNextLetter(validation.word)
    );
    await this.db.updatePlayerScore(this.groupId, jid);
    await this.refresh();

    const updatedIndex = this.getPlayerIndex(jid);
    const nextTurn = (updatedIndex + 1) % this.playerCount;
    await this.setCurrentTurn(nextTurn);

    const player = this.players.find((p) => p.jid === jid);
    return {
      processed: true,
      success: true,
      word: validation.word,
      score: player ? player.score : 0,
      milestone: this.successfulWords % 10 === 0 ? this.successfulWords : 0,
    };
  }

  async end() {
    const result = await this.db.endGame(this.groupId);
    this._game = null;
    if (!result) return null;
    return {
      game: result.game,
      winner: result.winner
        ? { jid: result.winner.player_jid, name: result.winner.player_name, score: result.winner.score }
        : null,
      players: result.players.map((p) => ({
        jid: p.player_jid,
        name: p.player_name,
        score: p.score || 0,
      })),
    };
  }

  async destroy() {
    await this.db.deleteGame(this.groupId);
    this._game = null;
  }

  static clearCache() {
    WordChainGame._cache.clear();
  }

  static async preloadCommonWords() {
    const stub = new WordChainGame("preload");
    const commonWords = [
      "apple", "elephant", "tiger", "rabbit", "table", "earth", "house", "eagle",
      "ocean", "ninja", "arrow", "window", "water", "river", "robot", "tower",
    ];

    for (const word of commonWords) {
      if (WordChainGame._cache.has(word)) continue;
      const result = await stub.apiValidation(word);
      if (result.valid) WordChainGame._cache.set(word, true);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

new WordChainGame("warmup").validateWord;

module.exports = WordChainGame;