/**
 * Configuration Object that contains environment specific variables.
 *
 */
export const AppConfig = {
  REGION: process.env.REGION,
  environment: process.env.ENVIRONMENT,
  AWS_SECRET_KEY_ID: process.env.AWS_SECRET_KEY_ID,
  AWS_SECRET_KEY_VAL: process.env.AWS_SECRET_KEY_VAL,
  logLevel: process.env.LOG_LEVEL || "info",
  requestRetryAttemptCount: process.env.REQUEST_RETRY_ATTEMPT_COUNT,
  requestRetryAttemptDelay: process.env.REQUEST_RETRY_ATTEMPT_DELAY,
  requestTimeout: process.env.REQUEST_TIMEOUT,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
  X_API_KEY: process.env.X_API_KEY,

  DBT_COMPANY_MGMT: process.env.DBT_COMPANY_MGMT,
  DBT_COMPANY_DEPT_MGMT: process.env.DBT_COMPANY_DEPT_MGMT,
  DBT_COMPANY_DEPT_APPL_MGMT: process.env.DBT_COMPANY_DEPT_APPL_MGMT,
  DBT_COMPANY_APPL_ROLE_MGMT: process.env.DBT_COMPANY_APPL_ROLE_MGMT,
  DBT_COMPANY_APPL_TEAM_MBR: process.env.DBT_COMPANY_APPL_TEAM_MBR,
  DBT_COMPANY_APPL_TEAM_MBR_ROLE: process.env.DBT_COMPANY_APPL_TEAM_MBR_ROLE,
  DBT_COMPANY_APPL_CATEGORY: process.env.DBT_COMPANY_APPL_CATEGORY,
  DBT_TEAM_MBR_X_CLIENT_X_VENDOR: process.env.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
  DBT_TEAM_MBR: process.env.DBT_TEAM_MBR,
  CMMN_SCRNS: process.env.CMMN_SCRNS,
  CMMN_AUTH_ROLES: process.env.CMMN_AUTH_ROLES,
  CMMN_AUTHENTICATION_X_SCRNS: process.env.CMMN_AUTHENTICATION_X_SCRNS,
  TMSHTZ_CLIENT: process.env.TMSHTZ_CLIENT,
  TMSHTZ_VENDOR: process.env.TMSHTZ_VENDOR,
  TMSHTZ_PROJECT_CODE: process.env.TMSHTZ_PROJECT_CODE,
  TMSHTZ_TEAM_MBR_TIMESHEET: process.env.TMSHTZ_TEAM_MBR_TIMESHEET,
  TMSHTZ_TEAM_MBR_TIMESHEET_DTLS: process.env.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS,
  COGNITO_POOL_ID: process.env.pool_id,

  SNS_TIMELNK_SCRN_RL_MPNG: process.env.SNS_TIMELNK_SCRN_RL_MPNG,
  SNS_ASSIGNMENT_UPDATE: process.env.SNS_ASSIGNMENT_UPDATE,
  SNS_TEAM_MEMBER_UPDATE: process.env.SNS_TEAM_MEMBER_UPDATE,
};

/**
 * Environment constants.  Can be utilized to write environment specific logic.
 */
export const Environment = {
  DEV: "dev",
  TEST: "test",
  QA: "qa",
  PROD: "prod",
  LOCAL: "local",
};

export const httpStatusCodes = {
  BAD_REQUEST: "400",
  INTERNAL_SERVER_ERROR: "500",
  SUCCESS: "200",
  CREATED: "201",
  NOT_FOUND: "404",
};
