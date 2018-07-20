import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const GoogleSpreadsheet = require('google-spreadsheet');

const SHEET_ID_TOKEN = '/* #SHEET_ID# */';
const RULES_TOKEN = '{/* RULES */}';

// spreadsheet id is the long id in the sheets URL. Pass as an env variable if it's a secret, or put here
const { SPREADSHEET_ID } = process.env;
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
const TEMPLATE_PATH = path.resolve(process.cwd(), '.eslintrc.template.js');
const OUTPUT_CONFIG_PATH = path.resolve(process.cwd(), 'downloads', '.eslintrc.js');

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
      rules[rule] = consensus;
    }
  });

  prepareConfig(rules);
};

const prepareConfig = (rules) => {
  const json = JSON.stringify(rules, null, 6);
  fs.readFile(TEMPLATE_PATH, 'utf8', (err, template) => {
    let config = template;
    config = config
      .replace(RULES_TOKEN, json)
      .replace(SHEET_ID_TOKEN, SPREADSHEET_ID);

    writeConfigFile(config);
  });
};

const writeConfigFile = (config) => {
  fs.writeFile(OUTPUT_CONFIG_PATH, config, (err) => {
    console.log(`Generated eslint config file at ${OUTPUT_CONFIG_PATH}`);
  });
};

doc.getInfo(onInfo);
