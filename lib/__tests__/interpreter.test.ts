import { expect } from '@jest/globals';
import { Scanner } from '../Scanner';
import { Parser } from '../Parser';
import { Interpreter } from '../Interpreter';

const readEvalPrint = (source: string): void => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  const parser = new Parser(tokens);
  const expression = parser.parse();

  const interpreter = new Interpreter();
  interpreter.interpret(expression);
};

describe('Test interpretor visitor class', () => {
  let logSpy: jest.SpyInstance | undefined;

  beforeEach(() => {
    logSpy = jest.spyOn(global.console, 'log');
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

      expect(logSpy).toHaveBeenCalledWith(expected);
    });
  });

  test('convert a number to string when combined', () => {
    const input = 'print 1 + "1";';
    const expected = '11';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expected);
  });

  test('should not evaluate 0 to nil', () => {
    const input = 'print 1 + 0;';
    const expected = '1';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expected);
  });

  test('dividing by zero should result in an error', () => {
    logSpy = jest.spyOn(global.console, 'error');
    const input = 'print 10 / 0;';

    readEvalPrint(input);
    expect(console.error).toHaveBeenCalled();
  });

  it('should reassign a defined variable', () => {
    const input = `
    var a = "hello, world!";
    a = 5;
    print a;`;
    const expected = '5';

    readEvalPrint(input);
    expect(logSpy).toHaveBeenCalledWith(expected);
  });
});
