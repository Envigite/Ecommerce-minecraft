import { pool } from "../config/db";
import { ICreateOrder } from "../types/models";

export const OrderModel = {
  findById: async (orderId: string, userId: string) => {
    const query = `
      SELECT 
        o.*, 
        json_agg(json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase,
          'name', p.name,
          'image_url', p.image_url
        )) as items,
        (
          SELECT row_to_json(addr)
          FROM (
             SELECT street, "number", city, region 
             FROM addresses 
             WHERE id = o.address_id
          ) addr
        ) as shipping_address
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id
    `;
    const { rows } = await pool.query(query, [orderId, userId]);
    return rows[0];
  },

  findByUser: async (userId: string) => {
    const query = `
      SELECT 
        o.*, 
        json_agg(json_build_object(
          'name', p.name,
          'image_url', p.image_url,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      AND (o.status = 'paid' OR o.payment_method = 'cash' OR o.payment_method != 'mercadopago')
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  validateStock: async (items: { id: string; quantity: number }[]) => {
    const productIds = items.map((i) => i.id);
    
    const query = `SELECT id, name, stock FROM products WHERE id = ANY($1)`;
    const { rows } = await pool.query(query, [productIds]);

    for (const item of items) {
      const product = rows.find((p) => p.id === item.id);
      
      if (!product) {
        throw new Error(`El producto con ID ${item.id} no existe.`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para '${product.name}'. Disponibles: ${product.stock}, Solicitados: ${item.quantity}`);
      }
    }
    return true; // Todo ok
  },

  create: async (data: ICreateOrder & { status?: string, payment_id?: string | null }) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const status = data.status || 'pending';

      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, delivery_type, address_id, payment_method, status, payment_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `;
      
      const orderValues = [
        data.user_id, 
        data.total, 
        data.delivery_type, 
        data.address_id || null, 
        data.payment_method,
        status,
        data.payment_id || null
      ];
      
      const resOrder = await client.query(orderQuery, orderValues);
      const orderId = resOrder.rows[0].id;

      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
      `;

      for (const item of data.items) {
        await client.query(itemQuery, [
          orderId, 
          item.product_id, 
          Number(item.quantity), 
          Number(item.price)
        ]);
      }

      await client.query('COMMIT');
      return { id: orderId, status, payment_id: data.payment_id };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  updateStatus: async (orderId: string, status: string, paymentId?: string) => {
    const query = `
      UPDATE orders 
      SET status = $2, payment_id = $3
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [orderId, status, paymentId || null]);
    return rows[0];
  },

  findAll: async (limit: number, offset: number, status?: string, search?: string) => {
    let query = `
      SELECT 
        o.*, 
        u.email as user_email,
        u.username as user_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    
    const params: any[] = [limit, offset]; 
    let paramIndex = 3;
    const conditions: string[] = [];

    if (status && status !== 'all') {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      conditions.push(`o.id::text ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY o.created_at DESC LIMIT $1 OFFSET $2`;

    const { rows } = await pool.query(query, params);
    
    let countQuery = `SELECT COUNT(*) FROM orders o`;
    const countParams: any[] = [];
    let countParamIndex = 1;
    const countConditions: string[] = [];

    if (status && status !== 'all') {
        countConditions.push(`status = $${countParamIndex}`);
        countParams.push(status);
        countParamIndex++;
    }
    if (search) {
        countConditions.push(`id::text ILIKE $${countParamIndex}`);
        countParams.push(`%${search}%`);
        countParamIndex++;
    }

    if (countConditions.length > 0) {
        countQuery += ` WHERE ` + countConditions.join(' AND ');
    }

    const countRes = await pool.query(countQuery, countParams);

    return { 
      orders: rows, 
      total: Number(countRes.rows[0].count) 
    };
  },

  delete: async (orderId: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
      const { rowCount } = await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
      await client.query('COMMIT');
      return rowCount && rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getStats: async () => {
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM orders 
      WHERE status IN ('paid', 'shipped', 'delivered')
    `;
    
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `;

    const chartQuery = `
      SELECT 
        TO_CHAR(created_at, 'DD Mon') as date,
        SUM(total_amount) as sales
      FROM orders
      WHERE status IN ('paid', 'shipped', 'delivered')
      AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'DD Mon'), created_at
      ORDER BY created_at ASC
    `;

    const [revenueRes, statusRes, chartRes] = await Promise.all([
      pool.query(revenueQuery),
      pool.query(statusQuery),
      pool.query(chartQuery)
    ]);

    return {
      revenue: Number(revenueRes.rows[0].total_revenue),
      ordersCount: Number(revenueRes.rows[0].total_orders),
      ordersByStatus: statusRes.rows,
      salesChart: chartRes.rows
    };
  },

  findByIdAdmin: async (orderId: string) => {
    const query = `
      SELECT 
        o.*, 
        u.email as user_email,
        u.username as user_name,
        json_agg(json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase,
          'name', p.name,
          'image_url', p.image_url
        )) as items,
        (
          SELECT row_to_json(addr)
          FROM (
             SELECT street, "number", city, region 
             FROM addresses 
             WHERE id = o.address_id
          ) addr
        ) as shipping_address
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, u.email, u.username
    `;
    const { rows } = await pool.query(query, [orderId]);
    return rows[0];
  },
};