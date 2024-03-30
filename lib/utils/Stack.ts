export class Stack<T> {
  private elements: Array<T> = [];

  isEmpty(): boolean {
    return this.elements.length === 0;
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.elements[this.elements.length - 1];
  }

  pop(): T {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.elements.pop() as T;
  }

  push(el: T): void {
    this.elements.push(el);
  }

  search(el: T): number {
    return this.elements.lastIndexOf(el);
  }

  size(): number {
    return this.elements.length;
  }

  get(index: number): T | null {
    return this.elements[index] ?? null;
  }
}
