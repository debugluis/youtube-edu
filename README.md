# YouTube Edu

A web app that turns YouTube playlists into structured courses with progress tracking, modules, and achievements.

## The problem

YouTube has a massive amount of educational content organized in playlists — full courses, lectures, sequential tutorials. But YouTube's interface isn't designed for learning: there's no module structure, no progress tracking, and it's easy to abandon a playlist halfway through with no reason to come back.

## The solution

YouTube Edu takes a YouTube playlist and turns it into an actual learning experience:

- An AI analyzes the videos and organizes them into thematic modules
- Progress tracking per video, per module, and overall
- Achievement system to keep motivation going
- Embedded video player with automatic completion detection
- Option to open in YouTube (for Premium users without ads)
- Manual marking for previously watched videos

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- YouTube Data API v3
- Claude API (Haiku) for content structuring
- Zustand + Framer Motion

## About the process

This project was built using vibe coding with Claude as a development agent. The technical spec, architecture, data models, and interface design were defined through conversation with Claude and documented in a `SPEC.md` file that the agent used as reference to generate the code.

This wasn't a one-click generated project. It was an iterative process of defining the problem, discussing technical options, making design decisions, and building piece by piece with AI assistance.

## Status

Live at [youtube-edu.vercel.app](https://youtube-edu.vercel.app/)

## Author

**debugluis**