const flatten = require('lodash/flatten');
const fetch = require('node-fetch');
const elasticsearch = require('elasticsearch');
const JSONstat = require('jsonstat');
const config = require('rc')('elastify-eurostat');
const citizenCountryCodes = require('./countryCodes.js');

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
    citizen: row.citizen,
  }));

  const indexAction = { index: {} };
  const body = flatten(documents.map(document => [indexAction, document]));

  client.bulk({
    type: config.elasticType,
    index: `${config.elasticIndexPrefix}citizen_${getDateString()}`,
    body,
  }).then(
    () => console.log(`${documents.length} document persisted.`),
    error => console.log('Error persisting document:', error)
  );
};

const fetchFromUriAndPersit = uri => {
  return fetch(uri)
    .then(
      res => res.json(),
      error => console.log('Error fetching data from Eurostat:', error)
    )
    .then(data => {
      const table = JSONstat(data)
        .Dataset(0)
        .toTable({ type : 'arrobj' })
        .filter(row => row.geo !== 'Total');

      console.log(`got ${table.length} rows for ${uri}`);
      persistRows(table);
    });
};

const getQueue = () => {
  let queue = [];

  for (let sinceTimePeriod = 2016; sinceTimePeriod <= 2017; sinceTimePeriod++) {
    citizenCountryCodes.forEach(citizenCountryCode => {
      const uri = `http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/migr_asyappctza` +
        `?citizen=${citizenCountryCode}` +
        `&sex=F` +
        `&sex=M` +
        `&sex=UNK` +
        `&precision=1` +
        `&sinceTimePeriod=${sinceTimePeriod}` +
        `&filterNonGeo=1` +
        `&shortLabel=1` +
        `&age=TOTAL` +
        `&unitLabel=label`;
      queue.push(uri);
    });
  }

  return queue;
};

{
  const queue = getQueue();

  const getNext = position => {
    fetchFromUriAndPersit(queue[position]).then(() => {
      if (position < queue.length - 1) {
        setTimeout(() => getNext(position + 1), 1000);
      }
    });
  };

  getNext(0);
}