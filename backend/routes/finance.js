const express = require('express');
const router = express.Router();

const accountController = require('../controllers/finance/accountController');
const checkController = require('../controllers/finance/checkController');
const installmentController = require('../controllers/finance/installmentController');
const dashboardController = require('../controllers/finance/dashboardController');

// ----------------------------------------
// Dashboard Routes
// ----------------------------------------
router.get('/dashboard', dashboardController.getDashboardStats);

// ----------------------------------------
// Accounting Routes
// ----------------------------------------
router.get('/accounts', accountController.getAccounts);
router.get('/journal', accountController.getJournalEntries);

// ----------------------------------------
// Check Management Routes
// ----------------------------------------
router.get('/checks', checkController.getChecks);
router.post('/checks/:id/status', checkController.updateCheckStatus);

// ----------------------------------------
// Installment Management Routes
// ----------------------------------------
router.get('/installments', installmentController.getInstallments);
router.post('/installments/:id/pay/:installmentId', installmentController.payInstallment);

module.exports = router;
