import { Plugin } from 'unified';
import { Root, ListItem } from '@types/mdast';
import { Options as ToMarkdownOptions } from 'mdast-util-to-markdown';

/**
 * Extended ListItem interface with custom marker property
 */
export interface CustomListItem extends ListItem {
  marker?: string;
  taskContent?: string;
}

/**
 * Plugin to add marker metadata to list items with custom task syntax
 */
declare const remarkCustomTasks: Plugin<[], Root>;

/**
 * Configuration for serialization to handle custom task markers
 */
export function customTasksToMarkdown(): ToMarkdownOptions;

export default remarkCustomTasks;