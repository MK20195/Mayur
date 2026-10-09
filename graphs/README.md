# Mayur Graphs — Remotion animated charts

Smooth, 60fps animated graphs (Line, Bar, Donut) jo video mein overlay ya full-screen use ho sakein.

## Setup

```bash
cd graphs
npm install
npm run studio        # browser mein live preview + props edit
```

## Render

```bash
# Normal MP4 (1920x1080, 60fps)
npx remotion render LineChart out/line.mp4 --crf=16

# Transparent background (Premiere / DaVinci / CapCut mein overlay ke liye)
npx remotion render LineChart out/line.mov --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png --props='{"transparent":true}'
```

Compositions: `LineChart`, `BarChart`, `DonutChart`.

## Apna data / style

- **Data:** `src/Root.tsx` mein `defaultProps` badlo (abhi demo data hai), ya Studio ke props panel se.
- **Colors / font / easing:** sab `src/theme.ts` mein hai — ek jagah badlo, saare graphs update.
- **Timing:** har composition ke top pe frame numbers (60fps pe 60 frames = 1 sec).

## Smoothness kahan se aati hai

- `ease.inOut` (bezier 0.65,0,0.35,1) se line/donut draw — slow start, slow end.
- `spring` with `damping: 200` — bina bounce ke settle hona.
- Har element staggered aata hai, aur poore shot pe halka camera push-in.
- 60fps render.
