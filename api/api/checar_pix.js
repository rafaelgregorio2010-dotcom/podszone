module.exports = async function handler(req, res) {
  const { id } = req.query;
  const SECRET_KEY = process.env.NEXPAY_SECRET_KEY;

  try {
    const response = await fetch(`https://www.nexpay.site/api/charge_status.php?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao checar status' });
  }
};
