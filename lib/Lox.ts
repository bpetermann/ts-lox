import readline from 'readline';
import fs from 'node:fs';
import colors from 'colors';
import { Scanner } from './Scanner.js';

export default class Lox {
  private static instance: Lox;
  private rl: readline.Interface;
  private arg?: string;
  hadError: boolean;

  private constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.arg = process.argv[2];
    this.hadError = false;
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
      err ? this.exit(err) : this.runAndExit(data)
    );
  }

  private runPrompt(): void {
    this.hadError = false;
    this.rl.question('>> ', (input) =>
      !input ? this.exit() : this.processInput(input)
    );
  }

  private processInput(input: string): void {
    this.run(input);
    this.runPrompt();
  }

  private runAndExit(input: string): void {
    this.run(input);
    this.exit();
  }

  private run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    if (this.hadError) return;

    tokens.forEach((token) => {
      console.log(token);
    });
  }

  private exit(err?: Error): void {
    if (err) console.error(colors.red(err.message));
    this.rl.close();
    process.exit(0);
  }

  error(line: number, msg: string): void {
    this.report(line, msg);
  }

  private report(line: number, msg: string) {
    console.error(colors.red(`[line ${line}] Error: ${msg}`));
    this.hadError = true;
  }
}
