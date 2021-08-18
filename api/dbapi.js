//. dbapi.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    multer = require( 'multer' ),
    { v4: uuidv4 } = require( 'uuid' ),
    router = express();
var PG = require( 'pg' );
PG.defaults.ssl = true;

//. env values
var pg_hostname = 'PG_HOSTNAME' in process.env ? process.env.PG_HOSTNAME : ''; 
var pg_port = 'PG_PORT' in process.env ? parseInt( process.env.PG_PORT ) : 5432; 
var pg_database = 'PG_DATABASE' in process.env ? process.env.PG_DATABASE : ''; 
var pg_username = 'PG_USERNAME' in process.env ? process.env.PG_USERNAME : ''; 
var pg_password = 'PG_PASSWORD' in process.env ? process.env.PG_PASSWORD : ''; 

var pg_client = null;
if( pg_hostname && pg_port && pg_database && pg_username && pg_password ){
  var connectionString = "postgres://" + pg_username + ":" + pg_password + "@" + pg_hostname + ":" + pg_port + "/" + pg_database;
  var pg = new PG.Pool({ 
    connectionString: connectionString,
    idleTimeoutMillis: ( 30 * 86400 * 1000 )  //. 30 days : https://node-postgres.com/api/pool#new-pool-config-object-
  });
  pg.connect( function( err, client ){
    if( err ){
      console.log( err );
    }else{
      pg_client = client;
    }
  });
  pg.on( 'error', function( err ){
    console.error( 'on error', err );
    pg.connect( function( err, client ){
      if( err ){
        console.log( 'err', err );
      }else{
        pg_client = client;
      }
    });
  });
}

router.use( multer( { dest: '../tmp/' } ).single( 'image' ) );
router.use( bodyParser.urlencoded( { extended: true } ) );
router.use( bodyParser.json() );


//. CREATE ITEM
router.createItem = async function( image_id, name, price ){
  return new Promise( async ( resolve, reject ) => {
    var id = uuidv4();
    var ts = ( new Date() ).getTime();
    var sql = "insert into items( id, image_id, name, price, created, updated ) values( $1, $2, $3, $4, $5, $6 )";
    var query = { text: sql, values: [ id, image_id, name, price, ts, ts ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        resolve( id );
      }
    });
  });
};

//. CREATE IMAGE
router.createImage = async function( body, contenttype, filename ){
  return new Promise( async ( resolve, reject ) => {
    var id = uuidv4();
    var ts = ( new Date() ).getTime();
    var sql = "insert into images( id, body, contenttype, filename, created, updated ) values( $1, $2, $3, $4, $5, $6 )";
    var query = { text: sql, values: [ id, body, contenttype, filename, ts, ts ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        resolve( id );
      }
    });
  });
};

//. READ ITEM
router.readItem = async function( id ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "select * from items where id = $1";
    var query = { text: sql, values: [ id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        var item = null;
        if( result.rows.length > 0 && result.rows[0].id ){
          try{
            item = result.rows[0];
          }catch( e ){
          }
        }
        resolve( item );
      }
    });
  });
};

//. READ IMAGE
router.readImage = async function( id ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "select * from images where id = $1";
    var query = { text: sql, values: [ id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        var image = null;
        if( result.rows.length > 0 && result.rows[0].id ){
          try{
            image = result.rows[0];
          }catch( e ){
          }
        }
        resolve( image );
      }
    });
  });
};

//. READ ITEMS
router.readItems = async function( limit, start ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "select * from items order by created";
    if( limit ){
      sql += ' limit ' + limit;
    }
    if( start ){
      sql += ' start ' + start;
    }
    var query = { text: sql, values: [] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        var items = [];
        if( result.rows.length > 0 ){
          try{
            items = result.rows;
          }catch( e ){
          }
        }
        resolve( items );
      }
    });
  });
};

//. READ IMAGES
router.readImages = async function( limit, start ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "select * from images order by created";
    if( limit ){
      sql += ' limit ' + limit;
    }
    if( start ){
      sql += ' start ' + start;
    }
    var query = { text: sql, values: [] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        var images = [];
        if( result.rows.length > 0 ){
          try{
            images = result.rows;
          }catch( e ){
          }
        }
        resolve( images );
      }
    });
  });
};

//. UPDATE ITEM
router.updateItem = async function( id, image_id, name, price ){
  return new Promise( async ( resolve, reject ) => {
    var ts = ( new Date() ).getTime();
    var sql = "update items set image_id = $1, name = $2, price = $3, updated = $4 where id = $5";
    var query = { text: sql, values: [ image_id, name, price, ts, id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        resolve( true );
      }
    });
  });
};

//. UPDATE IMAGE
router.updateImage = async function( id, body, contenttype, filename ){
  return new Promise( async ( resolve, reject ) => {
    var ts = ( new Date() ).getTime();
    var sql = "update images set body = $1, contenttype = $2, filename = $3, updated = $4 where id = $5";
    var query = { text: sql, values: [ body, contenttype, filename, ts, id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        resolve( true );
      }
    });
  });
};

