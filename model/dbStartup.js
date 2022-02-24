// db startup
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL;
const client = new MongoClient(url, { useNewUrlParser: true });

let dbCon;

module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, db) {
        if (err || !db) {
            return callback(err);
        }

        dbCon = db.db("wordblitz");
        console.log("Successfully connected to MongoDB.");

        return callback(err);
        });
    },

    getDb: function () {
        return dbCon;
    }
};