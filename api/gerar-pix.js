export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const chave = process.env.NEXPAY_SECRET_KEY;
    const valorOriginal = req.body.valor;
    const valorString = Number(valorOriginal).toFixed(2); // Ex: "10.00"

    // Vamos testar os formatos mais comuns que os gateways PHP aceitam
    const tentativas = [
      { label: 'String (Doc)', body: { valor: valorString } },
      { label: 'Number', body: { valor: Number(valorString) } },
      { label: 'String + Descricao', body: { valor: valorString, descricao: 'Pedido SmokeZone' } }
    ];

    let mensagemErroFinal = "Nenhuma tentativa funcionou.";

    for (const tentativa of tentativas) {
      console.log(`Testando formato: ${tentativa.label}`);

      const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${chave}`,
          // O User-Agent é crucial para não ser bloqueado por firewalls
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(tentativa.body)
      });

      const texto = await resposta.text();

      // Se for um JSON válido (sucesso ou erro da API), retornamos
      if (texto.trim().startsWith('{')) {
        const dados = JSON.parse(texto);
        if (resposta.ok) {
          return res.status(200).json(dados); // SUCESSO!
        }
        mensagemErroFinal = dados.message || dados.error || "Erro desconhecido na API";
      } else {
        // Se for um erro HTML (502, 500), limpamos as tags para ler a mensagem real
        const htmlLimpo = texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 150);
        mensagemErroFinal = `Erro ${resposta.status}: ${htmlLimpo}`;
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    return res.status(502).json({ error: mensagemErroFinal });

  } catch (erro) {
    return res.status(500).json({ error: `Erro de conexão: ${erro.message}` });
  }
}
