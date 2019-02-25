const Sequelize = require('sequelize');
const sequelize = require('./../database/connection.js');

module.exports = sequelize.define('genre', {
  id: {
    field: 'GenreId',
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    field: 'Name',
    type: Sequelize.STRING,
    validate: {
      // notEmpty: true,
      notEmpty: {
        args: true,
        msg: 'Name is required'
      },
      // isAlpha: true
      isAlpha: {
        args: true,
        msg: 'Name must only contain letters'
      },
      len: {
        args: [2, 10],
        msg: 'Name must be between 2 and 10 characters'
      }
    }
  }
}, {
  timestamps: false
});
