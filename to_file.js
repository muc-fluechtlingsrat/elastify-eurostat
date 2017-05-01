const fetch = require('node-fetch');
const JSONstat = require('jsonstat');
const config = require('rc')('elastify-eurostat');
const writetofile = require('fs').writeFile('./eurostat.json');

const persistRow = row => {
  const document = {
    value: row.value,
    time: row.time,
    geo: row.geo,
    sex: row.sex,
  };

const apiUri = 'https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/migr_asyappctza?citizen=TOTAL&sex=F&sex=M&sex=UNK&precision=1&unit=PER&age=TOTAL&asyl_app=ASY_APP';

fetch(apiUri)
  .then(
    res => res.json(),
    error => console.log('Error fetching data from Eurostat:', error)
  )
  .then(data => {
    const table = JSONstat(data)
      .Dataset(0)
      .toTable({ type : 'arrobj' });

    table
      .filter(row => row.geo !== 'Total')
      .forEach(writetofile);
  });

