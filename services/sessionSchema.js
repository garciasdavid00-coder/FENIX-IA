// Initialize before listening. connect-pg-simple 10 caches a rejected lazy
// table-creation promise forever; a transient startup timeout must not poison it.
async function initializeSessionSchema(pool) {
  for(let attempt=0;attempt<3;attempt++) {
    try {
      await pool.query('CREATE TABLE IF NOT EXISTS "session" (sid varchar PRIMARY KEY, sess json NOT NULL, expire timestamp(6) NOT NULL)');
      await pool.query('CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" (expire)');
      return;
    } catch(error) {
      const transient=['ETIMEDOUT','ECONNRESET','ECONNREFUSED','57P01','57P03','08006'].includes(error.code) || /connection.*(timeout|terminated)|timeout.*connect/i.test(error.message);
      if(!transient || attempt===2)throw error;
      await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
    }
  }
}
module.exports={initializeSessionSchema};
