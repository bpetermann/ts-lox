import fs from 'node:fs/promises';
import open from 'open';

(async function () {
  if (process.argv[2]) {
    fs.writeFile('bookmark.txt', process.argv[2]);
  } else {
    console.log('📖 open crafting interpreters');
    const bookmark = await fs.readFile('bookmark.txt', { encoding: 'utf8' });
    await open(`https://craftinginterpreters.com/${bookmark}.html`, {
      wait: true,
    });
  }
})();
