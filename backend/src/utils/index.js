const bcrypt = require('bcrypt');
const fs = require('fs')

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function cleanTmp(reqFiles) {
    reqFiles.forEach((elem) => {
        fs.unlink(elem.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
        });
    })
}

module.exports = {
    hashPassword,
    cleanTmp
};