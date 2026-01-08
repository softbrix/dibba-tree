import type { DibbaNode } from './DibbaNode.js';

/**
 * Path key type - supports both string and number indices
 */
export type PathKey = string | number;

/**
 * Path array type for tree navigation
 */
export type PathArray = PathKey[];

/**
 * Children collection type - maps path keys to nodes
 */
export type ChildrenMap<T> = { [key: string]: DibbaNode<T> };
