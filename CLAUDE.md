# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dibba-tree is a tree data structure implementation for JavaScript. It provides a hierarchical node structure with variable-length path-based access, leaf iteration capabilities, and subset operations.

## Common Commands

- Run tests: `npm test`
- The test suite uses Mocha and is located in the `test/` directory

## Architecture

### Core Components

**DibbaTree (index.js)**
- Main tree implementation with `_rootNode` (DibbaNode instance) and `_size` counter
- Path-based operations: paths are variable-length argument lists (e.g., `tree.get(1, 2, 3)`)
- Key operations:
  - `insert(content, ...path)`: Creates new nodes, throws if node exists
  - `update(content, ...path)`: Creates or replaces nodes, allows undefined/null
  - `delete(...path)`: Removes node, returns deleted node
  - `get(...path)` / `getNode(...path)`: Retrieves content or node
  - `subSet(from, to)`: Returns new tree with range of nodes (inclusive)
  - `getSize()`: Returns count of nodes with content

**DibbaNode (index.js)**
- Node structure: `parent`, `id`, `children` (object), `content`
- Children are stored as object with keys (not array), sorted alphabetically
- Helper methods: `getChildrenKeys()`, `getLeaves()`, `_getPath()`

**LeafIterator (leafIterator.js)**
- Bidirectional iterator for leaf nodes (nodes without children)
- Methods: `next()`, `prev()`, `hasNext()`, `hasPrev()`, `getPath()`, `gotoPath(path, pickLastKey)`
- Navigation: `findNextLeaf()`, `findPrevLeaf()`, `moveDown()` traverse the tree structure
- Tree provides `leafIterator()` (ascending) and `leafIteratorReverse()` (descending)

### Key Design Patterns

1. **Path Representation**: Paths use rest parameters, converted to arrays internally via `Array.prototype.slice.call(arguments)`

2. **Node Creation**: `findNode()` with `create=true` automatically builds intermediate nodes

3. **Leaf Detection**: Nodes without children (empty `children` object) are considered leaves

4. **Iterator State**: LeafIterator maintains `_node` (current), `_nextNode` (lookahead), `_prevNode` (lookback)

5. **Tree Traversal**: Children keys are sorted, enabling ordered iteration and range operations

## Implementation Notes

- Content can be any value; `insert()` rejects undefined/null, `update()` allows them
- The tree tracks size separately from node count (only nodes with content count)
- Paths support both integer and string keys mixed (e.g., `tree.insert(obj, 1, "a")`)
- `subSet()` accepts both array paths and node objects as range boundaries
- `randomLeaf()` traverses randomly down the tree until reaching a leaf
- Delete returns the removed node for inspection
