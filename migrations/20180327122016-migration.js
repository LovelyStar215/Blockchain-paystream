'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tokens', {
        id: {
		    allowNull: false,
		    primaryKey: true,
		    type: Sequelize.INTEGER
        },
	    count: {
      	    type: Sequelize.INTEGER
	    },
	    createdAt: {
		    type: Sequelize.DATE
	    },
	    updatedAt: {
        	type: Sequelize.DATE
	    }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tokens');
  }
};
