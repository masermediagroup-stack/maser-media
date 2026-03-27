# GameMaker Skills for Claude Code

Comprehensive GameMaker Studio 2 and GML development skills for Claude Code.

This repository provides expert-level GameMaker/GML knowledge to Claude Code, covering everything from beginner basics to advanced topics like shaders, networking, and platform-specific development.

---

## Skills Included

### gamemaker-expert

Expert-level GameMaker Studio 2 and GML knowledge covering:

- **Object Creation Workflow**: Complete 4-step process with templates
- **GML Language Essentials**: Variables, data types, operators, control flow
- **Data Structures**: Structs, arrays, ds_list, ds_map, ds_grid, memory management
- **File System**: JSON handling, datafiles/ structure, save/load systems
- **Event System**: Execution order, event types, common patterns
- **Drawing & Graphics**: Sprites, surfaces, shaders, particles, tilemaps
- **Collision & Movement**: Detection algorithms, optimization techniques
- **Performance Optimization**: Draw call reduction, object pooling, profiling
- **Networking**: Client-server architecture, packet structure, latency compensation
- **Platform-Specific Development**: Mobile, console, HTML5, desktop features
- **Advanced Topics**: Shader programming (GLSL ES), lighting systems, normal mapping

---

## Installation

### Option 1: Install from GitHub (Recommended)

1. Open Claude Code
2. Add this repository to your plugin marketplace:
   ```
   /plugin marketplace add leihaht/gamemaker-skills
   ```
3. Install the gamemaker-expert skill:
   ```
   /plugin install gamemaker-expert@gamemaker-skills
   ```

