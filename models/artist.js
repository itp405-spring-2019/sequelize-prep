const Sequelize = require('sequelize');
const sequelize = require('./../database/connection.js');

module.exports = sequelize.define('artist', {
  id: {
    field: 'ArtistId',
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: {
    field: 'Name',
    type: Sequelize.STRING
  }
}, {
  timestamps: false
});
