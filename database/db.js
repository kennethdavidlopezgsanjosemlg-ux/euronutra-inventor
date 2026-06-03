const {createClient} = require('@supabase/supabase-js');

// api base de datos de supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY '
    );
    process.exit(1); // Salir si no se configuran las variables de entorno necesarias
}

const conexion = createClient(supabaseUrl, supabaseKey);

module.exports = conexion;
