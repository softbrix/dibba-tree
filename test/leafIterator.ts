import assert from 'assert';
import { DibbaTree, LeafIterator } from '../src/index.js';

describe('Dibba tree leaf iterator', function() {
  const simpleTree = function(): DibbaTree<string> {
    const tree = new DibbaTree<string>();
    tree.insert('5', 1);  // sixth
    tree.insert('0', 0, 0, 0); // First
    tree.insert('Internal', 0, 0);  // Internal
    tree.insert('1', 0, 1); // second
    tree.insert('Internal', 0, 2);  // Internal
    tree.insert('3', 0, 2, 2);  // fourth
    tree.insert('2', 0, 2, 1); // third
    tree.insert('4', 0, 3); // fifth
    tree.insert('6', 2, 0); // seventh
    tree.insert('7', 2, 1); // eighth
    return tree;
  };

  const LEAF_NODE_COUNT = 7;

  it('should iterate over the given tree with has next and has prev', function() {
    const it = new LeafIterator(simpleTree());
    let i = 0;

    assert.equal(false, it.hasPrev());

    for (i = 0; i <= LEAF_NODE_COUNT; ++i) {
      assert.equal(true, it.hasNext(), 'Expected has next');
      assert.equal(it.next(), String(i));
    }

    assert.equal(false, it.hasNext());

    for (i = LEAF_NODE_COUNT; i >= 0; --i) {
      assert.equal(true, it.hasPrev(), 'Expected has prev');
      assert.equal(it.prev(), String(i));
    }

    assert.equal(false, it.hasPrev());
  });

  it('should iterate over the given tree with only next and prev', function() {
    const it = new LeafIterator(simpleTree());
    let i = 0;

    assert.equal(false, it.hasPrev());

    for (i = 0; i <= LEAF_NODE_COUNT; ++i) {
      assert.equal(it.next(), String(i));
    }

    assert.equal(false, it.hasNext());

    for (i = LEAF_NODE_COUNT; i >= 0; --i) {
      assert.equal(it.prev(), String(i));
    }

    assert.equal(false, it.hasPrev());
  });

  it('should iterate over the given tree with items added after iterator was created', function() {
    const tree = new DibbaTree<string>();
    tree.insert('2', 1);
    tree.insert('3', 2);

    const it = new LeafIterator(tree);
    assert.equal(it.next(), '2');
    assert.equal(it.next(), '3');

    tree.insert('1', 0);
    assert.equal(it.prev(), '3');
    assert.equal(it.prev(), '2');
    assert.equal(it.prev(), '1');
    assert.equal(false, it.hasPrev());
  });

  it('should return correct path', function() {
    const it = new LeafIterator(simpleTree());

    // First path twice...
    // TODO: This should be undefined
    assert.deepEqual(it.getPath(), [0, 0, 0]);
    it.next();
    assert.deepEqual(it.getPath(), [0, 0, 0]);
    it.next();
    assert.deepEqual(it.getPath(), [0, 1]);
    it.next();
    assert.deepEqual(it.getPath(), [0, 2, 1]);
  });

  it('should goto path', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([0, 2, 1]); // Third
    assert.equal(it.next(), '2');
    assert.equal(it.next(), '3');
  });

  it('should move to adjacent leaves immediately after goto path', function() {
    const it = new LeafIterator(simpleTree());
    it.gotoPath([0, 2, 1]); // Third ('2')
    assert.equal(true, it.hasNext());
    assert.equal(true, it.hasPrev());
    assert.equal('2', it.next());

    it.gotoPath([0, 2, 1]); // Third ('2')
    assert.equal(true, it.hasPrev());
    assert.equal('2', it.prev());
  });

  it('should goto path pick last child', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([0, 2]); // Third
    assert.equal(it.next(), '2');
    it.gotoPath([0, 2], false); // Third
    assert.equal(it.next(), '2');
    it.gotoPath([0, 2], true); // fourth
    assert.equal(it.next(), '3');
  });

  it('should goto path outside data nodes', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([3, 4]); // outside most right node in the tree
    assert.equal(true, it.hasNext());
    assert.equal(true, it.hasPrev());
    assert.equal('7', it.prev());
  });

  it('should goto path missing inside node', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([0, 2, 0]); // Goto a missing node
    assert.equal(true, it.hasNext());
    assert.equal(true, it.hasPrev());
    assert.equal('2', it.next());
  });

  it('should goto path missing inside node', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([0, 4, 3]); // Goto a missing node
    assert.equal(true, it.hasNext());
    assert.equal(true, it.hasPrev());
    assert.equal('4', it.next());
  });

  it('should goto path internal node', function() {
    const it = new LeafIterator(simpleTree());
    assert.equal(it.next(), '0');
    it.gotoPath([0, 2]); // Goto an internal node
    assert.equal(true, it.hasNext());
    assert.equal(true, it.hasPrev());
    assert.equal('2', it.next());
  });

  it('should be created as a reverse iterator', function() {
    const it = new LeafIterator(simpleTree(), true);
    assert.equal(false, it.hasNext());

    for (let i = LEAF_NODE_COUNT; i >= 0; --i) {
      assert.equal(true, it.hasPrev(), 'Expected has prev');
      assert.equal(it.prev(), String(i));
    }

    assert.equal(false, it.hasPrev());
  });
});
