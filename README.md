# bf2csv

This little utility will connect to Blockfolio using your Token, and will download all your trades to a CSV format.

## Getting Started

You can use the utility in 2 ways: on the [bf2csv github page](https://chesner.github.io/bf2csv/), or using a CLI.

### Github pages

Navigate to the [bf2csv github page](https://chesner.github.io/bf2csv/) and follow the instructions there.

Please note that during restrictions of HTTP you need a working CORS proxy to use the utility. If you Google for [CORS proxy](https://www.google.be/search?q=cors+proxy), you'll find several projects that you can use. I had best experience using ***https://cors-anywhere.herokuapp.com***, but there are also ***https://crossorigin.me*** and ***https://cors.io*** that provide the same functionality. Simply fill out the CORS proxy of your choise in the _Cors proxy_ field and you should be good to go.

### CLI

If you don't can or want to use a CORS proxy, you can run it from your local computer using ***nodejs***. Using nodejs is out of this scope, I assume you're familiar with it.

Clone this project and run `npm install`

Once this is done, you can run the tool with `npm run cli <your blockfolio token>`:

Example:
```
   macbook:bf2csv user$ npm run cli 796b9***********************************************************

   > bf2csv@0.0.1 cli /Users/user/Downloads/bf2csv
   > cross-env NODE_ENV=cli babel-node ./src/cli.js "796b9***********************************************************"

   Got your Blockfolio portfolio, which has a fiat value of  $7,157.31. You're holding the following coins:  BTC, BTC, ETH, EUR*, LTC, LTC, NEO, XMR, XRP.
   Querying a batch of positions
   Querying a batch of positions
   Got all the positions (21)
   Written to "blockfolio.csv"
```

This will create the file blockfolio.csv with the following contents:
```
   date,type,exchange,base,baseCurrency,quote,quoteCurrency,syncHoldings,notes
   2018-01-07 19:59:02 ,BUY,Coinbase,0.5,BTC (Bitcoin),8061.37,,,
   2018-01-07 20:08:16 ,BUY,Coinbase,4,LTC (Litecoin),0.06712,BTC (Bitcoin),,Initial buy
   2018-01-06 23:00:00 ,SELL,Coinbase,2,LTC (Litecoin),0.0337,BTC (Bitcoin),,Sold some thingy
   2017-12-03 23:00:00 ,BUY,Coinbase,0.3,BTC (Bitcoin),3813.51,,,Coinbase stuff
   2017-11-13 23:00:00 ,BUY,Coinbase,0.3,LTC (Litecoin),63.91199999999999,,,Test bought
   2018-01-02 23:00:00 ,BUY,Bitstamp,0.7,LTC (Litecoin),145.243,,,From bitstamp
   2018-04-11 15:02:40 ,BUY,Coinbase,0.01,BTC (Bitcoin),69.3752,,,Trade now apr 11 om 17:03 cest
   2018-04-11 15:05:33 ,DEPOSIT,Fiat,300,EUR,300,,,
   2018-04-11 15:05:52 ,WITHDRAW,Fiat,168.036,EUR,168.036,,,Sell for undefined
   2018-04-11 15:05:52 ,BUY,Bitfinex,0.03,BTC (Bitcoin),168.036,,,
   2018-04-11 15:08:29 ,WITHDRAW,Fiat,120,EUR,120,,,Sell it
   2018-04-10 22:00:00 ,BUY,ALLCOIN,10,NEO (Neo),0.0790479,BTC (Bitcoin),1,Bought 10 neo
   2018-04-11 17:16:53 ,SELL,ALLCOIN,3,NEO (Neo),0.024864,BTC (Bitcoin),1,
```

There are currently very few options we support, run the following command `npm run help` for more information.

## Built With

* [Babel](https://babeljs.io/) - Babel JS javascript compiler to use the next generation JavaScript, today.
* [Webpack](https://webpack.js.org/) - Web pack static module bundler for modern JavaScript applications
* [Axios](https://github.com/axios/axios) - Promise based HTTP client for the browser and node.js

And many more, see [package.json](package.json) for the full list


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
