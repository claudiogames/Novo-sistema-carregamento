import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_URL_SEC;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY_SEC;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Erro de configuração: Variáveis de ambiente em falta na Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const dataParam = req.query.data || req.query.date || req.query.dia;

    let query = supabase.from('controle_faltas_portao').select('*');

    if (dataParam) {
      let altDate = dataParam;
      // Converte automaticamente entre YYYY-MM-DD e DD/MM/YYYY para encontrar os dados na tabela
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
        const [ano, mes, dia] = dataParam.split('-');
        altDate = `${dia}/${mes}/${ano}`;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataParam)) {
        const [dia, mes, ano] = dataParam.split('/');
        altDate = `${ano}-${mes}-${dia}`;
      }

      // Procura na base de dados por qualquer um dos dois formatos de data
      query = query.or(`data_operacao.eq.${dataParam},data_operacao.eq.${altDate}`);
    }

    const { data, error } = await query;

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
