const express = require("express");
const app = express();
const scrape = require('website-scraper');
const dotenv = require('dotenv');
const schedule = require('node-schedule');
const fs = require('fs');
const port = process.env.PORT || 3000;

dotenv.config();
let timestamp
var dataset
const fol1 = './fol1'
const fol2 = './fol2'

fs.existsSync(fol1) ? true : initialScrape(fol1, fol2)

schedule.scheduleJob('0 0 * * *', function () {
  cleanUp(fol1)
  cleanUp(fol2)
  initialScrape(fol1, fol2)
  timestamp = new Date().toLocaleString('en-US', { hour12: false });
});

app.get('/t', (req, res) =>{
  res.send(timestamp ? 'timestamp:\t' + timestamp : 'unset')
})

app.get("/v1", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Content-Type', 'application/json');

  req.query.apikey == process.env.API_KEY ? res.json(dataset) : res.send("unauthenticated")
});

app.listen(port, () => {
  console.log("Server running on port 3000");
});


function initialScrape(fol1, fol2) {
  scrape({
    urls: ['https://www.bol.com/nl/'],
    directory: fol1
  }).then(() => {

    let content = fs.readFileSync(fol1 + '/index.html', 'utf8');
    let match = content.match(/topdeals-\/(\d*)/s)[0];
    let baseURL = 'https://www.bol.com/nl/ra/algemeen/' + match + '/index.html'

    secondScrape(fol2, baseURL)
  });
}

function secondScrape(folderLoc, baseURL) {
  scrape({
    urls: [baseURL],
    directory: folderLoc
  }).then(() => {
    let content = fs.readFileSync(folderLoc + '/index.html', 'utf8');
    let pageData = content.match(/var pageData =(.*)/gm)[0]
    let match = pageData.match(/(\d{16})/gm)
    dataset = [...new Set(match.map(key => parseInt(key)))]
  })
}

function cleanUp(folder) {
  fs.rmdirSync(folder, { recursive: true });
}
