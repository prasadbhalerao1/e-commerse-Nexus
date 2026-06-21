import logger from '../../config/logger.js';

export const mailService = {
  sendMail: async ({ to, subject, html, text }) => {
    logger.info(`[Mock Mail Service] Sending email to: ${to}`);
    logger.info(`[Mock Mail Service] Subject: ${subject}`);
    logger.debug(`[Mock Mail Service] Text: ${text || 'HTML Content'}`);
    return { messageId: `mock-email-id-${Date.now()}` };
  }
};

export default mailService;
