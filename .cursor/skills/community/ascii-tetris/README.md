# ASCII Tetris

A modern take on the classic Tetris game, implemented in ASCII art. This project is inspired by the original Tetris game created by Alexey Pajitnov in 1984, which has become one of the most iconic and beloved video games of all time.

**Note: This project was built primarily as an exercise in AI-assisted development using Cursor, exploring effective prompting techniques and instruction-giving to LLMs for software development.**

[Play now!](https://michaelmov.github.io/ascii-tetris/)

This implementation is built using vanilla web technologies:

- **HTML5** for the game structure
- **CSS3** for styling and animations
- **TypeScript** for game logic and mechanics

The game is designed to be lightweight and run smoothly in any modern web browser without requiring any external dependencies or frameworks. The ASCII art rendering is achieved through careful manipulation of the DOM and CSS styling, creating a nostalgic terminal-like experience while maintaining modern web standards.

## Features

- Classic Tetris gameplay in ASCII art
- Score tracking and level progression
- Next piece preview
- Increasing difficulty with level progression
- Pause functionality
- Game over detection

### Controls

- Left Arrow: Move piece left
- Right Arrow: Move piece right
- Down Arrow: Move piece down faster
- Up Arrow: Rotate piece
- Space: Hard drop (instantly drops the piece)
- P: Pause/Resume game
- Q: Quit game

## Building the Game

To install dependencies:

```bash
npm install
```

To build the game for production:

```bash
npm run build
```

## Development

To run the game in development mode:

```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Tetris game created by Alexey Pajitnov in 1984
- Inspired by the classic gameplay mechanics and timeless appeal of Tetris
