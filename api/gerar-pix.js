export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Pega o valor enviado pelo site
  const { valor } = req.body;

  // Cria um cronômetro para cancelar a requisição se a NexPay demorar mais de 10 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // ATENÇÃO: Verifique na documentação da NexPay se essa URL está EXATAMENTE correta
    const resposta = await fetch('https://api.nexpay.site/v1/cobrancas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', // Evita bloqueios
        'Accept': 'application/json'
      },
      body: JSON.stringify({ valor: valor }),
      signal: controller.signal // Aplica o cronômetro
    });

    clearTimeout(timeoutId); // Para o cronômetro se a resposta chegar

    const dados = await resposta.json();

    // Se a NexPay retornar erro (ex: chave inválida), repassa para o site
    if (!resposta.ok) {
      return res.status(resposta.status).json({ 
        error: dados.message || dados.error || 'Erro retornado pela NexPay',
        detalhes: dados
      });
    }

    // Se deu tudo certo, devolve o QR Code
    return res.status(200).json(dados);

  } catch (erro) {
    clearTimeout(timeoutId);
    
    // Tratamento de erros de rede
    let mensagemErro = 'Erro de conexão com a NexPay';
    
    if (erro.name === 'AbortError') {
      mensagemErro = 'A NexPay demorou muito para responder (Timeout).';
    } else if (erro.cause) {
      mensagemErro = `Falha de rede: ${erro.cause.message}`;
    } else {
      mensagemErro = erro.message;
    }

    console.error('Erro no Backend:', erro);
    return res.status(500).json({ 
      error: mensagemErro,
      tipo: 'fetch_failed'
    });
  }
}
