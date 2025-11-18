import { pool } from "../config/db";

export const ProductModel = {
  listProductsModel: async () => {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return result.rows;
  },

  createProductModel: async (data: {
    name: string;
    description?: string | null | undefined;
    price: number;
    stock?: number;
    category?: string | null | undefined;
    image_url?: string | null | undefined;
  }) => {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.description ?? null,
        data.price,
        data.stock ?? 0,
        data.category ?? null,
        data.image_url ?? null
      ]
    );

    return result.rows[0];
  },

  getProductByIdModel: async (id: string) => {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  },

  updateProductModel: async (id: string, data: Record<string, any>) => {
  const fields = Object.keys(data);
  if (!fields.length) return null;

  const setQuery = fields.map((key, i) => `${key} = $${i + 2}`).join(", ");
  const values = [id, ...Object.values(data)];

  const result = await pool.query(
    `UPDATE products SET ${setQuery} WHERE id = $1 RETURNING *`,
    values
  );

  return result.rowCount ? result.rows[0] : null;
  },

  deleteProductModel: async (id: string) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
  }
};
