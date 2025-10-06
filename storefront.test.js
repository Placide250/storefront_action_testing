const { Cart, ProductService, NotificationService, OrderService } = require('./storefront');

describe('Cart Basic Operations', () => {
  let cart;
  let productService;

  beforeEach(() => {
    cart = new Cart(1);
    productService = new ProductService();
    productService.addProduct(101, 'Laptop', 999.99, 10);
    productService.addProduct(102, 'Mouse', 29.99, 5);
  });

  test('[BASIC] should add product to cart when product is available', () => {
    const result = cart.addProduct(101, 2, productService);
    expect(result).toBe(true);
    expect(cart.getItemCount()).toBe(1);
  });

  test('[BASIC] should throw error when adding unavailable product', () => {
    productService.updateStock(101, 0);
    expect(() => {
      cart.addProduct(101, 1, productService);
    }).toThrow('Product 101 is not available');
  });

  test('[BASIC] should calculate correct total for multiple items', () => {
    cart.addProduct(101, 1, productService);
    cart.addProduct(102, 2, productService);
    const total = cart.calculateTotal(productService);
    expect(total).toBeCloseTo(999.99 + (29.99 * 2));
  });
});

describe('Order Service with Mock Notification', () => {
  test('[MOCK] should send both email and SMS when creating order', () => {
    const mockNotificationService = {
      sendEmail: jest.fn().mockReturnValue(true),
      sendSMS: jest.fn().mockReturnValue(true)
    };

    const orderService = new OrderService(mockNotificationService);
    const cart = new Cart(1);
    const productService = new ProductService();
    
    productService.addProduct(101, 'Tablet', 299.99, 5);
    cart.addProduct(101, 1, productService);

    const order = orderService.createOrder(cart, 'customer@example.com', '+1234567890');

    expect(order.orderId).toBeDefined();
    expect(order.status).toBe('confirmed');
    
    expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Order Confirmation',
      expect.stringContaining(`Your order #${order.orderId} has been created successfully.`)
    );
    
    expect(mockNotificationService.sendSMS).toHaveBeenCalledWith(
      expect.stringContaining(`Your order #${order.orderId} has been confirmed`)
    );
    
    expect(mockNotificationService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendSMS).toHaveBeenCalledTimes(1);
  });
});

describe('Cart with Stubbed Product Service', () => {
  test('[STUB] should handle out-of-stock products using stub', () => {
    const cart = new Cart(1);
    
    const stubProductService = {
      isProductAvailable: jest.fn().mockReturnValue(false),
      getProductPrice: jest.fn().mockReturnValue(99.99)
    };

    expect(() => {
      cart.addProduct(999, 1, stubProductService);
    }).toThrow('Product 999 is not available');
    
    expect(stubProductService.isProductAvailable).toHaveBeenCalledWith(999);
    expect(stubProductService.isProductAvailable).toHaveBeenCalledTimes(1);
  });

  test('[STUB] should calculate total using stubbed product prices', () => {
    const cart = new Cart(1);
    
    const stubProductService = {
      isProductAvailable: jest.fn().mockReturnValue(true),
      getProductPrice: jest.fn()
        .mockReturnValueOnce(50.00)
        .mockReturnValueOnce(25.00)
    };

    cart.addProduct(201, 2, stubProductService);
    cart.addProduct(202, 1, stubProductService);
    const total = cart.calculateTotal(stubProductService);

    expect(total).toBe(125.00);
    expect(stubProductService.getProductPrice).toHaveBeenCalledWith(201);
    expect(stubProductService.getProductPrice).toHaveBeenCalledWith(202);
    expect(stubProductService.getProductPrice).toHaveBeenCalledTimes(2);
  });
});

describe('Order Service Edge Cases', () => {
  test('[EDGE CASE] should throw error when creating order with empty cart', () => {
    const mockNotificationService = {
      sendEmail: jest.fn(),
      sendSMS: jest.fn()
    };

    const orderService = new OrderService(mockNotificationService);
    const emptyCart = new Cart(1);

    expect(() => {
      orderService.createOrder(emptyCart, 'test@example.com', '+1234567890');
    }).toThrow('Cannot create order with empty cart');

    expect(mockNotificationService.sendEmail).not.toHaveBeenCalled();
    expect(mockNotificationService.sendSMS).not.toHaveBeenCalled();
  });
});
