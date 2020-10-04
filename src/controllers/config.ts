import * as Express from 'express';
import { env } from '../env_vars';
import { isSuperAdmin } from '../authorizations';

export default function (req: Express.Request, res: Express.Response) {
    const groups = (req.user.memberOf) ? req.user.memberOf : req.user.groups;
    const can_grant_access = (env.AUTHORIZATIONS_ENABLED)
        ? isSuperAdmin(req.user.uid, groups, env.SUPER_ADMINS)
        : false;

    res.send({ can_grant_access });
}
