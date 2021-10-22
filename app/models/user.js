const mongoose = require( 'mongoose' ),
	Schema = mongoose.Schema;

const UserSchema = new Schema( {
		user_id : {
			type : String
		},
		name : {
			type : String
		}
	},
	{
		timestamps : true
	} );

module.exports = mongoose.model( 'User', UserSchema );