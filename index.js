const flatten = require('lodash/flatten');
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

const persistRows = rows => {
  const documents = rows.map(row => ({
    value: row.value,
    time: row.time,
    geo: row.geo,
    sex: row.sex,
  }));

  const indexAction = { index: {} };
  const body = flatten(documents.map(document => [indexAction, document]));

  client.bulk({
    type: config.elasticType,
    index: `${config.elasticIndexPrefix}${getDateString()}`,
    body,
  }).then(
    () => console.log(`${documents.length} document persisted.`),
    error => console.log('Error persisting document:', error)
  );
};

//const apiUri = 'https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/migr_asyappctza?sex=M&sex=UNK&precision=1&unit=PER&age=TOTAL&asyl_app=ASY_APP';
const apiUri = ' http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/migr_asyappctza?citizen=DE&citizen=UK&sex=F&sex=M&sex=UNK&precision=1&age=TOTAL';
fetch(apiUri)
  .then(
    res => res.json(),
    error => console.log('Error fetching data from Eurostat:', error)
  )
  .then(data => {
    const table = JSONstat(data)
      .Dataset(0)
      .toTable({ type : 'arrobj' })
      .filter(row => row.geo !== 'Total');

    persistRows(table);
  });

