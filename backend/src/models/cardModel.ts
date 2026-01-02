import { pool } from "../config/db";
import { ICard } from "../types/models";

export const CardModel = {
  create: async (data: ICard) => {
    const query = `
      INSERT INTO cards (user_id, last4, brand, "name", gateway_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.user_id, 
      data.last4, 
      data.brand, 
      data.name, 
      data.gateway_token || 'simulated_token'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByUser: async (userId: string) => {
    const query = "SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC";
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  delete: async (id: string, userId: string) => {
    const query = "DELETE FROM cards WHERE id = $1 AND user_id = $2 RETURNING id";
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  },
};