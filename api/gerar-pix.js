export default async function handler(req, res) {
  // 1. Valida o método de forma robusta
  const metodo = (req.method || '').toUpperCase();
  if (metodo !== 'POST') {
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  try {
    const { valor } = req.body;
    const chave = process.env.NEXPAY_SECRET_KEY;

    // 2. Tenta a URL com POST e envia o valor como número
    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chave}`
      },
      // A tentativa mais provável: enviar o valor como número e adicionar uma descrição
      body: JSON.stringify({ 
        valor: valor,
        descricao: 'Pedido SmokeZone' // Tenta adicionar um campo comum em APIs de pagamento
      })
    });

    const texto = await resposta.text();

    // 3. Tenta ler o JSON. Se falhar, mostra o erro exato da NexPay.
    try {
      const dados = JSON.parse(texto);
      return res.status(resposta.status).json(dados);
    } catch (erroParse) {
      console.error('NexPay retornou HTML:', texto.substring(0, 500));
      return res.status(500).json({
        error: `NexPay retornou HTML (Status ${resposta.status}). Verifique os logs.`,
        detalhes: texto.substring(0, 200)
      });
    }

  } catch (erro) {
    console.error('Erro de rede:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
