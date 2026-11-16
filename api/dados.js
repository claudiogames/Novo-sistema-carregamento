import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_URL_SEC;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY_SEC;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Erro de configuração: Variáveis de ambiente do Supabase em falta na Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: dataParam } = req.query;
    if (!dataParam) {
      return res.status(400).json({ error: "Data obrigatória" });
    }

    // Usando o nome correto da coluna visto na tabela: data_operacao
    const { data, error } = await supabase
      .from('controle_faltas_portao')
      .select('*')
      .eq('data_operacao', dataParam);

    if (error) {
      console.error("Erro na consulta ao Supabase:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("Erro interno no servidor:", err.message);
    return res.status(500).json({ error: "A server error occurred: " + err.message });
  }
}
