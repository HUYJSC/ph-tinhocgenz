/**
 * Zalo ZBS & OA Configuration & Feature Flags
 * PH Digital Education — Production Architecture
 * Server-only execution. NEVER expose secret values to the client.
 */

export interface ZaloConfigStatus {
  appId: boolean;
  appSecret: boolean;
  oaId: boolean;
  oaSecret: boolean;
  accessToken: boolean;
  refreshToken: boolean;
  templateId: boolean;
  supabaseConfigured: boolean;
  integrationEnabled: boolean;
  sendEnabled: boolean;
  automationEnabled: boolean;
}

export interface ZaloHealthCheckResult {
  configured: boolean;
  status: 'connected' | 'not_configured' | 'config_incomplete' | 'token_expiring' | 'token_expired';
  message: string;
  checks: {
    app: boolean;
    oa: boolean;
    token: boolean;
    refreshToken: boolean;
    template: boolean;
    webhook: boolean;
    database: boolean;
  };
  missing: string[];
  flags: {
    integrationEnabled: boolean;
    sendEnabled: boolean;
    automationEnabled: boolean;
  };
}

export function getZaloConfig() {
  const integrationEnabled = process.env.ZALO_INTEGRATION_ENABLED !== 'false';
  const sendEnabled = process.env.ZALO_SEND_ENABLED === 'true';
  const automationEnabled = process.env.ZALO_AUTOMATION_ENABLED === 'true';

  const appId = process.env.ZALO_APP_ID || '';
  const appSecret = process.env.ZALO_APP_SECRET || '';
  const oaId = process.env.ZALO_OA_ID || '';
  const oaSecretKey = process.env.ZALO_OA_SECRET_KEY || process.env.ZALO_APP_SECRET || '';
  const staticAccessToken = process.env.ZALO_OA_ACCESS_TOKEN || '';
  const staticRefreshToken = process.env.ZALO_OA_REFRESH_TOKEN || '';

  const templateId =
    process.env.ZALO_ZBS_TEMPLATE_ID ||
    process.env.ZALO_ZBS_REMINDER_TEMPLATE_ID ||
    'PH_EDU_REMINDER_2026';

  const reminderTemplateId = process.env.ZALO_ZBS_REMINDER_TEMPLATE_ID || templateId;
  const warningTemplateId = process.env.ZALO_ZBS_WARNING_TEMPLATE_ID || templateId;
  const paymentTemplateId = process.env.ZALO_ZBS_PAYMENT_TEMPLATE_ID || templateId;
  const classTemplateId = process.env.ZALO_ZBS_CLASS_TEMPLATE_ID || templateId;

  return {
    appId,
    appSecret,
    oaId,
    oaSecretKey,
    staticAccessToken,
    staticRefreshToken,
    templateId,
    templates: {
      reminder: reminderTemplateId,
      warning: warningTemplateId,
      payment: paymentTemplateId,
      classNotification: classTemplateId
    },
    flags: {
      integrationEnabled,
      sendEnabled,
      automationEnabled
    }
  };
}

export function getZaloConfigStatus(): ZaloConfigStatus {
  const cfg = getZaloConfig();
  const supabaseConfigured = Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return {
    appId: Boolean(cfg.appId),
    appSecret: Boolean(cfg.appSecret),
    oaId: Boolean(cfg.oaId),
    oaSecret: Boolean(cfg.oaSecretKey),
    accessToken: Boolean(cfg.staticAccessToken),
    refreshToken: Boolean(cfg.staticRefreshToken),
    templateId: Boolean(cfg.templateId),
    supabaseConfigured,
    integrationEnabled: cfg.flags.integrationEnabled,
    sendEnabled: cfg.flags.sendEnabled,
    automationEnabled: cfg.flags.automationEnabled
  };
}
