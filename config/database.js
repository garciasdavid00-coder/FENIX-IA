function databaseOptions(connectionString=process.env.DATABASE_URL){
 if(!connectionString)return null;
 const url=new URL(connectionString);
 // pg connection-string SSL flags must not override certificate verification.
 ['sslmode','sslcert','sslkey','sslrootcert'].forEach(key=>url.searchParams.delete(key));
 return {connectionString:url.toString(),ssl:{rejectUnauthorized:true},connectionTimeoutMillis:8000,query_timeout:15000,max:10};
}
module.exports={databaseOptions};
