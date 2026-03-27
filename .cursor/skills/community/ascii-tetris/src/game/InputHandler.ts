import { Game } from './Game';

export class InputHandler {
  private game: Game;
  private touchStartX: number | null;
  private touchStartY: number | null;
  private readonly SWIPE_THRESHOLD = 50;

  constructor(game: Game) {
    this.game = game;
    this.touchStartX = null;
    this.touchStartY = null;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard controls
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.game.getIsStarted()) {
        this.game.start();
        return;
      }

      switch (e.key) {
        case 'r':
        case 'R':
          this.game.restart();
          return;
      }

      if (this.game.getGameState().isGameOver()) return;

      switch (e.key) {
        case 'ArrowLeft':
        case '7':
          this.game.move(-1);
          break;
        case 'ArrowRight':
        case '9':
          this.game.move(1);
          break;
        case 'ArrowUp':
        case '8':
          this.game.rotatePiece();
          break;
        case 'ArrowDown':
        case '4':
          this.game.moveDown();
          break;
        case ' ':
        case '5':
          this.game.drop();
          break;
        case 'p':
        case 'P':
          this.game.togglePause();
          this.updatePauseButtonText();
          break;
      }
    });

    // Pause button click handler
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
      // Add both click and touchend listeners
      pauseButton.addEventListener('click', () => this.handleButtonClick());
      pauseButton.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent the click event from firing
        this.handleButtonClick();
      });
    }

    // Touch controls
    document.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        // Don't handle touch events on links
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          return;
        }
        
        if (!this.game.getIsStarted() || this.game.getGameState().isGameOver())
          return;

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      (e: TouchEvent) => {
        // Don't handle touch events on links
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          return;
        }
        
        if (
          !this.game.getIsStarted() ||
          !this.touchStartX ||
          !this.touchStartY ||
          this.game.getGameState().isGameOver()
        )
          return;

        // Check if the tap was on the pause button
        const pauseButton = document.getElementById('pause-button');
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        if (pauseButton) {
          const rect = pauseButton.getBoundingClientRect();
          if (
            touchEndX >= rect.left &&
            touchEndX <= rect.right &&
            touchEndY >= rect.top &&
            touchEndY <= rect.bottom
          ) {
            // Tap was on pause button, don't rotate
            this.touchStartX = null;
            this.touchStartY = null;
            return;
          }
        }

        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;

        // Determine if it's a swipe or a tap
        if (
          Math.abs(deltaX) < this.SWIPE_THRESHOLD &&
          Math.abs(deltaY) < this.SWIPE_THRESHOLD
        ) {
          // Tap - rotate piece
          this.game.rotatePiece();
        } else {
          // Handle swipes
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
              this.game.move(1); // Right
            } else {
              this.game.move(-1); // Left
            }
          } else {
            // Vertical swipe
            if (deltaY > 0) {
              this.game.drop(); // Hard drop on downward swipe
            } else {
              this.game.moveDown(); // Soft drop on upward swipe
            }
          }
        }

        this.touchStartX = null;
        this.touchStartY = null;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        // Don't handle touch events on links
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          return;
        }
        
        if (!this.game.getIsStarted() || this.game.getGameState().isGameOver())
          return;
      },
      { passive: true }
    );
  }

  public updatePauseButtonText(): void {
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
      if (this.game.getGameState().isGameOver()) {
        pauseButton.textContent = 'RESTART';
      } else {
        pauseButton.textContent = this.game.getGameState().getIsPaused()
          ? 'RESUME'
          : 'PAUSE';
      }
    }
  }

  private handleButtonClick(): void {
    if (this.game.getGameState().isGameOver()) {
      this.game.restart();
    } else if (
      this.game.getIsStarted() &&
      !this.game.getGameState().isGameOver()
    ) {
      this.game.togglePause();
    }
    this.updatePauseButtonText();
  }
}
