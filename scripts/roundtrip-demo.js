import { remark } from 'remark'
import fs from 'node:fs/promises'
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

    // Parse and stringify using the same plugin instance
    // With the refactored plugin, serialization is built-in
    const processor = remark().use(remarkCustomTasks)
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

  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Run the demo
runDemo()