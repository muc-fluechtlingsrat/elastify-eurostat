// helper to delete index
// find index name e.g. with _cat/indices

const elasticsearch = require('elasticsearch');
const config = require('rc')('elastify-eurostat');

const client = new elasticsearch.Client({
  host: config.elasticHost,
  log: config.elasticLog
});

client.indices.delete({
  index: 'asylum_data_eurostat_citizen_2017-05-01',
  ignore: [404]
}).then(function (body) {
  // since we told the client to ignore 404 errors, the
  // promise is resolved even if the index does not exist
  console.log('index was deleted or never existed');
}, function (error) {
  // oh no!
});


