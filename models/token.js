'use strict';
module.exports = (sequelize, DataTypes) => {
	var Token = sequelize.define('Token', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		count: DataTypes.INTEGER
	}, {});
	Token.associate = function (models) {
		// associations can be defined here
	};
	return Token;
};