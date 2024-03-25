import { expect } from '@jest/globals';
import { Scanner } from '../Scanner';
import { Parser } from '../Parser';
import { AstPrinter } from '../AstPrinter';
import { ExpressionStmt } from '../Stmt';
import { NullableStmt } from '../@types';

const parse = (source: string): NullableStmt[] => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  return parser.parse();
};

describe('Test parser class', () => {
  it('should create an array of tokens', () => {
    const input = '- 123 * (45.67);';
    const expected = '(* (- 123) (group 45.67))';
    const actual = parse(input);

    if (!(actual[0] instanceof ExpressionStmt)) {
      throw new Error(`statement is not expression statement`);
    }

    const expr = (actual[0] as ExpressionStmt).expression;

    expect(new AstPrinter().print(expr)).toEqual(expected);
  });
});
