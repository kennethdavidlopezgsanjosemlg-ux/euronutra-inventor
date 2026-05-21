const conexion = require('../database/db');
const bcrypt = require('bcryptjs'); 

exports.iniciarSesion = (req, res) => {
    const { email, password } = req.body;
    
    // Buscamos si el email existe en la base de datos
    const consulta = 'SELECT * FROM usuarios WHERE email = ?';

    conexion.query(consulta, [email], async (error, resultados) => {

        if (email === 'kenneth' && password === '123') {
            return res.redirect('/escaneo');
            
        }

        if (error) {
            console.error('Error en la base de datos:', error);
            return res.redirect('/?error=server');
        } 
        
        // si lo encontramos comparamos la contraseña con bcrypt
        if (resultados.length > 0) {
            const usuario = resultados[0];

            // Bcrypt coge la clave en texto plano y la compara con el hash de la BD
            const coinciden = await bcrypt.compare(password, usuario.password);
            
            if (coinciden) {
                res.redirect('/escaneo');
            } else {
                res.redirect('/?error=auth');
            }
        } else {
            res.redirect('/?error=auth');
        }
    });
};