# CLAUDE.md - Guidelines for remark-custom-tasks

## Project Overview
remark-custom-tasks is a plugin for the Remark Markdown processor that extends standard task lists to support custom markers. While regular Markdown only supports `[ ]` and `[x]` for tasks, this plugin allows arbitrary characters between square brackets like `[q]`, `[D]`, or any custom marker.

## Commands
- Run all tests: `npm test`
- Run specific test: `node --test index.test.js`
- Run demo: `npm run demo`
- Run specific demo: `node scripts/parsing-demo.js` or `node scripts/serialization-demo.js`

## Code Style Guidelines
- Format: ES Modules (`type: "module"` in package.json)
- Imports: ES modules syntax (`import x from 'y'`)
- Types:
  - Use JSDoc comments for type annotations in .js files
  - Separate .d.ts files for TypeScript definitions
  - Use full imports from '@types/mdast' and 'unified'
- Naming:
  - camelCase for variables and functions
  - Descriptive names for visitor functions
- Error Handling: Early returns for validation checks
- Comments: JSDoc style for functions and types
- Testing: Node.js built-in test runner with async/await syntax
- AST Handling: Use unist-util-visit for traversing the syntax tree

## Architecture
This plugin has two main capabilities:

1. **Parsing**: Identifies Markdown list items with custom task markers like `[q]` and enhances the AST by adding:
   - `marker`: The character(s) between brackets
   - `taskContent`: The text content after the marker

2. **Serialization**: Converts the modified AST back to Markdown text, preserving custom markers

The plugin follows the standard Remark plugin interface, supporting both parsing and serialization phases of Markdown processing.