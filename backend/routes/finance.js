const express = require('express');
const { requirePermission } = require('../middlewares/rbacGuard');
const readPerm = requirePermission('finance:read');
const managePerm = requirePermission('finance:manage');
const router = express.Router();

const accountController = require('../controllers/finance/accountController');
const checkController = require('../controllers/finance/checkController');
const installmentController = require('../controllers/finance/installmentController');
const dashboardController = require('../controllers/finance/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', readPerm, dashboardController.getDashboardStats);

// ----------------------------------------
// Accounting Routes
// ----------------------------------------
router.get('/accounts', readPerm, accountController.getAccounts);
router.get('/journal', readPerm, accountController.getJournalEntries);

// ----------------------------------------
// Check Management Routes
// ----------------------------------------
router.get('/checks', readPerm, checkController.getChecks);
router.post('/checks/:id/status', managePerm, checkController.updateCheckStatus);

// ----------------------------------------
// Installment Management Routes
// ----------------------------------------
router.get('/installments', readPerm, installmentController.getInstallments);
router.post('/installments/:id/pay/:installmentId', managePerm, installmentController.payInstallment);

module.exports = router;
