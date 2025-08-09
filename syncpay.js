/**
 * SyncPay: An autonomous AI agent for B2B payments on the Sei blockchain.
 * This file contains the core logic for invoice monitoring, data extraction,
 * payment scheduling, and treasury optimization.
 */

// Load environment variables
require('dotenv').config();
const sei = require('@sei-protocol/sei-js');
const cron = require('node-cron');
const express = require('express');

// Mock data and configurations
const seiRpcUrl = process.env.SEI_RPC_URL;
const yeiContractAddress = process.env.Yei_CONTRACT_ADDRESS;
const mnemonic = process.env.SEI_WALLET_MNEMONIC;

// LLM API integration - a placeholder function using the provided API structure.
async function getInvoiceDataFromLLM(invoiceText) {
    try {
        const prompt = `Extract the following data from the invoice text: vendor name, invoice number, due date, and amount owed. Return the data as a JSON object. Invoice text: ${invoiceText}`;
        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "vendorName": { "type": "STRING" },
                        "invoiceNumber": { "type": "STRING" },
                        "dueDate": { "type": "STRING" },
                        "amountOwed": { "type": "NUMBER" }
                    },
                    "propertyOrdering": ["vendorName", "invoiceNumber", "dueDate", "amountOwed"]
                }
            }
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const json = result.candidates[0].content.parts[0].text;
            return JSON.parse(json);
        } else {
            console.error("LLM response format is unexpected or missing content.");
            return null;
        }
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return null;
    }
}

// Function to check for new invoices (placeholder for email/cloud storage integration)
async function checkForNewInvoices() {
    console.log('Checking for new invoices...');
    // In a real application, this would connect to an email client or cloud storage API
    // and retrieve new invoices.
    const mockInvoiceText = "INVOICE #123456\nVendor: Acme Corp\nAmount: $500.00\nDue Date: 2025-08-30";
    const invoiceData = await getInvoiceDataFromLLM(mockInvoiceText);

    if (invoiceData) {
        console.log('Invoice data extracted:', invoiceData);
        schedulePayment(invoiceData);
    } else {
        console.log('No new invoices or failed to extract data.');
    }
}

// Function to schedule a payment based on invoice data
async function schedulePayment(invoice) {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();

    // Check if the payment date is in the future. Example: schedule for 2 days before the due date.
    const paymentDate = new Date(dueDate);
    paymentDate.setDate(dueDate.getDate() - 2);

    if (paymentDate > now) {
        // Use node-cron to schedule the payment
        const cronExpression = `${paymentDate.getMinutes()} ${paymentDate.getHours()} ${paymentDate.getDate()} ${paymentDate.getMonth() + 1} *`;
        cron.schedule(cronExpression, async () => {
            console.log(`Executing scheduled payment for invoice #${invoice.invoiceNumber}`);
            await executePayment(invoice);
        }, {
            scheduled: true,
            timezone: "Etc/UTC" // Use a consistent timezone
        });
        console.log(`Payment for invoice #${invoice.invoiceNumber} scheduled for ${paymentDate.toLocaleString()}.`);
    } else {
        console.log(`Due date for invoice #${invoice.invoiceNumber} is in the past or too soon. Processing immediately.`);
        await executePayment(invoice);
    }
}

// Function to execute a payment on the Sei blockchain
async function executePayment(invoice) {
    try {
        console.log(`Optimizing treasury and preparing funds for payment of $${invoice.amountOwed}`);
        const wallet = await sei.getWallet(mnemonic);
        const sender = wallet.accounts[0].address;

        // 1. Withdraw funds from Yei Finance (placeholder)
        // In a real implementation, you would call the Yei Finance smart contract.
        console.log('Withdrawing funds from Yei Finance lending pool...');
        // const yeiWithdrawMsg = {
        //     type: 'yei/withdraw',
        //     value: {
        //         contract: yeiContractAddress,
        //         amount: invoice.amountOwed,
        //         sender: sender
        //     }
        // };

        // 2. Prepare the Sei payment transaction
        const paymentMessage = sei.cosmos.bank.v1beta1.send.createMessage({
            fromAddress: sender,
            toAddress: 'sei1...', // Replace with actual vendor address
            amount: [{
                denom: 'usei', // stablecoin denom
                amount: (invoice.amountOwed * 1000000).toString() // Assumes 6 decimal places
            }]
        });

        // 3. Send the transaction
        const transaction = await sei.getTx(seiRpcUrl, wallet, [paymentMessage]);
        console.log('Payment transaction sent:', transaction);

        // 4. Update the real-time reporting dashboard with transaction status
        console.log('Updating dashboard with new transaction data.');
    } catch (error) {
        console.error('Failed to execute payment:', error);
    }
}

// Function for treasury optimization (placeholder)
async function treasuryOptimization() {
    console.log('Optimizing treasury...');
    // This function would run periodically to check for excess funds and deposit them
    // into the Yei Finance lending protocol.
    try {
        const wallet = await sei.getWallet(mnemonic);
        const sender = wallet.accounts[0].address;

        // 1. Check current wallet balance (placeholder)
        const balance = 1500; // Mock balance in stablecoin
        const keepThreshold = 100; // Amount to keep in the wallet
        const excessAmount = balance - keepThreshold;

        if (excessAmount > 0) {
            console.log(`Depositing $${excessAmount} into Yei Finance lending pool.`);
            // In a real implementation, you would call the Yei Finance smart contract.
            // const yeiDepositMsg = {
            //     type: 'yei/deposit',
            //     value: {
            //         contract: yeiContractAddress,
            //         amount: excessAmount,
            //         sender: sender
            //     }
            // };
            // Await transaction and handle confirmation
            console.log('Deposit transaction confirmed.');
        }
    } catch (error) {
        console.error('Treasury optimization failed:', error);
    }
}

// Main application entry point
function startSyncPay() {
    console.log('Starting SyncPay agent...');

    // Schedule periodic invoice checks (e.g., every hour)
    cron.schedule('0 * * * *', checkForNewInvoices);

    // Schedule treasury optimization (e.g., every 6 hours)
    cron.schedule('0 */6 * * *', treasuryOptimization);

    // Start a simple web server for the dashboard (placeholder)
    const app = express();
    const port = 3000;
    app.get('/', (req, res) => {
        res.send('SyncPay Agent is running. Dashboard functionality goes here.');
    });

    app.listen(port, () => {
        console.log(`SyncPay dashboard server listening at http://localhost:${port}`);
    });
}

// Kick off the application
startSyncPay();
