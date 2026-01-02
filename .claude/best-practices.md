# Claude Code Best Practices

## Playwright MCP Server Actions

When using Playwright MCP server actions for testing, always delegate to a subagent to avoid populating the main context with large snapshots and outputs.

### Why?

- Playwright snapshots can be extremely verbose (10,000+ lines)
- Multiple browser interactions quickly fill up the context window
- Subagents isolate the testing work and return only the results

### How?

Use the Task tool with `subagent_type: "general-purpose"` to run Playwright tests:

```typescript
// ❌ BAD: Running Playwright directly in main context
<invoke name="mcp__playwright__browser_navigate">
  <parameter name="url">http://localhost:3000