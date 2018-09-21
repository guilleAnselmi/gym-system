import mongoose from 'mongoose'
import settings from '../config/settings'

// if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
// 	settings = require('../test/config/settings')
// } else {
// 	settings = require('../config/settings')
// }

mongoose.connect('mongodb://' + settings.database.host + '/' + settings.database.name)

export default mongoose
