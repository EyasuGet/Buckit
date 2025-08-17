# Buckit — AI‑Powered Bucket Lists

Buckit helps you generate personalized bucket lists using AI, track progress with checkable items, and celebrate completion with a downloadable photo collage.

- Create a list by entering a title, location, budget, and who’s joining.
- The backend (Gemini via Google AI Studio) generates activity ideas.
- Check off items as you complete them and add a photo per activity.
- When everything is done and photos are added, unlock a shareable Memory Collage.

## Features

- AI list generation (Gemini) from simple prompts (title, location, budget, party)
- Smooth loading screen and error feedback
- Results page with:
  - Progress bar and checkable items
  - Optional place info from AI (name, address, map link) and price tier
  - Per‑activity photo uploads (stored locally)
  - “Finish to unlock” banner and congratulations state
  - Memory Collage generator (client‑side canvas) with download
  - Collage customization

## Tech Stack

- Frontend: React (Vite), React Router
- Backend: Node.js, Express, Google Generative AI (Gemini)

## Project Structure

- `backend/app.js` — Express API (POST `/lists`) using Gemini
- `src/api.js` — Frontend API helper for calling the backend
- `src/components/` — React components (Create form, Loading, Results, My Lists, Navbar)
- `src/styles/` — All CSS styles (moved from component folders)

Key routes:
- `/` — Home
- `/create` — Create a new list
- `/create/loading` — AI generation screen
- `/lists` — My Lists index
- `/lists/:id` — Single list with progress and collage

## Setup

Prerequisites: Node 18+ and npm

1) Install dependencies in the project root.
- Use your package manager to install. This repo contains the frontend deps and Express already.
- Ensure `@google/generative-ai` and `dotenv` are installed (for the backend).

2) Environment variables
- Frontend: create `.env.local` in the project root with the key `VITE_API_URL` pointing to your backend, for example `http://localhost:8787`.
- Backend: create `backend/.env` with `GOOGLE_API_KEY` (your Google AI Studio key) and optional `PORT` (default 8787).

3) Start the backend
- Run the Express server from the project root by starting `backend/app.js` with Node.

4) Start the frontend
- Run the Vite dev server. Open the provided local URL in your browser.


## API

POST `{VITE_API_URL}/lists`
- Request body: JSON
  - `title` (string, required)
  - `location` (string, required)
  - `budget` ("free" | "budget" | "high")
  - `party` ("friends" | "families" | "couples")
- Success response: JSON
  - `id` (string)
  - `title`, `subtitle` (strings)
  - `location`, `budget`, `party`
  - `createdAt` (ISO string)
  - `items`: array of activities
    - `id` (string)
    - `title` (string)
    - `description` (string)
    - `tags` (string[])
    - Optional: `place` { `name`, `address`, `neighborhood?`, `mapUrl?` }, `priceTier`

Notes
- The backend uses Gemini with a strict JSON prompt
- The frontend expects `items` to be an array; missing/empty arrays will render no activities.

## Data & Persistence

- Lists and progress are saved in `sessionStorage` under keys like `list:<id>`.
- Item photos are stored as base64 data URLs inside those objects and never leave the browser.
- Clearing browser storage or using another device will remove local data (no server database).

## Collage

- When all items are completed and each has a photo, a Memory Collage section appears.
- Collage is generated client‑side on a hidden canvas and can be downloaded as a JPEG.
- You can reorder and remove photos before building the collage; your order is saved locally.


