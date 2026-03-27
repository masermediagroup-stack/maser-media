interface PieceShape {
  shape: number[][];
}

export class Piece {
  private static readonly PIECES: PieceShape[] = [
    // O
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
    },
    // I
    {
      shape: [[1, 1, 1, 1]],
    },
    // Z
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
    // L
    {
      shape: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
    },
    {
      shape: [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
    },
    // T
    {
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
    },
  ];

  private shape: number[][];

  constructor(shape: number[][] | null = null) {
    this.shape = shape
      ? JSON.parse(JSON.stringify(shape))
      : this.getRandomPiece().shape;
  }

  private getRandomPiece(): PieceShape {
    const idx = Math.floor(Math.random() * Piece.PIECES.length);
    return JSON.parse(JSON.stringify(Piece.PIECES[idx]));
  }

  public rotate(): void {
    // Clockwise rotation
    this.shape = this.shape[0].map((_, i) =>
      this.shape.map((row) => row[i]).reverse()
    );
  }

  public getWidth(): number {
    return this.shape[0].length;
  }

  public getHeight(): number {
    return this.shape.length;
  }

  public getShape(): number[][] {
    return this.shape;
  }
}
