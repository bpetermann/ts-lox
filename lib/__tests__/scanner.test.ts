import { expect } from '@jest/globals';
import { Scanner } from '../Scanner';
import { Token } from '../Token';

const createTokens = (source: string): Array<Token> => {
  const scanner = new Scanner(source);
  return scanner.scanTokens();
};

it('should create an array of tokens', () => {
  const input = '=+(){},;';
  const actual = createTokens(input);

  input.split('').forEach((el, i) => {
    expect(actual[i].lexeme).toEqual(el);
  });
});
