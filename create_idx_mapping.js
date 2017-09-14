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

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

  const indexAction = { index: {} };
var body = {
   "mappings" : {
      "eurostat_migr_asyappctza" : {
         "properties" : {
            "value" : {
               "type" : "long"
            },
            "time" : {
               "type" : "date"
            },
            "geo" : {
               "type" : "text",
               "fielddata": true,
               "fields" : {
                  "keyword" : {
                     "type" : "keyword",
                     "ignore_above" : 256
                  }
               }
            },
            "sex" : {
               "type" : "text",
               "fields" : {
                  "keyword" : {
                     "type" : "keyword",
                     "ignore_above" : 256
                  }
               }
            },
            "citizen" : {
               "type" : "text",
               "fielddata": true,
               "fields" : {
                  "keyword" : {
                     "type" : "keyword",
                     "ignore_above" : 256
                  }
               }
            }
         }
      }
   }
}

client.indices.create({index:`${config.elasticIndexPrefix}citizen_${getDateString()}`, body:body});
//client.indices.putMapping({index:`${config.elasticIndexPrefix}${getDateString()}`, type:config.elasticType, body:body});


