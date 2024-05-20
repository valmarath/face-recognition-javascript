const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');

const notAuthorizedJson = { status: 401, message: 'Não autorizado!'};

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

const { pool } = require("../instances/pg");

passport.use(new JWTStrategy(options, async (payload, done) => {
    const user = await pool.query(`SELECT * FROM "USERS" WHERE id = ${payload.id}`);

    if(user.rowCount == 1) {
        return done(null, user.rows[0]);
    } else {
        return done(notAuthorizedJson, false);
    }
}));

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '60m' });
}

const privateRoute = (req, res, next) => {
    passport.authenticate('jwt', (err, user) => {
        req.user = user;
        return user? next() : next(notAuthorizedJson);
    })(req, res, next);
}

module.exports = {
    generateToken,
    privateRoute,
    passport
};