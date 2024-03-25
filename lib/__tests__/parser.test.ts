import { expect } from '@jest/globals';
import { Scanner } from '../Scanner';
import { Expr } from '../Expr';
import { Parser } from '../Parser';
import { AstPrinter } from '../AstPrinter';

const parse = (source: string): Expr => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  return parser.parse();
};

describe('Test parser class', () => {
  it('should create an array of tokens', () => {
    const input = '- 123 * (45.67)';
    const expected = '(* (- 123) (group 45.67))';
    const actual = parse(input);

    expect(new AstPrinter().print(actual)).toEqual(expected);
  });
});
