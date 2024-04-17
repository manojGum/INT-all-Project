const expressJwt = require('express-jwt');
// require('dotenv').config()

function atuhJwt() {

  return  expressJwt({
    secret: process.env.secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked
      
      }).unless({
        path: [
          {url:/\/api\/v1\/product(.*)/ , methods : ['GET', 'OPTIONS']},
          {url:/\/api\/v1\/product(.*)\/search/, methods : ['GET', 'OPTIONS']},
          {url:/\/api\/v1\/categories(.*)/ , methods : ['GET', 'OPTIONS']},
          '/api/v1/users/login',
          '/api/v1/users/register',
        ]
      })
}

module.exports=atuhJwt

async function isRevoked(req,payload,done){
  if(!payload.isAdmin) {
    done(null, true)
  }
  done();
}

// REGULAR EXPRESSON  {url:/\/api\/v1\/product(.*)/