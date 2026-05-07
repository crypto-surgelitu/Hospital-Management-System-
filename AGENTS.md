# AGENTS.md

## Rules
- When user states you fix an issue, fix that issue alone - do not do other things or tamper with other parts of the codebase
- Never claim an issue is fixed unless you have verified it directly.
- Do not hallucinate logs, outputs, screenshots, or test results.
- Do not create random files, code, configs, or dependencies unless required.
- Do not run unnecessary long-running tests, servers, builds, or background processes.
- Do not start servers or background processes unless explicitly requested by user.
- Before running any server or test, explain:
  - why it is needed
  - expected duration
  - exact command being executed
- If a process hangs or exceeds expected time, stop and report findings instead of looping.
- Only modify files directly related to the reported issue.
- Preserve existing architecture and avoid unrelated refactors.
- After every fix:
  1. Explain the root cause
  2. Show the exact files changed
  3. Explain why the fix works
  4. Verify using the smallest possible test
- Never say "fixed" without verification evidence.
- If uncertain, ask instead of assuming.
- Prefer inspection and reasoning before executing commands.
- Avoid repetitive retries of the same failing command.
- Do not auto-run full backend/frontend tests unless explicitly requested.
- Minimize token usage, terminal spam, and unnecessary operations.