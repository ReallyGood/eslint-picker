import { Linter } from 'eslint';

const linter = new Linter();
const rules = linter.getRules();
const allRules = {};
rules.forEach((value, key) => {
  allRules[key] = Object.assign(value.meta.docs, {
    fixable: !!value.meta.fixable
  });
});
export default allRules;
