#!/usr/bin/env node
'use strict';

// Timezone should be UTC
process.env.TZ = 'UTC';

const bf2csv = require('./lib/bf2csv');
const fs = require('fs');

var program = require('commander');
program
  .version('0.0.1')
  .usage('[options] <your Blockfolio device token>')
  .description('Exports your Blockfolio data to a CSV file')
  .option('-f, --fiat-currency [currency]', 'The Blockfolio API fiat currency to use [USD]', 'USD')
  .option('-l, --locale [locale]', 'The Blockfolio API locale to use [en-US]', 'en-US')
  .option('-v, --verbose', 'Turn on verbose logging')
  .parse(process.argv);

if (!program.args.length) {
  console.error('You need to specify your Blockfolio token. Launch Blockfolio, go to settings, and at the bottom you can find your token.');
  process.exit(1);
}

const bfToken = program.args[0].toLowerCase();
if (bfToken.length < 16) {
  console.error('Invalid Blockfolio token specified. It should be at least 16 characters long.');
  process.exit(1);
}

const run = async (bfToken, bfFiatCurrency, bfLocale) => {
  bf2csv.setLogFunction(function (text) {
    console.log(text);
  });

  const csv = await bf2csv.bf2csv(bfToken, bfFiatCurrency, bfLocale);
  if (!csv || csv.length === 0) {
    process.exit(1);
  }

  fs.writeFileSync('blockfolio.csv', csv);
  console.log('Written to "blockfolio.csv"');
  process.exit(0);
};

run(bfToken, program.fiatCurrency, program.locale);
