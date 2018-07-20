## ESlint Picker
Did you think you could really just go with [airbnb js conventions](https://github.com/airbnb/javascript) and live with it?
We did too! And we had too many qualms and disagreements with them and among ourselves, so things moved slow.

This tool helps you reach team consensus regrading eslint by:
- run `npm run prepare` to generate a csv which is then (manually) imported into a google sheet
- Ya'll go on and read about the rules, argue, do your homework and eventually fill in the Consensus column
- run `SPREADSHEET_ID=<your sheet id> npm run generate` to get a .eslintrc.js file ready for your project

### Bugs? Suggestions?
We're open for feedback and improvements, this is a very early version. Let's talk!

### License
MIT. Made with love by [Really Good](https://github.com/ReallyGood)