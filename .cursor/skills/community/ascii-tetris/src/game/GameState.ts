export class GameState {
  private score: number;
  private lines: number;
  private level: number;
  private gameOver: boolean;
  private isPaused: boolean;

  constructor() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
  }

  public updateScore(clearedLines: number): void {
    if (clearedLines > 0) {
      this.score += clearedLines * 100;
      this.lines += clearedLines;
      this.level = 1 + Math.floor(this.lines / 10);
    }
  }

  public reset(): void {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  public setGameOver(): void {
    this.gameOver = true;
  }

  public getScore(): number {
    return this.score;
  }

  public getLines(): number {
    return this.lines;
  }

  public getLevel(): number {
    return this.level;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}
