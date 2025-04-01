import test from 'node:test'
import assert from 'node:assert/strict'
import { remark } from 'remark'
import remarkCustomTasks from '../index.js'

test('remarkCustomTasks serialization', async (t) => {
  await t.test('should correctly serialize list items with custom task syntax', async () => {
    const markdown = '- [q] Question to answer'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
  })

  await t.test('should handle serializing multiple list items with different markers', async () => {
    const markdown = [
      '- [q] Question to answer',
      '- [x] Completed task',
      '- [ ] Open task',
      '- [D] Decision to make',
      '- Regular list item'
    ].join('\n')

    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
  })

  await t.test('should handle serializing nested list items with markers', async () => {
    const markdown = [
      '- [q] Question',
      '  - [x] Subitem',
      '    - [D] Sub-subitem'
    ].join('\n')

    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
  })

  await t.test('should not modify regular list items during serialization', async () => {
    const markdown = '- Just a regular list item'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
  })

  await t.test('should handle complex markers during serialization', async () => {
    const markdown = '- [D!] Complex marker'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
  })
})