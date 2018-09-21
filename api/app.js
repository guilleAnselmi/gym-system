import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import routes from './routes'
import http from 'http'
import multipart from 'connect-multiparty'

const app = express()
const server = http.Server(app)


app.use(function (req, res, next) {
	if (process.env.NODE_ENV && process.env.NODE_ENV == 'test') {
		req.settings = require('./test/config/settings')
	} else {
		req.settings = require('./config/settings')
	}
	return next()
})


// CORS
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept, x-access-token, x-accepted-format')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	next()
})

app.use(multipart({
	uploadDir: '/tmp/'
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())


/*
 * @static content
 * app.use('/speechToText', express.static(path.join(__dirname, './static/speechToText.html')));
 * app.use('/files', express.static(path.join(__dirname, './static/files/')));
 */
app.use('/api', routes)

app.use('/', express.static(path.join(__dirname, '../adm/dist/')))
app.use('/files', express.static(path.join(__dirname, '../adm/files/')))

app.get('/*',  function(req, res) {
	res.sendFile('index.html', { root: '../adm/dist/' })
})

export {app, server}
