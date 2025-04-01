import test from 'node:test'
import assert from 'node:assert/strict'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import remarkCustomTasks from '../index.js'

test('remarkCustomTasks', async (t) => {
  await t.test('should convert list items with custom task syntax to customTask nodes', () => {
    const markdown = '- [q] Question to answer'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let customTask
    visit(ast, 'customTask', (node) => {
      customTask = node
    })

    assert.equal(customTask.type, 'customTask')
    assert.equal(customTask.marker, 'q')
    assert.equal(customTask.taskContent, 'Question to answer')
    assert.equal(customTask.children[0].children[0].value, '[q] Question to answer')
  })

  await t.test('should handle multiple list items with different markers', () => {
    const markdown = [
      '- [q] Question to answer',
      '- [x] Completed task',
      '- [ ] Open task',
      '- [D] Decision to make',
      '- Regular list item'
    ].join('\n')

    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    const customTasks = []
    const listItems = []

    // Visit customTask nodes
    visit(ast, 'customTask', (node) => {
      customTasks.push({
        type: node.type,
        marker: node.marker,
        taskContent: node.taskContent
      })
    })

    // Visit regular listItem nodes
    visit(ast, 'listItem', (node) => {
      listItems.push({
        type: node.type,
        marker: node.marker,
        taskContent: node.taskContent
      })
    })

    // Should have 4 customTasks and 1 regular listItem
    assert.equal(customTasks.length, 4)
    assert.equal(listItems.length, 1)
    
    // Check custom tasks
    assert.deepEqual(customTasks, [
      { type: 'customTask', marker: 'q', taskContent: 'Question to answer' },
      { type: 'customTask', marker: 'x', taskContent: 'Completed task' },
      { type: 'customTask', marker: ' ', taskContent: 'Open task' },
      { type: 'customTask', marker: 'D', taskContent: 'Decision to make' }
    ])
    
    // Check regular list item
    assert.deepEqual(listItems[0], {
      type: 'listItem',
      marker: undefined,
      taskContent: undefined
    })
  })

  await t.test('should handle nested list items with markers', () => {
    const markdown = [
      '- [q] Question',
      '  - [x] Subitem',
      '    - [D] Sub-subitem'
    ].join('\n')

    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    const foundTasks = []

    visit(ast, 'customTask', (node) => {
      foundTasks.push({
        type: node.type,
        marker: node.marker,
      })
    })

    assert.equal(foundTasks.length, 3)
    assert.equal(foundTasks[0].type, 'customTask')
    assert.equal(foundTasks[0].marker, 'q')
    assert.equal(foundTasks[1].type, 'customTask')
    assert.equal(foundTasks[1].marker, 'x')
    assert.equal(foundTasks[2].type, 'customTask')
    assert.equal(foundTasks[2].marker, 'D')
  })

  await t.test('should not modify list items without markers', () => {
    const markdown = '- Just a regular list item'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let listItem
    visit(ast, 'listItem', (node) => {
      listItem = node
    })

    // Should still be a regular listItem
    assert.equal(listItem.type, 'listItem')
    assert.equal(listItem.marker, undefined)
    assert.equal(listItem.taskContent, undefined)
    assert.equal(listItem.children[0].children[0].value, 'Just a regular list item')
  })

  await t.test('should handle standard task list items', () => {
    const markdown = '- [x] Standard task list item'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let customTask
    visit(ast, 'customTask', (node) => {
      customTask = node
    })

    // Standard task list items should now be customTask nodes
    assert.equal(customTask.type, 'customTask')
    assert.equal(customTask.marker, 'x')
    assert.equal(customTask.taskContent, 'Standard task list item')
  })

  await t.test('should handle complex markers', () => {
    const markdown = '- [D!] Complex marker'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let customTask
    visit(ast, 'customTask', (node) => {
      customTask = node
    })

    assert.equal(customTask.type, 'customTask')
    assert.equal(customTask.marker, 'D!')
    assert.equal(customTask.taskContent, 'Complex marker')
    assert.equal(customTask.children[0].children[0].value, '[D!] Complex marker')
  })
})

