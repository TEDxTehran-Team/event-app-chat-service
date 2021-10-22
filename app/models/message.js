const mongoose = require( 'mongoose' ),
	Schema = mongoose.Schema;

const MessageSchema = new Schema( {
		conversationId : {
			type : Schema.Types.ObjectId,
			required : true
		},
		body : {
			type : String
		},
		is_seen : {
			type : Number
		},
		author : [ {
			kind : String,
			item : {
				type : String, refPath : 'author.kind'
			}
		} ],
	},
	{
		timestamps : true
	} );

module.exports = mongoose.model( 'Message', MessageSchema );