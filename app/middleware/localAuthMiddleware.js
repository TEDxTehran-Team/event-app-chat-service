const dns = require( 'dns' );

module.exports = function ( options )
{
	return function ( req, res, next )
	{
		const requestIp = req.connection.remoteAddress;

		dns.lookup( 'app', { all : true }, function ( err, result )
		{

			let validate = false;

			result.forEach( function ( value, key )
			{

				if ( value.family === 4 )
				{
					value.address = "::ffff:" + value.address
				}

				if ( requestIp == value.address )
				{
					validate = true
				}

			} );

			if ( !validate )
			{

				res.status( 401 ).send( {
					'status' : false,
					'message' :	'Unauthorized!'
				} );

			}
			else
			{
				next();
			}

		} );


	}
};