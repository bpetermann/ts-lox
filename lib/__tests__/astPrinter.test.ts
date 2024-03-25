import { TokenType } from '../TokenType';
import { Binary, Grouping, Literal, Unary } from '../Expr';
import { Token } from '../Token';
import { AstPrinter } from '../AstPrinter';

describe('Test ast printer visitor class', () => {
  it('should create binary expression', () => {
    const expected = '(* (- 123) (group 45.67))';
    const expression = new Binary(
      new Unary(new Token(TokenType.MINUS, '-', null, 1), new Literal(123)),
      new Token(TokenType.STAR, '*', null, 1),
      new Grouping(new Literal(45.67))
    );

    expect(new AstPrinter().print(expression)).toEqual(expected);
  });
});
