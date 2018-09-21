import Debug from 'debug'
const url       = require('url')
const fs        = require('fs')
const _         = require('lodash')
const models    = require('../models')
const moment    = require('moment')
const uuid = require('uuid')

const debug = new Debug('api/routes/_helpers')



const settings = {
	gcm: {
		//id: "AAAAv8hy8ms:APA91bEXyBy228XjfghPxTmGdZhxEuYElT849sOy-4Iz3ndYli-4LPi3wBGoUpSnMxorQNoBvcXZwNDMs36bXm4cKLNOH6V3sTEOcIGxvszjhPGDdSvxZEk4cUB7zwmbKk8rLqpPthHL",
		id: 'AAAABjP-kVc:APA91bFrNvtLBVUgQusTv9ll1Err5zp1cKe5AgJSRoSjwOyq1u6TpSil5A_m6AZyhZi12J9eQCi0qJqrRj2MzOziYHpDw6JHJFtjveQv8T2ptgEUXP1BMbxN1et40EWZa1Vouc7Yvp7H',
	},
	apn: {
		token: {
			key: './certs/key.p8', // optionally: fs.readFileSync('./certs/key.p8')
			keyId: 'ABCD',
			teamId: 'EFGH',
			production: false // true for APN production environment, false for APN sandbox environment
		}
	}
}


const PushNotifications = require('node-pushnotifications')
const push = new PushNotifications(settings)


