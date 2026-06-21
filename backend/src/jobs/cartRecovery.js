import Cart from '../modules/orders/Cart.js';
import mailService from '../common/services/mail.service.js';
import logger from '../config/logger.js';

export const runCartRecoveryJob = async () => {
  logger.info('[Cart Recovery Job] Scanning for abandoned carts...');
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find carts inactive for 24h+ containing items where email has not been sent
    const abandonedCarts = await Cart.find({
      lastActive: { $lt: oneDayAgo },
      items: { $exists: true, $not: { $size: 0 } },
      abandonedEmailSent: false
    }).populate('user', 'firstName email');

    logger.info(`[Cart Recovery Job] Found ${abandonedCarts.length} abandoned carts.`);

    for (const cart of abandonedCarts) {
      if (cart.user && cart.user.email) {
        try {
          await mailService.sendMail({
            to: cart.user.email,
            subject: 'Did you leave something behind in your Cargo Inventory?',
            text: `Hi ${cart.user.firstName || 'Runner'}, you left items in your Project Nexus cargo inventory! Access your uplink now to secure them before stock runs out.`
          });
          
          // Use updateOne to bypass pre-save hook reset
          await Cart.updateOne(
            { _id: cart._id },
            { $set: { abandonedEmailSent: true } }
          );
          logger.info(`[Cart Recovery Job] Abandoned email sent successfully to ${cart.user.email}`);
        } catch (e) {
          logger.error(`[Cart Recovery Job] Failed to send email to ${cart.user.email}: ${e.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`[Cart Recovery Job] Error running scanning job: ${error.message}`);
  }
};

export const startCartRecoveryInterval = () => {
  // Run first check 10 seconds after startup
  setTimeout(() => {
    runCartRecoveryJob();
  }, 10000);

  // Repeat every 4 hours
  setInterval(() => {
    runCartRecoveryJob();
  }, 4 * 60 * 60 * 1000);
};
