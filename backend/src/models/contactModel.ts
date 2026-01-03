import { pool } from "../config/db";

export const ContactModel = {
  create: async (data: { userId?: string | null, name: string, email: string, subject: string, message: string }) => {
    const query = `
      INSERT INTO contact_messages (user_id, name, email, subject, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [data.userId || null, data.name, data.email, data.subject, data.message];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  getAll: async () => {
    const query = `
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  updateStatus: async (id: string, status: 'pending' | 'replied') => {
    const query = `
      UPDATE contact_messages 
      SET status = $2 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, status]);
    return rows[0];
  }
};