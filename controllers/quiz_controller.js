var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load =function (req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(
		function (quiz) {
			if (quiz) {
				req.quiz = quiz;
				next ();
			} else {
				next(new Error('No existe quizId=' + quizId));
			}
	}).catch(function (error) {next(error);});
}

// GET /quizes
exports.index = function(req, res){
	var __search = req.query.search || "";
	__search = __search.replace(/ */ig, '%');
	models.Quiz.findAll({where: ["pregunta like ?", __search]}).then(function (quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
	}).catch(function (error) {next(error);}); 
};

// GET /quizes/:Id
exports.show = function(req, res){
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:Id/answer
exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build( // Crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Otro"}
	);
	res.render('quizes/new', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function (req, res) {
	var quiz = models.Quiz.build(req.body.quiz);

	quiz.validate().then(function (err) {
		if (err) {
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else {
			quiz // Guarda en la DB los campos pregunta y respuesta de quiz
			.save({fields:["pregunta", "respuesta", "tema"]})
			.then(function() {res.redirect('/quizes');});
		}   // Redirección HTTP (URL relativo) lista de preguntas
	}); //.catch(function (error) {next(error);});
};

// GET /quizes/:Id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; // autoload de la  instancia quiz
	res.render('quizes/edit', { quiz: quiz, errors: [] });
};

// PUT /quizes/:Id
exports.update = function (req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz.validate().then(function (err) {
		if (err) {
			res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		} else {
			req.quiz // Guarda en la DB los campos pregunta y respuesta de quiz
			.save({fields:["pregunta", "respuesta", "tema"]})
			.then(function() {res.redirect('/quizes');});
		}   // Redirección HTTP (URL relativo) lista de preguntas
	}).catch(function (error) {next(error);});
};

// DELETE /quizes/:Id
exports.destroy = function (req, res) {
	req.quiz.destroy().then( function () {
		res.redirect('/quizes');
	}).catch(function (error) {next(error);});
}

// GET /quizes/statistics
exports.statistics = function (req, res) {
	statistics = {n_quizes: 0, n_comments: 0, media: 0, quizes_con: 0, quizes_sin: 0};
	models.Quiz.findAll({include: [{ model: models.Comment }]}).then(function (quizes) {
		// Numero de preguntas
		statistics.n_quizes = quizes.length;
		for (i in quizes) {
			if (quizes[i].Comments.length != 0) {
				// Preguntas con comentarios
				statistics.quizes_con += 1;
			};
		};
		// Preguntas sin comentarios
		statistics.quizes_sin = statistics.n_quizes - statistics.quizes_con;
		models.Comment.findAll().then(function (comments) {
			// Numero de comentarios
			statistics.n_comments = comments.length;
			// Media de comentarios por pregunta con dos decimales
			statistics.media = (statistics.n_comments / statistics.n_quizes).toFixed(2);
			res.render('quizes/statistics', {statistics: statistics, errors: []});
		}).catch(function (error) {next(error);});
	}).catch(function (error) {next(error);});
};
