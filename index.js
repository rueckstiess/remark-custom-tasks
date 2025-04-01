/**
 * @typedef {import('unified').Plugin} Plugin
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('remark').Root} Root
 * @typedef {import('remark').ListItem} ListItem
 * @typedef {import('remark').Paragraph} Paragraph
 * @typedef {import('remark').Text} Text
 * @typedef {Omit<ListItem, 'type'> & {type: 'customTask', marker: string, taskContent: string}} CustomTask
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownOptions
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 */

import { visit } from 'unist-util-visit'
import { defaultHandlers } from 'mdast-util-to-markdown'

/**
 * Plugin to add support for custom task markers in markdown lists.
 * Handles both parsing and serialization.
 *
 * @returns {undefined}
 * @type {Plugin<[], Root, Root>}
 */
export default function remarkCustomTasks() {
  const data = this.data()

  // Add serialization extensions
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

  toMarkdownExtensions.push(customTasksToMarkdown())

  /**
   * Transformer function that processes the syntax tree
   *
   * @param {Root} tree
   * @returns {undefined}
   */
  return function (tree) {
    visit(tree, 'listItem', visitor)

    /**
     * @param {ListItem} node
     * @returns {void}
     */
    function visitor(node) {
      // Make sure the list item has a paragraph as its first child
      if (!node.children?.length || node.children[0].type !== 'paragraph') {
        return
      }

      const paragraph = node.children[0]

      // Make sure the paragraph has text content
      if (!paragraph.children?.length || paragraph.children[0].type !== 'text') {
        return
      }

      const textNode = paragraph.children[0]
      const text = textNode.value

      // Check for marker pattern like [q], [x], etc.
      const markerMatch = text.match(/^\s*\[([^\]]+)\]\s*(.*)$/)

      if (markerMatch) {
        // Extract the marker and the rest of the text
        const marker = markerMatch[1]
        const content = markerMatch[2]

        // Change the node type to customTask
        node.type = 'customTask'
        node.marker = marker
        node.taskContent = content
      }
    }
  }
}

/**
 * Configure serialization to handle custom task markers
 *
 * @returns {import('mdast-util-to-markdown').Options}
 */
export function customTasksToMarkdown() {
  return {
    // Configure how markdown is generated
    bullet: '-', // Use hyphen for bullet lists to match input expectation
    listItemIndent: 'one', // Use one space between bullet and content
    handlers: {
      customTask: customTaskHandler, // Handler for customTask nodes
      // Add custom text handler to prevent escaping of [ characters
      text: function (node) {
        // For text nodes, make sure square brackets aren't escaped
        return node.value.replace(/\\(\[)/g, '$1')
      }
    }
  }
}

/**
 * Custom handler for serializing customTask nodes
 *
 * @type {ToMarkdownHandle}
 */
function customTaskHandler(node, parent, state, info) {
  const marker = `[${node.marker}] `
  const tracker = state.createTracker(info)
  tracker.move(marker)

  // Create a node clone without the marker in the text content
  if (node.children?.length > 0 && node.children[0].type === 'paragraph') {
    const paragraph = node.children[0]
    if (paragraph.children?.length > 0 && paragraph.children[0].type === 'text') {
      const textNode = paragraph.children[0]
      const originalText = textNode.value
      // Temporarily modify the text node to not include the marker
      textNode.value = textNode.value.replace(/^\s*\[[^\]]+\]\s*/, '')

      // Create a copy of the node with type 'listItem' for default handling
      const listItemNode = { ...node, type: 'listItem' }
      
      // Get the value using default listItem handler
      const value = defaultHandlers.listItem(listItemNode, parent, state, {
        ...info,
        ...tracker.current()
      })

      // Restore the original text
      textNode.value = originalText

      // Add the custom marker
      return value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, function ($0) {
        return $0 + marker
      })
    }
  }

  // Fallback: convert to listItem and use default handler, then add marker
  const listItemNode = { ...node, type: 'listItem' }
  let value = defaultHandlers.listItem(listItemNode, parent, state, {
    ...info,
    ...tracker.current()
  })

  // Add the custom marker
  value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, function ($0) {
    return $0 + marker
  })

  return value
}