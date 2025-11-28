import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';

// Import routes
import authRoutes from './routes/auth.js';
import customersRoutes from './routes/customers.js';
import documentsRoutes from './routes/documents.js';
import suppliersRoutes from './routes/suppliers.js';
import purchasesRoutes from './routes/purchases.js';
import accountingRoutes from './routes/accounting.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/accounting', accountingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
