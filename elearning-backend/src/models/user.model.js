// src/models/user.model.js
const pool = require('../config/db.config');

class User {
  static async findAll() {
    const result = await pool.query('SELECT * FROM users ORDER BY createdat DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE userid = $1', [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create({ fullname, email, passwordhash, role, profilepicture }) {
    const result = await pool.query(
      `INSERT INTO users (fullname, email, passwordhash, role, profilepicture, createdat)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [fullname, email, passwordhash, role, profilepicture]
    );
    return result.rows[0];
  }

  static async update(id, { fullname, email, role, profilepicture }) {
    const result = await pool.query(
      `UPDATE users 
       SET fullname=$1, email=$2, role=$3, profilepicture=$4
       WHERE userid=$5 RETURNING *`,
      [fullname, email, role, profilepicture, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE userid = $1', [id]);
    return { message: 'User deleted successfully' };
  }
}

module.exports = User;
