/**
 * @typedef {import('unified').Plugin} Plugin
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('@types/mdast').Root} Root
 * @typedef {import('@types/mdast').ListItem} ListItem
 * @typedef {import('@types/mdast').Paragraph} Paragraph
 * @typedef {import('@types/mdast').Text} Text
 * @typedef {ListItem & {marker?: string, taskContent?: string}} CustomListItem
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
 * @type {Plugin<[], Root>}
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

        // Add marker and content to the list item node
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
    handlers: {
      listItem: listItemWithCustomMarker,
      // Add custom text handler to prevent escaping of [ characters
      text: function (node) {
        // For text nodes, make sure square brackets aren't escaped
        return node.value.replace(/\\(\[)/g, '$1')
      }
    }
  }
}

/**
 * Custom handler for serializing list items with custom markers
 *
 * @type {ToMarkdownHandle}
 */
function listItemWithCustomMarker(node, parent, state, info) {
  const customMarker = typeof node.marker === 'string'
  const marker = customMarker ? `[${node.marker}] ` : ''
  const tracker = state.createTracker(info)

  if (customMarker) {
    tracker.move(marker)
  }

  // Create a node clone without the marker in the text content
  if (customMarker && node.children?.length > 0 && node.children[0].type === 'paragraph') {
    const paragraph = node.children[0]
    if (paragraph.children?.length > 0 && paragraph.children[0].type === 'text') {
      const textNode = paragraph.children[0]
      const originalText = textNode.value
      // Temporarily modify the text node to not include the marker
      textNode.value = textNode.value.replace(/^\s*\[[^\]]+\]\s*/, '')

      // Get the value using default handler
      const value = defaultHandlers.listItem(node, parent, state, {
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

  // Default handling for non-custom-task list items
  let value = defaultHandlers.listItem(node, parent, state, {
    ...info,
    ...tracker.current()
  })

  // Add the custom marker if needed
  if (customMarker) {
    value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, function ($0) {
      return $0 + marker
    })
  }

  return value
}