// Definición del modelo de Comment con validacíón

module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'Comment',
		{	texto: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta Commentario"}}
			},
			publicado: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			}
		}
	);
};