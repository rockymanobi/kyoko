# Kyoko shimbun game server

## Installation

Node.js 7 or higher is required.

```
$ npm i
```

## Run

### Scraping

#### 虚構新聞

```
$ node kyoko-scraper.js  // overwrite data/news-kyoko.json
```

#### Yahoo! ニュース

```
$ node yahoo-news-scraper.js  // overwrite data/news-yahoo.json
```

### Server

```
$ node server.js [-p <port>]
```

Used port 8099 in default.

```
$ curl http://localhost:8099/api/v1/news
{"title":"通信障害でも安心　「紙製ツイッター」配布始まる","url":"http://kyoko-np.net/2017090801.html","content":"太陽フレアによる通信障害でツイッターが使えなくなった場合でも、 ...","source":"kyoko","updateDate":"2017-09-08T00:00:00+09:00"}
```

- title
  - News title
- url
  - News page URL
- content
  - News body text
- source
  - News site (`kyoko` or `yahoo`)
- updateDate
  - News content update date
