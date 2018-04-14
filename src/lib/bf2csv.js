const blockfolio = require('./blockfolio');
const csvConverter = require('json-2-csv');
const moment = require('moment');

export function enableCorsProxy(corsProxy) {
  blockfolio.setBaseUrl(corsProxy + blockfolio.getBaseUrl());
}

let customLogFunction = null;
export function setLogFunction(logFunction) {
  if (typeof logFunction === 'function') {
    customLogFunction = logFunction;
  }
}
function logFunction (text) {
  if (customLogFunction) {
    customLogFunction(text);
  }
}

export async function bf2csv(bfToken, bfFiatCurrency, bfLocale) {
  let allPositions = new Map();
  let maxPosition = 0;

  /**
   * Step 1: Query the main portfolio to get all positions
   */
  let portfolio = null;
  try {
    portfolio = await blockfolio.getPortfolio(bfToken, bfFiatCurrency, bfLocale);
  } catch (error) {
    logFunction(error);
    return null;
  }

  if (portfolio.positionList.length === 0) {
    logFunction('Empty position list, did you specify the correct token?');
    return null;
  }

  let coinList = [];
  portfolio.positionList.forEach(function (position) {
    coinList.push(position.coin);
  });

  logFunction(`Got your Blockfolio portfolio, which has a fiat value of  ${portfolio.portfolio.portfolioValueFiat}. You're holding the following coins:  ${coinList.filter(coin => coin.watchOnly !== true).join(', ')}.`);

  /**
   * Step 2: Query all positions individually
   */
  let promises = [];
  let currentBatch = [];

  for (let positionListId in portfolio.positionList) {
    const position = portfolio.positionList[positionListId];

    currentBatch.push(function fetch() {
      return blockfolio.getPosition(position.coin, position.base, bfToken, bfFiatCurrency, bfLocale);
    });

    if (currentBatch.length >= 5) {
      promises.push(currentBatch);
      currentBatch = [];
    }
  }
  if (currentBatch.length) {
    promises.push(currentBatch);
  }

  try {
    for (const batch of promises) {
      logFunction(`Querying a batch of positions`);
      const portfolioPositions = await Promise.all(batch.map(function (fetch) {
        return fetch();
      }));

      for (let portfolioPosition of portfolioPositions) {
        for (let positionItem of portfolioPosition.positionList) {
          allPositions.set(positionItem.positionId, positionItem);
          if (positionItem.positionId > maxPosition) {
            maxPosition = positionItem.positionId;
          }
        }
      }
    }
  } catch (error) {
    logFunction(`Error querying portfolio position: ${error.message || error.toString()}`);
    return null;
  }

  /**
   * Step 3: Get the coin list
   */
  let coinlist = new Map();
  let fiatlist = new Map();
  try {
    const coindata = await blockfolio.getCoinList();
    coindata.coins.map(function (coin) {
      if (coin.standardTokenSymbol.substr(coin.standardTokenSymbol.length - 1) == '*') {
        fiatlist.set(coin.standardTokenSymbol, coin.fullName);
      } else {
        coinlist.set(coin.standardTokenSymbol, coin.fullName);
      }
    });
  } catch (error) {
    logFunction(error);
    return null;
  }

  // Remove fiat from the coins
  for (let fiat in fiatlist) {
    if (coinlist.has(fiat)) {
      coinlist.remove(fiat);
    }
  }

  if (coinlist.length === 0) {
    logFunction('Empty coin list, failed to fetch from Blockfolio');
    return null;
  }

  /**
   * Step 4: Check for consistency and convert
   */
  for (let i = 1; i <= maxPosition; i++) {
    if (!allPositions.has(i)) {
      // It seems that deleted positions are still returned, to check
      //logFunction(`Consistency check failed: missing positionId ${i} in the position list`, allPositions);
    }
  }

  logFunction(`Got all the positions (${maxPosition})`);

  /**
   * Step 5: Look for synced transactions
   *
   * What we observed: for now, the positionId's are consecutive, and the sync position is created first, so we
   *   need to look at the previous position. The previous position coin should be equal to the base and the price
   *   should match (this is: quantity * price).
   */
  let keys = Array.from(allPositions.keys());
  let prevKey = keys.shift();
  for (let key of keys) {
    // BTW: Yes we start at index 2, since 1 cannot have a previous one
    let position = allPositions.get(key);
    let prevPosition = allPositions.get(prevKey);

    // In the following cases it's a NO GO
    if (!prevPosition
      || position.watch === 1
      || position.quantity === 0
      || position.base !== prevPosition.coin
      || prevPosition.watch === 1
      || prevPosition.quantity === 1
    ) {
      prevKey = key;
      continue;
    }

    let score = 0;
    // TODO: make this more flexible, when you edit the main position the sync doesn't get altered
    if (prevPosition.quantity.toFixed(8) === (-1 * position.quantity * position.price).toFixed(8)) {
      score += 3;
    }
    if (prevPosition.note && (prevPosition.note.search('Sell for') === 0 || prevPosition.note.search('Buy from') === 0)) {
      score += 3;
    }
    if (prevPosition.date === position.date) {
      score += 2;
    }

    if (score < 5) {
      prevKey = key;
      continue;
    }

    // Yes it's a sync
    position.syncPositionId = prevPosition.positionId;
    allPositions.delete(prevKey);
    allPositions.set(key, position);
    prevKey = key;
  }

  /**
   * Step 6: Export to CSV
   */
  let csvRows = [];
  for (let key of Array.from(allPositions.keys()).sort((a, b) => a - b)) {
    let position = allPositions.get(key);
    if (position.watch === 1 || position.quantity === 0) {
      continue;
    }

    const isCoinFiat = fiatlist.has(position.coin);
    const isBaseFiat = fiatlist.has(position.base + '*');
    const validCoin = isCoinFiat ? fiatlist.has(position.coin) : coinlist.has(position.coin);

    if (!validCoin) {
      logFunction(`Unknown coin encountered: ${position.coin}`);
      return null;
    }

    csvRows.push({
      date: moment(position.date).format('YYYY-MM-DD HH:mm:ss z'),
      type: isCoinFiat ? (position.quantity > 0 ? 'DEPOSIT' : 'WITHDRAW') : (position.quantity > 0 ? 'BUY' : 'SELL'),
      exchange: isCoinFiat ? '' : position.exchange,
      base: Math.abs(position.quantity),
      baseCurrency: isCoinFiat ? position.base : `${position.coin} (${coinlist.get(position.coin)})`,
      quote: isCoinFiat ? '' : Math.abs(position.quantity) * position.price,
      quoteCurrency: isCoinFiat ? '' : (isBaseFiat ? position.base : `${position.base} (${coinlist.get(position.base)})`),
      syncHoldings: position.syncPositionId ? 1 : '',
      notes: position.note,
    });
  }

  const csvText = await (new Promise(function (resolve, reject) {
    csvConverter.json2csv(csvRows, function (err, csvText) {
      if (err) {
        reject(err);
      }

      resolve(csvText);
    });
  }));

  return csvText;
}
