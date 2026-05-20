/**
 * Genera un hash bcrypt para guardar en la columna password de usuarios.
 * Uso: node scripts/generar-hash.js miContraseña
 */
const bcrypt = require('bcryptjs');

const contrasena = process.argv[2];

if (!contrasena) {
    console.log('Uso: node scripts/generar-hash.js tuContraseña');
    process.exit(1);
}

const hash = bcrypt.hashSync(contrasena, 10);
console.log('\nHash generado (cópialo en la BD):\n');
console.log(hash);
console.log('\nEjemplo SQL:\n');
console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'tu@correo.com';\n`);
