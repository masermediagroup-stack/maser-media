import { Board } from './Board';
import { GameState } from './GameState';
import { InputHandler } from './InputHandler';
import { Piece } from './Piece';
import { Sound } from './Sound';
import { GameMessage, Renderer } from './Renderer';

interface Position {
  row: number;
  col: number;
}

export class Game {
  private readonly ROWS: number;
  private readonly COLS: number;

  private board: Board;
  private gameState: GameState;
  private renderer: Renderer;
  private inputHandler: InputHandler;

  private current: Piece | null;
  private next: Piece | null;
  private position: Position | null;
  private isStarted: boolean;
  private tickInterval: number | null;
  private currentLevel: number;
  private isClearingLines: boolean;

  constructor(renderer: Renderer) {
    this.ROWS = 25;
    this.COLS = 10;

    this.board = new Board(this.ROWS, this.COLS);
    this.gameState = new GameState();
    this.renderer = renderer;
    this.inputHandler = new InputHandler(this);

    this.current = null;
    this.next = null;
    this.position = null;
    this.isStarted = false;
    this.tickInterval = null;
    this.currentLevel = 1;
    this.isClearingLines = false;
  }

  /**
   * Calculate tick speed based on current level using classic Tetris progression
   * Level 1: 800ms, Level 2: 717ms, Level 3: 633ms, etc.
   * Formula: max(50, 800 - (level - 1) * 83)
   */
  private getTickSpeed(): number {
    return Math.max(50, 800 - (this.currentLevel - 1) * 83);
  }

  /**
   * Update the tick interval with the current speed
   */
  private updateTickSpeed(): void {
    if (this.tickInterval) {
      window.clearInterval(this.tickInterval);
      this.tickInterval = window.setInterval(() => this.tick(), this.getTickSpeed());
    }
  }

  public start(): void {
    if (!this.isStarted) {
      const startScreen = document.getElementById('start-screen');
      const tetrisContainer = document.getElementById('tetris-container');

      if (startScreen && tetrisContainer) {
        startScreen.style.display = 'none';
        tetrisContainer.style.display = 'flex';
      }

      // Initialize sound on user gesture start
      Sound.init();

      this.isStarted = true;
      this.spawnPiece();
      this.tickInterval = window.setInterval(() => this.tick(), this.getTickSpeed());
    }
  }

  private spawnPiece(): void {
    this.current = this.next || new Piece();
    this.next = new Piece();
    this.position = {
      row: 0,
      col: Math.floor((this.COLS - this.current.getWidth()) / 2),
    };

    if (
      !this.board.isValidMove(
        this.current.getShape(),
        this.position.row,
        this.position.col
      )
    ) {
      this.gameState.setGameOver();
      this.inputHandler.updatePauseButtonText();
    }
  }

  private tick(): void {
    if (this.gameState.isGameOver() || this.gameState.getIsPaused()) return;

    // If a line clear animation is in progress, only re-render to animate and skip logic
    if (this.isClearingLines) {
      this.render();
      return;
    }

    if (
      this.board.isValidMove(
        this.current!.getShape(),
        this.position!.row + 1,
        this.position!.col
      )
    ) {
      this.position!.row++;
    } else {
      this.board.mergePiece(this.current!, this.position!);

      // Find lines that are about to be cleared
      const linesToClear: number[] = [];
      for (let r = this.ROWS - 1; r >= 0; r--) {
        if (this.board.getGrid()[r].every((cell) => cell !== 0)) {
          linesToClear.push(r);
        }
      }

      if (linesToClear.length > 0) {
        this.isClearingLines = true;
        // Start the animation
        this.renderer.setLinesToClear(linesToClear);
        this.render();

        // Wait for animation to complete before clearing
        setTimeout(() => {
          const clearedLines = this.board.clearLines();
          this.gameState.updateScore(clearedLines);
          // Play retro beep(s) for line clear
          Sound.playLineClear(clearedLines);
          
          // Check if level changed and update speed accordingly
          const newLevel = this.gameState.getLevel();
          if (newLevel !== this.currentLevel) {
            this.currentLevel = newLevel;
            this.updateTickSpeed();
            
            // Show level up message briefly
            this.renderer.setCustomMessage(GameMessage.LEVEL_UP, 2000);
          }
          
          this.renderer.setLinesToClear([]);
          this.isClearingLines = false;
          this.spawnPiece();
          this.render();
        }, 300);
        return;
      } else {
        this.spawnPiece();
      }
    }
    this.render();
  }

  public move(dx: number): void {
    if (this.gameState.getIsPaused()) return;
    
    if (
      this.board.isValidMove(
        this.current!.getShape(),
        this.position!.row,
        this.position!.col + dx
      )
    ) {
      this.position!.col += dx;
      this.render();
    }
  }

  public moveDown(): void {
    if (this.gameState.getIsPaused()) return;
    
    if (
      this.board.isValidMove(
        this.current!.getShape(),
        this.position!.row + 1,
        this.position!.col
      )
    ) {
      this.position!.row++;
      this.render();
    }
  }

  public drop(): void {
    if (this.gameState.getIsPaused()) return;
    
    while (
      this.board.isValidMove(
        this.current!.getShape(),
        this.position!.row + 1,
        this.position!.col
      )
    ) {
      this.position!.row++;
    }
    this.tick();
  }

  public rotatePiece(): void {
    if (this.gameState.getIsPaused()) return;
    
    this.current!.rotate();
    if (
      !this.board.isValidMove(
        this.current!.getShape(),
        this.position!.row,
        this.position!.col
      )
    ) {
      // If rotation is invalid, rotate back
      this.current!.rotate();
      this.current!.rotate();
      this.current!.rotate();
    }
    this.render();
  }

  public togglePause(): void {
    this.gameState.togglePause();
    this.render();
  }

  public restart(): void {
    // Clear existing interval
    if (this.tickInterval) {
      window.clearInterval(this.tickInterval);
    }

    this.gameState.reset();
    this.board.reset();
    this.current = null;
    this.next = null;
    this.position = null;
    this.currentLevel = 1;
    this.isClearingLines = false;
    this.spawnPiece();
    // Start new interval
    this.tickInterval = window.setInterval(() => this.tick(), this.getTickSpeed());
    this.render();
  }

  private render(): void {
    this.renderer.render(
      this.board,
      this.current,
      this.next!,
      this.position!,
      this.gameState
    );
  }

  public getIsStarted(): boolean {
    return this.isStarted;
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}
