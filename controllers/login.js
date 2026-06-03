const conexion = require('../database/db');
// bcrypt para comparar la contraseña ingresada con la almacenada en la base de datos que está hasheada
const bcrypt = require('bcryptjs');

exports.iniciarSesion = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Buscar el usuario por email
        const {data: usuario, error} = await conexion
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            return res.redirect('/?error=server');
        }

        if (!usuario) {
            return res.redirect('/?error=auth');
        }

        const coinciden = await bcrypt.compare(password, usuario.password);
        if (coinciden) {
            return res.redirect('/seleccion');
        }

        // Si no coinciden, redirigir con error de autenticación
        return res.redirect('/?error=auth');
    } catch (error) {
        return res.redirect('/?error=server');
    }
};