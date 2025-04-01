# remark-custom-tasks

A [remark](https://github.com/remarkjs/remark) plugin that adds support for custom task markers in markdown lists.

✅ **Parses** custom task markers like `[q]`, `[D]`, `[!]` in list items  
✅ **Serializes** custom task markers correctly back to markdown

## Installation

```bash
npm install remark-custom-tasks
```

## Usage

### Parsing Custom Task Markers

```js
import { remark } from 'remark'
import remarkCustomTasks from 'remark-custom-tasks'

const markdown = `
- Regular list item
- [q] Question to answer
- [x] Completed task
- [ ] Open task
- [D] Decision to make
`

async function process() {
  const file = await remark()
    .use(remarkCustomTasks)
    .process(markdown)
    
  console.log(String(file))
}

process()
```

### Serializing Custom Task Markers

The plugin provides a separate function for serialization to ensure custom markers are correctly preserved:

```js
import { remark } from 'remark'
import { toMarkdown } from 'mdast-util-to-markdown'
import remarkCustomTasks, { customTasksToMarkdown } from 'remark-custom-tasks'

const markdown = `
- [q] Question to answer
- [x] Completed task
`

async function process() {
  // Parse markdown to AST
  const processor = remark().use(remarkCustomTasks)
  const ast = processor.parse(markdown)
  processor.runSync(ast)
  
  // Serialize AST back to markdown
  const serialized = toMarkdown(ast, {
    extensions: [customTasksToMarkdown()]
  })
  
  console.log(serialized)
  // Output preserves original format with task markers
}

process()
```

## Syntax

This plugin recognizes list items with markers in square brackets:

- `[q]` - Question
- `[x]` - Completed task
- `[ ]` - Open task
- `[D]` - Decision
- Any other marker between `[` and `]`

## AST

This plugin adds `marker` and `taskContent` properties to list item nodes in the mdast that have custom markers.

Example:

```js
// Input: - [q] What is a SPA?

// Output AST node:
{
  type: 'listItem',
  marker: 'q',
  taskContent: 'What is a SPA?'
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '[q] What is a SPA?'
        }
      ]
    }
  ]
}
```

## Testing

Run the automated tests:

```bash
npm test
```

This will run all unit tests in the `test` directory.

For manual testing with sample markdown input:

```bash
# Test parsing
npm run demo

# Test serialization
npm run demo:serialization
```

You can also test with your own Markdown files using remark-cli:

```bash
# Using a relative path to the plugin file
./node_modules/.bin/remark path/to/your/file.md --tree-out --use=./index.js

# Or if you've linked the package
./node_modules/.bin/remark path/to/your/file.md --tree-out --use=remark-custom-tasks
```

## License

MIT