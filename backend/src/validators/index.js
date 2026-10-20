const authValidators = require('./auth.validator');
const profileValidators = require('./profile.validator');

module.exports = {
  ...authValidators,
  ...profileValidators,
};
