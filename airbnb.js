const Json2csvParser = require('json2csv').Parser;
const rootConfig = require('eslint-config-airbnb');

const titleCase = slug => slug.replace(/\b\S/g, t => t.toUpperCase()).replace('-', ' ');

const categories = [];

const getChildCategories = (config) => {
  config.extends.forEach((path) => {
    const content = require(path);
    categories.push({
      title: path.slice(path.lastIndexOf('/') + 1).slice(0, -3),
      content,
    });

    if (content.extends) {
      getChildCategories(content);
    }
  });
};

getChildCategories(rootConfig);

// csv schema
const fields = ['category', 'rule', 'airbnb-value', 'airbnb-level'];
// collect all rules + metadata here
const allRules = [];

// run through all categories to collect rules
categories.forEach((category) => {
  const entries = Object.entries(category.content.rules);
  entries.forEach((entry) => {
    allRules.push({
      category: titleCase(category.title).replace('Es6', 'ES6'),
      rule: `=HYPERLINK("https://www.google.com/search?q=eslint+rule+${entry[0]}&btnI", "${entry[0]}")`,
      'airbnb-value': entry[1],
      'airbnb-level': Array.isArray(entry[1]) ? entry[1][0] : entry[1]
    });
  });
});

const json2csvParser = new Json2csvParser({ fields });
const csv = json2csvParser.parse(allRules);

// strip index line
const cleanCsv = csv.replace(/"Index".+[\n]/, '');

console.log(cleanCsv);
