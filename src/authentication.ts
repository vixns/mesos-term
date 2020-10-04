import Express = require('express');
import passport = require('passport');
import LdapStrategy = require('passport-ldapauth');
import basicAuth = require('basic-auth');
import fs = require('fs');
import tls = require('tls');
import { Strategy } from 'passport-openidconnect';

import { env } from './env_vars';

function protectWithBasicAuth(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction) {

  const credentials = basicAuth(req);
  if (credentials) {
    next();
  }
  else {
    res.status(401);
    res.header('WWW-Authenticate', 'Basic realm="must be authenticated"');
    res.send('Unauthenticated');
  }
}

export default function(app: Express.Application) {

  let tlsOptions: Object;

  if ( env.LDAP_TLS ) {
    tlsOptions = {
      secureContext: tls.createSecureContext({
        ca: fs.readFileSync(env.LDAP_CA_FILE),
        cert: fs.readFileSync(env.LDAP_CERT_FILE),
        key: fs.readFileSync(env.LDAP_KEY_FILE)
      })
    };
  }

  const options = {
    server: {
      url: env.LDAP_URL,
      bindDN: env.LDAP_USER,
      bindCredentials: env.LDAP_PASSWORD,
      searchBase: env.LDAP_BASE_DN,
      searchFilter: 'uid={{username}}',
      searchAttributes: ['memberof', 'uid'],
      tlsOptions: tlsOptions,
      reconnect: true
    },
    credentialsLookup: basicAuth
  };

  passport.serializeUser(function(user: string, done: (err: Error, user: string) => void) {
    done(undefined, user);
  });

  passport.deserializeUser(function(user: string, done: (err: Error, user: string) => void) {
    done(undefined, user);
  });

  app.use(passport.initialize());
if (env.LDAP_ENABLED) {
  app.use(protectWithBasicAuth);
  app.use((req: Express.Request, res, next) => {
    // If user already has user account details, it means it has already been authenticated
    // and we don't need to do it again. We rather skip to the next middleware.
    if (req.session.user) {
      req.user = req.session.user;
      next();
      return;
    }

    passport.authenticate('ldapauth', {session: true}, (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.log(`ldap auth for ${req.method} ${req.path}`);
        res.status(401);
        res.header('WWW-Authenticate', 'Basic realm="mesos-term"');
        res.send('Unauthenticated');
        return;
      }

      // save the user into the session.
      req.session.user = user;
      // And make it available in the request for the following middlewares.
      req.user = req.session.user;
      next();
    })(req, res, next);
  });

  passport.use(new LdapStrategy(options));
}
else if (env.OIDC_ENABLED) {
  app.use(passport.session());
  passport.use('oidc', new Strategy({
    issuer: env.OIDC_ISSUER,
    authorizationURL: env.OIDC_AUTH_URL,
    tokenURL: env.OIDC_TOKEN_URL,
    userInfoURL: env.OIDC_USERINFO_URL,
    clientID: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
    callbackURL: env.OIDC_CALLBACK_URL,
    scope: env.OIDC_SCOPE
  },
  function (iss: any, sub: any, profile: any, jwtClaims: any, accessToken: String, refreshToken: String, params: any, callback: (err: string, user: any, info: string) => void) {
    callback(undefined, {
      uid: profile._json[env.OIDC_UID_KEY],
      groups: profile._json[env.OIDC_GROUPS_KEY]
    }, undefined);
  }));

  app.get('/authorization-code/callback', function (req, res, next) {
    if (req.query.error) {
      return res.redirect('/?error=' + req.query.error);
    }
    next();
  }, passport.authenticate('oidc', {
    // TODO: flash message with error reason
    // failureRedirect: '/error'
    failWithError: true,
  }), function (req, res) {
    const u = req.session.url;
    delete req.session.url;
    res.redirect(u);
  });

  app.use((req: Express.Request, res, next) => {
    if (!req.session.passport || !req.session.passport.user) {
        req.session.url = req.url;
        passport.authenticate('oidc')(req, res, next);
    }
    if (req.session.passport && req.session.passport.user) {
        req.user = req.session.passport.user;
    }
    next();
  });
}
}
