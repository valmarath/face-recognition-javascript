const bcrypt = require('bcrypt');

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

module.exports = {
    hashPassword
};