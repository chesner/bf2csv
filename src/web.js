'use strict';

require('babel-core/register');
require('babel-polyfill');

const store = require('store');
const bf2csv = require('./lib/bf2csv');
const download = require('./lib/download');

$(document).ready(function(e) {
  const $bfToken = $('#bfToken');
  const $bfFiatCurrency = $('#bfFiatCurrency');
  const $bfLocale = $('#bfLocale');
  const $btnConvert = $('#btnConvert');
  const $txtConsole = $('#txtConsole');

  function debugLog(text) {
    $txtConsole.val($txtConsole.val() + text + '\n');
  }

  let bfToken = store.get('bfToken');
  if (bfToken) {
    $bfToken.val(bfToken);
  }

  let bfFiatCurrency = store.get('bfFiatCurrency');
  if (bfFiatCurrency) {
    $bfFiatCurrency.find('option[value=' + bfFiatCurrency + ']').attr('selected', 'selected');
  }

  let bfLocale = store.get('bfLocale');
  if (bfLocale) {
    $bfLocale.find('option[value=' + bfLocale + ']').attr('selected', 'selected');
  }

  bf2csv.setLogFunction(function (text) {
    debugLog(text);
  });
  bf2csv.enableCorsProxy('https://cors-anywhere.herokuapp.com/');

  $btnConvert.click(function(e) {
    e.preventDefault();

    bfToken = $bfToken.val();
    if (bfToken.length < 16) {
      alert('Invalid Blockfolio token specified. It should be at least 16 characters long.');
      return;
    }
    store.set('bfToken', bfToken);

    bfFiatCurrency = $bfFiatCurrency.val();
    store.set('bfFiatCurrency', bfFiatCurrency);

    bfLocale = $bfLocale.val();
    store.set('bfLocale', bfLocale);

    bf2csv.bf2csv(bfToken, bfFiatCurrency, bfLocale).then(function (csv) {
      if (!csv || csv.length === 0) {
        alert('Failed, please check the output console');
        return;
      }
      debugLog('Preparing CSV file for download...');

      const blob = new Blob([csv], {
        type: 'text/csv;charset=utf8;',
      });

      download.downloadFile(blob, 'blockfolio.csv');
      debugLog('Download complete!');
    });
  });
});
