require('dotenv').config();
const express = require('express');
const analizadorCuerpo = require('body-parser');
const app = express();

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Servir archivos estáticos (JS, CSS, Imágenes)
app.use(express.static('public'));

// Para procesar JSON y datos de formularios
app.use(analizadorCuerpo.json());
app.use(analizadorCuerpo.urlencoded({extended: true}));

// Cargar las rutas definidas en router.js
app.use('/', require('./router'));

// Página principal 
app.get('/', (req, res) => {
    const error = req.query.error;
    res.render('login', {error});
});

// Puerto de servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en puerto: ${PORT}`);
    console.log(`realizado por kenneth`);

});
  