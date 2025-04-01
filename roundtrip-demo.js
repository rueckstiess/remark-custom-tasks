import { remark } from 'remark'
import { toMarkdown } from 'mdast-util-to-markdown'
import fs from 'node:fs/promises'
import remarkCustomTasks, { customTasksToMarkdown } from './index.js'

async function runDemo() {
  try {
    // Read the original markdown file
    const markdownPath = './original.md'
    const markdown = await fs.readFile(markdownPath, 'utf8')
    
    console.log('='.repeat(50))
    console.log('ORIGINAL MARKDOWN:')
    console.log('='.repeat(50))
    console.log(markdown)
    
    // Parse the markdown to AST with our custom task parser
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    // Serialize the AST back to markdown using our serialization extension
    const serialized = toMarkdown(ast, {
      extensions: [customTasksToMarkdown()]
    })
    
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
    
  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Run the demo
runDemo()