const config = require('config');
const dotenv = require('dotenv');
dotenv.config();
const db = config.get('database');
module.exports = require('pg-promise')(
  // {
  //   error: (err, e) => { console.log(e); },
  // },
)({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.name,
  min: 1,
  max: 10,
  idleTimeoutMillis: 60000,
  ssl: db.ssl,
});
