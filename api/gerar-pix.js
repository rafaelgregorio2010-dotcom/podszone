export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { valor } = req.body;
    
    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
      },
      body: JSON.stringify({ valor: valor })
    });

    // Lê a resposta da NexPay como texto primeiro para não quebrar se vier HTML
    const texto = await resposta.text();

    try {
      // Tenta converter para JSON
      const dados = JSON.parse(texto);
      return res.status(resposta.status).json(dados);
    } catch (erroParse) {
      // Se a NexPay retornar uma página HTML de erro, mostramos o motivo
      console.error("NexPay retornou HTML:", texto.substring(0, 200));
      return res.status(500).json({ 
        error: 'A NexPay retornou uma página de erro em vez de JSON.',
        detalhes: texto.substring(0, 100) 
      });
    }

  } catch (erro) {
    console.error('Erro no Backend:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
