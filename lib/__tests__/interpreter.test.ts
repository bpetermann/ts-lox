import { expect } from '@jest/globals';
import Lox from '../Lox';

const readEvalPrint = (source: string): void => {
  Lox.getInstance().run(source);
};

describe('Test interpretor visitor class', () => {
  let logSpy: jest.SpyInstance | undefined;

  beforeEach(() => {
    logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    if (logSpy) logSpy.mockRestore();
  });

  test('mathematical operations', () => {
    const input: [string, string][] = [
      [`print 5;`, '5'],
      [`print (5 + 10 * 2 + 15 / 3) * 2 + -10;`, '50'],
      [`print (10 + 2) * 30 == 300 + 20 * 3;`, 'true'],
      [`print (10 + 2) * 30 != 300 + 20 * 3;`, 'false'],
    ];

    input.forEach(([source, expected]) => {
      readEvalPrint(source);

      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
    });
  });

  test('convert a number to string when combined', () => {
    const input = 'print 1 + "1";';
    const expected = '11';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('should not evaluate 0 to nil', () => {
    const input = 'print 1 + 0;';
    const expected = '1';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('dividing by zero should result in an error', () => {
    logSpy = jest.spyOn(global.console, 'error');
    const input = 'print 10 / 0;';

    readEvalPrint(input);
    expect(console.error).toHaveBeenCalled();
  });

  test('reassign a defined variable', () => {
    const input = `
    var a = "hello, world!";
    a = 5;
    print a;`;
    const expected = '5';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('conditional statements', () => {
    const input: [string, string][] = [
      [`if(1 < 3) print true; else print false;`, 'true'],
      [`print "hi" or 2; `, 'hi'],
      [`print nil or "yes";`, 'yes'],
    ];

    input.forEach(([source, expected]) => {
      readEvalPrint(source);

      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
    });
  });

  test('for loop', () => {
    const input = `
    for (var a = 5; a > 0; a = a - 1) {
      print a;
    }`;
    const expected = '1';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('nested function call', () => {
    const input = `fun makeCounter() {  var i = 0;  fun count() {    i = i + 1;    print i;  }  return count;}var counter = makeCounter(); counter();`;
    const expected = '1';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('classes', () => {
    const input = `class Cake {
      taste() {
        var adjective = "delicious";
        print "The " + this.flavor + " cake is " + adjective + "!";
      }
    }
    var cake = Cake();
    cake.flavor = "Gugelhupf";
    cake.taste();
    `;
    const expected = 'The Gugelhupf cake is delicious!';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });

  test('classes init mehtod', () => {
    const input = `class Foo {
      init() {
        print "init";
      }
    }
    var foo = Foo();
    `;
    const expected = 'init';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(expected));
  });
});
