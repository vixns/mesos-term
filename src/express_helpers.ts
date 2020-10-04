import Express = require('express');
import { EnvVars, env } from './env_vars';
import { Logger } from './logger';
import { isSuperAdmin } from './authorizations';

const ENV_VARS_KEY = 'env_vars';
const LOGGER_KEY = 'logger';

declare global {
  namespace Express {
    interface User {
      uid: string;
      memberOf?: string[];
      groups?: string[];
    }
    interface Request {
      user?: User;
    }
  }
}


export function setup(app: Express.Application, logger: Logger) {
  app.set(ENV_VARS_KEY, env);
  app.set(LOGGER_KEY, logger);
}

export function getEnv(req: Express.Request): EnvVars {
  return req.app.get(ENV_VARS_KEY);
}

export function getLogger(req: Express.Request): Logger {
  return req.app.get(LOGGER_KEY);
}

export function SuperAdminsOnly(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction) {
  const groups = (req.user.memberOf) ? req.user.memberOf : req.user.groups;
  if (req.user.uid && groups && isSuperAdmin(
    req.user.uid, groups, env.SUPER_ADMINS)) {
    next();
    return;
  }
  res.sendStatus(403);
}
