// Motor de regras do Go: grupos, liberdades, captura, suicídio e pontuação.
// Este módulo não sabe nada sobre DOM — só trabalha com a matriz do tabuleiro.

import { BOARD_SIZE, isOnBoard, getNeighbors, cloneBoard } from "./board.js";

export const BLACK = "black";
export const WHITE = "white";
export const KOMI = 6.5;

export function oppositeColor(color) {
  return color === BLACK ? WHITE : BLACK;
}

// Retorna o grupo de pedras conectadas ortogonalmente a partir de (row, col)
// e o conjunto de liberdades (interseções vazias adjacentes ao grupo).
export function getGroup(board, row, col) {
  const color = board[row][col];
  if (!color) {
    return { stones: [], liberties: new Set() };
  }

  const stones = [];
  const liberties = new Set();
  const visited = new Set([`${row},${col}`]);
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    stones.push([r, c]);

    for (const [nr, nc] of getNeighbors(r, c)) {
      const neighborColor = board[nr][nc];
      const key = `${nr},${nc}`;

      if (neighborColor === null) {
        liberties.add(key);
      } else if (neighborColor === color && !visited.has(key)) {
        visited.add(key);
        stack.push([nr, nc]);
      }
    }
  }

  return { stones, liberties };
}

function removeStones(board, stones) {
  for (const [r, c] of stones) {
    board[r][c] = null;
  }
  return stones.length;
}

// Tenta jogar uma pedra de `color` em (row, col).
// Não modifica `board`; retorna um novo tabuleiro em caso de sucesso.
export function applyMove(board, row, col, color) {
  if (!isOnBoard(row, col)) {
    return { valid: false, reason: "Posição fora do tabuleiro." };
  }

  if (board[row][col] !== null) {
    return { valid: false, reason: "Essa interseção já está ocupada." };
  }

  const nextBoard = cloneBoard(board);
  nextBoard[row][col] = color;

  // Captura: remove grupos adversários adjacentes que ficaram sem liberdades.
  const opponent = oppositeColor(color);
  let capturedCount = 0;

  for (const [nr, nc] of getNeighbors(row, col)) {
    if (nextBoard[nr][nc] === opponent) {
      const group = getGroup(nextBoard, nr, nc);
      if (group.liberties.size === 0) {
        capturedCount += removeStones(nextBoard, group.stones);
      }
    }
  }

  // Suicídio: depois das capturas, o próprio grupo precisa ter ao menos uma liberdade.
  const ownGroup = getGroup(nextBoard, row, col);
  if (ownGroup.liberties.size === 0) {
    return { valid: false, reason: "Jogada suicida: o grupo ficaria sem liberdades." };
  }

  return { valid: true, board: nextBoard, capturedCount };
}

// Pontuação por área (estilo chinês): pedras no tabuleiro + território vazio
// cercado exclusivamente por um único jogador. Komi aplicado ao Branco.
//
// Limitação conhecida do MVP: não há remoção de "pedras mortas". Uma pedra
// deixada em território adversário sem ser capturada conta como pedra viva.
// Para resultados corretos, jogadores devem capturar grupos claramente mortos
// antes de encerrar a partida com dois passes.
export function calculateScore(board) {
  let blackStones = 0;
  let whiteStones = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === BLACK) blackStones++;
      else if (board[r][c] === WHITE) whiteStones++;
    }
  }

  const { blackTerritory, whiteTerritory } = calculateTerritory(board);

  const blackScore = blackStones + blackTerritory;
  const whiteScore = whiteStones + whiteTerritory + KOMI;

  let winner = null;
  if (blackScore > whiteScore) winner = BLACK;
  else if (whiteScore > blackScore) winner = WHITE;

  return {
    blackStones,
    whiteStones,
    blackTerritory,
    whiteTerritory,
    blackScore,
    whiteScore,
    winner,
    difference: Math.abs(blackScore - whiteScore),
  };
}

// Território = regiões vazias conectadas cujas pedras vizinhas são todas da mesma cor.
function calculateTerritory(board) {
  const visited = new Set();
  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (board[r][c] !== null || visited.has(key)) continue;

      const region = [];
      const borderColors = new Set();
      const stack = [[r, c]];
      visited.add(key);

      while (stack.length > 0) {
        const [cr, cc] = stack.pop();
        region.push([cr, cc]);

        for (const [nr, nc] of getNeighbors(cr, cc)) {
          const value = board[nr][nc];
          const nKey = `${nr},${nc}`;

          if (value === null) {
            if (!visited.has(nKey)) {
              visited.add(nKey);
              stack.push([nr, nc]);
            }
          } else {
            borderColors.add(value);
          }
        }
      }

      if (borderColors.size === 1) {
        const [owner] = borderColors;
        if (owner === BLACK) blackTerritory += region.length;
        else whiteTerritory += region.length;
      }
      // Regiões que tocam as duas cores (ou nenhuma) são neutras e não contam.
    }
  }

  return { blackTerritory, whiteTerritory };
}
