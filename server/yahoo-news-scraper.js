const axios = require('axios');
const xml = require('xml-parse');
const client = require('cheerio-httpcli');
const moment = require('moment-timezone');
const fs = require('fs');
const {URL} = require('url');


async function getNewsUrls() {
  const rssXmlText = await axios
    .get('https://news.yahoo.co.jp/pickup/rss.xml')
    .then((response) => {
      return response.data;
    });

  const xmlDoc = new xml.DOM(xml.parse(rssXmlText));
  const items = xmlDoc.document.getElementsByTagName('item');

  const links = [];
  for (const item of items) {
    // これは記事の本 URL ではない!! このページではニュースの冒頭だけ取得できる
    const pickupUrl = item.getElementsByTagName('link')[0].innerXML;

    // こっちが本当の URL
    links.push(await getBodyUrl(pickupUrl));
  }

  return links;
}

async function getBodyUrl(url) {
  const {$} = await client.fetch(url);

  return $('.newsLink').attr('href');
}

// すごくハードコーディング
async function getNews(url) {
  const {$} = await client.fetch(url);

  // 微妙すぎる
  const dateStr = moment(new URL(url).searchParams.get('a').slice(0, 8))
    .tz('Asia/Tokyo')
    .format();

  const title = $('.hd').children('h1').text().trim();

  const el = $('.ynDetailText');

  const sentences = [];
  Array.from(el.contents()).map((content) => {
    if (content.type === 'text') {
      const text = content.data.trim()
        .replace(/^【.+?】/, '');
      if (text) {
        sentences.push(text);
      }
    }
  });

  return {
    title,
    url,
    content: sentences.join(''),
    source: 'yahoo',
    updateDate: dateStr
  };
}

async function main() {
  const urls = await getNewsUrls();

  console.log(urls);

  const newsObjs = [];
  for (const url of urls) {
    newsObjs.push(await getNews(url));
  }

  fs.writeFileSync('data/news-yahoo.json', JSON.stringify(newsObjs, null, 2));
}

main();
