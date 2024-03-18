import fs from 'node:fs/promises';
import colors from 'colors';

const BASE_BOOK = 'https://craftinginterpreters.com/';

(async function () {
  if (process.argv[2]) {
    await fs.writeFile('bookmark.txt', process.argv[2]);
  } else {
    const current = await fs.readFile('bookmark.txt', { encoding: 'utf8' });
    const arrow = colors.green('➜  ');
    const book = colors.white('Book:     ');
    const bookmark = colors.cyan(`${BASE_BOOK}${current}.html`);

    console.log(`${arrow}${book}${colors.cyan(BASE_BOOK)}`);
    console.log(`${arrow}${colors.white('Bookmark: ')}${bookmark}`);
  }
})();
