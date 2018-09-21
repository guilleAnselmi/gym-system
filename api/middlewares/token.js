const jwt = require('jsonwebtoken')
const Debug = require('debug')
const settings = require('../config/settings.js')
const debug = new Debug('api/middleware/token')

const required = (req, res, next) => {
  const tok = req.headers.authorization || null
  if (!tok) {
    debug('JWT was not enctrypted with our secret')
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }

  debug(tok.split(' ')[0])
  if (req.headers && req.headers.authorization && tok.split(' ')[0] === 'Bearer') {
    jwt.verify(tok.split(' ')[1], settings.token.secret, (err, token) => {
      if (err) {
        debug('JWT was not enctrypted with our secret')
        return res.status(401).json({
          message: 'Unauthorized',
          error: err
        })
      }
      debug(`token verificado con exito ${JSON.stringify(token)}`)
      req.token = token
      next()
    })
  }
}
module.exports = required
