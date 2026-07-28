const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const router = express.Router();

const accountController = require('../controllers/finance/accountController');
const checkController = require('../controllers/finance/checkController');
const installmentController = require('../controllers/finance/installmentController');
const dashboardController = require('../controllers/finance/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', requirePermission('finance:read'), dashboardController.getDashboardStats);

// ----------------------------------------
// Accounting Routes
// ----------------------------------------
router.get('/accounts', requirePermission('finance:read'), accountController.getAccounts);
router.get('/journal', requirePermission('finance:read'), accountController.getJournalEntries);

// ----------------------------------------
// Check Management Routes
// ----------------------------------------
router.get('/checks', requirePermission('finance:read'), checkController.getChecks);
router.post('/checks/:id/status', requirePermission('finance:manage'), checkController.updateCheckStatus);

// ----------------------------------------
// Installment Management Routes
// ----------------------------------------
router.get('/installments', requirePermission('finance:read'), installmentController.getInstallments);
router.post('/installments/:id/pay/:installmentId', requirePermission('finance:manage'), installmentController.payInstallment);

module.exports = router;
