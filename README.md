# Roddy's Star Track

A digital adaptation of **Star Track**, a chain-picking board game originally designed by the [Math Pentathlon Organization](https://mathpentathlon.org). Built as a personal project to practice React + TypeScript and explore AI-assisted development.

🎮 **[Play it live → devonclemente.com/roddysgame](https://devonclemente.com/roddysgame)**

---

## How it works

Players draw 2 chains from a pickup bin each turn and choose one to advance along a 41-space board. Special spaces either send you back to the nearest star or jump you forward. First to reach the end triggers a rebuttal — giving the opponent one final turn.

- **VS AI** — Easy, Medium, or Hard difficulty
- **2-Player** — Local co-op on the same device
- **44 chains** in the pickup bin, lengths 2–9 (weighted toward shorter chains)
- **Collision mechanic** — land on your opponent, bump them back 2 spaces

## Tech stack

- React 18 + TypeScript
- Vite
- shadcn-ui + Tailwind CSS
- Framer Motion (board animations)
- Vitest (unit tests)

## Run locally

```bash
git clone https://github.com/devonclemente/roddys-star-track-gpt
cd roddys-star-track-gpt
npm install
npm run dev
```

## Notes

This project was built using Lovable (AI-assisted web app builder) as an experiment in AI-first development — comparing outputs from Claude and ChatGPT at each step. The game logic (`useGameLogic.ts`) is fully custom: chain distribution, movement resolution, collision detection, rebuttal mechanics, and AI decision-making.

---

Built by [Devon Clemente](https://devonclemente.com)
