# Character Sets Reference

All character palettes for the ASCII shader engine. Characters are ordered dark-to-bright (space = darkest, last char = brightest). The brightness mapper indexes into these strings linearly.

## Glyph Engine Charsets

### Standard

General-purpose ASCII ramp. Good default for most content.

```typescript
const CHARSET_STANDARD = ' .:-=+*#%@'
```

### Blocks

Unicode block elements. Produces a chunky, pixelated look. Only 5 levels — best for high-contrast content or large cell sizes.

```typescript
const CHARSET_BLOCKS = ' ░▒▓█'
```

### Detailed

Extended 68-character ramp with fine brightness gradation. Best for high-resolution grids where subtle tonal differences matter.

```typescript
const CHARSET_DETAILED = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
```

### Minimal

4-level ultra-simple ramp. Creates a clean, sparse aesthetic.

```typescript
const CHARSET_MINIMAL = ' ·░█'
```

### Binary

Only 0 and 1. Matrix-style binary rain or data-stream aesthetic.

```typescript
const CHARSET_BINARY = ' 01'
```

### Letter Sets

```typescript
const CHARSET_LETTERS_UPPER = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CHARSET_LETTERS_LOWER = ' abcdefghijklmnopqrstuvwxyz'
const CHARSET_LETTERS_MIXED = ' aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ'
const CHARSET_SYMBOLS = ' !@#$%^&*()+-=[]{}|;:,.<>?/'
```

### Braille Patterns

Braille characters provide extremely fine spatial resolution because each character cell encodes a 2x4 dot pattern. Useful for high-detail rendering at small font sizes.

**Standard (64 characters)** — full Braille block, maximum tonal range:

```typescript
const CHARSET_BRAILLE_STANDARD =
  ' ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿'
```

**Sparse (10 characters)** — selected Braille with clear brightness steps:

```typescript
const CHARSET_BRAILLE_SPARSE = ' ⠁⠉⠋⠛⠟⠿⡿⣿⣿'
```

**Dense (5 characters)** — minimal Braille for blocky rendering:

```typescript
const CHARSET_BRAILLE_DENSE = ' ⠐⠶⣿⣿'
```

### Terminal Charsets

Themed character sets for terminal/hacker aesthetics:

```typescript
const CHARSET_TERMINAL_101010 = ' 01'
const CHARSET_TERMINAL_BRACKETS = ' ()[]{}><'
const CHARSET_TERMINAL_DOLLAR = ' $€£¥₿'
const CHARSET_TERMINAL_MIXED = ' .·:;|/\\-=+*#@$%&'
const CHARSET_TERMINAL_PIPES = ' ─│┌┐└┘├┤┬┴┼'
```

### DotCross Ramps

Two complementary ramps for layered or dual-channel rendering:

```typescript
const DOT_RAMP = '  .·:oO'
const CROSS_RAMP = '  ·+xX#'
```

## ASCII-Video Charsets

Extended palettes from the ascii-video pipeline. These include Unicode ranges beyond standard ASCII for richer visual texture.

### General Purpose

