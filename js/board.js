// Representação e utilidades básicas do tabuleiro.
// Um tabuleiro é uma matriz 9x9 de células, cada uma null (vazia), "black" ou "white".

export const BOARD_SIZE = 9;

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

export function isOnBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getNeighbors(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ].filter(([r, c]) => isOnBoard(r, c));
}

// Serializa o tabuleiro em texto para comparações de igualdade (usado na regra do Ko).
export function boardToString(board) {
  return board.map((row) => row.map((cell) => cell || ".").join("")).join("/");
}
