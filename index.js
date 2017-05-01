const fetch = require('node-fetch');
const elasticsearch = require('elasticsearch');
const JSONstat = require('jsonstat');
const config = require('rc')('elastify-eurostat');

const client = new elasticsearch.Client({
  host: config.elasticHost,
  log: config.elasticLog
});

const getDateString = () => {
  const now = new Date();
  const pad = num => (num < 10 ? '0' : '') + num;

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDay())}`;
};

const persistRow = row => {
  const document = {
    value: row.value,
    time: row.time,
    geo: row.geo,
    sex: row.sex,
  };

  client.index({
    index: `${config.elasticIndexPrefix}${getDateString()}`,
    type: config.elasticType,
    body: document
  }).then(
    () => console.log('Document persisted.'),
    error => console.log('Error persisting document:', error)
  );
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
      .forEach(persistRow);
  });

require('fs').writeFile(

    './eurostat.json',

    JSON.stringify(myArray),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
    }
);
