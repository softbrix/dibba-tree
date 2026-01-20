# AI AGENT GUIDANCE

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

Dibba-tree is a tree data structure implementation for JavaScript/TypeScript. It provides a hierarchical node structure with variable-length path-based access, leaf iteration capabilities, and subset operations.

## Technology Stack

- **Language**: TypeScript (source in `src/`), compiled to JavaScript (output in `dist/`)
- **Testing**: Mocha with TypeScript
- **Build**: TypeScript compiler (`tsc`)

## Common Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Test**: `npm test` - Compiles test TypeScript and runs Mocha tests
- **Publish**: `npm run prepublishOnly` - Builds and tests before publishing

## Project Structure

- `src/` - TypeScript source files
- `test/` - TypeScript test files
- `dist/` - Compiled JavaScript output (git-ignored)
- `dist-test/` - Compiled test output (git-ignored)

## Architecture

### Core Components

**DibbaTree (src/DibbaTree.ts)**
- Main tree implementation with generic type parameter `<T>` for content
- Private fields: `_rootNode` (DibbaNode instance) and `_size` counter
- Path-based operations: paths are variable-length argument lists of type `PathKey[]` (e.g., `tree.get(1, 2, 3)`)
- Key operations:
  - `insert(content: T, ...path: PathKey[])`: Creates new nodes, throws if node exists or content is null/undefined
  - `update(content: T | undefined | null, ...path: PathKey[])`: Creates or replaces nodes, allows undefined/null
  - `delete(...path: PathKey[])`: Removes node, returns deleted node or undefined
  - `get(...path: PathKey[])`: Retrieves content or undefined
  - `getNode(...path: PathKey[])`: Retrieves node or undefined
  - `subSet(from, to)`: Returns new tree with range of nodes (inclusive)
  - `getSize()`: Returns count of nodes with content
  - `leafIterator()` / `leafIteratorReverse()`: Returns leaf iterators
  - `randomLeaf()`: Returns random leaf content

**DibbaNode (src/DibbaNode.ts)**
- Generic class with type parameter `<T>` for content
- Node structure: `parent`, `id`, `children` (object), `content`
- Children stored as object with string keys (not array), sorted alphabetically
- Helper methods: `getChildrenKeys()`, `getLeaves()`, `_getPath()`
- Module exports helper functions: `findNode()`, `subSetHelper()`

**LeafIterator (src/LeafIterator.ts)**
- Generic class `<T>` for bidirectional iteration over leaf nodes (nodes without children)
- Methods: `next()`, `prev()`, `hasNext()`, `hasPrev()`, `getPath()`, `gotoPath(path, pickLastKey)`
- Navigation helpers traverse the tree structure to find next/previous leaves
- Created via `tree.leafIterator()` (ascending) or `tree.leafIteratorReverse()` (descending)

### Key Design Patterns

1. **Type Safety**: Generic type parameter `<T>` ensures type-safe content throughout the tree

2. **Path Representation**: Paths use rest parameters of type `PathKey` (string | number), providing flexible addressing

3. **Node Creation**: `findNode()` with `create=true` automatically builds intermediate nodes

4. **Leaf Detection**: Nodes without children (empty `children` object) are considered leaves

5. **Iterator State**: LeafIterator maintains `_node` (current), `_nextNode` (lookahead), `_prevNode` (lookback)

6. **Tree Traversal**: Children keys are sorted, enabling ordered iteration and range operations

7. **Size Tracking**: Tree maintains `_size` counter that only counts nodes with defined content

## Implementation Notes

- Content type is determined by generic parameter `<T>`
- `insert()` enforces non-null/undefined content; `update()` allows all values including null/undefined
- The tree tracks size separately from node count (only nodes with content count)
- Paths support both integer and string keys mixed (e.g., `tree.insert(obj, 1, "a")`)
- `subSet()` accepts both `PathArray` and `DibbaNode<T>` objects as range boundaries
- `randomLeaf()` traverses randomly down the tree until reaching a leaf
- `delete()` returns the removed node for inspection, or undefined if not found
- All path parameters use the `PathKey` type (union of string | number)

## Testing Guidelines

- Test files are in `test/` directory using TypeScript
- Tests use Mocha framework with Node's built-in `assert` module
- Run `npm test` to compile and execute all tests
- Tests cover: basic operations, edge cases, size tracking, iterators, and performance
