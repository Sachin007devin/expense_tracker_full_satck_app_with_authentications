'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExpenseMigrated extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ExpenseMigrated.init({
    amount: DataTypes.INTEGER,
    category: DataTypes.STRING,
    description: DataTypes.STRING,
    note: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'ExpenseMigrated',
  });
  return ExpenseMigrated;
};