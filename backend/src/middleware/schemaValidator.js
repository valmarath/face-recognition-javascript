const schemas = require('../schemas');

const supportedMethods = ["post", "put", "patch", "delete"];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false,
};

const schemaValidator = (path, useJoiError = true, minFiles) => {
  const schema = schemas[path];

  if (!schema) {
    throw new Error(`Schema not found for path: ${path}`);
  }

  return (req, res, next) => {
    const method = req.method.toLowerCase();

    if (!supportedMethods.includes(method)) {
      return next();
    }

    // File count validation
    if(minFiles > 0) {
      const files = JSON.parse(JSON.stringify(req.files));
      if(!files.data || files.data.length < minFiles) {
        return res.status(400).json({ error: `At least ${minFiles} files are required.` });
      }
    }


    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      const customError = {
        status: "failed",
        error: "Invalid request. Please review request and try again.",
      };

      const joiError = {
        status: "failed",
        error: {
          original: error._original,
          details: error.details.map(({ message, type }) => ({
            message: message.replace(/['"]/g, ""),
            type,
          })),
        },
      };

      return res.status(422).json(useJoiError ? joiError : customError);
    }

    // validation successful
    req.body = value;
    return next();
  };
};

module.exports = { 
  schemaValidator
};
