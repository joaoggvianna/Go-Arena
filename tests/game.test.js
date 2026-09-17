// Testes do motor de regras do Go Arena (MVP 1).
// Executar com: npm test  (usa o test runner nativo do Node, sem dependências).

import test from "node:test";
import assert from "node:assert/strict";

import { createEmptyBoard, boardToString } from "../js/board.js";
import { BLACK, WHITE } from "../js/rules.js";
import { createGame, playMove, passTurn, resign, restartGame } from "../js/game.js";

// Constrói um objeto de partida com um tabuleiro pré-definido, no mesmo
// formato retornado por createGame(). Útil para testar cenários específicos
// (captura, suicídio, ko) sem precisar jogar dezenas de jogadas antes.
function createTestGame(stones, currentPlayer) {
  const board = createEmptyBoard();
  for (const [row, col, color] of stones) {
    board[row][col] = color;
  }

  return {
    board,
    currentPlayer,
    moveHistory: [],
    capturedBlack: 0,
    capturedWhite: 0,
    gameStatus: "playing",
    finishReason: null,
    result: null,
    boardHistory: [boardToString(board)],
    passStreak: 0,
  };
}

test("jogada em posição vazia coloca a pedra e passa a vez", () => {
  const game = createGame();
  const outcome = playMove(game, 4, 4);

  assert.equal(outcome.success, true);
  assert.equal(game.board[4][4], BLACK);
  assert.equal(game.currentPlayer, WHITE);
});

test("jogada em posição ocupada é rejeitada", () => {
  const game = createGame();
  playMove(game, 4, 4); // preto joga

  const outcome = playMove(game, 4, 4); // branco tenta a mesma casa

  assert.equal(outcome.success, false);
  assert.equal(game.board[4][4], BLACK);
  assert.equal(game.currentPlayer, WHITE); // vez não deve ter avançado
});

test("turnos alternam entre preto e branco a cada jogada", () => {
  const game = createGame();

  playMove(game, 0, 0);
  assert.equal(game.currentPlayer, WHITE);

  playMove(game, 0, 1);
  assert.equal(game.currentPlayer, BLACK);

  playMove(game, 1, 0);
  assert.equal(game.currentPlayer, WHITE);
});

test("captura uma única pedra adversária sem liberdades", () => {
  const game = createTestGame(
    [
      [1, 1, WHITE],
      [0, 1, BLACK],
      [1, 0, BLACK],
      [1, 2, BLACK],
    ],
    BLACK
  );

  const outcome = playMove(game, 2, 1); // última liberdade do branco

  assert.equal(outcome.success, true);
  assert.equal(outcome.captured, 1);
  assert.equal(game.board[1][1], null);
  assert.equal(game.capturedBlack, 1);
});

test("captura um grupo inteiro de pedras conectadas", () => {
  const game = createTestGame(
    [
      [1, 1, WHITE],
      [1, 2, WHITE],
      [0, 1, BLACK],
      [0, 2, BLACK],
      [1, 0, BLACK],
      [1, 3, BLACK],
      [2, 1, BLACK],
    ],
    BLACK
  );

  const outcome = playMove(game, 2, 2); // última liberdade do grupo branco

  assert.equal(outcome.success, true);
  assert.equal(outcome.captured, 2);
  assert.equal(game.board[1][1], null);
  assert.equal(game.board[1][2], null);
  assert.equal(game.capturedBlack, 2);
});

test("suicídio é rejeitado quando não captura nada", () => {
  const game = createTestGame(
    [
      [0, 1, BLACK],
      [1, 0, BLACK],
      [1, 2, BLACK],
      [2, 1, BLACK],
    ],
    WHITE
  );

  const outcome = playMove(game, 1, 1); // cercado por preto, sem capturar ninguém

  assert.equal(outcome.success, false);
  assert.equal(game.board[1][1], null);
});

test("suicídio aparente é permitido quando a jogada captura e ganha liberdade", () => {
  // Mesma forma do teste de ko: a pedra preta em (1,2) só tem espaço
  // porque captura a pedra branca em (1,1), abrindo uma liberdade.
  const game = createTestGame(
    [
      [0, 1, BLACK],
      [0, 2, WHITE],
      [1, 0, BLACK],
      [1, 1, WHITE],
      [1, 3, WHITE],
      [2, 1, BLACK],
      [2, 2, WHITE],
    ],
    BLACK
  );

  const outcome = playMove(game, 1, 2);

  assert.equal(outcome.success, true);
  assert.equal(outcome.captured, 1);
  assert.equal(game.board[1][1], null); // pedra branca capturada
  assert.equal(game.board[1][2], BLACK);
});

test("regra do Ko impede recriar imediatamente a posição anterior", () => {
  const game = createTestGame(
    [
      [0, 1, BLACK],
      [0, 2, WHITE],
      [1, 0, BLACK],
      [1, 1, WHITE],
      [1, 3, WHITE],
      [2, 1, BLACK],
      [2, 2, WHITE],
    ],
    BLACK
  );

  const capture = playMove(game, 1, 2); // preto captura a pedra branca em (1,1)
  assert.equal(capture.success, true);

  const recapture = playMove(game, 1, 1); // branco tentaria recriar a posição original
  assert.equal(recapture.success, false);
  assert.match(recapture.reason, /Ko/i);
});

test("passar turno troca o jogador e registra no histórico", () => {
  const game = createGame();
  const outcome = passTurn(game);

  assert.equal(outcome.success, true);
  assert.equal(outcome.finished, false);
  assert.equal(game.currentPlayer, WHITE);
  assert.deepEqual(game.moveHistory.at(-1), { type: "pass", color: BLACK });
});

test("dois passes consecutivos encerram a partida com pontuação", () => {
  const game = createGame();

  passTurn(game); // preto passa
  const outcome = passTurn(game); // branco passa

  assert.equal(outcome.finished, true);
  assert.equal(game.gameStatus, "finished");
  assert.equal(game.finishReason, "two-passes");
  assert.ok(game.result);
  assert.equal(game.result.whiteScore, 6.5); // tabuleiro vazio: só komi conta
});

test("desistência encerra a partida imediatamente e declara o adversário vencedor", () => {
  const game = createGame(); // preto está na vez

  const outcome = resign(game);

  assert.equal(outcome.success, true);
  assert.equal(game.gameStatus, "finished");
  assert.equal(game.finishReason, "resignation");
  assert.equal(game.result.winner, WHITE);
  assert.equal(game.result.resignedColor, BLACK);
});

test("reiniciar a partida limpa tabuleiro, capturas e histórico", () => {
  const game = createGame();
  playMove(game, 0, 0);
  playMove(game, 0, 1);

  const restarted = restartGame();

  assert.deepEqual(restarted.board, createEmptyBoard());
  assert.equal(restarted.currentPlayer, BLACK);
  assert.equal(restarted.capturedBlack, 0);
  assert.equal(restarted.capturedWhite, 0);
  assert.equal(restarted.moveHistory.length, 0);
  assert.equal(restarted.gameStatus, "playing");
});
