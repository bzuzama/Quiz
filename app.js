var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function (req, res, next) {
	// Guardar path en session.redir para despues de login
	if (!req.path.match(/\/login|\/logout/)) {
		req.session.redir = req.path;
	}
	// Hacer visible req.session en las vistas
	res.locals.session = req.session;
	next();
});

app.use(function (req, res, next) {
	var now = new Date();
	var last_op = req.session.last_op || 0;
	var tiempo = 0;
	var n = 0;
	var lo = 0;
	if (req.session.user) {
		if (last_op === 0) { // si es la primera vez que se ejecuta el MW se inicializa
			req.session.last_op = now; // se inicializa la variable de sesión 'last_op' a ahora 'now' 
			next (); // y se pasa al siguiente MW
		} else { 
			n = now.getTime();
			lo = Date.parse(last_op);
			tiempo = n - lo;  // tiempo en milisegundos desde la ultima acción
			if (tiempo < 120000) { // si el tiempo es inferior a 2 min. (120.000 milisegundos)
				req.session.last_op = now; // se actualiza la variable de sesión 'last_op'
				next (); // y se pasa al siguiente MW
			} else { // si han transcurrido mas de 2 min.
				delete req.session.user; // se destruye la sesión
				delete req.session.last_op;
				next();
			}
		}
	} else {next ();}
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
			errors: []
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
		errors: []
	});
});


module.exports = app;
