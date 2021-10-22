const
	express = require( 'express' ),
	passportService = require( '../config/passport' ),
	passport = require( 'passport' ),
	localAuth = require('../middleware/localAuthMiddleware'),
	ChatController = require( '../controllers/chat' );

const requireAuth = passport.authenticate( 'jwt', { session : false } );

module.exports = app =>
{
	const apiRoutes = express.Router(),
		chatRoutes = express.Router();

	apiRoutes.use( '/chat', chatRoutes );

	// View messages from users
	chatRoutes.get( '/', requireAuth, ChatController.getConversations );

	// Gets Private conversations
	chatRoutes.get( '/conversations/:conversationId', requireAuth, ChatController.getPrivateMessages );

	// Start new conversation
	chatRoutes.post( '/new', localAuth(), ChatController.newConversation );

	// Leave conversation
	chatRoutes.post( '/leave', requireAuth, ChatController.leaveConversation );

	// New message to conversations
	chatRoutes.post( '/newMessage', requireAuth, ChatController.sendMessage );

	app.use( '/api', apiRoutes );

	app.get( '/', ( req, res ) =>
	{
		// res.sendFile(__dirname + '/index.html');
		res.status( 200 ).send( 'Working' )
	} );
};