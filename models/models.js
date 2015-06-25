var path = require ('path');

//Postgres	DATABASE_URL = postgres://user:password@host:port/database
//SQLite 	DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name	 = (url[6]||null);
var user	 = (url[2]||null);
var pwd		 = (url[3]||null);
var protocol = (url[1]||null);
var dialect	 = (url[1]||null);
var port 	 = (url[5]||null);
var host	 = (url[4]||null);
var storage	 = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite:
var sequelize = new Sequelize(DB_name, user, pwd, 
	{ dialect: 	dialect,
	  protocol: protocol,
	  port: 	port,
	  host: 	host,
	  storage: 	storage,	// Solo SQLite (.env)
	  omitNull: true		// Solo Postgres
	}
);

// Importar la definición de la tabla Quiz desde quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
// Importar la definición de la tabla Comment desde comment.js
var Comment = sequelize.import(path.join(__dirname, 'comment'));

// Crear relación entre las tablas
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // Exportar la tabla Quiz
exports.Comment = Comment; // Exportar la tabla Comment

// sequelize.sync() crea a inicializa la tabla de preguntas en DB
sequelize.sync().success(function() {
	// success(...) ejecuta el manejador una vez creada la tabla
	Quiz.count().success(function (count) {
		if (count === 0) { // La tabla se inicializa solo si está vacía
			Quiz.create(
				{ pregunta: 'Capital de Italia',
				respuesta: 'Roma',
				tema: 'humanidades'});
			Quiz.create(
				{ pregunta: 'Capital de Portugal',
				respuesta: 'Lisboa',
				tema: 'humanidades'})
			.success(function(){console.log('Base de datos inicializa')});
		};
	});
});
