const axios = require('axios');

const bfHttp = axios.create({
  baseURL: 'https://api-v0.blockfolio.com/rest/',
  timeout: 15000,
  headers: {'Accept': '*/*', 'User-Agent': 'Blockfolio/73 CFNetwork/887 Darwin/17.0.0', 'magic': 'edtopjhgn2345piuty89whqejfiobh89-2q453'}
});

export function getBaseUrl() {
    return bfHttp.defaults.baseURL;
}

export function setBaseUrl(baseURL) {
  bfHttp.defaults.baseURL = baseURL;
}

export async function getCoinList() {
  const coinlist = await bfHttp.get(
    '/coinlist_v6'
  ).catch(function (error) {
    if (error && error.response && error.response.hasOwnProperty('status')) {
      throw new Error(`Failed to query the coin list, Blockfolio API returned ${error.response.status} (${error.response.statusText})`);
    }
    throw new Error(`Failed to query the coin list, failed to call Blockfolio API\n${error}`);
  });

  return coinlist.data;
}

export async function getPortfolio(bfToken, bfFiatCurrency, bfLocale) {
  const portfolio = await bfHttp.get(
    '/get_all_positions/' + bfToken + '?fiat_currency=' + bfFiatCurrency + '&locale=' + bfLocale
  ).catch(function (error) {
    if (error && error.response && error.response.hasOwnProperty('status')) {
      throw new Error(`Failed to query the portfolio, Blockfolio API returned ${error.response.status} (${error.response.statusText})`);
    }
    throw new Error(`Failed to query the portfolio, failed to call Blockfolio API\n${error}`);
  });

  if (portfolio.data.success !== true) {
    throw new Error('Failed to query the portfolio, Blockfolio API returned success: false');
  }

  if (portfolio.data.positionList.length === 0) {
    throw new Error('Empty position list, did you specify the correct token?');
  }

  return portfolio.data;
}

export async function getPosition(coin, base, bfToken, bfFiatCurrency, bfLocale) {
  const pair = base + '-' + coin;

  const portfolioPosition = await bfHttp.get(
    '/get_positions_v2/' + bfToken + '/' + pair + '?fiat_currency=' + bfFiatCurrency + '&locale=' + bfLocale
  ).catch(function (error) {
    if (error && error.response && error.response.hasOwnProperty('status')) {
      throw new Error(`Failed to query the positions for pair '${pair}', Blockfolio API returned ${error.response.status} (${error.response.statusText})`);
    }
    throw new Error(`Failed to query the positions for pair '${pair}', failed to call Blockfolio API\n${error}`);
  });

  if (portfolioPosition.data.success !== true) {
    throw new Error(`Failed to query the positions for pair '${pair}', Blockfolio API returned success: false`);
  }

  return portfolioPosition.data;
}
