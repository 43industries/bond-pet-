# 🐾 BondPet Game

A relationship-building game where you take care of a virtual pet by playing puzzles and buying items!

## Features

- 🎮 Match-3 puzzle gameplay
- 💕 Three relationship modes: Friends, Couples, and Family
- 🛍️ Shop system with items tailored to each mode
- 🎯 Progressive difficulty and scoring system
- ✨ Power-ups and combo multipliers

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Deployment

### Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://www.netlify.com/)
3. Click "New site from Git"
4. Connect your repository
5. Build settings will be auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click "New Project"
4. Import your repository
5. Settings will be auto-detected from `vercel.json`
6. Click "Deploy"

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

Enjoy building relationships! 🎉
