
function getOrExit(varName: string): string {
  const v = process.env[varName];
  if (v) return v;

  console.log(`${varName} env const must be provided`);
  process.exit(1);
}

function getOrElse(varName: string, defaultValue: string): string {
  const v = process.env[varName];
  if (v) {
    return v;
  }
  else {
    return defaultValue;
  }
}

export interface EnvVars {
  AUTHORIZATIONS_ENABLED: boolean;
  JWT_SECRET: string;
  LDAP_URL?: string;
  LDAP_BASE_DN?: string;
  LDAP_USER?: string;
  LDAP_PASSWORD?: string;
  MESOS_MASTER_URL: string;
  MESOS_STATE_CACHE_TIME: number;
  SESSION_SECRET: string;
  SUPER_ADMINS: string[];
  MESOS_PRINCIPAL: string;
  MESOS_SECRET_FILE: string;
  CA_FILE: string;
  ENABLE_PER_APP_ADMINS?: boolean;
  ENABLE_RIGHTS_DELEGATION?: boolean;
  COMMAND: string;
}

const authorizations_enabled = (process.env['MESOS_TERM_LDAP_URL']) ? true : false;

function getSuperAdmins() {
  const adminsStr = process.env['MESOS_TERM_SUPER_ADMINS'];
  return (adminsStr)
    ? adminsStr.split(',')
    : [];
}

export const env: EnvVars = {
  SESSION_SECRET: getOrExit('MESOS_TERM_SESSION_SECRET'),
  JWT_SECRET: getOrExit('MESOS_TERM_JWT_SECRET'),
  CA_FILE: process.env['MESOS_TERM_CA_FILE'],
  MESOS_PRINCIPAL: process.env['MESOS_TERM_MESOS_PRINCIPAL'],
  MESOS_SECRET_FILE: process.env['MESOS_TERM_MESOS_SECRET_FILE'],
  SUPER_ADMINS: getSuperAdmins(),
  MESOS_MASTER_URL: getOrExit('MESOS_TERM_MESOS_MASTER_URL'),
  AUTHORIZATIONS_ENABLED: authorizations_enabled,
  MESOS_STATE_CACHE_TIME: parseFloat(getOrExit('MESOS_TERM_MESOS_STATE_CACHE_TIME')),
  COMMAND: getOrElse('MESOS_TERM_COMMAND', '/bin/sh')
};

if (authorizations_enabled) {
  env['LDAP_URL'] = getOrExit('MESOS_TERM_LDAP_URL');
  env['LDAP_BASE_DN'] = getOrExit('MESOS_TERM_LDAP_BASE_DN');
  env['LDAP_USER'] = getOrExit('MESOS_TERM_LDAP_USER');
  env['LDAP_PASSWORD'] = getOrExit('MESOS_TERM_LDAP_PASSWORD');
  env['ENABLE_PER_APP_ADMINS'] = process.env['MESOS_TERM_ENABLE_PER_APP_ADMINS'] === 'true';
  env['ENABLE_RIGHTS_DELEGATION'] = process.env['MESOS_TERM_ENABLE_RIGHTS_DELEGATION'] === 'true';
}
