import { remark } from 'remark'
import remarkCustomTasks from './index.js'

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

async function runTest() {
  try {
    // Process with remark and our plugin
    const processor = remark().use(remarkCustomTasks)

    // Process the markdown
    const file = await processor.process(markdown)

    // Get the processed AST
    const ast = processor.parse(markdown)
    const processedAst = processor.runSync(ast, file)

    // Check if our plugin added markers
    let markersFound = 0

    // Traverse the AST to find list items with markers
    const visit = (node) => {
      if (node.type === 'listItem' && 'marker' in node) {
        console.log(`Found list item with marker [${node.marker}] and taskContent '${node.taskContent}'`)
        markersFound++
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    visit(processedAst)
    console.log(`\nTotal markers found: ${markersFound}`)

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
runTest()