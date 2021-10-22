const config = require( '../config/main' );
const { authorize } = require( '@thream/socketio-jwt' );
const User = require( '../models/user' );
const Conversation = require( '../models/conversation' );
const Message = require( '../models/message' );

exports = module.exports = function ( io )
{

	io.use(
		authorize( {
			secret : config.secret,
			onAuthentication : async decodedToken =>
			{
				const user = await User.findOne( { user_id : decodedToken.sub } ).exec();

				if ( !user )
				{
					throw { code : "user_not_found", Message : 'User not Found!', type : "UnauthorizedError" };
				}

				return user;
			}
		} )
	);

	io.on( 'connection', ( socket ) =>
	{

		let currentUser = socket.user;

		console.log( 'a user has connected' );

		socket.on( 'enter privateMessage', ( conversationId ) =>
		{
			console.log( 'enter privateMessage' );

			Conversation.findOne( { $and : [ { participants : currentUser._id }, { _id : conversationId } ] }, function ( err, foundConversation )
			{
				if ( err || !foundConversation || parseInt( conversationId ) !== parseInt( foundConversation._id ) )
				{
					socket.emit( "messages", "Unauthorized!" );
					return;
				}

				if ( foundConversation )
				{
					socket.join( conversationId );
				}

			} );

		} );

		socket.on( 'leave privateMessage', ( conversationId ) =>
		{
			let currentUser = socket.user;
			console.log( 'leave privateMessage' );

			if ( !conversationId )
			{
				socket.emit( "messages", "Bad parameter!" );
				return;
			}

			Conversation.find( { $and : [ { participants : currentUser._id }, { _id : conversationId } ] }, function ( err, foundConversation )
			{
				if ( err || !foundConversation )
				{
					socket.emit( "messages", "Unauthorized!" );
					return;
				}

				socket.leave( conversationId );

			} );

		} );

		socket.on( 'new privateMessage', ( data ) =>
		{
			console.log( 'new privateMessage' );

			let currentUser = socket.user;
			let conversationId = data.conversationId;
			let message = data.message;

			if ( !data || !conversationId || !message )
			{
				socket.emit( "messages", "Bad Parameter!" );
				return;
			}

			try
			{
				Conversation.findOne( { $and : [ { participants : currentUser._id }, { _id : conversationId } ] }, async function ( err, foundConversation )
				{
					if ( err || !foundConversation )
					{
						socket.emit( "messages", "Unauthorized!" );
						return;
					}

					const newMessage = new Message( {
						conversationId : foundConversation._id,
						body : message,
						is_seen : 0,
						author : {
							kind : 'User',
							item : currentUser._id
						}
					} );

					let messageStatus = await newMessage.save();

					if ( !messageStatus )
					{
						socket.emit( "messages", "Unauthorized!" );
					}

					io.sockets.in( conversationId ).emit( 'refresh privateMessages', data );

				} );
			}
			catch ( e )
			{
				console.log( e )
			}
		} );

		socket.on( 'user typing', ( data ) =>
		{
			console.log( 'user typing' );
			let currentUser = data.user;
			let conversationId = data.conversationId;

			if ( !data || !conversationId )
			{
				socket.emit( "messages", "Bad Parameter!" );
				return;
			}

			Conversation.find( { $and : [ { participants : currentUser._id }, { _id : conversationId } ] }, function ( err, foundConversation )
			{
				if ( err || !foundConversation )
				{
					socket.emit( "messages", "Unauthorized!" );
					return;
				}

				io.sockets.in( conversationId ).emit( 'typing', data );

			} );
		} );

	} );

};