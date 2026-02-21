---
name: code-review
description: Review all code in the project.
user-invocable: true
---

Review all code in the project.

## Usage

- `/code-review` - Review all project code

## Steps

1. **Get list of all source files in the project:**
   Use Glob to find all source files (e.g. `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`, `**/*.css`), excluding `node_modules`, `.next`, and other build/generated directories.

2. **Read and review every source file** for:
   - Bugs and logic errors
   - CLAUDE.md/CLAUDE.local.md compliance
   - Code clarity, structure, and maintainability
   - Consistency with existing patterns and architecture
   - Edge cases and error handling
   - Test coverage and test quality
   - Performance, security, and reliability concerns

## Output Format

Report issues with confidence >= 80 only. For each issue:
- File path and line number
- Description of the issue
- Why it matters (bug, convention violation, etc.)
- Suggested fix

If no significant issues found, confirm the code looks good with a brief summary of what was reviewed.

## Guidelines

- Focus on real bugs and explicit convention violations
- Review the entire codebase, not just recent changes

Assume this is a production codebase and review accordingly
