# ASCII Tetris

A TypeScript-based ASCII Tetris game built with Vite.

## Development Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## Architecture

- **Game Engine**: Core game logic in `src/game/`
- **Rendering**: ASCII-based rendering system
- **Input**: Keyboard input handling
- **Sound**: Audio feedback system

## Key Components

- `main.ts` - Application entry point
- `Game.ts` - Main game controller
- `Board.ts` - Game board management
- `Piece.ts` - Tetris piece logic
- `Renderer.ts` - ASCII rendering
- `InputHandler.ts` - User input processing
- `Sound.ts` - Audio system