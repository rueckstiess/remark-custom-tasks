/**
 * @typedef {import('unified').Plugin} Plugin
 * @typedef {import('@types/mdast').Root} Root
 * @typedef {import('@types/mdast').ListItem} ListItem
 * @typedef {import('@types/mdast').Paragraph} Paragraph
 * @typedef {import('@types/mdast').Text} Text
 * @typedef {ListItem & {marker?: string}} CustomListItem
 */

import { visit } from 'unist-util-visit'

/**
 * Plugin to add marker metadata to list items with custom task syntax.
 *
 * @type {Plugin<[], Root>}
 */
function remarkCustomTasks() {
  /**
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

export default remarkCustomTasks