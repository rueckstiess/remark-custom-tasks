import test from 'node:test'
import assert from 'node:assert/strict'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import remarkCustomTasks from '../index.js'

test('remarkCustomTasks serialization', async (t) => {
  await t.test('should correctly serialize customTask nodes', async () => {
    const markdown = '- [q] Question to answer'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
    
    // Verify that the node was processed as a customTask
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    let found = false
    visit(ast, 'customTask', () => {
      found = true
    })
    
    assert.equal(found, true, 'Node should be processed as a customTask')
  })

  await t.test('should handle serializing multiple items with different markers', async () => {
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
    
    // Verify node types in the AST
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    let customTaskCount = 0
    let listItemCount = 0
    
    visit(ast, (node) => {
      if (node.type === 'customTask') customTaskCount++
      if (node.type === 'listItem') listItemCount++
    })
    
    assert.equal(customTaskCount, 4, 'Should have 4 customTask nodes')
    assert.equal(listItemCount, 1, 'Should have 1 regular listItem node')
  })

  await t.test('should handle serializing nested items with markers', async () => {
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
    
    // Verify nested nodes are all customTasks
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    let customTaskCount = 0
    visit(ast, 'customTask', () => {
      customTaskCount++
    })
    
    assert.equal(customTaskCount, 3, 'Should have 3 customTask nodes')
  })

  await t.test('should not modify regular list items during serialization', async () => {
    const markdown = '- Just a regular list item'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
    
    // Verify it's still a listItem, not a customTask
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    let customTaskCount = 0
    let listItemCount = 0
    
    visit(ast, (node) => {
      if (node.type === 'customTask') customTaskCount++
      if (node.type === 'listItem') listItemCount++
    })
    
    assert.equal(customTaskCount, 0, 'Should have no customTask nodes')
    assert.equal(listItemCount, 1, 'Should have 1 regular listItem node')
  })

  await t.test('should handle complex markers during serialization', async () => {
    const markdown = '- [D!] Complex marker'
    const processor = remark().use(remarkCustomTasks)
    const result = await processor.process(markdown)
    const serialized = String(result)

    // Should preserve the original markdown syntax
    assert.equal(serialized.trim(), markdown)
    
    // Verify it's a customTask with the correct marker
    const ast = processor.parse(markdown)
    processor.runSync(ast)
    
    let marker
    visit(ast, 'customTask', (node) => {
      marker = node.marker
    })
    
    assert.equal(marker, 'D!', 'Should correctly parse complex marker')
  })
})