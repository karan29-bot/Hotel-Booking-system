const { Pool } = require("pg");

const pool = new Pool({

  connectionString: "postgresql://postgres.dzmfgsjpwzxdzaldrvis:cloudonhire@2929@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres",

  ssl: {
    rejectUnauthorized: false,
  },

});

module.exports = pool;