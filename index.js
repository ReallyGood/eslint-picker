const Linter = require('eslint').Linter;
const linter = new Linter();
//this file has intentional eslint errors for now
var _ = require('lodash')


const rules = linter.getRules();
rules.forEach((value, key) => {
  if (key=== 'max-len') {
    console.log('rule', key, 'meta', JSON.stringify( value.meta));
  }
});