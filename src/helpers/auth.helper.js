// src/helpers/auth.helper.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, jwtExpirationInterval } = require('../config/vars');


const hashPassword = async (password) => {
  return await bcrypt.hash(password, 1);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateJWT= (user) => {
  return jwt.sign({ id: user.id, role: user.roleId }, jwtSecretKey, { expiresIn: jwtExpirationInterval || '1d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecretKey);
};


module.exports = { hashPassword, comparePassword, verifyToken, generateJWT };


// hashPassword("pass123")
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));

// comparePassword("pass123", "$2a$15$SxxNkTxyKwgRdict1OKh0.ze9mQlIjvUu7ooCJus.3lAQVg3OCisG")
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));

/**
 * @param: round salt = 15:    29'92" ~ 30' 2
 * $2a$15$aa1qPktpL2IitHJfcdra9eOODF.IhyktMdZVaY/KlgDR6vugUs6My
 * @param: round salt = 12:    4'72" ~ 4' 71
 * $2a$12$DIlHSxIilY9pzWxF2z2QG.MO0AWDTDH7Z08lQ/mTnlDjlKcGC.EVq
 * @param: round salt = 10:    2'28" ~ 2' 32
 * $2a$10$SxxNkTxyKwgRdict1OKh0.ze9mQlIjvUu7ooCJus.3lAQVg3OCisG
 */
