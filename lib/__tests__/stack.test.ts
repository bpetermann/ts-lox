import { expect } from '@jest/globals';
import { Stack } from '../utils/Stack';

test('stack', () => {
  const stack: Stack<number> = new Stack();

  stack.push(0);
  stack.push(1);
  stack.push(2);
  stack.push(3);

  expect(stack.isEmpty()).toEqual(false);

  stack.pop();

  expect(stack.peek()).toEqual(2);

  stack.push(38);

  expect(stack.peek()).toEqual(38);
  expect(stack.search(1)).toEqual(1);

  stack.pop();
  stack.pop();
  stack.pop();
  stack.pop();

  expect(stack.isEmpty()).toEqual(true);
  expect(stack.pop).toThrow();

  stack.push(0);

  expect(stack.size()).toEqual(1);
  expect(stack.get(0)).toEqual(0);
});
