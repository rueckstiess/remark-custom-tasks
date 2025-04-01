import { remark } from 'remark'
import remarkCustomTasks from '../index.js'

// Sample Markdown with custom task syntax
const markdown = `
# Custom Tasks Example

- Regular list item
- [q] What's the meaning of life?
- [x] Completed task
- [ ] Open task
- [D] Decision to make
  - Option 1
  - Option 2
`

async function runDemo() {
  try {
    console.log('='.repeat(50))
    console.log('DEMO: SERIALIZATION OF CUSTOM TASK MARKERS')
    console.log('='.repeat(50))

    // Step 1: Parse the input markdown
    console.log('\n📝 STEP 1: Parse markdown with custom task markers')
    console.log('Original Markdown:')
    console.log(markdown)

    const processor = remark().use(remarkCustomTasks)

    // Using the unified API to parse and transform
    const ast = processor.parse(markdown)
    const transformedAst = processor.runSync(ast)

    // Step 2: Show AST nodes with custom task markers
    console.log('\n🔍 STEP 2: Inspect AST for custom task markers')
    console.log('Custom task markers found:')

    function findMarkers(node, depth = 0) {
      if (node.type === 'listItem' && typeof node.marker === 'string') {
        const indent = '  '.repeat(depth)
        console.log(`${indent}- Item with marker [${node.marker}]: "${node.taskContent}"`)
      }

      if (node.children) {
        node.children.forEach(child => findMarkers(child, depth + 1))
      }
    }

    findMarkers(transformedAst)

    // Step 3: Serialize back to markdown
    console.log('\n📄 STEP 3: Serialize AST back to markdown')
    console.log('Using integrated serialization:')

    // The serialization is now handled automatically by the plugin
    const result = await processor.process(markdown)
    const serialized = String(result)

    console.log('\nSerialized Markdown:')
    console.log(serialized)

    // Check if the serialization preserves the original format
    const isPreserved = serialized.trim() === markdown.trim()
    console.log(`\n✨ RESULT: Format preserved: ${isPreserved ? '✅ Yes' : '❌ No'}`)

    // Demonstrate what it would look like without the serialization extensions
    console.log('\n💡 NOTE: The plugin now automatically handles serialization!')
    console.log('No need to manually add the customTasksToMarkdown() extension.')

  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Run the demo
runDemo()