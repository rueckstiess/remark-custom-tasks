# CLAUDE.md - Guidelines for remark-custom-tasks

## Commands
- Run all tests: `npm test`
- Run specific test: `node --test index.test.js`
- Run demo: `npm run demo`

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
This plugin extends remark to process custom task markers in markdown lists.
It adds `marker` and `taskContent` properties to list items with custom syntax.