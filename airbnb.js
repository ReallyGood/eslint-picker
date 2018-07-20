import path from 'path';
import fs from 'fs';
import eslintRules from './eslint-rules';
import getAirbnbData from './airbnb-readme-parser';

const Json2csvParser = require('json2csv').Parser;
const rootConfig = require('eslint-config-airbnb');

const titleCase = slug => slug.replace(/\b\S/g, t => t.toUpperCase()).replace('-', ' ');

const AIRBNB_README_LINK = 'https://github.com/airbnb/javascript/blob/master/README.md#';
const OUTPUT_CSV_PATH = path.resolve(process.cwd(), 'downloads', 'airbnb.csv');

const LEVEL_VALUES = {
  error: 'Error ⛔',
  warn: 'Warn ⚠️',
  off: 'Off 🙈'
};

const FIXABLE_VALUES = {
  true: '🔧'
};

const RECOMMENDED_VALUES = {
  true: LEVEL_VALUES.error,
  false: LEVEL_VALUES.off
};

const categories = [];

const formatTitle = (title, options = {}) => {
  const link = options.link ? options.link : `https://www.google.com/search?q=eslint+rule+${title}&btnI`;
  const TITLES = {
    BASIC: title,
    MARKDOWN: `[${title}](${link})`,
    HTML: `<a href="${link}">${title}</a>`,
    SPREADSHEET: `=HYPERLINK("${link}", "${title}")`
  };

  return TITLES[options.format || 'SPREADSHEET'];
};

const getChildCategories = (config) => {
  config.extends.forEach((path) => {
    const content = require(path);
    categories.push({
      title: path.slice(path.lastIndexOf('/') + 1).slice(0, -3),
      content
    });

    if (content.extends) {
      getChildCategories(content);
    }
  });
};

getChildCategories(rootConfig);

// csv schema
const fields = ['category', 'airbnb-link', 'rule', 'description', 'fixable', 'recommended', 'airbnb-level', 'airbnb-value'];
// collect all rules + metadata here
const allRules = [];

// async fetch & parse rules metadata out of airbnb js guide readme
getAirbnbData().then((airbnbData) => {
  // run through all categories to collect rules
  categories.forEach((category) => {
    const entries = Object.entries(category.content.rules);
    entries.forEach((entry) => {
      const id = entry[0];
      const value = entry[1];
      const hasOfficial = !!eslintRules[id];
      const officialEntry = eslintRules[id] || {};
      const level = Array.isArray(value) ? value[0] : value;
      const airbnbAnchor = hasOfficial && airbnbData[id] && airbnbData[id].anchor;
      const airbnbLink = airbnbAnchor ? formatTitle('💬', { link: AIRBNB_README_LINK + airbnbAnchor }) : null;

      allRules.push({
        category: titleCase(category.title).replace('Es6', 'ES6'),
        'airbnb-link': airbnbLink,
        rule: formatTitle(id, { link: officialEntry.url || null }),
        description: officialEntry.description,
        fixable: FIXABLE_VALUES[officialEntry.fixable] || '',
        recommended: RECOMMENDED_VALUES[officialEntry.recommended],
        'airbnb-level': LEVEL_VALUES[level],
        'airbnb-value': value
      });
    });
  });

  const json2csvParser = new Json2csvParser({ fields });
  const csv = json2csvParser.parse(allRules);

  // strip index line
  const cleanCsv = csv.replace(/"Index".+[\n]/, '');

  // write csv to file
  fs.writeFile(OUTPUT_CSV_PATH, cleanCsv, (err) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Generated CSV at ${OUTPUT_CSV_PATH}`);
  });
});
