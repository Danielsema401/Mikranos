const passport = require('passport');

// const jwt = require('jsonwebtoken');
// const { jwtSecretKey, jwtExpirationInterval } = require('./vars');

// // Generate a JWT token
// const generateToken = (user) => {
//   return jwt.sign({ id: user.id, role: user.role }, jwtSecretKey, { expiresIn: '1d' });
// };

// // Generate a JWT token
// // const generateJWT= (user) => {
// //   return jwt.sign({ id: user.id, role: user.role }, jwtSecretKey, { expiresIn: '1d' });
// // };

// // Verify a JWT token
// const verifyToken = (token) => {
//   return jwt.verify(token, jwtSecretKey);
// };

// module.exports = {
//   generateToken,
//   // generateJWT,
//   verifyToken,
// };

// //===================-Test-==================
// // const user = { id: 1, role: 'seller' };
// const user = { id: '9d37a348-41b2-4496-b597-135fdb9dcaa6', status: 'active' }   ;
// // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InNlbGxlciIsImlhdCI6MTc0MzM3MzQ5NCwiZXhwIjoxNzQzNDU5ODk0fQ.LLsnzVem_AL8IK-v8mEe2bwUQ2eQS2YcOmVTwLY3ceY'
// // console.log(verifyToken(token));
// console.log(generateToken(user));




// /////////////////////////////////////
// /**
//  * const fs = require('fs');
// const jwt = require('jsonwebtoken');

// // Use RSA keys for production
// const privateKey = fs.readFileSync('./keys/private.pem');
// const publicKey = fs.readFileSync('./keys/public.pem');

// class JwtService {
//   static generateAccessToken(user) {
//     return jwt.sign(
//       {
//         userId: user.id,
//         role: user.role // Least privilege claims
//       },
//       privateKey,
//       {
//         algorithm: 'RS256',
//         expiresIn: '15m'
//       }
//     );
//   }

//   static verifyToken(token) {
//     return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
//   }
// }
//  */
