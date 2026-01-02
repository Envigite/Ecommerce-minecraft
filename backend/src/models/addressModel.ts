import { pool } from "../config/db";
import { IAddress } from "../types/models";

export const AddressModel = {
  create: async (data: IAddress) => {
    const query = `
      INSERT INTO addresses (user_id, alias, street, "number", city, region, zip_code, country, is_default, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *;
    `;
    const values = [
      data.user_id,
      data.alias || 'Mi Dirección', 
      data.street,
      data.number || '',
      data.city,
      data.region,
      data.zip_code || '',
      data.country || 'Chile',
      data.is_default || false
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByUser: async (userId: string) => {
    const query = "SELECT * FROM addresses WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC";
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  delete: async (id: string, userId: string) => {
    const query = `
      UPDATE addresses 
      SET is_active = false 
      WHERE id = $1 AND user_id = $2 
      RETURNING id
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  },
  
  findById: async (id: string) => {
    const query = "SELECT * FROM addresses WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};