```typescript
const PAL_DEFAULT = " .`'-:;!><=+*^~?/|(){}[]#&$@%"
const PAL_DENSE = ' .:;+=xX$#@█'
```

### Script / Language

```typescript
const PAL_RUNE = ' .ᚠᚢᚦᛒᛗᛡᛇᛞᛟᛚᛞᛟ'
const PAL_KATA = ' ·ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷ'
const PAL_GREEK = ' αβγδεζηθικλμνξπρστφψω'
```

### Mathematical / Technical

```typescript
const PAL_MATH = ' ·∘∙•°±∓×÷≈≠≡≤≥∞∫∑∏√∇∂∆Ω'
const PAL_BOX = ' ─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬'
const PAL_CIRCUIT = ' .·─│┌┐└┘┼○●□■△▽≡'
const PAL_HEX = ' 0123456789abcdef'
```

### Symbolic / Decorative

```typescript
const PAL_ARROWS = ' ←↑→↓↔↕↖↗↘↙↩↪↻➡'
const PAL_DOTS = ' ⋅∘∙●◉◎◆✦★'
const PAL_STARS = ' ·✧✦✩✨★✶✳✸'
```

### Block / Structural

```typescript
const PAL_BRAILLE = ' ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠿'
const PAL_BLOCKS = ' ░▒▓█▄▀▐▌'
```

## Complete Palette Registry

```typescript
const CHARSETS: Record<string, string> = {
  // Glyph engine
  'standard': CHARSET_STANDARD,
  'blocks': CHARSET_BLOCKS,
  'detailed': CHARSET_DETAILED,
  'minimal': CHARSET_MINIMAL,
  'binary': CHARSET_BINARY,
  'letters-upper': CHARSET_LETTERS_UPPER,
  'letters-lower': CHARSET_LETTERS_LOWER,
  'letters-mixed': CHARSET_LETTERS_MIXED,
  'symbols': CHARSET_SYMBOLS,
  'braille': CHARSET_BRAILLE_STANDARD,
  'braille-sparse': CHARSET_BRAILLE_SPARSE,
  'braille-dense': CHARSET_BRAILLE_DENSE,
  'terminal-binary': CHARSET_TERMINAL_101010,
  'terminal-brackets': CHARSET_TERMINAL_BRACKETS,
  'terminal-dollar': CHARSET_TERMINAL_DOLLAR,
  'terminal-mixed': CHARSET_TERMINAL_MIXED,
  'terminal-pipes': CHARSET_TERMINAL_PIPES,
  'dot-ramp': DOT_RAMP,
  'cross-ramp': CROSS_RAMP,

  // ASCII-video
  'default': PAL_DEFAULT,
  'dense': PAL_DENSE,
  'rune': PAL_RUNE,
  'katakana': PAL_KATA,
  'greek': PAL_GREEK,
  'math': PAL_MATH,
  'box': PAL_BOX,
  'circuit': PAL_CIRCUIT,
  'hex': PAL_HEX,
  'arrows': PAL_ARROWS,
  'dots': PAL_DOTS,
  'stars': PAL_STARS,
  'braille-full': PAL_BRAILLE,
  'blocks-extended': PAL_BLOCKS,
}
```

## Choosing a Palette

### By Content Type

| Content | Recommended Palettes |
|---------|---------------------|
| **Photographic images** | `detailed`, `standard`, `default`, `dense` |
| **Webcam / live video** | `standard`, `blocks`, `dense` (fewer chars = faster) |
| **High-contrast graphics** | `blocks`, `minimal`, `binary` |
| **Portraits / faces** | `detailed`, `braille` (fine gradation preserves features) |
| **Text / documents** | `standard`, `detailed` |
| **Dark scenes** | `braille-sparse`, `dots`, `stars` (bright chars stand out) |
| **Data visualization** | `hex`, `circuit`, `math` |

### By Aesthetic

| Aesthetic | Recommended Palettes |
|-----------|---------------------|
| **Classic terminal** | `standard`, `terminal-mixed`, `terminal-pipes` |
| **Matrix / hacker** | `binary`, `katakana`, `terminal-binary` |
| **Retro computing** | `blocks`, `minimal`, `braille-dense` |
| **Sci-fi / futuristic** | `rune`, `greek`, `math`, `circuit` |
| **Elegant / artistic** | `braille`, `dots`, `stars` |
| **Chunky / bold** | `blocks`, `blocks-extended`, `minimal` |
| **Financial / data** | `hex`, `terminal-dollar` |
| **Playful / decorative** | `arrows`, `stars`, `symbols` |

### By Grid Resolution

| Grid Size | Recommended |
|-----------|-------------|
| **Small (< 40 cols)** | Short palettes: `blocks` (5), `minimal` (4), `binary` (3) |
| **Medium (40-120 cols)** | Mid palettes: `standard` (10), `dense` (12), `default` (29) |
| **Large (120+ cols)** | Long palettes: `detailed` (68), `braille` (64), `default` (29) |

Longer palettes waste tonal range at low resolutions because adjacent brightness levels map to the same character. Shorter palettes at high resolution produce banding.

### Performance Considerations

- All palettes have O(1) character lookup (direct index into string).
- Unicode characters (Braille, Katakana, Runes, etc.) render at the same speed as ASCII in modern browsers — there is no performance penalty from character complexity.
- The main performance factor is grid size (cols x rows), not palette length.
- For animated content at 30+ fps, keep total grid cells under ~15,000 (e.g. 150x100) for smooth rendering with DOM-based output. Canvas-based rendering can handle much larger grids.

### Custom Palettes

To create a custom palette, order characters from least visually dense (darkest) to most visually dense (brightest). Test by squinting — the string should appear as a smooth gradient from empty to filled.

```typescript
// Example: custom geometric palette
const CUSTOM_GEO = ' ·∘○◎●◉⬤'

// Example: emoji brightness ramp (novelty)
const CUSTOM_EMOJI = '  ·•●🌑🌒🌓🌔🌕'
```

The only requirement is that characters are a string with length >= 2 (space + at least one visible character).
