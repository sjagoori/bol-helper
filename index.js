const express = require("express");
const app = express();
const scrape = require('website-scraper');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');

var dataset
let fol1 = './fol1'
let fol2 = './fol2'

fs.rmdirSync(fol1, { recursive: true });
fs.rmdirSync(fol2, { recursive: true });

scrape({
  urls: ['https://www.bol.com/nl/'],
  directory: fol1
}).then(() => {

  let content = fs.readFileSync(fol1 + '/index.html', 'utf8');
  let match = content.match(/topdeals-\/(\d*)/s)[0];
  let baseURL = 'https://www.bol.com/nl/ra/algemeen/' + match + '/index.html'

  scrape({
    urls: [baseURL],
    directory: fol2
  }).then(() => {
    let content = fs.readFileSync(fol2 + '/index.html', 'utf8');
    let pageData = content.match(/var pageData =(.*)/gm)[0]
    let match = pageData.match(/(\d{16})/gm)
    dataset = [...new Set(match.map(key => parseInt(key)))]
  })
});

app.get("/", (req, res, next) => {
  // let key = req.query
  // if (key == process.env.API_KEY) {
    res.setHeader('Content-Type', 'application/json');
    res.json(dataset);
  // }
  // }else{
  //   res.redirect('/')
  // }
});

app.listen(80, () => {
  console.log("Server running on port 3000");
});

