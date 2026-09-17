// Estado da partida: aplica jogadas, passes, desistência e reinício,
// mantendo o histórico necessário para a regra do Ko e para pontuação final.

import { createEmptyBoard, boardToString } from "./board.js";
import { BLACK, oppositeColor, applyMove, calculateScore } from "./rules.js";

export function createGame() {
  const board = createEmptyBoard();

  return {
    board,
    currentPlayer: BLACK,
    moveHistory: [],
    // Pedras capturadas POR cada jogador (prisioneiros conquistados), não perdidas.
    capturedBlack: 0,
    capturedWhite: 0,
    gameStatus: "playing", // "playing" | "finished"
    finishReason: null, // "resignation" | "two-passes"
    result: null,
    boardHistory: [boardToString(board)],
    passStreak: 0,
  };
}

export function playMove(game, row, col) {
  if (game.gameStatus !== "playing") {
    return { success: false, reason: "A partida já terminou." };
  }

  const color = game.currentPlayer;
  const outcome = applyMove(game.board, row, col, color);

  if (!outcome.valid) {
    return { success: false, reason: outcome.reason };
  }

  const candidateKey = boardToString(outcome.board);
  const koKey = game.boardHistory[game.boardHistory.length - 2];

  if (koKey !== undefined && candidateKey === koKey) {
    return { success: false, reason: "Jogada proibida pela regra do Ko." };
  }

  game.board = outcome.board;
  game.boardHistory.push(candidateKey);
  game.passStreak = 0;

  if (color === BLACK) {
    game.capturedBlack += outcome.capturedCount;
  } else {
    game.capturedWhite += outcome.capturedCount;
  }

  game.moveHistory.push({ type: "move", color, row, col, captured: outcome.capturedCount });
  game.currentPlayer = oppositeColor(color);

  return { success: true, captured: outcome.capturedCount };
}

export function passTurn(game) {
  if (game.gameStatus !== "playing") {
    return { success: false, reason: "A partida já terminou." };
  }

  game.moveHistory.push({ type: "pass", color: game.currentPlayer });
  game.passStreak += 1;

  if (game.passStreak >= 2) {
    game.gameStatus = "finished";
    game.finishReason = "two-passes";
    game.result = calculateScore(game.board);
    return { success: true, finished: true };
  }

  game.currentPlayer = oppositeColor(game.currentPlayer);
  return { success: true, finished: false };
}

export function resign(game) {
  if (game.gameStatus !== "playing") {
    return { success: false, reason: "A partida já terminou." };
  }

  const resignedColor = game.currentPlayer;
  const winner = oppositeColor(resignedColor);

  game.moveHistory.push({ type: "resign", color: resignedColor });
  game.gameStatus = "finished";
  game.finishReason = "resignation";
  game.result = { winner, resignedColor };

  return { success: true };
}

export function restartGame() {
  return createGame();
}
