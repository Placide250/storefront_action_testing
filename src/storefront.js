class Cart {
  constructor(cartId) {
    this.cartId = cartId;
    this.items = new Map();
    this.createdAt = new Date();
  }

  addProduct(productId, quantity, productService) {
    if (!productService.isProductAvailable(productId)) {
      throw new Error(`Product ${productId} is not available`);
    }
    
    const currentQty = this.items.get(productId) || 0;
    this.items.set(productId, currentQty + quantity);
    return true;
  }

  removeProduct(productId) {
    if (!this.items.has(productId)) {
      throw new Error(`Product ${productId} not in cart`);
    }
    this.items.delete(productId);
  }

  calculateTotal(productService) {
    let total = 0;
    for (const [productId, quantity] of this.items) {
      const price = productService.getProductPrice(productId);
      total += price * quantity;
    }
    return total;
  }

  getItemCount() {
    return this.items.size;
  }
}

class ProductService {
  constructor() {
    this.products = new Map();
  }

  addProduct(productId, name, price, stock) {
    this.products.set(productId, { productId, name, price, stock });
  }

  isProductAvailable(productId) {
    const product = this.products.get(productId);
    return product && product.stock > 0;
  }

  getProductPrice(productId) {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return product.price;
  }

  updateStock(productId, newStock) {
    const product = this.products.get(productId);
    if (product) {
      product.stock = newStock;
    }
  }
}

class NotificationService {
  constructor() {
    this.sendEmailEnabled = true;
    this.sendSMSEnabled = true;
  }

  sendEmail(email, subject, body) {
    if (!this.sendEmailEnabled) {
      return false;
    }
    console.log(`Email sent to ${email}: ${subject}`);
    return true;
  }

  sendSMS(message) {
    if (!this.sendSMSEnabled) {
      return false;
    }
    console.log(`SMS sent: ${message}`);
    return true;
  }
}

class OrderService {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  createOrder(cart, customerEmail, customerPhone) {
    if (cart.getItemCount() === 0) {
      throw new Error("Cannot create order with empty cart");
    }

    const orderId = Math.floor(Math.random() * 10000);
    
    this.notificationService.sendEmail(
      customerEmail, 
      "Order Confirmation", 
      `Your order #${orderId} has been created successfully.`
    );
    
    this.notificationService.sendSMS(
      `Your order #${orderId} has been confirmed. Thank you for your purchase!`
    );

    return {
      orderId,
      orderDate: new Date(),
      status: 'confirmed'
    };
  }
}

module.exports = { Cart, ProductService, NotificationService, OrderService };
