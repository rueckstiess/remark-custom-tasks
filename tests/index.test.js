import test from 'node:test'
import assert from 'node:assert/strict'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import remarkCustomTasks from '../index.js'

test('remarkCustomTasks', async (t) => {
  await t.test('should add marker attribute to list items with custom task syntax', () => {
    const markdown = '- [q] Question to answer'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let listItem
    visit(ast, 'listItem', (node) => {
      listItem = node
    })

    assert.equal(listItem.marker, 'q')
    assert.equal(listItem.taskContent, 'Question to answer')
    assert.equal(listItem.children[0].children[0].value, '[q] Question to answer')
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

    const items = []

    visit(ast, 'listItem', (node) => {
      items.push({
        marker: node.marker,
        taskContent: node.taskContent
      })
    })

    assert.deepEqual(items, [
      { marker: 'q', taskContent: 'Question to answer' },
      { marker: 'x', taskContent: 'Completed task' },
      { marker: ' ', taskContent: 'Open task' },
      { marker: 'D', taskContent: 'Decision to make' },
      { marker: undefined, taskContent: undefined }
    ])
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

    const foundMarkers = []

    visit(ast, 'listItem', (node) => {
      foundMarkers.push({
        marker: node.marker,
      })
    })

    assert.equal(foundMarkers.length, 3)
    assert.equal(foundMarkers[0].marker, 'q')
    assert.equal(foundMarkers[1].marker, 'x')
    assert.equal(foundMarkers[2].marker, 'D')
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

    assert.equal(listItem.marker, undefined)
    assert.equal(listItem.taskContent, undefined)
    assert.equal(listItem.children[0].children[0].value, 'Just a regular list item')
  })

  await t.test('should handle standard task list items', () => {
    const markdown = '- [x] Standard task list item'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let listItem
    visit(ast, 'listItem', (node) => {
      listItem = node
    })

    // Standard task list items are already parsed by remark
    // but our plugin should still add the marker
    assert.equal(listItem.marker, 'x')
    assert.equal(listItem.taskContent, 'Standard task list item')
  })

  await t.test('should handle complex markers', () => {
    const markdown = '- [D!] Complex marker'
    const processor = remark().use(remarkCustomTasks)
    const ast = processor.parse(markdown)
    processor.runSync(ast)

    let listItem
    visit(ast, 'listItem', (node) => {
      listItem = node
    })

    assert.equal(listItem.marker, 'D!')
    assert.equal(listItem.taskContent, 'Complex marker')
    assert.equal(listItem.children[0].children[0].value, '[D!] Complex marker')
  })
})

