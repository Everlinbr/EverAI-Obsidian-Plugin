# EverAI SPEC.md

## Project Overview

EverAI is an offline-first AI assistant for Obsidian designed primarily
for Android devices. It must help users manage Markdown notes, study,
code, and organize knowledge while running locally.

## Primary Goals

-   Offline by default.
-   Local LLM only.
-   Fast on low-end hardware.
-   Safe file operations.
-   Modular architecture.
-   Clean, maintainable code.

## Target Hardware

Primary device: - Lenovo Tab M10 HD (X306) - Android 11 - 3 GB RAM -
MediaTek CPU - PowerVR GE8320 GPU - 32 GB internal storage - 64 GB
adopted SD storage

The software MUST optimize RAM usage and avoid loading unnecessary data.

## AI Model

Default: - Qwen2.5-1.5B-Instruct - GGUF - Quantization: Q4_K_M
Inference: - llama.cpp - Local only Optional Internet tools may be
enabled by the user.

## Architecture

Obsidian Plugin (TypeScript) ↕ HTTP Python Backend (FastAPI) ↕ llama.cpp
↕ Qwen2.5-1.5B-Instruct

## Repository Structure

-   backend/
-   plugin/
-   prompts/
-   memory/
-   models/
-   docs/
-   scripts/
-   tests/

## Backend Responsibilities

-   Load model
-   Chat endpoint
-   Memory
-   Tool execution
-   Vault indexing
-   Search
-   Markdown generation

## Plugin Responsibilities

-   Chat panel
-   Commands
-   Settings
-   Sidebar
-   Display responses
-   Execute validated file actions

## Features (V1)

-   Chat
-   Create notes
-   Edit notes
-   Search vault
-   Read Markdown
-   Memory
-   Optional internet toggle

## File Safety

Never delete files without confirmation. Always validate paths. Never
modify files outside the vault.

## Memory

Maintain summarized memory instead of replaying full conversations.
Cache intelligently.

## Coding Standards

-   TypeScript for plugin
-   Python for backend
-   Small functions
-   SOLID where practical
-   No placeholder implementations
-   No fake TODO logic
-   Remove dead code
-   Prefer readability
-   Add docstrings where useful

## Performance

-   Minimize RAM
-   Lazy loading
-   Stream model output
-   Avoid unnecessary dependencies
-   Cache repeated searches

## Security

Never execute arbitrary shell commands without explicit user approval.
Never access the Internet unless enabled. Never send local files
externally.

## Development Workflow

Implement one feature at a time. Build. Test. Commit. Repeat.

## Git Commit Rules

Use Conventional Commits: feat: fix: refactor: perf: docs: test: build:
chore:

Each commit must: - Solve one problem - Build successfully - Include
meaningful description - Avoid unrelated changes

Example: feat(plugin): add chat sidebar connected to backend
fix(memory): prevent duplicate summaries docs(spec): update architecture

## Definition of Done

A task is complete only when: - Feature works end-to-end - Builds
successfully - Existing functionality still works - Errors handled -
Documentation updated if needed - Commit created

## Future Roadmap

V2: - PDF support - OCR - Voice - Better RAG

V3: - Tool plugins - Calendar - Git integration - Multi-agent support
(optional)

## Final Principles

Build EverAI like a production-quality open-source project. Prioritize
correctness over speed. Keep modules independent. Optimize for Android
first.
