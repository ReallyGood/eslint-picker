import { Linter } from 'eslint';

const linter = new Linter();
const rules = linter.getRules();
const allRules = {};
rules.forEach((value, key) => {
    allRules[key] = value.meta.docs;
});
export default allRules;
