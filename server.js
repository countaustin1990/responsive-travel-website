const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const validator = require('validator');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 booking attempts per hour
  message: 'Too many booking attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/book', bookingLimiter);

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// In-memory storage (replace with database in production)
const bookings = [];
const users = [];

// Validation middleware
const validateBooking = [
  body('email').isEmail().normalizeEmail(),
  body('fullName').isLength({ min: 2, max: 50 }).trim().escape(),
  body('phone').isMobilePhone(),
  body('destination').isLength({ min: 2, max: 100 }).trim().escape(),
  body('checkIn').isISO8601().toDate(),
  body('checkOut').isISO8601().toDate(),
  body('guests').isInt({ min: 1, max: 10 }),
  body('totalPrice').isFloat({ min: 0 })
];

const validateContact = [
  body('email').isEmail().normalizeEmail(),
  body('name').isLength({ min: 2, max: 50 }).trim().escape(),
  body('subject').isLength({ min: 5, max: 100 }).trim().escape(),
  body('message').isLength({ min: 10, max: 1000 }).trim().escape()
];

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Booking endpoint
app.post('/api/book', validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Invalid booking data provided'
      });
    }

    const { email, fullName, phone, destination, checkIn, checkOut, guests, totalPrice } = req.body;
    
    // Generate booking ID
    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Create booking object
    const booking = {
      id: bookingId,
      email: email.toLowerCase(),
      fullName,
      phone,
      destination,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: parseInt(guests),
      totalPrice: parseFloat(totalPrice),
      status: 'confirmed',
      createdAt: new Date(),
      ipAddress: req.ip
    };

    // Store booking
    bookings.push(booking);

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🌴 Travel Booking Confirmation - ${bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌴 Travel Booking Confirmed!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 5px 0;"><strong>Destination:</strong> ${destination}</p>
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
              <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
              <p style="margin: 5px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">🔒 Cyber Safety Notice</h3>
              <ul style="color: #155724; margin: 10px 0;">
                <li>Your booking data is encrypted and securely stored</li>
                <li>We will never ask for passwords via email</li>
                <li>Always verify booking details through our official website</li>
                <li>Report suspicious emails to security@travel.com</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666;">Thank you for choosing our travel services!</p>
              <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send notification to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Booking Received - ${bookingId}`,
      html: `
        <h2>New Travel Booking</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Customer:</strong> ${fullName} (${email})</p>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Total:</strong> $${totalPrice}</p>
        <p><strong>IP Address:</strong> ${req.ip}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };

    await transporter.sendMail(adminMailOptions);

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      bookingId,
      data: {
        id: bookingId,
        destination,
        checkIn,
        checkOut,
        guests,
        totalPrice
      }
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Contact form endpoint
app.post('/api/contact', validateContact, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, name, subject, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>IP Address:</strong> ${req.ip}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting us',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Thank you for your message!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🔒 Security Reminder</h3>
            <p style="color: #856404; margin: 0;">We will only contact you from official email addresses ending in @travel.com. Be cautious of phishing attempts.</p>
          </div>
          
          <p>Best regards,<br>Travel Support Team</p>
        </div>
      `
    };

    await transporter.sendMail(autoReplyOptions);

    res.json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Get booking by ID
app.get('/api/booking/:id', (req, res) => {
  const bookingId = req.params.id;
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Remove sensitive information
  const { ipAddress, ...safeBooking } = booking;
  
  res.json({
    success: true,
    data: safeBooking
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Travel Booking Server running on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📧 Email notifications configured`);
});