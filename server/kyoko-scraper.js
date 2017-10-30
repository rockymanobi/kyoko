const axios = require('axios');
const xml = require('xml-parse');
const client = require('cheerio-httpcli');
const moment = require('moment-timezone');
const fs = require('fs');


async function getNewsUrls() {
  const rssXmlText = await axios
    .get('http://kyoko-np.net/index.xml')
    .then((response) => {
      return response.data;
    });

  const xmlDoc = new xml.DOM(xml.parse(rssXmlText));
  const items = xmlDoc.document.getElementsByTagName('item');
  const links = items.map((item) => {
    return item.getElementsByTagName('link')[0].innerXML;
  });

  return links;
}

// すごくハードコーディング
async function getNews(url) {
  const {$} = await client.fetch(url);

  const updateDate = $('.article-update').text();
  const dateStr = moment(updateDate.match(/\d{4}\.\d{2}\.\d{2}/)[0].replace(/\./g, '-'))
    .tz('Asia/Tokyo')
    .format();
  
  const el = $('article');

  const title = el.find('h1').text().replace('これは嘘ニュースです', '').trim();  // !!!!

  const sentences = [];
  Array.from(el.contents()).map((content) => {
    if (content.type === 'text') {
      const text = content.data.trim();
      if (text) {
        sentences.push(text);
      }
    }
  });

  return {
    title,
    url,
    content: sentences.join(''),
    source: 'kyoko',
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

  fs.writeFileSync('data/news-kyoko.json', JSON.stringify(newsObjs, null, 2));
}

main();
