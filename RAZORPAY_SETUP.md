# Razorpay Payment Integration Setup

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install razorpay
```

### 2. Environment Configuration
Add to `.env` file:
```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 3. Database Migration
```bash
npm run prisma:migrate
npm run prisma:generate
```

## 📋 API Endpoints

### Create Payment Order
```http
POST /payments/razorpay/create
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "bookingId": "booking-123",
  "amount": 500
}
```

### Verify Payment
```http
POST /payments/razorpay/verify
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx", 
  "razorpaySignature": "signature_xxx"
}
```

### Get Payment Status
```http
GET /payments/booking/{bookingId}
Authorization: Bearer <jwt-token>
```

### Payment Analytics
```http
GET /payments/analytics
Authorization: Bearer <jwt-token>
```

## 🔧 Frontend Integration Example

```javascript
// Create order
const createOrder = async (bookingId, amount) => {
  const response = await fetch('/payments/razorpay/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bookingId, amount })
  });
  return response.json();
};

// Initialize Razorpay
const initializePayment = (orderData) => {
  const options = {
    key: 'your-razorpay-key-id',
    amount: orderData.amount,
    currency: 'INR',
    order_id: orderData.orderId,
    handler: async (response) => {
      // Verify payment
      await fetch('/payments/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        })
      });
    }
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
};
```

## 🗄️ Database Schema

### Payment Model
```prisma
model Payment {
  id                String        @id @default(cuid())
  bookingId         String        @unique
  amount            Float
  currency          String        @default("INR")
  status            PaymentStatus @default(PENDING)
  method            PaymentMethod @default(ONLINE)
  razorpayOrderId   String?       @unique
  razorpayPaymentId String?
  razorpaySignature String?
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

## 🔒 Security Features

- ✅ Signature verification for payment validation
- ✅ JWT authentication for all endpoints
- ✅ Secure webhook handling
- ✅ PCI DSS compliant integration
- ✅ Amount validation and currency support

## 📊 Payment Analytics

The system tracks:
- Total revenue
- Daily revenue
- Online vs offline payments
- Payment success rates
- Transaction history

## 🧪 Testing

### Test Payment Flow
1. Create a test booking
2. Generate payment order
3. Use Razorpay test cards
4. Verify payment signature
5. Check payment status

### Test Cards
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002