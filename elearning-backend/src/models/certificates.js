const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('certificates', {
    certificateid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    studentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'courseid'
      }
    },
    issuedat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    transactionhash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'certificates',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "certificates_pkey",
        unique: true,
        fields: [
          { name: "certificateid" },
        ]
      },
    ]
  });
};
