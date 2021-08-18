//. app.js
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    ejs = require( 'ejs' ),
    app = express();

var _settings = process.env.SETTINGS || 'local';
var settings = require( './' + _settings );

//. env values
var basic_username = 'BASIC_USERNAME' in process.env ? process.env.BASIC_USERNAME : ''; 
var basic_password = 'BASIC_PASSWORD' in process.env ? process.env.BASIC_PASSWORD : ''; 

//. Basic 認証
if( basic_username && basic_password ){
  app.all( '*', basicAuth( function( user, pass ){
    return( user === basic_username && pass === basic_password );
  }));
}

//. DB
var dbapi = require( './api/dbapi' );
app.use( '/api', dbapi );

app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.get( '/', async function( req, res ){
  var items = await dbapi.readItems();
  res.render( 'index', { items: items, settings: settings } );
});

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );

