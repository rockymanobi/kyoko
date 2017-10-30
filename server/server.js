const fs = require('fs');
const http = require('http');
const path = require('path');
const {ArgumentParser} = require('argparse');

const FAKE_THRESHOLD = 0.5  // 虚構が出る割合

const argparser = new ArgumentParser({
  addHelp: true,
  description: 'Kyoko shimbun game server'
});
argparser.addArgument(
  ['-p', '--port'],
  {
    help: 'server\'s port'
  }
);
const args = argparser.parseArgs();
const port = args.port || 8099;

const fakeNewsObjs = JSON.parse(fs.readFileSync('./data/news-kyoko.json', 'utf-8'));
const realNewsObjs = JSON.parse(fs.readFileSync('./data/news-yahoo.json', 'utf-8'));

const server = http.createServer();
server.on('request', (req, res) => {
  if (req.url === '/api/v1/news') {
    // ウソニュース or ホントニュース
    const newsObjs = Math.random() < FAKE_THRESHOLD ? fakeNewsObjs : realNewsObjs;

    // 適当な index のニュースを取ってくる
    const idx = ~~(Math.random() * newsObjs.length);
    const news = newsObjs[idx];

    res.writeHead(200, {
      'Content-Type': 'text/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(JSON.stringify(news));
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
console.log(`start to listen at localhost:${port}`);
