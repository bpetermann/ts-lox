import { expect } from '@jest/globals';
import { Scanner } from '../Scanner';
import { Token } from '../Token';
import { TokenType } from '../TokenType';

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

it('should create no token for a comment', () => {
  const input = '// this is a comment';
  const actual = createTokens(input);
  const expected = new Token(TokenType.EOF, '', null, 0);

  expect(expected).toEqual(actual[0]);
});

it('should create no token for a block comment', () => {
  const input = '/* this is a block comment */';
  const actual = createTokens(input);
  const expected = new Token(TokenType.EOF, '', null, 0);

  expect(expected).toEqual(actual[0]);
});

it('should create token after a comment', () => {
  const input = '/* this is a block comment */"Hello, World!"';
  const actual = createTokens(input);

  [
    new Token(TokenType.STRING, '"Hello, World!"', 'Hello, World!', 0),
    new Token(TokenType.EOF, '', null, 0),
  ].forEach((token, i) => expect(token).toEqual(actual[i]));
});

it('should create valid tokens', () => {
  const input = 'var greeting = "Hello, World!"';
  const actual = createTokens(input);

  [
    new Token(TokenType.VAR, 'var', null, 0),
    new Token(TokenType.IDENTIFIER, 'greeting', null, 0),
    new Token(TokenType.EQUAL, '=', null, 0),
    new Token(TokenType.STRING, '"Hello, World!"', 'Hello, World!', 0),
    new Token(TokenType.EOF, '', null, 0),
  ].forEach((token, i) => expect(token).toEqual(actual[i]));
});
