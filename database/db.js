const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// En el servidor (Railway) usa la service_role: omite RLS y permite UPDATE/INSERT.
// No la expongas en el navegador. La anon key solo sirve si el cliente lleva JWT de usuario.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (recomendado en Railway)'
    );
}

const conexion = createClient(supabaseUrl, supabaseKey);

module.exports = conexion;
