const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'password'; // Aquí pones la contraseña que deseas cifrar

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});
