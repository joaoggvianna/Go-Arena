// Camada de interface: liga o estado da partida (game.js) ao DOM.
// Nenhuma regra do jogo mora aqui — apenas leitura de estado e renderização.

import { BOARD_SIZE } from "./board.js";
import { BLACK, WHITE } from "./rules.js";
import { createGame, playMove, passTurn, resign, restartGame } from "./game.js";

const STAR_POINTS = new Set(["2,2", "2,6", "6,2", "6,6", "4,4"]);

let game = createGame();

const boardEl = document.getElementById("board");
const currentPlayerEl = document.getElementById("current-player");
const gameStatusEl = document.getElementById("game-status");
const capturedBlackEl = document.getElementById("captured-black");
const capturedWhiteEl = document.getElementById("captured-white");
const messageEl = document.getElementById("message");
const resultEl = document.getElementById("result");

const btnPass = document.getElementById("btn-pass");
const btnResign = document.getElementById("btn-resign");
const btnRestart = document.getElementById("btn-restart");

function playerLabel(color) {
  return color === BLACK ? "Preto" : "Branco";
}

function buildBoard() {
  boardEl.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const point = document.createElement("button");
      point.type = "button";
      point.className = "point";
      point.dataset.row = String(row);
      point.dataset.col = String(col);
      point.setAttribute("aria-label", `Interseção linha ${row + 1}, coluna ${col + 1}`);

      if (STAR_POINTS.has(`${row},${col}`)) {
        const hoshi = document.createElement("span");
        hoshi.className = "hoshi";
        point.appendChild(hoshi);
      }

      const stone = document.createElement("span");
      stone.className = "stone-slot";
      point.appendChild(stone);

      point.addEventListener("click", () => handlePointClick(row, col));
      boardEl.appendChild(point);
    }
  }
}

function handlePointClick(row, col) {
  const outcome = playMove(game, row, col);
  if (!outcome.success) {
    showMessage(outcome.reason);
    return;
  }
  clearMessage();
  render();
}

function handlePass() {
  const outcome = passTurn(game);
  if (!outcome.success) {
    showMessage(outcome.reason);
    return;
  }
  clearMessage();
  render();
}

function handleResign() {
  const outcome = resign(game);
  if (!outcome.success) {
    showMessage(outcome.reason);
    return;
  }
  clearMessage();
  render();
}

function handleRestart() {
  game = restartGame();
  clearMessage();
  render();
}

function showMessage(text) {
  messageEl.textContent = text;
}

function clearMessage() {
  messageEl.textContent = "";
}

function renderStones() {
  boardEl.querySelectorAll(".point").forEach((point) => {
    const row = Number(point.dataset.row);
    const col = Number(point.dataset.col);
    const value = game.board[row][col];

    const slot = point.querySelector(".stone-slot");
    slot.className = "stone-slot";
    if (value === BLACK) slot.classList.add("black");
    if (value === WHITE) slot.classList.add("white");
  });
}

function renderResult() {
  resultEl.hidden = false;

  if (game.finishReason === "resignation") {
    resultEl.innerHTML = `
      <h3>${playerLabel(game.result.winner)} venceu por desistência</h3>
      <p>${playerLabel(game.result.resignedColor)} desistiu da partida.</p>
    `;
    return;
  }

  const { blackScore, whiteScore, blackTerritory, whiteTerritory, winner, difference } = game.result;
  const winnerText = winner ? `${playerLabel(winner)} venceu por ${difference} pontos` : "Empate";

  resultEl.innerHTML = `
    <h3>Partida encerrada por dois passes</h3>
    <p>Preto: <strong>${blackScore}</strong> pontos (território: ${blackTerritory})</p>
    <p>Branco: <strong>${whiteScore}</strong> pontos (território: ${whiteTerritory} + komi 6.5)</p>
    <p class="result-winner">${winnerText}</p>
  `;
}

function render() {
  renderStones();
  currentPlayerEl.textContent = playerLabel(game.currentPlayer);
  capturedBlackEl.textContent = String(game.capturedBlack);
  capturedWhiteEl.textContent = String(game.capturedWhite);

  const isPlaying = game.gameStatus === "playing";
  gameStatusEl.textContent = isPlaying ? "Em andamento" : "Partida encerrada";
  btnPass.disabled = !isPlaying;
  btnResign.disabled = !isPlaying;

  resultEl.hidden = true;
  if (!isPlaying) {
    renderResult();
  }
}

btnPass.addEventListener("click", handlePass);
btnResign.addEventListener("click", handleResign);
btnRestart.addEventListener("click", handleRestart);

buildBoard();
render();
