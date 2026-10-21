export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const chave = process.env.NEXPAY_SECRET_KEY;

    // TESTE CEGO: Enviando exatamente o que a documentação pede
    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chave}`
      },
      body: JSON.stringify({ valor: "10.00" }) // Forçando string com 2 casas
    });

    const texto = await resposta.text();

    if (texto.trim().startsWith('{')) {
      return res.status(resposta.status).json(JSON.parse(texto));
    } else {
      // Se vier HTML, tenta limpar as tags para mostrar o erro real na tela
      const erroLimpo = texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 150);
      return res.status(resposta.status).json({ 
        error: `NexPay retornou ${resposta.status}: ${erroLimpo}` 
      });
    }
  } catch (erro) {
    return res.status(500).json({ error: erro.message });
  }
}
