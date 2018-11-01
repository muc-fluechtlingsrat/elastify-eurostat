const flatten = require('lodash/flatten');
const fetch = require('node-fetch');
const elasticsearch = require('elasticsearch');
const JSONstat = require('jsonstat');
const config = require('rc')('elastify-eurostat');
const citizenCountryCodes = require('./countryCodesPre2008.js');

const client = new elasticsearch.Client({
  host: config.elasticHost,
  log: config.elasticLog
});

const getDateString = () => {
  const now = new Date();
  const pad = num => (num < 10 ? '0' : '') + num;
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const persistRows = rows => {
  const documents = rows.map(row => ({
    value: row.value,
    time: row.time,
    geo: row.geo,
    citizen: row.citizen,
  }));

  const indexAction = { index: {} };
  const body = flatten(documents.map(document => [indexAction, document]));

  client.bulk({
    type: config.elasticType,
    index: `${config.elasticIndexPrefix}`,
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
        .filter(row => row.geo !== 'Total' && row.geo !== 'Insgesamt');

      console.log(`got ${table.length} rows for ${uri}`);
      persistRows(table);
    });
};

const getQueue = () => {
  let queue = [];

    citizenCountryCodes.forEach(citizenCountryCode => {
      const uri = `http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/de/migr_asyctz` +
        `?citizen=${citizenCountryCode}` +
        `&precision=1` +
        `&sinceTimePeriod=1988` +
        `&filterNonGeo=1` +
        `&shortLabel=1` +
        `&unitLabel=label`;
      queue.push(uri);
    });

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
