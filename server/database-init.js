import Database from 'better-sqlite3';
import { tmpdir } from 'os';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { existsSync } from 'fs';

export function initDatabase() {
  // Vercel環境では/tmpディレクトリを使用
  const dbPath = process.env.VERCEL 
    ? join(tmpdir(), 'order_management.db')
    : join(process.cwd(), 'order_management.db');
  
  console.log('Initializing database at:', dbPath);
  
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Create administrators table
  db.exec(`
    CREATE TABLE IF NOT EXISTS administrators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'admin',
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if admin user exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM administrators WHERE username = ?').get('東京ぶたくらぶ');
  
  if (adminExists.count === 0) {
    console.log('Creating default admin user...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO administrators (username, password, email, permissions) VALUES (?, ?, ?, ?)').run(
      '東京ぶたくらぶ',
      hashedPassword,
      'info@tokyobutaclub.com',
      'all'
    );
    console.log('Default admin user created successfully');
  }

  // Create other tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_type TEXT NOT NULL,
      name TEXT NOT NULL,
      postal_code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      payment_terms INTEGER DEFAULT 30,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customer_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      email TEXT,
      phone TEXT,
      postal_code TEXT,
      address TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_number TEXT UNIQUE NOT NULL,
      document_type TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE,
      payment_date DATE,
      status TEXT DEFAULT 'draft',
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id),
      FOREIGN KEY (created_by) REFERENCES administrators (id)
    );

    CREATE TABLE IF NOT EXISTS document_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      tax_rate REAL DEFAULT 10.0,
      amount REAL NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_type TEXT NOT NULL,
      name TEXT NOT NULL,
      postal_code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      payment_terms INTEGER DEFAULT 30,
      bank_name TEXT,
      branch_name TEXT,
      account_type TEXT,
      account_number TEXT,
      account_holder TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS supplier_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      email TEXT,
      phone TEXT,
      postal_code TEXT,
      address TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      order_date DATE NOT NULL,
      expected_delivery_date DATE,
      actual_delivery_date DATE,
      status TEXT DEFAULT 'ordered',
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
      FOREIGN KEY (created_by) REFERENCES administrators (id)
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      tax_rate REAL DEFAULT 10.0,
      amount REAL NOT NULL,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code TEXT UNIQUE NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      parent_account_id INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_account_id) REFERENCES accounts (id)
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_date DATE NOT NULL,
      entry_number TEXT UNIQUE NOT NULL,
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES administrators (id)
    );

    CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_entry_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      debit_amount REAL DEFAULT 0,
      credit_amount REAL DEFAULT 0,
      description TEXT,
      FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts (id)
    );

    CREATE TABLE IF NOT EXISTS operation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_type TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      operation_detail TEXT,
      operated_by INTEGER,
      operated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operated_by) REFERENCES administrators (id)
    );
  `);

  // Create default accounts if they don't exist
  const accountsCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
  if (accountsCount.count === 0) {
    console.log('Creating default accounts...');
    const defaultAccounts = [
      ['1000', '現金', 'asset'],
      ['1100', '売掛金', 'asset'],
      ['2000', '買掛金', 'liability'],
      ['3000', '資本金', 'equity'],
      ['4000', '売上高', 'revenue'],
      ['5000', '仕入高', 'expense'],
      ['6000', '給料', 'expense'],
      ['7000', '地代家賃', 'expense']
    ];

    const stmt = db.prepare('INSERT INTO accounts (account_code, account_name, account_type) VALUES (?, ?, ?)');
    for (const [code, name, type] of defaultAccounts) {
      stmt.run(code, name, type);
    }
    console.log('Default accounts created successfully');
  }

  // Create default suppliers if they don't exist
  const suppliersCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get();
  if (suppliersCount.count === 0) {
    console.log('Creating default suppliers...');
    const defaultSuppliers = [
      {
        supplier_type: '食品',
        name: '中延園食品',
        postal_code: '224-0057',
        address: '神奈川県横浜市都筑区川和町303',
        phone: '0459342391',
        email: '',
        payment_terms: 30,
        bank_name: '三井住友銀行',
        branch_name: '荏原支店',
        account_type: '普通',
        account_number: '0868811',
        account_holder: 'カ）ナカノブエンショクヒン',
        notes: ''
      },
      {
        supplier_type: '製麺',
        name: '菅野製麺所',
        postal_code: '252-0239',
        address: '神奈川県相模原市中央区中央２丁目５−１１',
        phone: '0428513724',
        email: '',
        payment_terms: 30,
        bank_name: '相模原市農業協同組合',
        branch_name: '中央支店',
        account_type: '普通',
        account_number: '0037150',
        account_holder: 'カブシキガイシヤ カンノセイメンジョ カナガワエイギョウショ ダ',
        notes: '神奈川営業所'
      },
      {
        supplier_type: '卸売',
        name: '東京ジョーカー',
        postal_code: '103-0027',
        address: '東京都中央区日本橋3-2-14日本橋KNビル4F',
        phone: '0352013643',
        email: '',
        payment_terms: 30,
        bank_name: '三菱UFJ銀行',
        branch_name: '秋葉原支店',
        account_type: '普通',
        account_number: '4511782',
        account_holder: 'トウキョウジョーカー （カ',
        notes: ''
      }
    ];

    const supplierStmt = db.prepare(`
      INSERT INTO suppliers (
        supplier_type, name, postal_code, address, phone, email, payment_terms,
        bank_name, branch_name, account_type, account_number, account_holder, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const supplier of defaultSuppliers) {
      supplierStmt.run(
        supplier.supplier_type,
        supplier.name,
        supplier.postal_code,
        supplier.address,
        supplier.phone,
        supplier.email,
        supplier.payment_terms,
        supplier.bank_name,
        supplier.branch_name,
        supplier.account_type,
        supplier.account_number,
        supplier.account_holder,
        supplier.notes
      );
    }
    console.log('Default suppliers created successfully');
  }

  // Create default purchase orders if they don't exist
  const purchaseOrdersCount = db.prepare('SELECT COUNT(*) as count FROM purchase_orders').get();
  if (purchaseOrdersCount.count === 0) {
    console.log('Creating default purchase orders...');
    
    // Get supplier IDs
    const nakanobuen = db.prepare('SELECT id FROM suppliers WHERE name = ?').get('中延園食品');
    const kanno = db.prepare('SELECT id FROM suppliers WHERE name = ?').get('菅野製麺所');
    const joker = db.prepare('SELECT id FROM suppliers WHERE name = ?').get('東京ジョーカー');
    
    // Get admin user ID
    const admin = db.prepare('SELECT id FROM administrators WHERE username = ?').get('東京ぶたくらぶ');
    
    if (nakanobuen && kanno && joker && admin) {
      const defaultOrders = [
        {
          order_number: 'PO-2024-001',
          supplier_id: nakanobuen.id,
          order_date: '2024-12-01',
          expected_delivery_date: '2024-12-03',
          status: 'delivered',
          created_by: admin.id,
          items: [
            { item_name: 'チャーシュー用豚バラ肉', description: '1kg×10パック', quantity: 10, unit_price: 2500, tax_rate: 10.0 },
            { item_name: 'もやし', description: '200g×30袋', quantity: 30, unit_price: 80, tax_rate: 10.0 },
            { item_name: 'ネギ', description: '1束×5', quantity: 5, unit_price: 200, tax_rate: 10.0 }
          ]
        },
        {
          order_number: 'PO-2024-002',
          supplier_id: kanno.id,
          order_date: '2024-12-01',
          expected_delivery_date: '2024-12-02',
          status: 'delivered',
          created_by: admin.id,
          items: [
            { item_name: '中太麺', description: '生麺 1kg×20袋', quantity: 20, unit_price: 450, tax_rate: 10.0 },
            { item_name: '細麺', description: '生麺 1kg×10袋', quantity: 10, unit_price: 450, tax_rate: 10.0 }
          ]
        },
        {
          order_number: 'PO-2024-003',
          supplier_id: joker.id,
          order_date: '2024-12-02',
          expected_delivery_date: '2024-12-05',
          status: 'ordered',
          created_by: admin.id,
          items: [
            { item_name: 'ラーメンスープ（豚骨醤油）', description: '業務用 5L×2個', quantity: 2, unit_price: 3800, tax_rate: 10.0 },
            { item_name: '煮卵', description: '味付け済み 50個入り', quantity: 1, unit_price: 2500, tax_rate: 10.0 },
            { item_name: 'メンマ', description: '業務用 1kg', quantity: 2, unit_price: 1200, tax_rate: 10.0 }
          ]
        },
        {
          order_number: 'PO-2024-004',
          supplier_id: nakanobuen.id,
          order_date: '2024-12-03',
          expected_delivery_date: '2024-12-05',
          status: 'ordered',
          created_by: admin.id,
          items: [
            { item_name: 'キャベツ', description: '1玉×10', quantity: 10, unit_price: 180, tax_rate: 10.0 },
            { item_name: '白菜', description: '1/4カット×20', quantity: 20, unit_price: 120, tax_rate: 10.0 },
            { item_name: 'ニンニク', description: '1kg', quantity: 2, unit_price: 800, tax_rate: 10.0 }
          ]
        }
      ];

      for (const order of defaultOrders) {
        // Calculate totals
        let subtotal = 0;
        for (const item of order.items) {
          subtotal += item.quantity * item.unit_price;
        }
        const tax_amount = Math.round(subtotal * 0.1);
        const total_amount = subtotal + tax_amount;

        // Insert purchase order
        const result = db.prepare(`
          INSERT INTO purchase_orders (
            order_number, supplier_id, order_date, expected_delivery_date, 
            status, subtotal, tax_amount, total_amount, created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          order.order_number,
          order.supplier_id,
          order.order_date,
          order.expected_delivery_date,
          order.status,
          subtotal,
          tax_amount,
          total_amount,
          order.created_by
        );

        // Insert order items
        const itemStmt = db.prepare(`
          INSERT INTO purchase_order_items (
            purchase_order_id, item_name, description, quantity, unit_price, tax_rate, amount
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of order.items) {
          const amount = item.quantity * item.unit_price;
          itemStmt.run(
            result.lastInsertRowid,
            item.item_name,
            item.description,
            item.quantity,
            item.unit_price,
            item.tax_rate,
            amount
          );
        }
      }
      
      console.log('Default purchase orders created successfully');
    }
  }

  return db;
}
