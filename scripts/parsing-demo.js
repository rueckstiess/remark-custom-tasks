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

async function runTest() {
  try {
    // Process with remark and our plugin
    const processor = remark().use(remarkCustomTasks)

    // Process the markdown
    const file = await processor.process(markdown)

    // Get the processed AST
    const ast = processor.parse(markdown)
    const processedAst = processor.runSync(ast, file)

    // Check if our plugin added customTask nodes
    let customTasksFound = 0
    let regularListItems = 0

    // Traverse the AST to find customTask nodes
    const visit = (node) => {
      if (node.type === 'customTask') {
        console.log(`Found customTask with marker [${node.marker}] and taskContent '${node.taskContent}'`)
        customTasksFound++
      } else if (node.type === 'listItem') {
        console.log(`Found regular listItem with content '${node.children[0]?.children[0]?.value || ''}'`)
        regularListItems++
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    visit(processedAst)
    console.log(`\nTotal custom tasks found: ${customTasksFound}`)
    console.log(`Total regular list items found: ${regularListItems}`)

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
runTest()