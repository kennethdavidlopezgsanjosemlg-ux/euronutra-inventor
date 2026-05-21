const { createClient } = require('@supabase/supabase-js');

console.log("DEBUG: URL detectada:", process.env.SUPABASE_URL); // ESTO ES LA CLAVE

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const conexion = createClient(supabaseUrl, supabaseKey);

module.exports = conexion;