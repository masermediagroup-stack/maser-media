import { Piece } from './Piece';

interface Position {
  row: number;
  col: number;
}

export class Board {
  private readonly rows: number;
  private readonly cols: number;
  private readonly empty: number;
  private grid: number[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.empty = 0;
    this.grid = Array.from({ length: rows }, () =>
      Array(cols).fill(this.empty)
    );
  }

  public isValidMove(shape: number[][], row: number, col: number): boolean {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const nr = row + r;
          const nc = col + c;
          if (
            nr < 0 ||
            nr >= this.rows ||
            nc < 0 ||
            nc >= this.cols ||
            this.grid[nr][nc] !== this.empty
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  public mergePiece(piece: Piece, position: Position): void {
    const shape = piece.getShape();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          this.grid[position.row + r][position.col + c] = 1;
        }
      }
    }
  }

  public clearLines(): number {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every((cell) => cell !== this.empty)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(this.empty));
        cleared++;
        r++;
      }
    }
    return cleared;
  }

  public reset(): void {
    this.grid = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(this.empty)
    );
  }

  public getCell(row: number, col: number): number {
    return this.grid[row][col];
  }

  public getGrid(): number[][] {
    return this.grid;
  }
}
