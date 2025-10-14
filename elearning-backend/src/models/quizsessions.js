const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quizsessions', {
    sessionid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    quizid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'quizid'
      }
    },
    studentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    startedat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    submittedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    score: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    starttime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endtime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'quizsessions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "quizsessions_pkey",
        unique: true,
        fields: [
          { name: "sessionid" },
        ]
      },
    ]
  });
};
