import { pool } from "../config/db";

export const UserModel = {
  findByEmailOrUsername: async (email: string, username: string) => {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    return result.rows[0] ?? null;
  },

  createUser: async (username: string, email: string, passwordHash: string) => {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  findByEmail: async (email: string) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
  },

  updateUserRoleModel: async (id: string, newRole: string) => {
    const result = await pool.query(
      `UPDATE users 
       SET role = $2 
       WHERE id = $1 
       RETURNING id, username, email, role, created_at`,
      [id, newRole]
    );
    return result.rows[0] ?? null;
  },

  deleteUserModel: async (id: string) => {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },

  listUsersModel: async () => {
  const result = await pool.query(
      `SELECT id, username, email, role, created_at 
      FROM users 
      ORDER BY created_at ASC`
    );
    return result.rows;
  },

  getUserById: async (id: string) => {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  },

  updateUser: async (id: string | undefined, username?: string, password?: string) => {
    const updates: string[] = [];
    const values: any[] = [id];

    if (username) {
      updates.push(`username = $${values.length + 1}`);
      values.push(username);
    }

    if (password) {
      updates.push(`password_hash = $${values.length + 1}`);
      values.push(password);
    }

    if (!updates.length) return null;

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $1
      RETURNING username, email
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  },

  findOrCreateByGoogle: async (googleId: string, email: string, displayName: string) => {
    const client = await pool.connect();
    
    try {
      const userCheck = await client.query(
        "SELECT * FROM users WHERE google_id = $1",
        [googleId]
      );

      if (userCheck.rows.length > 0) {
        return userCheck.rows[0];
      }

      const emailCheck = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (emailCheck.rows.length > 0) {
        const user = emailCheck.rows[0];
        await client.query(
          "UPDATE users SET google_id = $1 WHERE id = $2",
          [googleId, user.id]
        );
        return { ...user, google_id: googleId };
      }

      let baseUsername = displayName.replace(/\s+/g, "");
      let finalUsername = baseUsername;
      let counter = 1;

      while (true) {
        const userCheckName = await client.query("SELECT id FROM users WHERE username = $1", [finalUsername]);
        if (userCheckName.rowCount === 0) break;
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      const newUserQuery = `
        INSERT INTO users (username, email, google_id, role, password_hash)
        VALUES ($1, $2, $3, 'user', NULL)
        RETURNING *
      `;

      const newUser = await client.query(newUserQuery, [
        finalUsername,
        email,
        googleId,
      ]);

      return newUser.rows[0];

    } finally {
      client.release();
    }
  }
};
