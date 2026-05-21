const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
    
});

// Conectar a la base de datos
conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        console.error("DEBUG VARIABLES:", process.env.MYSQLHOST, process.env.MYSQLPORT);
        return;
    }
    console.log('Conexión exitosa');
    console.error("DEBUG VARIABLES:", process.env.MYSQLHOST, process.env.MYSQLPORT);

});

module.exports = conexion;