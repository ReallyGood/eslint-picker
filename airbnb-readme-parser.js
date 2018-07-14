import https from 'https';

const AIRBNB_JS_README_URL = 'https://raw.githubusercontent.com/airbnb/javascript/master/README.md';
const SEARCH_TERM = 'eslint.org/docs/rules/';
const getReadme = () => new Promise((resolve, reject) => {
  let README = '';
  https.get(AIRBNB_JS_README_URL, (res) => {
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      README += chunk;
    });
    res.on('end', () => {
      resolve(README);
    });
  });
});

const parseReadme = (README) => {
  const parsed = {};
  const indexes = [];
  let index = 0;
  while (index < README.length && index !== -1) {
    const foundIndex = README.indexOf(SEARCH_TERM, index);
    index = foundIndex === -1 ? -1 : foundIndex + 1;
    if (foundIndex !== -1) {
      indexes.push(foundIndex);
    }
  }

  indexes.forEach((index) => {
    const id = README.slice(index + SEARCH_TERM.length, README.indexOf(')', index)).replace('.html', '');
    const anchorEnd = README.lastIndexOf('"></a><a name', index);
    const anchorStart = README.lastIndexOf('="', anchorEnd);
    const anchor = README.slice(anchorStart + 2, anchorEnd);

    console.log('id', id, '|', anchor);
    parsed[id] = {
      anchor
    };
  });

  console.log('indexes', indexes.length);
  return parsed;
};

const getReadmeData = () => new Promise((resolve, reject) => {
  getReadme().then((README) => {
    const parsedRules = parseReadme(README);
    resolve(parsedRules);
  });
});

getReadmeData().then((result) => {
  console.log('Got', result);
});

export default getReadme;
