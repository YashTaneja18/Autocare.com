const mysql = require('mysql');

function fetchCartData(username, callback) {
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: 'Yas@2004',
        database: 'autocare'
    };

    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            return callback(err, null);
        }
        console.log('Connected to MySQL database');

        const sql = 'SELECT * FROM cart WHERE username = ?';

        connection.query(sql, [username], (err, rows) => {
            connection.end(); // Close the connection
            if (err) {
                console.error('Error executing MySQL query:', err);
                return callback(err, null);
            }
            callback(null, rows);
        });
    });
}

module.exports = fetchCartData;
