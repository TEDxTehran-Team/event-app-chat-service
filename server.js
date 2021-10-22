const express = require( "express" ),
	bodyParser = require( "body-parser" ),
	cors = require( "cors" ),
	path = require( 'path' ),
	logger = require( 'morgan' ),
	mongoose = require( 'mongoose' ),
	config = require( './app/config/main' ),
	{ Server } = require( "socket.io" ),
	socketEvents = require( './app/socket/socketEvents' ),
	app = express(),
	swaggerUi = require( 'swagger-ui-express' ),
	swaggerDocument = require( './swagger.json' );

// Connect to the database
mongoose.connect( config.database ).then( r =>
{
	console.log( "Mongo Db conneted!" );
} );

let corsOptions = {
	origin : "http://localhost:" + config.port
};

app.use( cors( corsOptions ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended : true } ) );
app.use( express.json() );
app.use( express.static( path.join( __dirname, 'app/public' ) ) );
app.use( logger( 'dev' ) );
app.use( '/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerDocument ) );
//Enables CORS from client-side
app.use( function ( req, res, next )
{
	res.header( "Access-Control-Allow-Origin", "*" );
	res.header( 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS' );
	res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials" );
	res.header( "Access-Control-Allow-Credentials", "true" );
	next();
} );

require( "./app/routes/init.routes.js" )( app );

const server = app.listen( config.port, () =>
{
	console.log( `Server is running on port ${config.port}.` );
} );

const io = new Server( server );
socketEvents( io );


