// Booking functionality with security features
class TravelBooking {
    constructor() {
        this.apiUrl = '/api';
        this.init();
    }

    init() {
        this.setupBookingModal();
        this.setupContactForm();
        this.setupSecurityFeatures();
        this.bindEvents();
    }

    setupBookingModal() {
        // Create booking modal HTML
        const modalHTML = `
            <div id="bookingModal" class="booking-modal">
                <div class="booking-modal-content">
                    <div class="booking-modal-header">
                        <h2>🌴 Book Your Dream Trip</h2>
                        <span class="booking-close">&times;</span>
                    </div>
                    <form id="bookingForm" class="booking-form">
                        <div class="form-group">
                            <label for="fullName">Full Name *</label>
                            <input type="text" id="fullName" name="fullName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="destination">Destination *</label>
                            <select id="destination" name="destination" required>
                                <option value="">Select Destination</option>
                                <option value="Bali, Indonesia">Bali, Indonesia - $2499</option>
                                <option value="Bora Bora, Polynesia">Bora Bora, Polynesia - $1599</option>
                                <option value="Hawaii, USA">Hawaii, USA - $3499</option>
                                <option value="Whitehaven, Australia">Whitehaven, Australia - $2499</option>
                                <option value="Hvar, Croatia">Hvar, Croatia - $1999</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="checkIn">Check-in Date *</label>
                                <input type="date" id="checkIn" name="checkIn" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="checkOut">Check-out Date *</label>
                                <input type="date" id="checkOut" name="checkOut" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="guests">Number of Guests *</label>
                            <select id="guests" name="guests" required>
                                <option value="">Select Guests</option>
                                <option value="1">1 Guest</option>
                                <option value="2">2 Guests</option>
                                <option value="3">3 Guests</option>
                                <option value="4">4 Guests</option>
                                <option value="5">5+ Guests</option>
                            </select>
                        </div>
                        
                        <div class="price-summary">
                            <div class="price-line">
                                <span>Base Price:</span>
                                <span id="basePrice">$0</span>
                            </div>
                            <div class="price-line">
                                <span>Guests (×<span id="guestMultiplier">1</span>):</span>
                                <span id="guestPrice">$0</span>
                            </div>
                            <div class="price-line total">
                                <span>Total Price:</span>
                                <span id="totalPrice">$0</span>
                            </div>
                        </div>
                        
                        <div class="security-notice">
                            <div class="security-icon">🔒</div>
                            <div class="security-text">
                                <strong>Your data is secure:</strong> All information is encrypted and protected. We never store payment details.
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-book">Book Now</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupContactForm() {
        const contactHTML = `
            <section class="contact section" id="contact">
                <div class="contact__container container">
                    <h2 class="section__title">Contact Us</h2>
                    <p class="contact__description">Have questions? We're here to help with your travel plans!</p>
                    
                    <form id="contactForm" class="contact__form">
                        <div class="form-group">
                            <input type="text" name="name" placeholder="Your Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Your Email" required>
                        </div>
                        <div class="form-group">
                            <input type="text" name="subject" placeholder="Subject" required>
                        </div>
                        <div class="form-group">
                            <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="button">Send Message</button>
                    </form>
                </div>
            </section>
        `;

        // Insert contact section before footer
        const footer = document.querySelector('.footer');
        footer.insertAdjacentHTML('beforebegin', contactHTML);
    }

    setupSecurityFeatures() {
        // Add security banner
        const securityBanner = `
            <div class="security-banner">
                <div class="container">
                    <div class="security-content">
                        <span class="security-icon">🔒</span>
                        <span class="security-text">Secure Booking • SSL Encrypted • Data Protected</span>
                        <button class="security-info-btn" onclick="travelBooking.showSecurityInfo()">Learn More</button>
                    </div>
                </div>
            </div>
        `;

        const header = document.querySelector('.header');
        header.insertAdjacentHTML('afterend', securityBanner);

        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');
        
        if (checkInInput) checkInInput.min = today;
        if (checkOutInput) checkOutInput.min = today;
    }

    bindEvents() {
        // Booking button clicks
        document.querySelectorAll('.place__button, .button').forEach(button => {
            if (button.textContent.includes('Explore') || button.closest('.place__card')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openBookingModal(button);
                });
            }
        });

        // Modal events
        const modal = document.getElementById('bookingModal');
        const closeBtn = document.querySelector('.booking-close');
        const cancelBtn = document.querySelector('.btn-cancel');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeBookingModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeBookingModal());
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeBookingModal();
            });
        }

        // Form events
        const bookingForm = document.getElementById('bookingForm');
        const contactForm = document.getElementById('contactForm');

        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
            
            // Price calculation
            const destinationSelect = document.getElementById('destination');
            const guestsSelect = document.getElementById('guests');
            
            if (destinationSelect) destinationSelect.addEventListener('change', () => this.calculatePrice());
            if (guestsSelect) guestsSelect.addEventListener('change', () => this.calculatePrice());
        }

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Date validation
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');
        
        if (checkInInput) {
            checkInInput.addEventListener('change', () => {
                if (checkOutInput) {
                    checkOutInput.min = checkInInput.value;
                    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
                        checkOutInput.value = '';
                    }
                }
            });
        }
    }

    openBookingModal(button) {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Pre-fill destination if clicked from place card
            const placeCard = button.closest('.place__card');
            if (placeCard) {
                const title = placeCard.querySelector('.place__title')?.textContent;
                const subtitle = placeCard.querySelector('.place__subtitle')?.textContent;
                const price = placeCard.querySelector('.place__price')?.textContent;
                
                if (title && subtitle && price) {
                    const destinationSelect = document.getElementById('destination');
                    const destinationValue = `${title}, ${subtitle}`;
                    
                    // Find matching option
                    const option = Array.from(destinationSelect.options).find(opt => 
                        opt.textContent.includes(title)
                    );
                    
                    if (option) {
                        destinationSelect.value = option.value;
                        this.calculatePrice();
                    }
                }
            }
        }
    }

    closeBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            const form = document.getElementById('bookingForm');
            if (form) form.reset();
            this.calculatePrice();
        }
    }

    calculatePrice() {
        const destinationSelect = document.getElementById('destination');
        const guestsSelect = document.getElementById('guests');
        const basePriceEl = document.getElementById('basePrice');
        const guestMultiplierEl = document.getElementById('guestMultiplier');
        const guestPriceEl = document.getElementById('guestPrice');
        const totalPriceEl = document.getElementById('totalPrice');

        if (!destinationSelect || !guestsSelect) return;

        const destinationText = destinationSelect.options[destinationSelect.selectedIndex]?.text || '';
        const priceMatch = destinationText.match(/\$(\d+)/);
        const basePrice = priceMatch ? parseInt(priceMatch[1]) : 0;
        const guests = parseInt(guestsSelect.value) || 1;
        const totalPrice = basePrice * guests;

        if (basePriceEl) basePriceEl.textContent = `$${basePrice}`;
        if (guestMultiplierEl) guestMultiplierEl.textContent = guests;
        if (guestPriceEl) guestPriceEl.textContent = `$${basePrice * guests}`;
        if (totalPriceEl) totalPriceEl.textContent = `$${totalPrice}`;
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.btn-book');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const totalPriceEl = document.getElementById('totalPrice');
            const totalPrice = totalPriceEl ? totalPriceEl.textContent.replace('$', '') : '0';

            const bookingData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                destination: formData.get('destination'),
                checkIn: formData.get('checkIn'),
                checkOut: formData.get('checkOut'),
                guests: formData.get('guests'),
                totalPrice: parseFloat(totalPrice)
            };

            const response = await fetch(`${this.apiUrl}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccessMessage(result.bookingId);
                this.closeBookingModal();
            } else {
                throw new Error(result.message || 'Booking failed');
            }

        } catch (error) {
            console.error('Booking error:', error);
            this.showErrorMessage(error.message || 'Booking failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            const response = await fetch(`${this.apiUrl}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccessMessage('Message sent successfully! We\'ll get back to you soon.');
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }

        } catch (error) {
            console.error('Contact error:', error);
            this.showErrorMessage(error.message || 'Failed to send message. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    showSecurityInfo() {
        const securityModal = `
            <div class="security-modal">
                <div class="security-modal-content">
                    <div class="security-modal-header">
                        <h2>🔒 Your Security & Privacy</h2>
                        <span class="security-modal-close">&times;</span>
                    </div>
                    <div class="security-modal-body">
                        <h3>How We Protect You:</h3>
                        <ul>
                            <li><strong>SSL Encryption:</strong> All data is encrypted in transit</li>
                            <li><strong>Secure Storage:</strong> Personal information is safely stored</li>
                            <li><strong>No Payment Storage:</strong> We never store credit card details</li>
                            <li><strong>Email Verification:</strong> All bookings are confirmed via email</li>
                            <li><strong>Rate Limiting:</strong> Protection against automated attacks</li>
                        </ul>
                        
                        <h3>Cyber Safety Tips:</h3>
                        <ul>
                            <li>Always verify booking confirmations through our official website</li>
                            <li>We will never ask for passwords via email</li>
                            <li>Report suspicious emails to security@travel.com</li>
                            <li>Use strong, unique passwords for your accounts</li>
                            <li>Keep your browser and devices updated</li>
                        </ul>
                        
                        <div class="security-contact">
                            <p><strong>Security Concerns?</strong> Contact us immediately at <a href="mailto:security@travel.com">security@travel.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', securityModal);
        
        const modal = document.querySelector('.security-modal');
        const closeBtn = modal.querySelector('.security-modal-close');
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.travelBooking = new TravelBooking();
});