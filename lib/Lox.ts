import readline from 'readline';
import fs from 'node:fs';
import colors from 'colors';
import { Scanner } from './Scanner.js';
import { Token } from './Token.js';
import { TokenType } from './TokenType.js';
import { Parser } from './Parser.js';
import { RuntimeError } from './Error.js';
import { Interpreter } from './Interpreter.js';
import { Resolver } from './Resolver.js';

type ExitCode = 0 | 7;
export default class Lox {
  private static instance: Lox;
  private rl: readline.Interface;
  private arg?: string;
  private interpreter: Interpreter;
  static hadError: boolean;
  static hadRuntimeError: boolean;

  private constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.arg = process.argv[2];
    this.interpreter = new Interpreter();
    Lox.hadError = false;
    Lox.hadRuntimeError = false;
  }

  public static getInstance(): Lox {
    if (!Lox.instance) Lox.instance = new Lox();
    return Lox.instance;
  }

  main(): void {
    this.arg ? this.runFile(this.arg) : this.runPrompt();
  }

  private runFile(file: string): void {
    fs.readFile(file, 'utf8', (err, data) =>
      err ? this.readFileError(err) : this.runAndExit(data)
    );
  }

  private runPrompt(): void {
    Lox.hadError = false;
    this.rl.question('>> ', (input) =>
      !input ? this.exit(0) : this.processInput(input)
    );
  }

  private processInput(input: string): void {
    this.run(input);
    this.runPrompt();
  }

  private runAndExit(input: string): void {
    this.run(input);
    this.exit(Lox.hadRuntimeError ? 7 : 0);
  }

  run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const syntax = parser.parseRepl();

    if (Lox.hadError) return;

    const resolver = new Resolver(this.interpreter);
    resolver.resolve(syntax);

    if (Lox.hadError) return;

    const result = this.interpreter.interpret(syntax);
    if (result) console.log(`= ${result}`);
  }

  private exit(code: ExitCode): void {
    this.rl.close();
    process.exit(code);
  }

  private readFileError(err: Error) {
    console.error(colors.red(err.message));
    this.exit(7);
  }

  static error(line: number, msg: string): void {
    Lox.report(line, msg);
  }

  static parseError(token: Token, msg: string): void {
    if (token.type === TokenType.EOF) {
      Lox.report(token.line, `at end. ${msg}`);
    } else {
      Lox.report(token.line, `at \"${token.lexeme}\". ${msg}`);
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.error(colors.red(`${error.message} \n[line ${error.token.line}]`));
    this.hadRuntimeError = true;
  }

  private static report(line: number, msg: string) {
    console.error(colors.red(`[line ${line}] Error: ${msg}`));
    Lox.hadError = true;
  }
}
