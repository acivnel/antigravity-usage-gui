# Global Development Rules

These rules are mandatory for all development tasks in this project to ensure stability and consistency across different environments.

## Terminal and Environment
- **Default Terminal**: Use **Command Prompt (CMD)** on Windows for basic tasks. For complex scripts, explicitly use `powershell -Command "..."` if CMD fails.
- **Paths**: Always use absolute paths when interacting with tools.
- **Language**: Use **Russian (RU)** for all user-facing messages, notifications, and UI elements.

## Electron Development Standards
- **Startup Robustness**: 
    - NEVER call Electron APIs that depend on the `app` object (e.g., `app.getPath`, `app.isPackaged`) at the top level of any module.
    - Always wrap such calls in `app.whenReady()` or use lazy-initialization (getters).
- **Auto-Updates**:
    - Use `electron-updater` for update logic.
    - Ensure update checks are disabled in development mode using `!app.isPackaged` checks.
- **Dependency Management**:
    - Be cautious with `@electron-toolkit/utils` in the main process as it may cause startup race conditions. Prefer direct Electron API calls for environment checks.

## Code Style
- **Type Safety**: Maintain strict TypeScript typing.
- **Logging**: Use the internal `logger.ts` for all persistent logs.



ENV: Windows.
Always use 'cmd /c' for all shell executions to ensure the process terminates 
correctly and sends an EOF signal. 

**IMPORTANT**: When launching Electron apps (e.g., `npm run dev`, `electron .`), always clear potential agent-specific environment variables that might interfere with the Electron runtime:
`cmd /c "set ELECTRON_RUN_AS_NODE= & set NODE_OPTIONS= & npm run dev"`
(Or use a batch file to ensure a clean environment).

Avoid interactive shells. If a persistent session is needed, use 'cmd /k'
but ensure the command is self-terminating.
