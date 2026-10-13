const axios = require('axios');

class WooCommerceAdapter {
  constructor(customConfig = null) {
    this.url = customConfig?.url || process.env.WOOCOMMERCE_URL;
    this.consumerKey = customConfig?.consumerKey || process.env.WOOCOMMERCE_KEY;
    this.consumerSecret = customConfig?.consumerSecret || process.env.WOOCOMMERCE_SECRET;

    // Use mock mode if credentials/URL missing or MOCK_MODE explicitly set
    this.isMockMode =
      process.env.MOCK_MODE === 'true' ||
      !this.url ||
      !this.consumerKey ||
      !this.consumerSecret;

    if (!this.isMockMode) {
      // Normalize base URL
      let baseURL = this.url.trim().replace(/\/+$/, '');
      if (!baseURL.endsWith('/wp-json/wc/v3')) {
        baseURL = `${baseURL}/wp-json/wc/v3`;
      }

      this.client = axios.create({
        baseURL,
        timeout: 15000,
        auth: {
          username: this.consumerKey,
          password: this.consumerSecret
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NEXORA-Integration-Engine/1.0'
        }
      });
    } else {
      console.log('[WooCommerceAdapter] Running in MOCK MODE (realistic simulated data)');
    }
  }

  /**
   * Exponential backoff retry wrapper
   */
  async executeWithRetry(operation, maxRetries = 3, baseDelayMs = 500) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        // Don't retry client 4xx errors except 429 Too Many Requests
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw err;
        }
        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          console.warn(`[WooCommerceAdapter] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * Test connection to WooCommerce store
   */
  async testConnection() {
    if (this.isMockMode) {
      return {
        success: true,
        mock: true,
        storeName: 'NEXORA Mock WooCommerce Store',
        version: 'wc/v3',
        message: 'Successfully simulated connection to WooCommerce'
      };
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.get('/system_status');
      return {
        success: true,
        mock: false,
        storeName: response.data?.environment?.site_title || 'WooCommerce Store',
        version: response.data?.environment?.version || 'v3'
      };
    });
  }

  /**
   * Fetch products from WooCommerce or return realistic mock products
   */
  async getProducts(params = { page: 1, per_page: 20 }) {
    if (this.isMockMode) {
      console.log(`[WooCommerceAdapter:Mock] Fetching products page=${params.page || 1}`);
      const mockProducts = [
        {
          id: 101,
          name: 'Pro Wireless Noise-Cancelling Headphones',
          sku: 'AUDIO-WH-1000',
          price: '299.99',
          regular_price: '299.99',
          categories: [{ id: 1, name: 'Electronics', slug: 'electronics' }],
          stock_quantity: 45,
          description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
          status: 'publish'
        },
        {
          id: 102,
          name: 'Ultra-Slim Mechanical Keyboard (RGB)',
          sku: 'TECH-KB-MECH',
          price: '129.50',
          regular_price: '149.00',
          categories: [{ id: 1, name: 'Electronics', slug: 'electronics' }],
          stock_quantity: 18,
          description: 'Compact mechanical keyboard with hot-swappable switches and customizable lighting.',
          status: 'publish'
        },
        {
          id: 103,
          name: 'Organic Cotton Crewneck T-Shirt',
          sku: 'APP-TEE-ORG-BLK',
          price: '34.00',
          regular_price: '34.00',
          categories: [{ id: 2, name: 'Clothing', slug: 'clothing' }],
          stock_quantity: 120,
          description: 'Sustainably sourced 100% organic cotton crewneck tee.',
          status: 'publish'
        },
        {
          id: 104,
          name: 'Artisan Dark Roast Coffee Beans (1kg)',
          sku: 'FOOD-CF-DK-1KG',
          price: '24.99',
          regular_price: '24.99',
          categories: [{ id: 3, name: 'Food', slug: 'food' }],
          stock_quantity: 60,
          description: 'Single-origin fair-trade Arabica beans roasted to perfection.',
          status: 'publish'
        },
        {
          id: 105,
          name: 'Thermal Stainless Steel Water Bottle 750ml',
          sku: 'ACC-BOT-750',
          price: '19.99',
          regular_price: '22.00',
          categories: [{ id: 4, name: 'Other', slug: 'other' }],
          stock_quantity: 85,
          description: 'Vacuum insulated double-wall flask keeping liquids cold for 24h or hot for 12h.',
          status: 'publish'
        },
        {
          id: 106,
          name: 'USB-C Hub Multiport Adapter',
          sku: 'TECH-HUB-USB-C',
          price: '49.99',
          regular_price: '59.99',
          categories: [{ id: 1, name: 'Electronics', slug: 'electronics' }],
          stock_quantity: 3,
          description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.',
          status: 'publish'
        },
        {
          id: 107,
          name: 'Wireless Gaming Mouse',
          sku: 'TECH-MOUSE-GAME',
          price: '79.99',
          regular_price: '89.99',
          categories: [{ id: 1, name: 'Electronics', slug: 'electronics' }],
          stock_quantity: 0,
          description: 'High-precision gaming mouse with RGB lighting and programmable buttons.',
          status: 'publish'
        },
        {
          id: 108,
          name: 'Portable Phone Charger 10000mAh',
          sku: 'ACC-POWER-10K',
          price: '29.99',
          regular_price: '34.99',
          categories: [{ id: 4, name: 'Other', slug: 'other' }],
          stock_quantity: 5,
          description: 'Fast charging power bank with dual USB ports.',
          status: 'publish'
        }
      ];

      return {
        data: mockProducts,
        total: mockProducts.length,
        totalPages: 1
      };
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.get('/products', { params });
      return {
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || response.data.length, 10),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || 1, 10)
      };
    });
  }

  /**
   * Fetch customers from WooCommerce or return realistic mock customers
   */
  async getCustomers(params = { page: 1, per_page: 20 }) {
    if (this.isMockMode) {
      console.log(`[WooCommerceAdapter:Mock] Fetching customers page=${params.page || 1}`);
      const mockCustomers = [
        {
          id: 201,
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          username: 'johndoe',
          billing: {
            first_name: 'John',
            last_name: 'Doe',
            company: 'Example Corp',
            address_1: '123 Main St',
            address_2: '',
            city: 'San Francisco',
            state: 'CA',
            postcode: '94102',
            country: 'US',
            email: 'john.doe@example.com',
            phone: '+1-555-0101'
          },
          shipping: {
            first_name: 'John',
            last_name: 'Doe',
            company: 'Example Corp',
            address_1: '123 Main St',
            address_2: '',
            city: 'San Francisco',
            state: 'CA',
            postcode: '94102',
            country: 'US'
          },
          date_created: '2026-01-15T10:00:00',
          date_modified: '2026-10-01T14:30:00',
          orders_count: 5,
          total_spent: '1250.00'
        },
        {
          id: 202,
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          username: 'janesmith',
          billing: {
            first_name: 'Jane',
            last_name: 'Smith',
            company: '',
            address_1: '456 Oak Ave',
            address_2: 'Apt 2B',
            city: 'Los Angeles',
            state: 'CA',
            postcode: '90001',
            country: 'US',
            email: 'jane.smith@example.com',
            phone: '+1-555-0102'
          },
          shipping: {
            first_name: 'Jane',
            last_name: 'Smith',
            company: '',
            address_1: '456 Oak Ave',
            address_2: 'Apt 2B',
            city: 'Los Angeles',
            state: 'CA',
            postcode: '90001',
            country: 'US'
          },
          date_created: '2026-02-20T11:15:00',
          date_modified: '2026-09-28T09:45:00',
          orders_count: 12,
          total_spent: '3450.50'
        },
        {
          id: 203,
          email: 'mike.johnson@example.com',
          first_name: 'Mike',
          last_name: 'Johnson',
          username: 'mikejohnson',
          billing: {
            first_name: 'Mike',
            last_name: 'Johnson',
            company: 'Tech Solutions Inc',
            address_1: '789 Tech Blvd',
            address_2: 'Suite 100',
            city: 'Seattle',
            state: 'WA',
            postcode: '98101',
            country: 'US',
            email: 'mike.johnson@example.com',
            phone: '+1-555-0103'
          },
          shipping: {
            first_name: 'Mike',
            last_name: 'Johnson',
            company: 'Tech Solutions Inc',
            address_1: '789 Tech Blvd',
            address_2: 'Suite 100',
            city: 'Seattle',
            state: 'WA',
            postcode: '98101',
            country: 'US'
          },
          date_created: '2026-03-10T08:30:00',
          date_modified: '2026-10-05T16:20:00',
          orders_count: 8,
          total_spent: '2100.00'
        }
      ];

      return {
        data: mockCustomers,
        total: mockCustomers.length,
        totalPages: 1
      };
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.get('/customers', { params });
      return {
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || response.data.length, 10),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || 1, 10)
      };
    });
  }

  /**
   * Fetch orders from WooCommerce or return realistic mock orders
   */
  async getOrders(params = { page: 1, per_page: 20 }) {
    if (this.isMockMode) {
      console.log(`[WooCommerceAdapter:Mock] Fetching orders page=${params.page || 1}`);
      const mockOrders = [
        {
          id: 1001,
          number: '1001',
          status: 'completed',
          currency: 'USD',
          total: '299.99',
          date_created: '2026-10-10T14:30:00',
          date_modified: '2026-10-10T15:45:00',
          customer_id: 201,
          billing: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0101'
          },
          line_items: [
            {
              product_id: 101,
              name: 'Pro Wireless Noise-Cancelling Headphones',
              quantity: 1,
              price: '299.99',
              total: '299.99'
            }
          ]
        },
        {
          id: 1002,
          number: '1002',
          status: 'processing',
          currency: 'USD',
          total: '159.49',
          date_created: '2026-10-12T09:15:00',
          date_modified: '2026-10-12T10:00:00',
          customer_id: 202,
          billing: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1-555-0102'
          },
          line_items: [
            {
              product_id: 102,
              name: 'Ultra-Slim Mechanical Keyboard (RGB)',
              quantity: 1,
              price: '129.50',
              total: '129.50'
            },
            {
              product_id: 105,
              name: 'Thermal Stainless Steel Water Bottle 750ml',
              price: '19.99',
              quantity: 1,
              total: '19.99'
            }
          ]
        },
        {
          id: 1003,
          number: '1003',
          status: 'pending',
          currency: 'USD',
          total: '79.99',
          date_created: '2026-10-13T11:00:00',
          date_modified: '2026-10-13T11:00:00',
          customer_id: 203,
          billing: {
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@example.com',
            phone: '+1-555-0103'
          },
          line_items: [
            {
              product_id: 107,
              name: 'Wireless Gaming Mouse',
              quantity: 1,
              price: '79.99',
              total: '79.99'
            }
          ]
        }
      ];

      return {
        data: mockOrders,
        total: mockOrders.length,
        totalPages: 1
      };
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.get('/orders', { params });
      return {
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || response.data.length, 10),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || 1, 10)
      };
    });
  }

  /**
   * Get available external resource types for WooCommerce
   */
  getAvailableResourceTypes() {
    return [
      { type: 'product', label: 'Products', description: 'Product catalog with inventory' },
      { type: 'customer', label: 'Customers', description: 'Customer accounts and billing info' },
      { type: 'order', label: 'Orders', description: 'Order history and transactions' }
    ];
  }

  /**
   * Get field schema for external resource type
   */
  getFieldSchema(externalType) {
    const schemas = {
      product: [
        { key: 'name', label: 'Product Name', type: 'text' },
        { key: 'sku', label: 'SKU', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'regular_price', label: 'Regular Price', type: 'number' },
        { key: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'categories', label: 'Categories', type: 'array' },
        { key: 'status', label: 'Status', type: 'select' }
      ],
      customer: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'first_name', label: 'First Name', type: 'text' },
        { key: 'last_name', label: 'Last Name', type: 'text' },
        { key: 'username', label: 'Username', type: 'text' },
        { key: 'billing.first_name', label: 'Billing First Name', type: 'text' },
        { key: 'billing.last_name', label: 'Billing Last Name', type: 'text' },
        { key: 'billing.email', label: 'Billing Email', type: 'email' },
        { key: 'billing.phone', label: 'Billing Phone', type: 'text' },
        { key: 'orders_count', label: 'Orders Count', type: 'number' },
        { key: 'total_spent', label: 'Total Spent', type: 'number' }
      ],
      order: [
        { key: 'number', label: 'Order Number', type: 'text' },
        { key: 'status', label: 'Status', type: 'select' },
        { key: 'total', label: 'Total', type: 'number' },
        { key: 'date_created', label: 'Date Created', type: 'date' },
        { key: 'customer_id', label: 'Customer ID', type: 'number' },
        { key: 'billing.email', label: 'Billing Email', type: 'email' },
        { key: 'line_items', label: 'Line Items', type: 'array' }
      ]
    };

    return schemas[externalType] || [];
  }

  /**
   * Fetch single product by external WooCommerce ID
   */
  async getProduct(externalId) {
    if (this.isMockMode) {
      const all = (await this.getProducts()).data;
      const found = all.find((p) => String(p.id) === String(externalId));
      if (!found) {
        const error = new Error(`Product ${externalId} not found`);
        error.status = 404;
        throw error;
      }
      return found;
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.get(`/products/${externalId}`);
      return response.data;
    });
  }

  /**
   * Map WooCommerce data to NEXORA resource based on field mappings
   */
  mapWooToResource(wooData, externalType, fieldMappings) {
    const data = {};
    
    // Apply field mappings
    if (fieldMappings && typeof fieldMappings === 'object') {
      for (const [wooField, nexoraField] of Object.entries(fieldMappings)) {
        const value = this.getNestedValue(wooData, wooField);
        if (value !== undefined && value !== null) {
          data[nexoraField] = value;
        }
      }
    }
    
    // Use default mapping if no custom mappings provided
    if (Object.keys(data).length === 0) {
      switch (externalType) {
        case 'product':
          return this.mapWooProductToResource(wooData);
        case 'customer':
          return this.mapWooCustomerToResource(wooData);
        case 'order':
          return this.mapWooOrderToResource(wooData);
      }
    }
    
    return {
      externalId: String(wooData.id),
      syncSource: 'woocommerce',
      data
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Map WooCommerce product schema into NEXORA product resource schema
   */
  mapWooProductToResource(wcProduct) {
    // Map WC category to allowed enum: electronics, clothing, food, other
    let category = 'other';
    const firstCat = wcProduct.categories?.[0]?.name?.toLowerCase() || '';
    if (firstCat.includes('elect')) category = 'electronics';
    else if (firstCat.includes('cloth') || firstCat.includes('apparel')) category = 'clothing';
    else if (firstCat.includes('food') || firstCat.includes('bev') || firstCat.includes('coffee')) category = 'food';

    const priceNum = parseFloat(wcProduct.price || wcProduct.regular_price || 0);

    return {
      externalId: String(wcProduct.id),
      syncSource: 'woocommerce',
      data: {
        name: wcProduct.name || 'Untitled Product',
        sku: wcProduct.sku || `SKU-${wcProduct.id}`,
        price: Number.isNaN(priceNum) ? 0 : priceNum,
        category,
        stock: typeof wcProduct.stock_quantity === 'number' ? wcProduct.stock_quantity : 0,
        description: (wcProduct.description || '').replace(/<[^>]*>?/gm, '').trim(),
        active: wcProduct.status === 'publish'
      }
    };
  }

  /**
   * Map WooCommerce customer to NEXORA resource
   */
  mapWooCustomerToResource(wcCustomer) {
    return {
      externalId: String(wcCustomer.id),
      syncSource: 'woocommerce',
      data: {
        email: wcCustomer.email,
        firstName: wcCustomer.first_name,
        lastName: wcCustomer.last_name,
        username: wcCustomer.username,
        billingFirstName: wcCustomer.billing?.first_name,
        billingLastName: wcCustomer.billing?.last_name,
        billingEmail: wcCustomer.billing?.email,
        billingPhone: wcCustomer.billing?.phone,
        billingAddress: wcCustomer.billing?.address_1,
        billingCity: wcCustomer.billing?.city,
        billingState: wcCustomer.billing?.state,
        billingPostalCode: wcCustomer.billing?.postcode,
        billingCountry: wcCustomer.billing?.country,
        ordersCount: wcCustomer.orders_count,
        totalSpent: parseFloat(wcCustomer.total_spent || 0)
      }
    };
  }

  /**
   * Map WooCommerce order to NEXORA resource
   */
  mapWooOrderToResource(wcOrder) {
    return {
      externalId: String(wcOrder.id),
      syncSource: 'woocommerce',
      data: {
        orderNumber: wcOrder.number,
        status: wcOrder.status,
        total: parseFloat(wcOrder.total || 0),
        currency: wcOrder.currency,
        dateCreated: wcOrder.date_created,
        dateModified: wcOrder.date_modified,
        customerId: wcOrder.customer_id,
        customerEmail: wcOrder.billing?.email,
        customerPhone: wcOrder.billing?.phone,
        lineItems: wcOrder.line_items?.map(item => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price || 0),
          total: parseFloat(item.total || 0)
        })) || []
      }
    };
  }

  /**
   * Map NEXORA product record into WooCommerce product payload
   */
  mapResourceToWooProduct(recordData) {
    return {
      name: recordData.name,
      sku: recordData.sku,
      regular_price: String(recordData.price || '0'),
      stock_quantity: recordData.stock || 0,
      manage_stock: true,
      description: recordData.description || '',
      status: recordData.active ? 'publish' : 'draft'
    };
  }

  /**
   * Push / create a product in WooCommerce
   */
  async createProduct(productData) {
    if (this.isMockMode) {
      console.log('[WooCommerceAdapter:Mock] Simulated product creation:', productData);
      return {
        id: Math.floor(Math.random() * 9000) + 1000,
        ...productData,
        status: 'publish'
      };
    }

    return this.executeWithRetry(async () => {
      const payload = this.mapResourceToWooProduct(productData);
      const response = await this.client.post('/products', payload);
      return response.data;
    });
  }

  /**
   * Push / update a product in WooCommerce
   */
  async updateProduct(externalId, productData) {
    if (this.isMockMode) {
      console.log(`[WooCommerceAdapter:Mock] Simulated product update for ID ${externalId}:`, productData);
      return {
        id: externalId,
        ...productData
      };
    }

    return this.executeWithRetry(async () => {
      const payload = this.mapResourceToWooProduct(productData);
      const response = await this.client.put(`/products/${externalId}`, payload);
      return response.data;
    });
  }
}

module.exports = WooCommerceAdapter;
