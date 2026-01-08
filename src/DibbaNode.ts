import type { PathArray, PathKey, ChildrenMap } from './types.js';

/**
 * Internal node class representing a single node in the tree.
 * Not exported publicly - used internally by DibbaTree.
 */
export class DibbaNode<T> {
  parent: DibbaNode<T> | undefined;
  id: PathKey;
  children: ChildrenMap<T>;
  content: T | undefined;

  constructor(parent?: DibbaNode<T>, id?: PathKey, content?: T) {
    this.parent = parent;
    this.id = id ?? '';
    this.children = {};
    this.content = content;
  }

  /**
   * Return the keys of the node's children, sorted alphabetically
   */
  getChildrenKeys(): string[] {
    return Object.keys(this.children).sort();
  }

  /**
   * Return all the leaf node contents from this node and its descendants
   */
  getLeaves(): T[] {
    const nodeArray = flatten(this.children);
    return nodeArray
      .filter(node => node.content !== undefined)
      .map(node => node.content as T);
  }

  /**
   * Return the path for this node by recursively calling its parents
   */
  _getPath(): PathArray {
    return getPath(this);
  }
}

/**
 * Recursively build path from node to root
 */
function getPath<T>(node: DibbaNode<T>): PathArray {
  const path: PathArray = [];
  let current: DibbaNode<T> | undefined = node;

  while (current?.parent) {
    path.push(current.id);
    current = current.parent;
  }

  return path.reverse();
}

/**
 * Flatten children tree into array of leaf nodes
 */
function flatten<T>(nodes: ChildrenMap<T>, leafArray: DibbaNode<T>[] = []): DibbaNode<T>[] {
  Object.keys(nodes).forEach(key => {
    const node = nodes[key];
    const nOfChildren = Object.keys(node.children).length;

    if (nOfChildren === 0) {
      leafArray.push(node);
    } else {
      flatten(node.children, leafArray);
    }
  });

  return leafArray;
}

/**
 * Find or create node at given path
 */
export function findNode<T>(
  node: DibbaNode<T>,
  pathArray: PathArray,
  create: boolean = false
): DibbaNode<T> | undefined {
  if (pathArray.length === 0) {
    return node;
  }

  const subNodeId = pathArray[0];
  let childNode = node.children[String(subNodeId)];

  if (childNode === undefined) {
    if (create) {
      childNode = node.children[String(subNodeId)] = new DibbaNode<T>(node, subNodeId);
    } else {
      return undefined;
    }
  }

  return findNode(childNode, pathArray.slice(1), create);
}

/**
 * Helper for subset operation - recursively copy subtree with range constraints
 */
export function subSetHelper<T>(
  copyNode: DibbaNode<T> | undefined,
  from: PathArray | undefined,
  to: PathArray | undefined,
  newNode: DibbaNode<T>
): void {
  if (copyNode === undefined) {
    return;
  }

  const start = from !== undefined && from.length ? String(from.shift()) : undefined;
  const end = to !== undefined && to.length ? String(to.shift()) : undefined;

  newNode.content = copyNode.content;

  // No limits, copy all children
  if (start === undefined && end === undefined) {
    newNode.children = copyNode.children;
  } else {
    copyNode.getChildrenKeys().forEach(x => {
      if (start !== undefined && x < start) {
        return;
      }
      if (end !== undefined && x > end) {
        return;
      }

      newNode.children[x] = new DibbaNode<T>(newNode, x);
      const childNode = copyNode.children[x];
      subSetHelper(
        childNode,
        start === x ? from : undefined,
        end === x ? to : undefined,
        newNode.children[x]
      );
    });
  }
}
