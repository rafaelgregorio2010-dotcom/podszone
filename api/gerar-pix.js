export default async function handler(req, res) {
  // 1. Valida o método de forma robusta (aceita POST em maiúsculo ou minúsculo)
  const metodo = (req.method || '').toUpperCase();
  if (metodo !== 'POST') {
    return res.status(405).json({ error: `Método ${req.method} não permitido. Use POST.` });
  }

  try {
    const { valor } = req.body;

    // 2. Faz a chamada para a NexPay com o método POST explícito
    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
      },
      body: JSON.stringify({ valor: valor })
    });

    const texto = await resposta.text();

    // 3. Tenta converter a resposta para JSON
    try {
      const dados = JSON.parse(texto);
      return res.status(resposta.status).json(dados);
    } catch (erroParse) {
      // Se a NexPay retornar HTML, mostra o status real e um trecho do erro
      console.error('NexPay retornou HTML:', texto.substring(0, 300));
      return res.status(500).json({
        error: `NexPay retornou HTML (Status ${resposta.status}). Verifique a URL ou a chave.`,
        detalhes: texto.substring(0, 200)
      });
    }

  } catch (erro) {
    console.error('Erro de rede:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