### Option 2: Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/leihaht/gamemaker-skills.git
   ```

2. Copy the `gamemaker-expert` directory to your Claude Code plugins folder:
   - Windows: `%APPDATA%\Claude\plugins\`
   - macOS: `~/Library/Application Support/Claude/plugins/`
   - Linux: `~/.config/Claude/plugins/`

3. Restart Claude Code

---

## Usage

Once installed, the gamemaker-expert skill will automatically provide context when you're working on GameMaker projects.

### Activating the Skill

The skill activates automatically when Claude detects GameMaker-related questions or files. You can also manually invoke it:

```
/skill gamemaker-expert
```

### Example Prompts

**Object Creation**:
```
Create a new enemy object called objEnemyGoblin with health, movement, and collision
```

**Code Explanation**:
```
Explain how the collision detection works in this GML code: [paste code]
```

**Debugging**:
```
Why is my shader not rendering anything? Here's my fragment shader: [paste shader]
```

**Architecture Guidance**:
```
Should I use a struct or an object for storing item data in my inventory system?
```

**Performance Optimization**:
```
My game is running slow when there are 100+ enemies. How can I optimize this?
```

**Advanced Features**:
```
How do I implement client-side prediction for my multiplayer game?
```

---

## Documentation

The gamemaker-expert skill includes comprehensive reference documentation:

### [SKILL.md](gamemaker-expert/SKILL.md)
Main skill file with core GameMaker/GML knowledge and quick reference guides.

### [GML_REFERENCE.md](gamemaker-expert/references/GML_REFERENCE.md)
Complete GML function reference organized by category:
- Drawing functions
- Math functions
- String functions
- Instance functions
- Data structures
- File handling
- Collision & movement
- Input functions
- Audio, networking, shaders, surfaces, particles, buffers
- Common code patterns (inventory, state machines, dialogue, save/load, camera)
- Struct vs Object decision tree

### [COMMON_PITFALLS.md](gamemaker-expert/references/COMMON_PITFALLS.md)
Common GameMaker mistakes and solutions:
- Object creation issues (missing .yy, wrong event names, JSON errors)
- File system issues (datafiles/ subdirectories, missing .yyp registration)
- GML syntax traps (ternary operators, variable scope, array bounds)
- Memory management (ds_* leaks, surface leaks, buffer leaks)
- Performance issues (excessive collision checks, draw call optimization)
- Collision detection problems
- Networking issues
- Shader issues
- Event order confusion
- Common logic errors

### [QUICK_REFERENCE.md](gamemaker-expert/references/QUICK_REFERENCE.md)
Fast lookup tables and code snippets:
- Event types & numbers
- Keyboard constants
- Mouse constants
- Color constants & functions
- Blend modes
- Common GML patterns (distance checks, collision, timers, screen shake)
- Frequently used functions
- IDE version reference

### [ADVANCED_TOPICS.md](gamemaker-expert/references/ADVANCED_TOPICS.md)
Advanced GameMaker development:
- **Shader Programming**: GLSL ES syntax, uniforms, common effects (grayscale, outline, wave, glow), multi-pass rendering, debugging
- **Networking Patterns**: Client-server architecture, packet structure, latency compensation, lobby systems
- **Platform-Specific Development**: Mobile (touch, accelerometer, IAP), Console (gamepad, achievements), HTML5 (JavaScript execution, local storage), Desktop (file dialogs, registry, command line)
- **Advanced Graphics**: 2D lighting systems, normal mapping, particle systems, procedural tilemaps
- **Performance Profiling**: Built-in profiler, manual profiling, optimization checklists, memory leak detection

---

## Features

### Automatic Context Awareness

The skill automatically recognizes GameMaker-related questions and provides relevant guidance without needing to be explicitly invoked.

### Beginner to Advanced Coverage

Whether you're just starting with GameMaker or building complex multiplayer games with custom shaders, the skill has you covered.

### Code Templates & Examples

Ready-to-use code snippets for common patterns:
- Inventory systems
- State machines
- Dialogue systems
- Save/load systems
- Camera systems
- Object pooling
- Networking (client/server)
- Shader effects
- Lighting systems
- Particle systems

### Platform-Specific Guidance

Targeted advice for deploying to different platforms:
- Mobile (iOS/Android): Touch input, accelerometer, IAP
- Console (PlayStation/Xbox/Switch): Gamepad, achievements
- HTML5 (Web): Browser detection, JavaScript integration
- Desktop (Windows/macOS/Linux): File dialogs, registry

### Performance Optimization

Expert guidance on optimizing GameMaker games:
- Draw call reduction
- Collision optimization
- Object pooling
- Memory management
- Profiling techniques

---

## Contributing

Contributions are welcome! If you'd like to improve the GameMaker skills:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Please ensure:
- All information is accurate according to official GameMaker documentation
- Code examples are tested and working
- Documentation is clear and well-organized
- New content follows existing style and structure

---

## Version History

### v1.0.0 (2025-01-XX)
- Initial release
- gamemaker-expert skill with comprehensive GML reference
- 4 detailed reference documents (GML_REFERENCE, COMMON_PITFALLS, QUICK_REFERENCE, ADVANCED_TOPICS)
- Coverage from beginner to advanced topics
- Shader programming guide (GLSL ES)
- Networking patterns and examples
- Platform-specific development guidance
- Performance optimization techniques

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [YoYoGames](https://www.yoyogames.com/) for GameMaker Studio 2
- [GameMaker Manual](https://manual.gamemaker.io/) - Official documentation
- [Anthropic](https://www.anthropic.com/) for Claude Code and the skills system
- The GameMaker community for knowledge sharing

---

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: [https://github.com/leihaht/gamemaker-skills/issues](https://github.com/leihaht/gamemaker-skills/issues)
- **GameMaker Manual**: [https://manual.gamemaker.io/](https://manual.gamemaker.io/)
- **GameMaker Community**: [https://forum.yoyogames.com/](https://forum.yoyogames.com/)

---

## Related Resources

- [Official GameMaker Manual](https://manual.gamemaker.io/) - Complete API reference
- [GameMaker Documentation on GitHub](https://github.com/YoYoGames/GameMaker-Manual) - Source for official docs
- [GameMaker Community Forum](https://forum.yoyogames.com/) - Community support
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code) - Claude Code official docs
- [Claude Code Skills Repository](https://github.com/anthropics/skills) - Official Anthropic skills
