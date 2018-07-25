import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { argv } from 'yargs';

dotenv.config();

const GoogleSpreadsheet = require('google-spreadsheet');

const SHEET_ID_TOKEN = '/* #SHEET_ID# */';
const RULES_TOKEN = '{/* RULES */}';
const MODULE_START_TOKEN = '/* MODULE START */';;
const FROM_MODULE_START_TILL_END = /\/\* MODULE START \*\/([\s\S]+)/gm;

// spreadsheet id is the long id in the sheets URL. Pass as an env variable if it's a secret, or put here
const { SPREADSHEET_ID } = process.env;
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
const TEMPLATE_PATH = path.resolve(process.cwd(), '.eslintrc.template.js');
const HAS_CONFIG = argv.config.length > 0;
const DEFAULT_OUTPUT_PATH = path.resolve(process.cwd(), 'downloads', '.eslintrc.js');
const OUTPUT_CONFIG_PATH = argv.config || DEFAULT_OUTPUT_PATH;

const onInfo = (err, info) => {
  const [sheet] = info.worksheets;
  processSheet(sheet);
};

const processSheet = (sheet) => {
  sheet.getRows({
    worksheets_id: 1
  }, processRows);
};

const processRows = (err, rows) => {
  const rules = {};

  rows.forEach((row) => {
    const { rule, consensus, airbnbvalue } = row;
    if (consensus.trim() !== '' && consensus !== airbnbvalue) {
      // we want js values, not JSON strings
      const value = consensus[0] === '[' ? JSON.parse(consensus) : consensus;
      rules[rule] = value;
    }
  });

  prepareConfig(rules);
};

const prepareConfig = (rules) => {
  const json = JSON.stringify(rules, null, 6);
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let config = template
    .replace(SHEET_ID_TOKEN, SPREADSHEET_ID);

  if (HAS_CONFIG) {
    const configObject = require(argv.config);
    configObject.rules = rules;
    const module = JSON.stringify(configObject, null, 2);
    const moduleExpression = `module.exports = ${module};`;
    config = config
      .replace('Automatically', 'Rules automatically')
      .replace(FROM_MODULE_START_TILL_END, moduleExpression);
  } else {
    config = config
      .replace(RULES_TOKEN, json)
      .replace(MODULE_START_TOKEN, '');
  }

  writeConfigFile(config);
};

const writeConfigFile = (config) => {
  fs.writeFile(OUTPUT_CONFIG_PATH, config, (err) => {
    console.log(`Generated eslint config file at ${OUTPUT_CONFIG_PATH}`);
  });
};

doc.getInfo(onInfo);
