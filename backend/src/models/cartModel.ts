import { pool } from "../config/db";

export const CartModel = {
  getUserCart: async (userId: string) => {
  const result = await pool.query(
    `
    SELECT 
      p.id AS id,
      p.name,
      p.price,
      p.image_url,
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY p.name ASC
    `,
    [userId]
  );

  return result.rows;
},

  addOrUpdateItem: async (userId: string, productId: string, quantity: number) => {
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  },

  updateQuantity: async (userId: string, productId: string, quantity: number) => {
    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $3
       WHERE user_id = $1 AND product_id = $2
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0] ?? null;
  },

  removeItem: async (userId: string, productId: string) => {
    const result = await pool.query(
      `DELETE FROM cart_items
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  clearUserCart: async (userId: string) => {
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
  }
};
