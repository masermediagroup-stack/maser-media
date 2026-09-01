# masermedia.co — design.md

One file for this site. Not the lab. Not Cat-Eye. Not Vercel’s report kit.

## Scope

masermedia.co homepage and inner routes. Brand, web, and campaign site for Maser Media.

Reader: a founder or marketer deciding whether this is the shop that can hold brand, site, and campaign without splitting.

Job: make the offer obvious in one screen, then prove craft on the CTA mark.

## Reader and job

- First screen: know who this is and that one team does the work.
- Services: pick Brand, Web, or Digital without a menu of vibes.
- CTA: read the Blue-HD mark as the closer. The mark is the CTA, not a sentence under it.
- Do not write a Why Us rewrite.

## Accepted copy

Do not rewrite these lines.

- Hero: Need one creative team? Here we are.
- Hero sub: Fewer handoffs. Clearer outcomes.
- Services: Serious Craft. Playful Energy.
- Brand: The story, the mark, and the rules so the site and the campaign don’t split later.
- Web: Pages that make the offer obvious and still look like you.
- Digital: Photo, film, and the campaigns that keep people seeing you after the site ships.
- Logo card: Two creatives. Tired of watching shops drop the ball.
- Date step: Let’s Meet.
- CTA is the mark, not a line.

## Observable decisions

Paint the homepage closer as `CtaLogoTilt` on Blue-HD. Do not replace the footer `AsciiWaveFooter` strip with this look.

Fill the mark with a four-blob Maser-blue wash. Sample neighboring palette stops. Do not bilinear-mix opposite corners (that crease is the hard diagonal).

Cycle which corner is hot. Do not rotate the wash UV.

Integrate wash phase. Treat speed as rate. Do not multiply wall-clock time by speed (that jumps the loop).

Ship these defaults: speed 1.5, White max (1), Dark max (1). Leave glow 0.55 and angle 118.

Clip a uniform ASCII grid to Blue-HD. Pin cell size to footer font 22 ÷ 5 (`ASCII_FONT_SIZE`, `ASCII_CELL_W`, `ASCII_CELL_H`). Cover the whole mark. Do not re-derive size from live canvas height.

Tick glyphs in place through `.:+x*#` in little bursts. Keep every cell inked. Do not wink off, punch holes, dim/flash multiply, or slide glyphs.

Paint glyphs with the same wash at opposite phase. Do not bleach glyphs to paper white.

Keep production tilt: `MAX_TILT_X=14`, `MAX_TILT_Y=16`, `MAX_LIFT=14`, `LERP=0.12`, perspective 920. Drop tilt on coarse pointer and reduced motion. Keep the wash looping. Lamp off the silhouette.

Rebuild the ASCII mask only when the canvas bitmap size actually changes. Knobs retint. Knobs do not restroke the grid. Knobs stay in the lab demo, never on this site.

Build new washes on vgpu. Do not start a raw WebGL stack.

## Primitives Spark may name

- Mark: `/assets/cta-logo-gradient/Blue-HD.svg` (or the production Blue-HD path already on this site)
- Components: `CtaLogoTilt`, `CtaLogoGradient`, `AsciiWaveFooter` (footer only)
- Color: `--clg-blue #10a4ff`, `--clg-white #f5fbff`, `--clg-dark #0872c4`, `--clg-ground #ffffff`
- ASCII: charset `.:+x*#`, `ASCII_FOOTER_FONT=22`, `ASCII_FONT_SIZE=4.4`, `ASCII_CELL_W=3.4`, `ASCII_CELL_H=4.4`
- Tilt: `MAX_TILT_X`, `MAX_TILT_Y`, `MAX_LIFT`, `LERP`, `PERSPECTIVE_PX`
- Wash: four-blob corners, phase clock, speed 1.5, highlight 1, shade 1, glow 0.55, angle 118, loop 9s
- Type and spacing: existing masermedia.co tokens on this site. Do not invent a second scale. Do not load Geist, vbg, or the Vercel triangle.

Do not read the CSS implementation into context. Name these. Stop.

## Generated-design refusals

- Inter on white as a default
- Stock-startup purple gradient
- Glassmorphism soup / fake 3D chrome
- Geist / vbg / Vercel triangle
- “Keep it clean” as a rule
- Filament, prism-wave, pond ripple, footer column-wave on the CTA mark
- Hover drop-shadow lamp on the silhouette
- Hard bilinear crease / slanted shutdown wipe
- Wink-off holes, multiply dim, glyphs that slide
- One studio stylesheet shared with Cat-Eye or the lab
