import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { promises } from 'node:fs';
import { cwd } from 'node:process';
import { join } from 'node:path';

const { writeFile } = promises;

const fetch = global.fetch;

GlobalRegistrator.register();

const matcher = /https:\/\/iiif\.io\/api\/cookbook\/recipe\/([^\/.]*)\//;

function getManifest(id) {
  return `https://iiif.io/api/cookbook/recipe/${id}/manifest.json`;
}

async function main() {
  const resp = await fetch('https://iiif.io/api/cookbook/recipe/matrix/');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();

  const elements = wrapper.querySelectorAll('.api-content table td a[href]');
  const index = {};

  for (const el of elements) {
    const link = el.getAttribute('href');
    const matches = matcher.exec(link);
    if (matches && matches[1]) {
      let id = matches[1];
      index[id] = {
        id: id,
        url: getManifest(id),
      };
      console.log(id, getManifest(id));
    }
  }

  const keys = Object.keys(index);
  const promises = [];
  for (const key of keys) {
    promises.push(
      await (async () => {
        const jsonHopefully = await (await fetch(index[key].url)).text();

        if (false && jsonHopefully.trim().startsWith('{')) {
          await writeFile(join(cwd(), `fixtures/cookbook`, `${key}.json`), jsonHopefully);
        } else {
          if (index[key]) {
            delete index[key];
          }

          // Otherwise..
          const innerDocument = await fetch(`https://iiif.io/api/cookbook/recipe/${key}/`);
          const innerWrapper = document.createElement('div');
          innerWrapper.innerHTML = await innerDocument.text();
          const elements = innerWrapper.querySelectorAll('.content > p > a');
          const headingEl = innerWrapper.querySelector('h1.title');
          for (const el of elements) {
            if (el.innerHTML === 'JSON-LD') {
              const href = el.getAttribute('href');
              const filenameParts = href.split('/');
              const fileNameWithExtension = filenameParts[filenameParts.length - 1];
              if (fileNameWithExtension.endsWith('.json')) {
                const fileName = fileNameWithExtension.slice(0, -5);
                const data = await (await fetch(`https://iiif.io/api/cookbook/recipe/${key}/${href}`)).text();
                const realKey = fileName === 'manifest' ? `${key}` : `${key}-${fileName}`;

                await writeFile(
                  join(cwd(), `fixtures/cookbook`, `${realKey}.json`),
                  await (await fetch(`https://iiif.io/api/cookbook/recipe/${key}/${href}`)).text()
                );

                index[realKey] = {
                  id: realKey,
                  url: `https://iiif.io/api/cookbook/recipe/${key}/${href}`,
                };
                const heading = headingEl ? headingEl.innerHTML : 'Untitled';
                console.log(
                  JSON.stringify({
                    title: heading,
                    cookbookUrl: `https://iiif.io/api/cookbook/recipe/${key}/`,
                    url: `https://iiif.io/api/cookbook/recipe/${key}/${href}`,
                  })
                );
                // console.log(`https://iiif.io/api/cookbook/recipe/${key}/${href}`);
              }
            }
          }
        }
      })()
    );
  }

  await Promise.all(promises);

  await writeFile(join(cwd(), `fixtures/cookbook`, '_index.json'), JSON.stringify(index, null, 2));
}

main().then(() => {
  console.log('done');
});
