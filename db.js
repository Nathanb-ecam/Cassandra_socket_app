const cassandra = require('cassandra-driver');
const connection = new cassandra.Client({
    contactPoints: ['127.0.0.1'], 
    keyspace: "ecam_nosql",
    localDataCenter: 'datacenter1' 
});

module.exports = connection; 