const getModels = (req) => {
    return {
        Order: req.tenantConnection.model('Order'),
        Product: req.tenantConnection.model('Product'),
        StockMovement: req.tenantConnection.model('StockMovement'),
        Employee: req.tenantConnection.model('Employee'),
        PayrollRun: req.tenantConnection.model('PayrollRun'),
        Folder: req.tenantConnection.model('Folder'),
        File: req.tenantConnection.model('File'),
        User: req.tenantConnection.model('User'),
        Customer: req.tenantConnection.model('Customer'),
        DebtLog: req.tenantConnection.model('DebtLog'),
        InstallmentPlan: req.tenantConnection.model('InstallmentPlan'),
        CheckPayment: req.tenantConnection.model('CheckPayment'),
        Account: req.tenantConnection.model('Account'),
        JournalEntry: req.tenantConnection.model('JournalEntry'),
        ShiftLog: req.tenantConnection.model('ShiftLog')
    };
};

module.exports = { getModels };
