# BYTE NOTES 🍪

> Developed by [Caitlin Estrada](https://github.com/caitlinestrada27), [Elizabeth (Lizzie) Coats](https://github.com/escoats), [Sanjana Gopalswamy](https://github.com/sgopal08), and [Yi (Charlotte) Tsui](https://github.com/charlottetsui) for COMP 426: Modern Web Programming at UNC-Chapel Hill.


![TypeScript](https://img.shields.io/badge/-TypeScript-05122A?style=flat&logo=typescript)
![Next.js](https://img.shields.io/badge/-Next.js-05122A?style=flat&logo=nextdotjs)
![Shadcn/ui](https://img.shields.io/badge/-Shadcn_UI-05122A?style=flat&logo=shadcnui)
![Tailwind](https://img.shields.io/badge/-Tailwind-05122A?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/-Supabase-05122A?style=flat&logo=supabase)

ByteNotes is a full-stack web application created by Computer Science for Computer Science students to facilitate efficient and organized note-taking in higher-level courses.

## Features

### Authentication
Supabase Authentication for secure login and session management <br>
Server-side rendering (SSR) for protected routes <br>

### Hierarchical Notes
Users can create Notebooks → Chapters → Pages <br>
Designed for structured learning and modular documentation <br>
<img src="https://github.com/comp426-25s/final-project-team-03/blob/main/docs/images/file-hierarchy.png" width="150">

### Markdown Editor
Live editing with support for headings, lists, bold/italic, links, and more <br>
Users can save their progress and return after signing out to make new changes <br>

### Code Compiler
Each page includes a live coding environment (StackBlitz) <br>
It supports multi-language execution (e.g., Python, JavaScript, etc.) <br>
Users can save and load code snippets per page which is stored through Supabase <br>

### Theme Support
Dark and light themes are available with full Tailwind support <br>
Toggle via custom ThemeProvider and ThemeToggle components <br>

### Published Page
Once a student finishes their notes they can share (via clipboard, email, or SMS) and publish the page <br>

### Viewers
Viewers are updated live using Supabase's real-time capabilities <br> 
Profile pictures are displayed in an Avatar Stack <br>

### Reactions 
Viewers can react to pages with a heart, star, or dislike <br>
Reaction counts are updated live using Supabase's real-time capabilities

## Architecture 
ByteNotes follows a modular design, split into clearly defined feature areas: <br>
- Frontend (Next.js): Pages and components structured by purpose (auth, content, layout).
- Database (Supabase): Handles user data, notes hierarchy, compiled code, and real-time subscriptions.
- Shadcn/ui + Tailwind: For consistent and theme-friendly styling.
- TipTap Markdown Editor: Each page component integrates Tip Tap with dynamic, per-page project state. 
- StackBlitz Embeds: Each Page component integrates StackBlitz with dynamic, per-page project state via postMessage API.
- Custom Hooks & Contexts: Manage page state, user context, and theme toggling cleanly.
This modular structure not only improves maintainability but enables independent feature testing and clearer separation of concerns.

## Project Management
We used Figma to create wireframes for our website before developing. We used Notion for project management to keep track of backlog, in progress, in review, and completed tickets. <br>
[Notion Workspace](https://www.notion.so/F02-Development-Sprints-1-2-1ce1456210fd803089fed0650bf324b6?pvs=4)
