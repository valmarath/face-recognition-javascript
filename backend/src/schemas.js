const Joi = require('joi')

const login = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const face_login = Joi.object().keys({
  username: Joi.string().required(),
});

const face_recognition = Joi.object().keys({

});

const register = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

module.exports = {
  "/login": login,
  "/face_login": face_login,
  "/face_recognition": face_recognition,
  "/register": register,
};
