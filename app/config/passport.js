const passport = require( 'passport' ),
	User = require( '../models/user' ),
	config = require( './main' ),
	JwtStrategy = require( 'passport-jwt' ).Strategy,
	ExtractJwt = require( 'passport-jwt' ).ExtractJwt;

const jwtOptions = {
	jwtFromRequest : ExtractJwt.fromAuthHeaderWithScheme( 'Bearer' ),
	secretOrKey : config.secret
};

// JWT login strategy setup
const jwtLogin = new JwtStrategy( jwtOptions, function ( payload, callback )
{
	User.findOne( {
		user_id : payload.sub
	}, async function ( err, user )
	{
		if ( err )
		{
			return callback( err, false );
		}

		if ( user )
		{
			user.name = payload.name;

			user = await user.save();

			return callback( null, user );
		}
		else
		{
			try
			{
				let user = new User( {
					user_id : payload.sub,
					name : payload.name,
				} );

				let newUser = await user.save();

				return callback( null, newUser );
			}
			catch ( e )
			{
				return callback( e, false );
			}

		}
	} );
} );

passport.use( jwtLogin );