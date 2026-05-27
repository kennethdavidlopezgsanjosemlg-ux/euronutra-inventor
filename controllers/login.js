const conexion = require('../database/db');
const bcrypt = require('bcryptjs');

exports.iniciarSesion = async (req, res) => {
    const {email, password} = req.body;

    try {
        const {data: usuario, error} = await conexion
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        console.log('login email', email, 'usuario', usuario);

        if (error) {
            console.error('Error en la base de datos:', error);
            return res.redirect('/?error=server');
        }

        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.redirect('/?error=auth');
        }

        const coinciden = await bcrypt.compare(password, usuario.password);
        console.log('Coincide la contraseña:', coinciden);
        if (coinciden) {
            return res.redirect('/seleccion');
        }

        return res.redirect('/?error=auth');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.redirect('/?error=server');
    }
};