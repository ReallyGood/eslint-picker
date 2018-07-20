import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const GoogleSpreadsheet = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL. Pass as an env variable
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);

const onInfo = (err, info) => {
  console.log(info);
  const [sheet] = info.worksheets;
  console.log(`sheet 1: ${sheet.title}`);
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
      console.log('AHA!', rule, consensus);
      rules[rule] = consensus;
    }
  });

  prepareConfig(rules);
};

const prepareConfig = (rules) => {
  console.log('extending default airbnb config with', rules);
};

doc.getInfo(onInfo);
