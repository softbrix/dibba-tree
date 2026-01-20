import assert from 'assert';
import { DibbaTree } from '../src/index.js';

describe('Dibba tree size', function() {
  interface TestObject {
    a: number;
  }

  const testObject1: TestObject = { a: 1 };
  const testObject2: TestObject = { a: 2 };
  const testObject3: TestObject = { a: 3 };
  const testObject4: TestObject = { a: 4 };

  describe('insert', function() {
    let tree: DibbaTree<TestObject>;

    beforeEach(function() {
      tree = new DibbaTree<TestObject>();
    });

    it('should increase size when insert', function() {
      assert.equal(0, tree.getSize());
      tree.insert(testObject1);
      assert.equal(1, tree.getSize());
    });

    it('should increase size when update non existing object', function() {
      assert.equal(0, tree.getSize());
      tree.update(testObject2);
      assert.equal(1, tree.getSize());
    });

    it('should not increase size when update existing object', function() {
      assert.equal(0, tree.getSize());
      tree.insert(testObject1);
      assert.equal(1, tree.getSize());
      tree.update(testObject2);
      assert.equal(1, tree.getSize());
    });

    it('should not decrease size when delete existing object', function() {
      assert.equal(0, tree.getSize());
      tree.insert(testObject1);
      assert.equal(1, tree.getSize());
      tree.delete();
      assert.equal(0, tree.getSize());
    });

    it('should increase size when insert multiple objects', function() {
      assert.equal(0, tree.getSize());
      tree.insert(testObject1, 1);
      tree.insert(testObject2, 2);
      tree.insert(testObject3, 3);
      assert.equal(3, tree.getSize());
    });

    it('should update size when insert multiple objects and then delete', function() {
      assert.equal(0, tree.getSize());
      tree.insert(testObject1, 1);
      tree.insert(testObject2, 2);
      tree.insert(testObject3, 3);
      assert.equal(3, tree.getSize());
      tree.delete(1);
      tree.delete(3);
      assert.equal(1, tree.getSize());
    });
  });
});
