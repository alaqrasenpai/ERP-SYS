const express = require('express');
const router = express.Router();
const BiometricDevice = require('../models/BiometricDevice');
const { getTenantConnection } = require('../config/tenant-db');

// Middleware to parse raw text body for ADMS
router.use(express.text({ type: '*/*' }));

/**
 * Handle ADMS Initialization / Handshake
 * GET /api/zkteco/iclock/cdata?SN=XYZ...
 */
router.get('/iclock/cdata', async (req, res) => {
    const sn = req.query.SN;
    if (!sn) return res.status(400).send('Missing SN');

    try {
        const device = await BiometricDevice.findOneAndUpdate(
            { serialNumber: sn },
            { status: 'Online', lastPing: new Date() },
            { new: true }
        );
        if (device) {
            console.log(`[ZKTeco] Device ${sn} Handshake - OK`);
        } else {
            console.warn(`[ZKTeco] Unknown device attempting handshake: ${sn}`);
        }
    } catch (err) {
        console.error(err);
    }

    // Required response format for ADMS
    res.setHeader('Content-Type', 'text/plain');
    res.send(`GET OPTION FROM: ${sn}\nStamp=9999\nOpStamp=9999\nErrorDelay=60\nDelay=10\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nRealtime=1\nEncrypt=0`);
});

/**
 * Handle ADMS Commands Check
 * GET /api/zkteco/iclock/getrequest?SN=XYZ
 */
router.get('/iclock/getrequest', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('OK');
});

/**
 * Handle ADMS Push Data (Attendance logs)
 * POST /api/zkteco/iclock/cdata?SN=XYZ
 */
router.post('/iclock/cdata', async (req, res) => {
    const sn = req.query.SN;
    const data = req.body; // Raw text body

    if (!sn || !data) {
        return res.status(400).send('Missing SN or Data');
    }

    try {
        // 1. Identify Tenant
        const device = await BiometricDevice.findOne({ serialNumber: sn });
        if (!device) {
            console.warn(`[ZKTeco] Rejected push from unknown device: ${sn}`);
            return res.status(403).send('UNKNOWN DEVICE');
        }

        // Update last ping
        device.lastPing = new Date();
        device.status = 'Online';
        await device.save();

        const tenantConnection = getTenantConnection(device.tenantId);
        const Employee = tenantConnection.model('Employee');
        const Attendance = tenantConnection.model('Attendance');

        // 2. Parse Data
        // Format typically: USERID\tYYYY-MM-DD HH:mm:ss\tSTATE\tVERIFY_TYPE\r\n
        const lines = data.split('\n').filter(line => line.trim().length > 0);
        
        for (const line of lines) {
            const parts = line.split('\t');
            if (parts.length >= 4) {
                const biometricId = parts[0];
                const timeString = parts[1]; // e.g. "2026-07-17 08:30:00"
                const state = parts[2]; // 0=CheckIn, 1=CheckOut, 2=BreakOut, 3=BreakIn, 4=OTIn, 5=OTOut
                const verifyType = parts[3]; // 1=Fingerprint, 15=Face, 4=Card...

                const punchTime = new Date(timeString);
                const dateString = timeString.split(' ')[0]; // "2026-07-17"

                // Map verifyType to string
                let mappedType = 'Fingerprint';
                if (verifyType == 15) mappedType = 'Face';
                else if (verifyType == 4) mappedType = 'Card';

                // Find employee by biometricId
                const employee = await Employee.findOne({ biometricId });
                if (!employee) {
                    console.warn(`[ZKTeco] Biometric ID ${biometricId} not mapped to any employee in Tenant ${device.tenantId}`);
                    continue;
                }

                // Find or create Attendance record for today
                let attendance = await Attendance.findOne({ employeeId: employee._id, date: dateString });
                
                if (!attendance) {
                    attendance = new Attendance({
                        employeeId: employee._id,
                        date: dateString,
                        punchInType: mappedType,
                        deviceId: device.serialNumber
                    });
                }

                // Apply punch
                if (state == 0 || state == 4) {
                    // Check In
                    if (!attendance.clockIn || punchTime < attendance.clockIn) {
                        attendance.clockIn = punchTime;
                    }
                } else if (state == 1 || state == 5) {
                    // Check Out
                    if (!attendance.clockOut || punchTime > attendance.clockOut) {
                        attendance.clockOut = punchTime;
                        attendance.punchOutType = mappedType;
                    }
                } else {
                    // Unspecified state, guess based on whether clockIn exists
                    if (!attendance.clockIn) {
                        attendance.clockIn = punchTime;
                    } else if (!attendance.clockOut || punchTime > attendance.clockOut) {
                        attendance.clockOut = punchTime;
                        attendance.punchOutType = mappedType;
                    }
                }

                // If both clockIn and clockOut are present, calculate totalHours
                if (attendance.clockIn && attendance.clockOut) {
                    const diffMs = attendance.clockOut - attendance.clockIn;
                    attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
                }

                await attendance.save();
            }
        }

        res.setHeader('Content-Type', 'text/plain');
        res.send('OK');

    } catch (err) {
        console.error(`[ZKTeco] Error processing ADMS push:`, err);
        res.status(500).send('ERROR');
    }
});

module.exports = router;
