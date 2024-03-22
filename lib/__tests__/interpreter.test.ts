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
  it('should evaluate mathematical operations', () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const input: [string, string][] = [
      [`5`, '5'],
      [`(5 + 10 * 2 + 15 / 3) * 2 + -10;`, '50'],
      [`(10 + 2) * 30 == 300 + 20 * 3;`, 'true'],
      [`(10 + 2) * 30 != 300 + 20 * 3;`, 'false'],
    ];

    input.forEach(([source, expected]) => {
      readEvalPrint(source);
      expect(logSpy).toHaveBeenCalledWith(expected);
    });

    logSpy.mockRestore();
  });
});
