const cassandra = require('cassandra-driver');

const tempClient = new cassandra.Client({ contactPoints: ['localhost'], localDataCenter: 'datacenter1', keyspace: 'system' });
const client = new cassandra.Client({ contactPoints: ['localhost'], localDataCenter: 'datacenter1', keyspace: 'sauron_sdc' });

const connectAndCreate = () => tempClient.connect()
  .then(() => {
    const create = "CREATE KEYSPACE IF NOT EXISTS sauron_sdc WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' }AND DURABLE_WRITES =  true;";
    return tempClient.execute(create);
  })
  .then(() => client.connect())
  .then(() => {
    console.log('Connected to Cassandra!');
    const createTable = 'CREATE TABLE IF NOT EXISTS sauron_sdc.products_by_shop ("shopID" int, "shopName" text, "shopDate" text, "shopSales" int, "shopLoc" text, "shopURL" text, "shopItems" int, "productID" int, "productName" text, "productPrice" text, "productShipping" text, "productURL" text, PRIMARY KEY("shopID", "productID")) WITH CLUSTERING ORDER BY ("productID" ASC);';

    return client.execute(createTable);
  })
  .catch((err) => console.log('Cannot Connect to Cassandra!', err));

// COPY is a command of the shell cqlsh. COPY does not exist in standard syntax.
/*
const save = () => {
  const query = 'COPY sauron_sdc.products_by_shop ("shopID", "shopName", "shopDate", "shopSales", "shopLoc", "shopURL", "shopItems", "productID", "productName", "productPrice", "productShipping", "productURL") FROM '/home/hieuho/Hack Reactor/sdc/suggested-module/data.csv' WITH header=true AND delimiter=',';';
  const params = ['/home/hieuho/Hack Reactor/sdc/suggested-module/data.csv', ','];
  client.execute(query, params);
  console.log('Copy to Cassandra Completed!');
};
*/

const doAll = () => connectAndCreate()
  // .then(() => save())
  .then(() => console.log('Cassandra ready for actions!'))
  .catch((err) => console.log('Connection or Seeding Error!', err));

doAll();

const getShop = (id) => client.execute(`SELECT * FROM sauron_sdc.products_by_shop WHERE "shopID" IN (${id})`);

const get8 = (id) => client.execute(`SELECT "productName", "productPrice", "productShipping", "productURL" FROM sauron_sdc.products_by_shop WHERE "shopID" IN (${id})`);

const getSuggested = (id) => client.execute(`SELECT "shopName", "productName", "productPrice", "productShipping", "productURL" FROM sauron_sdc.products_by_shop WHERE "shopID" IN (${id})`);

module.exports = {
  doAll,
  getShop,
  get8,
  getSuggested,
};
