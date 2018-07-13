import eslintRules from './eslint-rules';

const Json2csvParser = require('json2csv').Parser;
const rootConfig = require('eslint-config-airbnb');

const titleCase = slug => slug.replace(/\b\S/g, t => t.toUpperCase()).replace('-', ' ');

const LEVEL_VALUES = {
  error: 'Error ⛔',
  warn: 'Warn ⚠️',
  off: 'Off 🙈'
};

const RECOMMENDED_VALUES = {
  true: LEVEL_VALUES.error,
  false: LEVEL_VALUES.off
};

const categories = [];

const getRuleTitle = (title, options = {}) => {
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
const fields = ['category', 'rule', 'description', 'recommended', 'airbnb-level', 'airbnb-value'];
// collect all rules + metadata here
const allRules = [];

// run through all categories to collect rules
categories.forEach((category) => {
  const entries = Object.entries(category.content.rules);
  entries.forEach((entry) => {
    const id = entry[0];
    const value = entry[1];
    const officialEntry = eslintRules[id] || {};
    const level = Array.isArray(value) ? value[0] : value;

    allRules.push({
      category: titleCase(category.title).replace('Es6', 'ES6'),
      rule: getRuleTitle(id, { link: officialEntry.url || null }),
      description: officialEntry.description,
      recommended: RECOMMENDED_VALUES[officialEntry.recommended],
      'airbnb-value': value,
      'airbnb-level': LEVEL_VALUES[level]
    });
  });
});

const json2csvParser = new Json2csvParser({ fields });
const csv = json2csvParser.parse(allRules);

// strip index line
const cleanCsv = csv.replace(/"Index".+[\n]/, '');

console.log(cleanCsv);
