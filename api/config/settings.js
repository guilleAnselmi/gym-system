import path from 'path'

const settings = {
	token      : {
		secret:     'ts$s38*jsjmjnT1',
		expires:    '1d', // expires in 24 hours
		noexpires:  '100y', // expires in 100 years
	},
	baseUrl    : 'http://localhost',
	uploadDir  : '/tmp',
	imagesDir  : '../adm/files/',
	url        : function() {
		return this.baseUrl + ':' + this.port
	},
	path       : path.normalize(path.join(__dirname, '..')),
	port       : process.env.NODE_PORT || 3000,
	database   : {
		logging  : 'console.log',
		timezone : '-03:00',
		host     : 'localhost',
		name     : 'gym-system'
	},
	pagging    : {
		itemsPerPage  : 10
	}
}


export default settings