//. DELETE ITEM
router.deleteItem = async function( id ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "delete from items where id = $1";
    var query = { text: sql, values: [ id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        reject( err );
      }else{
        resolve( true );
      }
    });
  });
};

//. DELETE IMAGE
router.deleteImage = async function( id ){
  return new Promise( async ( resolve, reject ) => {
    var sql = "delete from images where id = $1";
    var query = { text: sql, values: [ id ] };

    pg_client.query( query, function( err, result ){
      if( err ){
        console.log( err );
        reject( err );
      }else{
        resolve( true );
      }
    });
  });
};


router.post( '/item', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var image_id = req.body.image_id ? req.body.image_id : '';
  var name = req.body.name ? req.body.name : '';
  var price = req.body.price ? req.body.price : 0;
  if( image_id ){
    var id = await router.createItem( image_id, name, price );
    if( id ){
      res.write( JSON.stringify( { status: true, id: id } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no image_id' } ) );
    res.end();
  }
});

router.post( '/image', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var imgpath = req.file.path;
  var imgtype = req.file.mimetype;
  var filename = req.file.originalname;

  var img = fs.readFileSync( imgpath );
  if( img && imgtype && filename ){
    var id = await router.createImage( img, imgtype, filename );
    if( id ){
      res.write( JSON.stringify( { status: true, id: id } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no image' } ) );
    res.end();
  }
});

router.get( '/item/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.params.id ? req.params.id : null;
  if( id ){
    var item = await router.readItem( id );
    if( item ){
      res.write( JSON.stringify( { status: true, item: item } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no id' } ) );
    res.end();
  }
});

router.get( '/image/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.params.id ? req.params.id : null;
  if( id ){
    var image = await router.readImage( id );
    if( image ){
      if( req.query.attachment ){
        res.contentType( image.contenttype );
        res.end( image.body, 'binary' );
      }else{
        res.write( JSON.stringify( { status: true, image: image } ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no id' } ) );
    res.end();
  }
});

router.get( '/items', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var limit = req.query.limit ? parseInt( req.query.limit ) : 0;
  var start = req.query.start ? parseInt( req.query.start ) : 0;
  var items = await router.readItems( limit, start );
  if( items ){
    res.write( JSON.stringify( { status: true, items: items } ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false } ) );
    res.end();
  }
});

router.get( '/images', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var limit = req.query.limit ? parseInt( req.query.limit ) : 0;
  var start = req.query.start ? parseInt( req.query.start ) : 0;
  var images = await router.readImages( limit, start );
  if( images ){
    res.write( JSON.stringify( { status: true, images: images } ) );
    res.end();
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false } ) );
    res.end();
  }
});

router.put( '/item/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.params.id ? req.params.id : '';
  var image_id = req.body.image_id ? req.body.image_id : '';
  var name = req.body.name ? req.body.name : '';
  var price = req.body.price ? req.body.price : 0;
  if( id ){
    var id = await router.updateItem( id, image_id, name, price );
    if( id ){
      res.write( JSON.stringify( { status: true } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no name' } ) );
    res.end();
  }
});

router.put( '/image/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var imgpath = req.file.path;
  var imgtype = req.file.mimetype;
  var filename = req.file.originalname;

  var id = req.params.id ? req.params.id : '';

  var img = fs.readFileSync( imgpath );
  if( id ){
    var id = await router.updateImage( id, img, imgtype, filename );
    if( id ){
      res.write( JSON.stringify( { status: true, id: id } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no id' } ) );
    res.end();
  }
});

router.delete( '/item/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.params.id ? req.params.id : null;
  if( id ){
    var r = await router.deleteItem( id );
    if( r ){
      res.write( JSON.stringify( { status: true } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no id' } ) );
    res.end();
  }
});

router.delete( '/image/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var id = req.params.id ? req.params.id : null;
  if( id ){
    var r = await router.deleteImage( id );
    if( r ){
      res.write( JSON.stringify( { status: true } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no id' } ) );
    res.end();
  }
});




function timestamp2datetime( ts, time ){
  if( ts ){
    if( typeof ts == 'string' ){
      ts = parseInt( ts );
    }

    //. 日本時間に変更したいが、サーバーがどこでどう動いているかによる
    //var tzo = ( new Date() ).getTimezoneOffset(); //. 日本だと -540 、GMT だと 0
    //ts -= ( ( tzo + 540 ) * 60 * 1000 );

    var dt = new Date( ts );
    var yyyy = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var hh = dt.getHours();
    var nn = dt.getMinutes();
    var ss = dt.getSeconds();
    var datetime = yyyy + '-' + ( mm < 10 ? '0' : '' ) + mm + '-' + ( dd < 10 ? '0' : '' ) + dd;
    if( time ){
      datetime +=  ' ' + ( hh < 10 ? '0' : '' ) + hh + ':' + ( nn < 10 ? '0' : '' ) + nn + ':' + ( ss < 10 ? '0' : '' ) + ss;
    }
    return datetime;
  }else{
    return "";
  }
}



//. router をエクスポート
module.exports = router;
