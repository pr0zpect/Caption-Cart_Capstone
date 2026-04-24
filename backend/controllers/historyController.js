const { pool } = require('../config/db');

exports.saveCaption = async (req, res) => {
  const { image_url, image_data, caption_text, platform, tone, all_variations, hashtags } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'INSERT INTO captions_history (user_id, image_url, image_data, caption_text, platform, tone, all_variations, hashtags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, image_url, image_data, caption_text, platform, tone, all_variations, hashtags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCaption = async (req, res) => {
  const { id } = req.params;
  const { caption_text } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'UPDATE captions_history SET caption_text = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [caption_text, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM captions_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

exports.deleteCaption = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query('DELETE FROM captions_history WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Caption deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete caption' });
  }
};
