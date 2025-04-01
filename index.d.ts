import { Plugin } from 'remark';
import { Root, ListItem } from '@types/mdast';
import { Options as ToMarkdownOptions } from 'mdast-util-to-markdown';

/**
 * CustomTask node type for representing list items with custom task markers
 */
export interface CustomTask extends Omit<ListItem, 'type'> {
  type: 'customTask';
  marker: string;
  taskContent: string;
}

/**
 * Plugin to add support for custom task markers in markdown lists.
 * Handles both parsing and serialization.
 */
declare const remarkCustomTasks: Plugin<[], Root, Root>;

/**
 * Configuration for serialization to handle custom task markers.
 * This is exposed for advanced usage but is automatically registered
 * when using the plugin.
 */
export function customTasksToMarkdown(): ToMarkdownOptions;

export default remarkCustomTasks;