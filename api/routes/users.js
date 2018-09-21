import mongoose from 'mongoose'
import Debug from 'debug'
const helpers = require('./_helpers.js')
const express = require('express')
const required = require('../middlewares/token')
const router = express.Router()
const debug = new Debug('api/routes/users')
import lol from '../models/User.js'
const model = mongoose.model('User')

// router.get('/',(req, res, next) => helpers.find(model, req, res))

router.get('/', function (req, res) {
	return helpers.find(model, req, res)
})

router.get('/:id', function (req, res) {
	return helpers.findById(model, req, res)
})


router.post('/', required, function (req, res) {
	return helpers.save(model, req, res)
})

router.put('/:id', required, function (req, res) {
	return helpers.save(model, req, res)
})

router.delete('/:id', required, hasVehicles,function (req, res) {
	return helpers.delete(model, req, res)
})


function hasVehicles(req, res, next) {
	const model = req.params.id
	debug('model id: ', model)
	vehicle.findOne({ model })
		.then(response => {
			debug('Respuesta db: ', response)
			if (response === null || !response) {
				next()
			} else {
				res.status(200).json({
					message: 'No se pueden eliminar modelos si existen vehiculos de los mismos'
				})
			}
		})
		.catch(err => {
			res.status(400).json({
				message: 'A ocurrido un error',
				err
			})
		})
}
module.exports = router
