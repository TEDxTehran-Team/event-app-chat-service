const Conversation = require( '../models/conversation' ),
	Message = require( '../models/message' ),
	User = require( '../models/user' );

exports.newConversation = function ( req, res, next )
{
	const recipientId = req.body.recipient_id;
	const userId = req.body.user_id;


	if ( !recipientId || !userId )
	{
		res.status( 422 ).send( {
			status : false,
			message : "Enter a valid recipient or user."
		} );
		return next();
	}

	User.findOne( { user_id : userId }, async function ( err, foundUser )
	{
		if ( err )
		{
			res.send( {
				error : err
			} );

			return next( err );
		}

		if ( !foundUser )
		{
			let user = new User( {
				user_id : userId,
			} );

			foundUser = await user.save();
		}

		User.findOne( { user_id : recipientId }, async function ( err, foundRecipient )
		{
			if ( err )
			{
				res.send( {
					error : err
				} );

				return next( err );
			}

			if ( !foundRecipient )
			{
				let user = new User( {
					user_id : recipientId,
				} );

				foundRecipient = await user.save();
			}

			Conversation.findOne( { $and : [ { participants : foundUser._id }, { participants : foundRecipient._id } ] }, function ( err, foundConversation )
			{
				if ( foundConversation )
				{
					res.status( 200 ).json( {
						status : true,
						message : `Started conversation with ${foundRecipient.name}`,
						data : {
							conversationId : foundConversation._id,
							recipient : foundRecipient.name,
						}
					} )
				}
				else
				{
					const conversation = new Conversation( {
						participants : [ foundUser._id, foundRecipient._id ],
						count : 0
					} );

					conversation.save( function ( err, newConversation )
					{
						if ( err )
						{
							res.send( {
								status : false,
								error : err
							} );
							return next( err );
						}

						res.status( 200 ).json( {
							status : true,
							message : `Started conversation with ${foundRecipient.name}`,
							data : {
								consversionId : newConversation._id,
								recipient : foundRecipient.name,
							}
						} )

					} );
				}

			} );


		} );

	} );
};

exports.leaveConversation = function ( req, res, next )
{
	const conversationToLeave = req.body.conversationId;
	const userId = req.user._id;

	Conversation.findOneAndRemove( {
		participants : userId,
		_id : conversationToLeave
	}, function ( err, foundConversation )
	{
		if ( err )
		{
			res.send( {
				status : false,
				error : err
			} );
			return next( err );
		}

		if ( foundConversation )
		{
			res.status( 200 ).json( {
				status : true,
				message : 'Left from the Conversation.'
			} );
		}
		else
		{
			res.status( 404 ).json( {
				status : false,
				message : 'Conversation not found!'
			} );
		}
	} );
};

exports.getConversations = function ( req, res, next )
{
	const userId = req.user.user_id;

	Conversation.aggregate( [
		{ $match : { participants : req.user._id } },
		{
			$lookup : {
				from : "messages",
				localField : "_id",
				foreignField : "conversationId",
				as : "Message",
				pipeline : [
					{
						$match : {
							is_seen : 0
						}
					}
				],
			},
		}, {
			$lookup : {
				from : "users",
				localField : "participants",
				foreignField : "_id",
				as : "Users",
			},
		},
	] ).exec( ( err, conversations ) =>
	{
		if ( err )
		{
			res.send( { error : err } );
			return next( err );
		}

		if ( conversations.length === 0 )
		{
			return res.status( 200 ).json( {
				status : false,
				message : 'No conversations yet'
			} )
		}

		const conversationList = [];

		conversations.forEach( ( conversation ) =>
		{
			let participant = conversation.Users.filter( item =>
			{
				return parseInt( item.user_id ) !== parseInt( userId )
			} );

			let messageCount = conversation.Message.length;

			if ( participant.length >= 1 )
				participant = participant[0];

			let conversionObj = {
				"_id" : conversation._id,
				"name" : participant.name !== undefined ? participant.name : '',
				"count" : messageCount
			};

			conversationList.push( conversionObj );

		} );


		return res.status( 200 ).json( {
			status : true,
			message : 'successful',
			data : conversationList
		} );

	} );
};

exports.sendMessage = function ( req, res, next )
{
	const privateMessage = req.body.message;
	const conversationId = req.body.conversationId;
	const userId = req.user._id;

	console.log(userId)

	if ( !privateMessage || !conversationId )
	{
		return res.status( 500 ).json( {
			status : false,
			message : 'Bad Request!'
		} )
	}

	Conversation.findOne( { $and : [ { participants : userId }, { _id : conversationId } ] }, function ( err, foundConversation )
	{

		if ( err )
		{

			res.send( {
				errror : err
			} );

			return next( err );

		}

		if ( !foundConversation )
		{
			return res.status( 404 ).json( {
				status : false,
				message : 'Could not find conversation'
			} )
		}

		const message = new Message( {
			conversationId : foundConversation._id,
			body : privateMessage,
			is_seen : 0,
			author : {
				kind : 'User',
				item : req.user._id
			}
		} );

		message.save( function ( err, sentReply )
		{

			if ( err )
			{
				res.send( {
					error : err
				} );
				return next( err );
			}

			foundConversation.count += 1;
			foundConversation.save();

			res.status( 200 ).json( {
				status : true,
				message : 'Message sent.'
			} );

			return next();

		} );

	} );

};

exports.getPrivateMessages = function ( req, res, next )
{
	const userId = req.user._id;
	const conversationId = req.params.conversationId;

	Conversation.findOne( { $and : [ { participants : userId }, { _id : conversationId } ] }, function ( err, foundConversation )
	{
		if ( err )
		{
			res.send( {
				error : err
			} );
			return next( err );
		}

		if ( !foundConversation )
		{
			return res.status( 200 ).json( {
				status : false,
				message : 'Could not find conversation'
			} )
		}

		Message.find( { conversationId : foundConversation._id } ).select( 'createdAt body author' ).sort( '-createdAt' ).populate( 'author.item', {
			"name" : true
		} ).exec( function ( err, message )
		{
			if ( err )
			{
				res.send( {
					error : err
				} );
				return next();
			}

			try
			{
				Message.updateMany( { conversationId : foundConversation._id }, { $set : { is_seen : 1 } }, {}, ( err, collection ) =>
				{
					if ( err ) throw err
				} );

				const sortedMessage = message.reverse();

				res.status( 200 ).json( {
					status : true,
					message : 'successful',
					data : {
						conversation : sortedMessage,
						conversationId : foundConversation._id
					}
				} );

			}
			catch ( e )
			{
				res.status( 200 ).json( {
					status : false,
					message : 'Error!'
				} );
			}

		} );
	} );
};