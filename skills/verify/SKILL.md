---
name: verify
description: Run language-specific verification (lint, type-check, tests, build). Use PROACTIVELY after any code change, before commit, and as part of any fix-then-validate loop. Returns structured failures the agent can act on.
---

# Verify

## When to Use

- After any Edit / Write that touches code
- Before declaring a fix complete
- When the agent says "this should work" without running anything
- When CI is failing and you need to reproduce locally
- As the inner step of any "edit → verify → repeat" loop

## Why This Exists

LLMs confidently claim fixes that don't compile, don't type-check, or break
tests. This skill gives the agent a deterministic source of truth — the only
honest way to claim a change works is to actually run the project.

## How It Works

### 1. Detect project type

Walk up from the touched file to find the nearest:

- `package.json` → Node / TS / JS
- `pyproject.toml` / `setup.py` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` / `build.gradle*` → Java
- `*.csproj` / `*.sln` → .NET

### 2. Pick the cheapest deterministic command

Run the cheapest command that can catch a real bug. Order by speed:

1. **Syntax / parse** — `node --check`, `gofmt -l`, `python -m py_compile`
2. **Type-check** — `tsc --noEmit`, `mypy`, `go build ./...`
3. **Lint** — `eslint`, `ruff`, `golangci-lint`
4. **Unit tests** — file-scoped only (`pytest <file>`, `go test ./pkg/...`)
5. **Full build** — only if the above all passed

Stop at the first failing step. Do **not** run the whole CI matrix for a
single-line change.

### 3. Capture and structure the output

Always emit this JSON shape, even on success:

```json
{
  "passed": true,
  "command": "node --check src/foo.ts",
  "elapsed_ms": 142,
  "errors": []
}
```

On failure:

```json
{
  "passed": false,
  "command": "tsc --noEmit",
  "elapsed_ms": 4300,
  "errors": [
    {
      "file": "src/foo.ts",
      "line": 42,
      "column": 7,
      "code": "TS2322",
      "message": "Type 'string' is not assignable to type 'number'."
    }
  ]
}
```

The agent must consume `errors[]` directly. Do not paraphrase the error —
quote it verbatim.

### 4. Loop rule

If passed === false:

1. The agent re-reads the failing line.
2. Applies a focused Edit to that file at that line.
3. Re-invokes this skill on the same files.
4. Repeats until `passed === true`.

Do not declare success until the JSON output of this skill is `passed: true`.

## Examples

### Example 1 — Node project, type error introduced

User: "I changed the return type of `getUser`. Verify."

Agent invokes verify:

```json
{
  "passed": false,
  "command": "npx tsc --noEmit",
  "errors": [
    {
      "file": "src/api/users.ts",
      "line": 88,
      "code": "TS2322",
      "message": "Type 'string' is not assignable to type 'number'."
    }
  ]
}
```

Agent reads line 88 of `src/api/users.ts`, sees the wrong literal, edits it.
Re-invokes verify, gets `passed: true`. Done.

### Example 2 — Python project, lint complaint

User: "Run verify on the diff."

Agent invokes verify; ruff flags one unused import:

```json
{
  "passed": false,
  "command": "ruff check src/",
  "errors": [
    {
      "file": "src/pipeline.py",
      "line": 3,
      "code": "F401",
      "message": "'os' imported but unused"
    }
  ]
}
```

Agent removes the import. Re-invokes. Done.

## Hard Rules

- **NEVER** claim a fix worked without invoking this skill and getting
  `passed: true`.
- **NEVER** mask errors. If the JSON has `errors[]`, every entry is real.
- **NEVER** run the full test suite when a file-scoped check can prove the
  point — wasted context, slower loop.
- **NEVER** proceed to the next task while `passed` is false.
- **ALWAYS** quote the tool error verbatim into `errors[].message`. The LLM
  prior is fallible; the compiler is not.

## Anti-Patterns to Avoid

- "I read the code and it looks correct, so I won't run verify."
- "The error is probably transient, let me retry the whole command."
- "I'll fix this in my head — the type-checker just needs a fresh start."
- Reporting `passed: true` when the command never ran.
