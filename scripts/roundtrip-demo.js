import { remark } from 'remark'
import fs from 'node:fs/promises'
import { visit } from 'unist-util-visit'
import remarkCustomTasks from '../index.js'

async function runDemo() {
  try {
    // Read the original markdown file
    const markdownPath = './original.md'
    const markdown = await fs.readFile(markdownPath, 'utf8')

    console.log('='.repeat(50))
    console.log('ORIGINAL MARKDOWN:')
    console.log('='.repeat(50))
    console.log(markdown)

    // Parse and process the markdown
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    const processedAst = processor.runSync(ast)
    
    // Count node types in the AST
    let customTaskCount = 0
    let listItemCount = 0
    
    visit(processedAst, (node) => {
      if (node.type === 'customTask') customTaskCount++
      else if (node.type === 'listItem') listItemCount++
    })
    
    console.log('\n' + '='.repeat(50))
    console.log('AST ANALYSIS:')
    console.log('='.repeat(50))
    console.log(`- customTask nodes: ${customTaskCount}`)
    console.log(`- listItem nodes: ${listItemCount}`)
    
    // Serialize back to markdown
    const result = await processor.process(markdown)
    const serialized = String(result)

    console.log('\n' + '='.repeat(50))
    console.log('SERIALIZED MARKDOWN (ROUND-TRIP):')
    console.log('='.repeat(50))
    console.log(serialized)

    // Check if the serialization preserves the original format
    const normalizedOriginal = markdown.trim()
    const normalizedSerialized = serialized.trim()
    const isPreserved = normalizedOriginal === normalizedSerialized

    console.log('\n' + '='.repeat(50))
    console.log(`ROUND-TRIP SUCCESSFUL: ${isPreserved ? '✅ Yes' : '❌ No'}`)
    console.log('='.repeat(50))

    if (!isPreserved) {
      console.log('\nDifferences found:')
      // Highlight differences between original and serialized
      const originalLines = normalizedOriginal.split('\n')
      const serializedLines = normalizedSerialized.split('\n')

      const maxLen = Math.max(originalLines.length, serializedLines.length)

      for (let i = 0; i < maxLen; i++) {
        const origLine = originalLines[i] || ''
        const serLine = serializedLines[i] || ''

        if (origLine !== serLine) {
          console.log(`Line ${i + 1}:`)
          console.log(`  Original: ${origLine}`)
          console.log(`  Serialized: ${serLine}`)
          console.log()
        }
      }
    }
    
    console.log('\n💡 NOTE: The plugin now transforms list items with task markers')
    console.log('into customTask nodes while preserving the original Markdown syntax.')

  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Run the demo
runDemo()