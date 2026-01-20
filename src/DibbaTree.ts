import { DibbaNode, findNode, subSetHelper } from './DibbaNode.js';
import { LeafIterator } from './LeafIterator.js';
import type { PathArray, PathKey } from './types.js';

/**
 * Generate random integer between 0 and max (exclusive)
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Main tree data structure with type-safe generic content
 */
export class DibbaTree<T> {
  private _rootNode: DibbaNode<T>;
  private _size: number;

  constructor() {
    this._rootNode = new DibbaNode<T>();
    this._size = 0;
  }

  /**
   * Insert content at the given path. Creates intermediate nodes if needed.
   * Throws error if node already exists or content is null/undefined.
   *
   * @param content - The content to insert (cannot be null or undefined)
   * @param path - Variable-length path of string or number keys
   * @throws {Error} If content is null/undefined or node already exists
   */
  insert(content: T, ...path: PathKey[]): void {
    if (content === undefined || content === null) {
      throw new Error('Content must not be undefined or null');
    }

    const node = findNode(this._rootNode, path, true);

    if (node === undefined) {
      throw new Error('Failed to create node at path');
    }

    if (node.content !== undefined) {
      throw new Error('Node already exists');
    }

    node.content = content;
    this._size += 1;
  }

  /**
   * Update content at the given path. Creates node if it doesn't exist.
   * Allows undefined and null as content values.
   *
   * @param content - The content to set (can be any value including undefined/null)
   * @param path - Variable-length path of string or number keys
   */
  update(content: T | undefined | null, ...path: PathKey[]): void {
    const node = findNode(this._rootNode, path, true);

    if (node === undefined) {
      throw new Error('Failed to create node at path');
    }

    if (node.content === undefined) {
      this._size += 1;
    }

    node.content = content as T | undefined;
  }

  /**
   * Remove a node from the tree. Returns the deleted node.
   *
   * @param path - Variable-length path of string or number keys
   * @returns The deleted node, or undefined if not found
   */
  delete(...path: PathKey[]): DibbaNode<T> | undefined {
    const node = this.getNode(...path);

    if (node === undefined) {
      return undefined;
    }

    if (node.parent === undefined) {
      // Root node deletion
      if (path.length === 0) {
        this._rootNode = new DibbaNode<T>();
        this._size = 0;
      } else {
        throw new Error(
          `Internal error in DibbaTree, root node returned when asking for: ${path[0]}`
        );
      }
    } else {
      // Remove node from parent
      const lastPath = path[path.length - 1];
      delete node.parent.children[String(lastPath)];
      this._size -= 1;
    }

    return node;
  }

  /**
   * Get the node at the given path
   *
   * @param path - Variable-length path of string or number keys
   * @returns The node, or undefined if not found
   */
  getNode(...path: PathKey[]): DibbaNode<T> | undefined {
    return findNode(this._rootNode, path);
  }

  /**
   * Get the content of the node at the given path
   *
   * @param path - Variable-length path of string or number keys
   * @returns The content, or undefined if node not found or has no content
   */
  get(...path: PathKey[]): T | undefined {
    const node = this.getNode(...path);
    return node?.content;
  }

  /**
   * Returns a subset tree from the first node to the end node (inclusive)
   *
   * @param from - Starting path as array or node (undefined for beginning)
   * @param to - Ending path as array or node (undefined for end)
   * @returns New tree containing the subset
   */
  subSet(
    from: PathArray | DibbaNode<T> | undefined,
    to: PathArray | DibbaNode<T> | undefined
  ): DibbaTree<T> {
    let fromPath: PathArray | undefined = undefined;
    let toPath: PathArray | undefined = undefined;

    if (from !== undefined && !Array.isArray(from)) {
      fromPath = from._getPath();
    } else {
      fromPath = from;
    }

    if (to !== undefined && !Array.isArray(to)) {
      toPath = to._getPath();
    } else {
      toPath = to;
    }

    const tree = new DibbaTree<T>();
    const sourceNode = this.getNode();
    const targetNode = tree.getNode();

    if (sourceNode && targetNode) {
      subSetHelper(sourceNode, fromPath, toPath, targetNode);
    }

    return tree;
  }

  /**
   * Get the number of nodes with content in the tree
   *
   * @returns The size (count of nodes with content)
   */
  getSize(): number {
    return this._size;
  }

  /**
   * Return a new leaf iterator starting from the lowest values
   *
   * @returns A leaf iterator in ascending order
   */
  leafIterator(): LeafIterator<T> {
    return new LeafIterator<T>(this);
  }

  /**
   * Return a new leaf iterator starting from the highest values
   *
   * @returns A leaf iterator in descending order
   */
  leafIteratorReverse(): LeafIterator<T> {
    return new LeafIterator<T>(this, true);
  }

  /**
   * Return a random leaf content from the tree
   *
   * @returns Random leaf content, or undefined if tree is empty
   */
  randomLeaf(): T | undefined {
    let node: DibbaNode<T> = this._rootNode;
    let children = Object.values(node.children || {});

    while (children.length > 0) {
      node = children[getRandomInt(children.length)];
      children = Object.values(node.children || {});
    }

    return node.content;
  }
}