module.exports = {

	toMysqlDate: function (date) {
		return moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
	},


	toHumanDate: function (date) {
		return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY')
	},

	notify: function (deviceId,message,body) {
		debug('notify:' + message + ' - ' + body  + ' - ' + deviceId)
		const data = {
			title: message, // REQUIRED for Android
			topic: 'topic', // REQUIRED for iOS (apn and gcm)
			body: body,
			custom: {
				sender: 'Peniel',
			}
		}

		// Or you could use it as a promise:
		push.send(deviceId, data)
			.then((results) => {
				//alert(JSON.stringify(results));
				debug(JSON.stringify(results))
			})
			.catch((err) => {
				//alert(JSON.stringify(err));
				debug(JSON.stringify(err))
			})

	},

	deleteFiles: function (req, res) {
		debug('entro', req.body)
		if(req.body) {
			req.body.forEach(el => {
				fs.unlink(`${req.settings.imagesDir}/${el}`, err => {
					debug(`error al borrar el archivo. ${err}`)
				})
				fs.unlink(`${req.settings.imagesDir}/small-${el}`, err => {
					if (err) {
						debug(`error al borrar el archivo. ${err}`)
					}
				})
			})
			res.status(200).json({
				message: 'Imagenes borradas con exito'
			})
		} else {
			res.status(400).json({
				message: 'bad request',
				body: req.body
			})
		}
	},

	upload: function (req, res) {

		let prefix = ''
		if (req.originalUrl) {
			let p = req.originalUrl.split('/')
			if (p.length >= 3) {
				prefix = p[1] + '_'
			}
		}

		const _self = this
		if (req.files && req.files.file) {
			let file = req.files.file
			let tmp = file.type.split('/')
			if (tmp.length == 2 && tmp[0] == 'image') {
				let newFileName = prefix + uuid.v4() + '.' + tmp[1]
				fs.rename(file.path, req.settings.imagesDir + newFileName, function (err) {
					if (err) {
						return res.status(400).send({ errors: _self.formatErrors(err) })
					} else {
						const Jimp = require('jimp')

						Jimp.read(req.settings.imagesDir + newFileName).then(function (lenna) {
							// lenna.resize(256, 256)            // resize
							lenna.scaleToFit(256, 256)            // resize
								.quality(60)                 // set JPEG quality
							//           .greyscale()                 // set greyscale
								.write(req.settings.imagesDir + 'small-' + newFileName) // save

							return res.status(200).send({ image: newFileName })
						}).catch(function (err) {
							debug('err:' + err)
							return res.status(400).send({ errors: 'No se puede generar el archivo chico' })
						})
					}
				})
			} else {
				return res.status(400).send({ errors: 'No image files uploaded' })
			}
		} else {
			return res.status(400).send({ errors: 'No file uploaded' })
		}
	},



	uploadOri: function (req, res, next, sendResponse, cb) {

		var prefix = ''
		if (req.originalUrl) {
			var p = req.originalUrl.split('/')
			if (p.length >= 3) {
				prefix = p[1] + '_'
			}
		}

		var _self = this
		if (req.files && req.files.file) {
			var file = req.files.file
			var tmp = file.type.split('/')
			if (tmp.length == 2 && tmp[0] == 'image') {
				var newFileName = prefix + uuid.v4() + '.' + tmp[1]
				fs.rename(file.path, req.settings.imagesDir + newFileName, function(err) {
					if (err) {
						return res.status(400).send( { errors: _self.formatErrors(err) } )
					} else {
						if (cb) {
							cb(req, res, newFileName)
						}
						if(sendResponse) return res.status(200).send({ image : newFileName })
					}
				})
			} else {
				if(sendResponse) return res.status(400).send( { errors: 'No image files uploaded' } )
			}
		} else {
			if(sendResponse) return res.status(400).send( { errors: 'No file uploaded' } )
		}
	},

	uploadNew: function (req, res, next, cbs, cbf) {

		var prefix = ''
		if (req.originalUrl) {
			var p = req.originalUrl.split('/')
			if (p.length >= 3) {
				prefix = p[1] + '_'
			}
		}

		var _self = this
		if (req.files && req.files.file) {
			var file = req.files.file
			var tmp = file.type.split('/')
			if (tmp.length == 2 && tmp[0] == 'image') {
				var newFileName = prefix + uuid.v4() + '.' + tmp[1]
				fs.rename(file.path, req.settings.imagesDir + newFileName, function(err) {
					if (err) {
						cbf(req, res, _self.formatErrors(err))
					} else {
						cbs(req, res, newFileName)
					}
				})
			} else {
				cbf(req, res, 'No image files uploaded')
			}
		} else {
			cbf(req, res, 'No file uploaded')
		}
	},


	findById: function(model, req, res) {
		let _self = this
		var options = {}
		if (req.extraOptions) {
			if (req.extraOptions.include) {
				options.include = req.extraOptions.include
			}
		}
		model.findById(req.params.id, options)
			.then(function(item) {
				if(item) {
					if (typeof res === 'function') {
						res(item)
					} else {
						res.json(_self.addIdProperty(item))
						//res.json(item);
					}
				} else {
					return res.status(404).send( { errors : _self.formatErrors({'name': 'Item Not Found', 'message': 'Item ID: '+ req.params.id +' Not Found'}) } )
				}
			})
	},

	login: function (model, req, res) {
		let _self = this
		var params = req.body
		if (req.params.user) {
			params.user = req.params.user
			params.password = req.params.password
		}
		debug('usuario: ' + params.user + ' password: ' + params.password)
		model.findOne({user: params.user, password: params.password}).then(function (item) {
			if (item) {
				res.json(item)
			} else {
				return res.status(200).send({ status: 'nok', errors: _self.formatErrors({'name': 'Login incorrecto', 'message': 'Usuario o contraseña incorrecta'}) } )
			}
		})
	},


	loginRut: function (model, req, res) {
		let _self = this
		var params = req.body
		if (req.params.rut) {
			params.rut = req.params.rut
			params.password = req.params.password
		}
		debug('rut: ' + params.rut + ' password: ' + params.password)
		model.findOne({rut: params.rut, password: params.password}).then(function (item) {
			if (item) {
				res.json(item)
			} else {
				return res.status(200).send({ status: 'nok', errors: _self.formatErrors({'name': 'Login incorrecto', 'message': 'Usuario o contraseña incorrecta'}) } )
			}
		})
	},

	delete: function(model, req, res) {
		let _self = this
		debug('**********DELETE***********')
		debug(JSON.stringify(req.params))
		debug(req.params.id)
		if (req.params.id) {
			model.deleteOne({_id:req.params.id}).then(function() {
				return res.status(200).send()
			}).catch(function(err) {
				return res.status(400).send( { errors : _self.formatErrors(err) } )
			})
		} else {
			return res.status(200).send()
		}
	},

	deleteOld: function(model, req, res) {
		let _self = this
		model.findById(req.params.id).then(function(item) {
			if (item) {
				item.destroy().then(function() {
					return res.status(200).send()
				}).catch(function(err) {
					return res.status(400).send( { errors : _self.formatErrors(err) } )
				})
			} else {
				return res.status(404).send( { errors : _self.formatErrors({'name': 'Item Not Found', 'message': 'Item ID: '+ req.params.id +' Not Found'}) } )
			}
		})
	},

	paginate: function(model, req, res) {

		var _self = this
		var options = _self.getOptions(model, req)
		model.findAll(options).then(function(find) {
			// removing includes to avoid being counted
			// options.include = null;
			model.count(options).then(function(count) {
				debug(count)
				if (typeof res === 'function') {
					//debug(find[0].get());
					res(find, count)
				} else {
					res.set({
						'Access-Control-Expose-Headers' :   'X-Total-Count,X-User-Logged-In,X-User-Code',
						'X-Total-Count' :                   count,
						'X-User-Logged-In' :                req.userLoggedIn,
						'X-User-Code' :                     req.userCode
					})

					for(var i=0; i < find.length;i++){
						find[i].id = find[i]._id
					}

					res.json(find)
				}
			})
		})
	},

	find: function(model, req, res) {

		var urlParts = url.parse(req.url, true)
		var queryParams = urlParts.query

		debug('queryParams:' + JSON.stringify(queryParams))

		var sort = {}
		if(queryParams.sort)
			sort = JSON.parse(queryParams.sort)

		debug('sort:')
		debug(sort)

		var filter = {}
		if(queryParams._filters) {
			filter = JSON.parse(queryParams._filters)
		}
		debug('filter: ', filter)

		debug(queryParams.limit)
		let datas
		// datas = model.find(filter)

		if (queryParams.limit) {
			datas = model.find(filter)
				.limit(Number(queryParams.limit))
		} else {
			datas = model.find(filter)
		}

		let populates = []
		if (queryParams._populates)
			populates = JSON.parse(queryParams._populates)

		debug('===========')
		debug(populates)

		for (let i = 0; i < populates.length ; i++){
			datas = datas.populate(populates[i])
		}

		datas.sort(sort).then(function (find) {
			for (let i = 0; i < find.length; i++) {
				find[i].id = find[i]._id
			}
			res.json(find)
		})
	},

	findOld: function(model, req, res) {
		model.find().then(function(find) {
			for(var i=0; i < find.length;i++){
				find[i].id = find[i]._id
			}
			res.json(find)
		})
	},

	save: function(model, req, res) {

		var _self = this

		var params = req.body

		if (req.params.id) {
			params.id = req.params.id
		}

		if (params.id) {
			model.update( { _id : params.id } , params ).then(function(data) {
				return res.status(200).send( data )
			}).catch(function(err) {
				return res.status(400).send( { errors: _self.formatErrors(err) } )
			})
		} else {
			//params.id = uuid.v4();
			model.create(params).then(function(data) {
				return res.status(200).send(_self.addIdProperty(data))
			}).catch(function(err) {
				debug(err)
				return res.status(400).send( { errors: _self.formatErrors(err) } )
			})
		}

	},

	getDateConditions: function(req, model) {
		let alias = ''
		if (model) {
			alias = model + '.'
		}
		let params = this.parseQueryString(req)
		let where = null
		if (params && params._filters) {
			params._filters = JSON.parse(params._filters)
			if (params._filters.dateFrom && params._filters.dateTo) {
				where = models.sequelize.literal('DATE(' + alias + 'date) >= "' + params._filters.dateFrom + '" AND DATE(' + alias + 'date) <= "' + params._filters.dateTo + '"')
			} else {
				if (params._filters.dateFrom) {
					where = models.sequelize.literal('DATE(' + alias + 'date) >= "' + params._filters.dateFrom + '"')
				}
				if (params._filters.dateTo) {
					where = models.sequelize.literal('DATE(' + alias + 'date) <= "' + params._filters.dateTo + '"')
				}
			}
		}
		return where
	},

	getOptionsSearch: function(model, req) {

		var urlParts = url.parse(req.url, true)
		var queryParams = urlParts.query

		var options = {}
		var filters = {}

		debug('================= SEARCH ===================')
		debug(queryParams._filters_serach)
		debug('================= SEARCH ===================')

		if (queryParams._filters_serach) {
			var criterias = JSON.parse(queryParams._filters_serach)

			debug('================= FOR ===================')
			var filters_like = []
			for(var i = 0 ; i < criterias.length ; i++){
				debug(criterias[i])
				var f = { $like : '%' + criterias[i] + '%' }
				filters_like.push(f)
			}
			filters.art_descripcion = { $or : filters_like }

			// RUBROS
			/*var where = {};
    where.rub_descripcion = { $or : filters_like };
    req.extraOptions.include.push({
    model: models.rubros,
    where: where
  });*/
			debug('================= FOR ===================')

			/*if (criterias.art_descripcion) {
  filters.art_descripcion = { $like : '%' + criterias.art_descripcion + '%' };
  delete criterias.art_descripcion;
}*/

			/*for (var field in criterias) {
filters[field] = criterias[field];
}*/

			//if (Object.keys(filters).length > 0) {
			debug('================= WHERE ===================')
			debug(filters)
			options.where = filters
			debug('================= WHERE ===================')
			//}

		}

		if (queryParams._page && queryParams._perPage) {
			var page = null
			if (queryParams._perPage) {
				page = parseInt(queryParams._page)
			} else {
				page = 1
			}
			page--

			var perPage = null
			if (queryParams._perPage) {
				perPage = parseInt(queryParams._perPage)
			} else {
				perPage = req.settings.pagging.itemsPerPage
			}
			options.limit = perPage
			options.offset = page * perPage
		}

		var sort = null
		if (queryParams._sortField) {
			sort = queryParams._sortField
		}
		if (sort && queryParams._sortDir) {
			sort = [ [ sort, queryParams._sortDir ] ]
		}
		options.order = sort

		if (req.extraOptions) {
			if (req.extraOptions.where) {
				if (options.where) {
					options.where = _.flatten([options.where, req.extraOptions.where])
				} else {
					options.where = req.extraOptions.where
				}
			}

			if (req.extraOptions.order) {
				if (options.order) {
					options.order = _.flatten([options.order, req.extraOptions.order])
				} else {
					options.order = req.extraOptions.order
				}
			}

			if (req.extraOptions.include) {
				options.include = req.extraOptions.include
			}
		}

		return options

	},


	getOptions: function(model, req) {

		var urlParts = url.parse(req.url, true)
		var queryParams = urlParts.query

		var options = {}
		var filters = {}

		debug('====================================')
		debug(queryParams._filters)
		debug('====================================')

		if (queryParams._filters) {
			var criterias = JSON.parse(queryParams._filters)

			if (criterias.dateFrom && criterias.dateTo) {
				filters.date = { $between : [ criterias.dateFrom, criterias.dateTo ] }
				delete criterias.dateFrom
				delete criterias.dateTo
			}

			if (criterias.dateFrom) {
				filters.date = { $gte : '\'' + criterias.dateFrom + '\'' }
				delete criterias.dateFrom
			}

			if (criterias.dateTo) {
				filters.date = { $lte : '\'' + criterias.dateTo + '\'' }
				delete criterias.dateTo
			}

			if (criterias.email) {
				filters.email = { $like : '%' + criterias.email + '%' }
				delete criterias.email
			}

			if (criterias.name) {
				filters.name = { $like : '%' + criterias.name + '%' }
				delete criterias.name
			}

			if (criterias.value) {
				filters.value = { $like : '%' + criterias.value + '%' }
				delete criterias.value
			}

			if (criterias.data) {
				filters.data = { $like : '%' + criterias.data + '%' }
				delete criterias.data
			}

			for (var field in criterias) {
				filters[field] = criterias[field]
			}

			if (Object.keys(filters).length > 0) {
				options.where = filters
			}

		}

		if (queryParams._page && queryParams._perPage) {
			var page = null
			if (queryParams._perPage) {
				page = parseInt(queryParams._page)
			} else {
				page = 1
			}
			page--

			var perPage = null
			if (queryParams._perPage) {
				perPage = parseInt(queryParams._perPage)
			} else {
				perPage = req.settings.pagging.itemsPerPage
			}
			options.limit = perPage
			options.offset = page * perPage
		}

		var sort = null
		if (queryParams._sortField) {
			sort = queryParams._sortField
		}
		if (sort && queryParams._sortDir) {
			sort = [ [ sort, queryParams._sortDir ] ]
		}
		options.order = sort

		if (req.extraOptions) {
			if (req.extraOptions.where) {
				if (options.where) {
					options.where = _.flatten([options.where, req.extraOptions.where])
				} else {
					options.where = req.extraOptions.where
				}
			}

			if (req.extraOptions.order) {
				if (options.order) {
					options.order = _.flatten([options.order, req.extraOptions.order])
				} else {
					options.order = req.extraOptions.order
				}
			}

			if (req.extraOptions.include) {
				options.include = req.extraOptions.include
			}
		}

		return options

	},


	getOptionsOld: function(model, req) {

		var urlParts = url.parse(req.url, true)
		var queryParams = urlParts.query

		var options = {}
		var filters = {}

		debug('====================================')
		debug(queryParams._filters)
		debug('====================================')

		if (queryParams._filters) {
			var criterias = JSON.parse(queryParams._filters)

			if (criterias.dateFrom && criterias.dateTo) {
				filters.date = { $between : [ criterias.dateFrom, criterias.dateTo ] }
				delete criterias.dateFrom
				delete criterias.dateTo
			}

			if (criterias.dateFrom) {
				filters.date = { $gte : '\'' + criterias.dateFrom + '\'' }
				delete criterias.dateFrom
			}

			if (criterias.dateTo) {
				filters.date = { $lte : '\'' + criterias.dateTo + '\'' }
				delete criterias.dateTo
			}

			if (criterias.email) {
				filters.email = { $like : '%' + criterias.email + '%' }
				delete criterias.email
			}

			if (criterias.name) {
				filters.name = { $like : '%' + criterias.name + '%' }
				delete criterias.name
			}

			if (criterias.value) {
				filters.value = { $like : '%' + criterias.value + '%' }
				delete criterias.value
			}

			if (criterias.data) {
				filters.data = { $like : '%' + criterias.data + '%' }
				delete criterias.data
			}

			for (var field in criterias) {
				filters[field] = criterias[field]
			}

			if (Object.keys(filters).length > 0) {
				options.where = filters
			}

		}

		if (queryParams._page && queryParams._perPage) {
			var page = null
			if (queryParams._perPage) {
				page = parseInt(queryParams._page)
			} else {
				page = 1
			}
			page--

			var perPage = null
			if (queryParams._perPage) {
				perPage = parseInt(queryParams._perPage)
			} else {
				perPage = req.settings.pagging.itemsPerPage
			}
			options.limit = perPage
			options.offset = page * perPage
		}

		var sort = null
		if (queryParams._sortField) {
			sort = queryParams._sortField
		}
		if (sort && queryParams._sortDir) {
			sort = [ [ sort, queryParams._sortDir ] ]
		}
		options.order = sort

		if (req.extraOptions) {
			if (req.extraOptions.where) {
				if (options.where) {
					options.where = _.flatten([options.where, req.extraOptions.where])
				} else {
					options.where = req.extraOptions.where
				}
			}

			if (req.extraOptions.order) {
				if (options.order) {
					options.order = _.flatten([options.order, req.extraOptions.order])
				} else {
					options.order = req.extraOptions.order
				}
			}

			if (req.extraOptions.include) {
				options.include = req.extraOptions.include
			}
		}

		return options

	},

	parseQueryString: function(req) {
		var urlParts = url.parse(req.url, true)
		return urlParts.query
	},

	addIdProperty: function(data) {
		var dataJson = data.toJSON()
		dataJson.id = dataJson._id
		return dataJson
	},

	formatErrors: function(errorsIn) {
		var errors = [ ]

		if (typeof errorsIn == 'object') {
			var error = {
				name      : errorsIn['name'],
				message   : errorsIn['message'],
			}

			if (errorsIn.fields) {
				error.extra = errorsIn.fields
			}

			if (errorsIn.sql) {
				error.sql = errorsIn.sql
			}
			errors.push( error )
		}

		return errors
	}
}
