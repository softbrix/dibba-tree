import type { DibbaTree } from './DibbaTree.js';
import type { DibbaNode } from './DibbaNode.js';
import type { PathArray, PathKey } from './types.js';

/**
 * Check if node has children
 */
function hasChildren<T>(node: DibbaNode<T> | undefined): boolean {
  return (
    node !== undefined &&
    node.children !== undefined &&
    Object.keys(node.children).length > 0
  );
}

/**
 * Get child keys from node (expects node to have children)
 */
function childKeys<T>(node: DibbaNode<T>): string[] {
  return Object.keys(node.children).sort();
}

/**
 * Get child key index for given node
 */
function getChildKey<T>(node: DibbaNode<T>, keys: string[]): number {
  const childKeyId = keys.indexOf(String(node.id));

  if (childKeyId === -1) {
    throw new Error('Node has been deleted?');
  }

  return childKeyId;
}

/**
 * Move down the tree to a leaf node
 *
 * @param node - Starting node
 * @param pickLastKey - If true, pick rightmost child at each level
 * @returns Leaf node
 */
function moveDown<T>(node: DibbaNode<T>, pickLastKey: boolean = false): DibbaNode<T> {
  while (hasChildren(node)) {
    const keys = childKeys(node);

    if (pickLastKey) {
      const lastKeyId = keys.length - 1;
      const lastChildKey = keys[lastKeyId];
      node = node.children[lastChildKey];
    } else {
      const firstChildKey = keys[0];
      node = node.children[firstChildKey];
    }
  }

  return node;
}

/**
 * Find the next leaf node in sorted order
 */
function findNextLeaf<T>(node: DibbaNode<T>): DibbaNode<T> | undefined {
  const parent = node.parent;

  if (parent !== undefined) {
    const keys = childKeys(parent);
    const childKeyId = getChildKey(node, keys);
    const nextChildId = childKeyId + 1;

    if (keys.length > nextChildId) {
      const nextNode = parent.children[keys[nextChildId]];
      return moveDown(nextNode);
    } else {
      return findNextLeaf(parent);
    }
  }

  return undefined;
}

/**
 * Find the previous leaf node in sorted order
 */
function findPrevLeaf<T>(node: DibbaNode<T>): DibbaNode<T> | undefined {
  const parent = node.parent;

  if (parent !== undefined) {
    const keys = childKeys(parent);
    const childKeyId = getChildKey(node, keys);
    const nextChildId = childKeyId - 1;

    if (nextChildId >= 0) {
      const prevNode = parent.children[keys[nextChildId]];
      return moveDown(prevNode, true);
    } else {
      return findPrevLeaf(parent);
    }
  }

  return undefined;
}

/**
 * Find closest child key to target
 */
function findClosestChildKey<T>(node: DibbaNode<T>, childKey: PathKey): string {
  const keys = node.getChildrenKeys();
  let lastKey = keys[0];
  let i = 0;

  while (++i < keys.length && keys[i] < String(childKey)) {
    lastKey = keys[i];
  }

  return lastKey;
}

/**
 * Find closest leaf to a target path
 */
function findClosestLeaf<T>(node: DibbaNode<T>, pathArray: PathArray): DibbaNode<T> {
  if (pathArray.length === 0 || Object.keys(node.children).length === 0) {
    return node;
  }

  const subNodeId = pathArray[0];
  const childNode = node.children[String(subNodeId)];

  if (childNode === undefined) {
    const key = findClosestChildKey(node, subNodeId);
    // Pick rightmost child if requested id is larger than found key
    return moveDown(node.children[key], key < String(subNodeId));
  }

  return findClosestLeaf(childNode, pathArray.slice(1));
}

/**
 * Step function for iterator navigation
 */
type StepFunction<T> = (node: DibbaNode<T>) => DibbaNode<T> | undefined;

function step<T>(
  iterator: LeafIterator<T>,
  stepNode: DibbaNode<T> | undefined,
  findStepNode: StepFunction<T>
): T | undefined {
  if (stepNode === undefined) {
    iterator._node = findStepNode(iterator._node!);
  } else {
    iterator._node = stepNode;
  }

  if (iterator._node === undefined) {
    return undefined;
  }

  return iterator._node.content;
}

/**
 * Bidirectional iterator for tree leaf nodes with lazy evaluation
 */
export class LeafIterator<T> {
  private _tree: DibbaTree<T>;
  _node: DibbaNode<T> | undefined;
  _nextNode: DibbaNode<T> | undefined;
  _prevNode: DibbaNode<T> | undefined;

  constructor(tree: DibbaTree<T>, reverse: boolean = false) {
    if (tree === undefined) {
      throw new Error('Missing argument tree in leaf iterator');
    }

    this._tree = tree;
    const rootNode = tree.getNode();

    if (rootNode === undefined) {
      throw new Error('Tree has no root node');
    }

    if (reverse === true) {
      this._node = moveDown(rootNode, true);
      this._prevNode = this._node;
      this._nextNode = undefined;
    } else {
      this._node = moveDown(rootNode);
      this._nextNode = this._node;
      this._prevNode = undefined;
    }
  }

  /**
   * Check if there is a next leaf node
   */
  hasNext(): boolean {
    if (this._nextNode === undefined && this._node !== undefined) {
      this._nextNode = findNextLeaf(this._node);
    }
    return this._nextNode !== undefined;
  }

  /**
   * Move to and return next leaf content
   */
  next(): T | undefined {
    const content = step(this, this._nextNode, findNextLeaf);
    this._nextNode = undefined;

    if (this._node !== undefined) {
      this._prevNode = this._node;
    }

    return content;
  }

  /**
   * Check if there is a previous leaf node
   */
  hasPrev(): boolean {
    if (this._prevNode === undefined && this._node !== undefined) {
      this._prevNode = findPrevLeaf(this._node);
    }
    return this._prevNode !== undefined;
  }

  /**
   * Move to and return previous leaf content
   */
  prev(): T | undefined {
    const content = step(this, this._prevNode, findPrevLeaf);
    this._prevNode = undefined;

    if (this._node !== undefined) {
      this._nextNode = this._node;
    }

    return content;
  }

  /**
   * Get the path of the current node
   */
  getPath(): PathArray | undefined {
    if (this._node !== undefined) {
      return this._node._getPath();
    }
    return undefined;
  }

  /**
   * Navigate to a specific path
   *
   * @param path - Target path
   * @param pickLastKey - If true and path is internal node, pick rightmost leaf
   */
  gotoPath(path: PathArray, pickLastKey: boolean = false): void {
    let node = this._tree.getNode(...path);

    if (node === undefined) {
      const rootNode = this._tree.getNode();
      if (rootNode === undefined) {
        throw new Error('Tree has no root node');
      }
      node = findClosestLeaf(rootNode, path);
    }

    this._node = moveDown(node, pickLastKey);
    this._nextNode = this._node;
    this._prevNode = this._node;
  }
}
