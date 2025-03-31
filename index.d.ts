import { Plugin } from 'unified';
import { Root, ListItem } from '@types/mdast';

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

export default remarkCustomTasks;