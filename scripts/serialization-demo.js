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
    console.log('DEMO: SERIALIZATION OF CUSTOM TASK NODES')
    console.log('='.repeat(50))

    // Step 1: Parse the input markdown
    console.log('\n📝 STEP 1: Parse markdown with custom task markers')
    console.log('Original Markdown:')
    console.log(markdown)

    const processor = remark().use(remarkCustomTasks)

    // Using the unified API to parse and transform
    const ast = processor.parse(markdown)
    const transformedAst = processor.runSync(ast)

    // Step 2: Show AST nodes with custom task type
    console.log('\n🔍 STEP 2: Inspect AST for customTask nodes')
    console.log('Custom task nodes found:')

    function findCustomTasks(node, depth = 0) {
      if (node.type === 'customTask') {
        const indent = '  '.repeat(depth)
        console.log(`${indent}- customTask with marker [${node.marker}]: "${node.taskContent}"`)
      } else if (node.type === 'listItem') {
        const indent = '  '.repeat(depth)
        const content = node.children?.[0]?.children?.[0]?.value || ''
        console.log(`${indent}- Regular listItem: "${content}"`)
      }

      if (node.children) {
        node.children.forEach(child => findCustomTasks(child, depth + 1))
      }
    }

    findCustomTasks(transformedAst)

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

    // Count node types in the AST
    let customTaskCount = 0
    let listItemCount = 0
    
    const countNodes = (node) => {
      if (node.type === 'customTask') customTaskCount++
      else if (node.type === 'listItem') listItemCount++
      
      if (node.children) {
        node.children.forEach(countNodes)
      }
    }
    
    countNodes(transformedAst)
    console.log(`\n📊 Node Statistics:`)
    console.log(`- customTask nodes: ${customTaskCount}`)
    console.log(`- listItem nodes: ${listItemCount}`)

    console.log('\n💡 NOTE: The plugin now converts task items to customTask node type!')
    console.log('This makes it easier to visit only task nodes in the AST.')

  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Run the demo
runDemo()