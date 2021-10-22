module.exports = {
	'secret' : process.env.SECRET_KEY,
	'database' : `${process.env.DATABASE_SCHEMA}://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
	'port' : 3030,
};