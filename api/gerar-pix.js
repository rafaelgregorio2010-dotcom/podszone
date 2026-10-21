export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { valor } = req.body;
    const chave = process.env.NEXPAY_SECRET_KEY;

    // Tenta as variações mais prováveis de payload aceitas pela API
    const tentativas = [
      // Tentativa 1: Valor como STRING e campo descricao
      { 
        body: JSON.stringify({ valor: Number(valor).toFixed(2), descricao: 'Pedido SmokeZone' }),
        label: 'String + Descricao'
      },
      // Tentativa 2: Valor como NÚMERO puro
      { 
        body: JSON.stringify({ valor: Number(Number(valor).toFixed(2)) }),
        label: 'Numero'
      },
      // Tentativa 3: Valor como STRING sem campos extras
      { 
        body: JSON.stringify({ valor: Number(valor).toFixed(2) }),
        label: 'Apenas String'
      }
    ];

    let ultimoErro = null;

    for (const tentativa of tentativas) {
      try {
        console.log(`Tentando payload: ${tentativa.label}`);

        const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${chave}`,
            'Accept': 'application/json'
          },
          body: tentativa.body
        });

        const texto = await resposta.text();

        // Se a resposta for JSON, a tentativa funcionou ou retornou um erro claro
        if (texto.trim().startsWith('{')) {
          const dados = JSON.parse(texto);
          if (resposta.ok) {
            return res.status(200).json(dados); // Sucesso!
          }
          // Se for erro JSON, guarda para exibir caso todas as tentativas falhem
          ultimoErro = { status: resposta.status, dados };
        } else {
          // Se for HTML, guarda o erro
          ultimoErro = { status: resposta.status, html: texto.substring(0, 300) };
        }

      } catch (erroRede) {
        ultimoErro = { status: 500, erro: erroRede.message };
      }
    }

    // Se chegou até aqui, todas as tentativas falharam. Retorna o último erro.
    return res.status(ultimoErro?.status || 500).json({
      error: 'Nenhum formato de payload funcionou.',
      detalhes: ultimoErro
    });

  } catch (erro) {
    console.error('Erro no Backend:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
