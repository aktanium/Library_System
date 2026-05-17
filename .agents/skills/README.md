# .agents/skills — AI Agent Skills for Library Management System

This folder contains skill files that give AI agents (Claude, Copilot, Cursor, etc.)
the context they need to work accurately on this project without guessing.

## How to use
When starting a task with an AI agent, paste this at the top of your prompt:
> "Read .agents/skills/project-context.md before starting."

Or reference a specific skill:
> "Follow .agents/skills/add-frontend-page.md to add a new page."

## Skills Index

| File | Use When |
|------|----------|
| `project-context.md` | Starting any task — gives full project overview |
| `add-api-endpoint.md` | Adding new Spring Boot endpoint |
| `add-frontend-page.md` | Adding new React page or feature |
| `ui-improvements.md` | Improving existing UI (skeletons, badges, tables) |
| `db-changes.md` | Adding new DB fields or entities |

## Adding new skills
Create a new `.md` file here whenever you establish a new pattern in the project.
Name it clearly: `verb-noun.md` (e.g. `add-notification.md`, `write-test.md`).
