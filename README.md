# Elastify Eurostat

> Fetches data from the Eurostat API and persists it into an Elasticsearch database.

## Prerequisites

Node 6 or later with NPM.  
See <https://nodejs.org/en/download/package-manager/> or <https://nodejs.org/en/download/current/>.

## Usage

1. Create the configuration file `.elastify-eurostatrc`, use `.elastify-eurostatrc-example` as a template.
2. Add your Elasticsearch credentials to the configuration.
3. Install Node dependencies with `$ npm install`.
4. Run the script with `$ npm start`.

## Prepare elasticsearch cluster

For elastic cloud:
Create a cluster. Create roles and users to push data, and to read data
Precreate the index with a mapping, else the year won't be a date.

node create_idx_mapping.js
node push_data_citizens.js

Add Kibana to your cluster. Create index pattern. Create visualisations.

The scripts are helpers and have to be edited manually.

If you have to rerun:
* list indexes with `curl -u user:password https://host:port/_cat/indices`
* delete your index with node `delete_idx.js`
and start over.

If you want to see the data, no elasticsearch: 
* `node log_citizen_data.js | less`

# to get all citizen codes (citizen.dic)
wget  'http://ec.europa.eu/eurostat/estat-navtree-portlet-prod/BulkDownloadListing?sort=1&file=dic%2Fen%2Fcitizen.dic'

return 3706 codes
