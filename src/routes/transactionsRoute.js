import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

// API Endpoints

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    // Validate userId
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        // Fetch transactions for the given user_id
        const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

router.post('/', async (req, res) => {
    const { user_id, title, amount, category } = req.body;
    // Validate input
    if (!user_id || !title || !amount || !category || amount===undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (typeof amount !== 'number' ) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    // Insert transaction into the database
    // Using parameterized queries to prevent SQL injection
    try {
        const result = await sql`INSERT INTO transactions (user_id, title, amount, category) VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Validate id
    if (!id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Transaction ID must be a number' });
    }
    try {
        // Delete transaction by id
        const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully', transaction: result[0] });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

router.get("/summary/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch all transactions and calculate the balance for the given user_id
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        } 
        const balanceResult = await sql`SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ${userId}`;


        const incomeResult = await sql`SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id = ${userId} AND amount > 0`;

        const expenseResult = await sql`SELECT COALESCE(SUM(amount), 0) AS expense FROM transactions WHERE user_id = ${userId} AND amount < 0`;

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        });
    
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;