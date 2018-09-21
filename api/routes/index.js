const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()


router.use(function (req, res, next) {
	if (req.method == 'OPTIONS') {
		return next()
	}

	req.originalUrl = req.originalUrl.replace('//', '/')

	return next()
})


fs
	.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== '_helpers.js')
	})
	.forEach(function (file) {
		file = file.replace('.js', '')
		router.use('/' + file.replace('.js', ''), require(path.join(__dirname, file)))
	})

module.exports = router
