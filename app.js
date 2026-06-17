/**
 * NEON RUSH 2026 - Online Registration Web Application Logic
 * Implements: Multi-step navigation, field validation, dynamic preview,
 * interactive 3D card tilt, custom confetti system, and modal handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Core State & Constants
  // ==========================================
  const state = {
    currentStep: 1,
    totalSteps: 4,
    bibNumber: '',
    category: '42k',
    price: 1200,
    name: '',
    gender: 'M',
    identity: '',
    blood: 'A',
    birthdate: '',
    phone: '',
    email: '',
    shirtSize: 'M',
    emergencyName: '',
    emergencyPhone: '',
    consent: false
  };

  // Prices and details configuration
  const categoryConfigs = {
    '42k': {
      label: '42K 全程馬拉松',
      name: '42K 全程馬拉松組',
      prefix: 'A',
      price: 1200,
      chipDeposit: 100,
      themeColor: '#d4ff00',
      themeRGB: '212, 255, 0'
    },
    '21k': {
      label: '21K 半程馬拉松',
      name: '21K 半程馬拉松組',
      prefix: 'B',
      price: 1000,
      chipDeposit: 100,
      themeColor: '#00f2fe',
      themeRGB: '0, 242, 254'
    },
    '10k': {
      label: '10K 路跑挑戰',
      name: '10K 路跑挑戰組',
      prefix: 'C',
      price: 800,
      chipDeposit: 100,
      themeColor: '#f355ff',
      themeRGB: '243, 85, 255'
    },
    '5k': {
      label: '5K 樂活休閒',
      name: '5K 樂活休閒組',
      prefix: 'D',
      price: 600,
      chipDeposit: 0, // Fun run has no chip
      themeColor: '#ff5722',
      themeRGB: '255, 87, 34'
    }
  };

  const shippingFee = 80;

  // ==========================================
  // 2. DOM Elements Selection
  // ==========================================
  // Form navigation and wrappers
  const mainAppGrid = document.getElementById('main-app-grid');
  const successDashboard = document.getElementById('success-dashboard');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const steps = Array.from(document.querySelectorAll('.form-step'));
  const stepNodes = Array.from(document.querySelectorAll('.step-node'));
  const stepperProgress = document.getElementById('stepper-progress');
  
  // Step 1: Category selection
  const categoryCards = document.querySelectorAll('.category-card');

  // Step 2: Personal Info Inputs
  const inputName = document.getElementById('input-name');
  const inputIdentity = document.getElementById('input-identity');
  const inputBirth = document.getElementById('input-birth');
  
  // Step 3: Contact & Gear Info Inputs
  const inputPhone = document.getElementById('input-phone');
  const inputEmail = document.getElementById('input-email');
  const inputEmergencyName = document.getElementById('input-emergency-name');
  const inputEmergencyPhone = document.getElementById('input-emergency-phone');
  
  // Step 4: Payment
  const checkboxConsent = document.getElementById('checkbox-consent');
  const receiptCategoryLabel = document.getElementById('receipt-category-label');
  const receiptCategoryPrice = document.getElementById('receipt-category-price');
  const receiptTotalPrice = document.getElementById('receipt-total-price');

  // Live Preview BIB Elements
  const rootElement = document.documentElement;
  const bibCard = document.getElementById('preview-bib-card');
  const bibTiltWrapper = document.getElementById('bib-tilt-wrapper');
  const previewBibCategory = document.getElementById('preview-bib-category');
  const previewBibNumber = document.getElementById('preview-bib-number');
  const previewBibName = document.getElementById('preview-bib-name');
  const previewBibBlood = document.getElementById('preview-bib-blood');
  const previewBibSize = document.getElementById('preview-bib-size');
  const previewBibEmergency = document.getElementById('preview-bib-emergency');
  
  // Preview Summary Panel Elements
  const summaryCategory = document.getElementById('summary-category');
  const summaryName = document.getElementById('summary-name');
  const summarySize = document.getElementById('summary-size');
  const summaryTotal = document.getElementById('summary-total');

  // Modals
  const sizeChartModal = document.getElementById('size-chart-modal');
  const btnOpenSizeModal = document.getElementById('btn-open-size-modal');
  const btnCloseSizeModal = document.getElementById('btn-close-size-modal');

  // Success screen details
  const successBibCard = document.getElementById('success-bib-card');
  const successBibCategory = document.getElementById('success-bib-category-lbl');
  const successBibNumber = document.getElementById('success-bib-number-lbl');
  const successBibName = document.getElementById('success-bib-name-lbl');
  const successBibBlood = document.getElementById('success-bib-blood-lbl');
  const successBibSize = document.getElementById('success-bib-size-lbl');
  const successBibEmergency = document.getElementById('success-bib-emergency-lbl');
  const successTicketId = document.getElementById('success-ticket-id');
  const successTicketAmount = document.getElementById('success-ticket-amount');

  // ==========================================
  // 3. Initialization Logic
  // ==========================================
  function init() {
    generateRandomBIB();
    updateTheme(state.category);
    updatePriceBreakdown();
    setInitialBirthdateLimit();
    bindEvents();
  }

  // Generate random 4 digit BIB number on load
  function generateRandomBIB() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const config = categoryConfigs[state.category];
    state.bibNumber = `${config.prefix} - ${randomNum}`;
    
    // Update preview & success layouts
    previewBibNumber.textContent = state.bibNumber;
  }

  // Set birthdate input calendar max date to today
  function setInitialBirthdateLimit() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    inputBirth.max = `${yyyy}-${mm}-${dd}`;
  }

  // ==========================================
  // 4. Interaction Events & Live Binding
  // ==========================================
  function bindEvents() {
    // A. Form Step 1: Category Card click selector
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const category = card.getAttribute('data-category');
        state.category = category;
        state.price = parseInt(card.getAttribute('data-price'));
        
        updateTheme(category);
        generateRandomBIB(); // Regenerate code prefix (A, B, C, D)
        updatePriceBreakdown();
      });
    });

    // B. Form Step 2 & 3: Live update elements
    inputName.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.name = val;
      previewBibName.textContent = val ? val.toUpperCase() : '選手姓名';
      summaryName.textContent = val ? val : '尚未輸入';
    });

    document.querySelectorAll('input[name="gender"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.gender = e.target.value;
      });
    });

    document.querySelectorAll('input[name="blood"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.blood = e.target.value;
        previewBibBlood.textContent = `${state.blood}型`;
      });
    });

    document.querySelectorAll('input[name="shirt-size"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.shirtSize = e.target.value;
        previewBibSize.textContent = state.shirtSize;
        summarySize.textContent = `${state.shirtSize}尺寸 (紀念跑衣)`;
      });
    });

    inputEmergencyPhone.addEventListener('input', (e) => {
      state.emergencyPhone = e.target.value.trim();
      previewBibEmergency.textContent = state.emergencyPhone ? state.emergencyPhone : '--';
    });

    // C. Modal Triggers
    btnOpenSizeModal.addEventListener('click', () => sizeChartModal.classList.add('active'));
    btnCloseSizeModal.addEventListener('click', () => sizeChartModal.classList.remove('active'));
    sizeChartModal.addEventListener('click', (e) => {
      if (e.target === sizeChartModal) sizeChartModal.classList.remove('active');
    });

    // D. Step Navigation Buttons
    btnNext.addEventListener('click', handleNextStep);
    btnPrev.addEventListener('click', handlePrevStep);

    // E. 3D Tilt BIB Card Preview Effect
    if (bibTiltWrapper && bibCard) {
      bibTiltWrapper.addEventListener('mousemove', (e) => {
        const rect = bibTiltWrapper.getBoundingClientRect();
        // Mouse coordinate relative to the card container center (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Multiplier for degree rotation
        const tiltX = (y * -20).toFixed(2);
        const tiltY = (x * 20).toFixed(2);
        
        bibCard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
      });

      bibTiltWrapper.addEventListener('mouseleave', () => {
        bibCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      });
    }
  }

  // ==========================================
  // 5. Themes, Prices & Stepper Updates
  // ==========================================
  function updateTheme(category) {
    const config = categoryConfigs[category];
    
    // Set custom CSS variables on document root for transition effects
    rootElement.style.setProperty('--accent-color', config.themeColor);
    rootElement.style.setProperty('--accent-color-rgb', config.themeRGB);
    
    // Update BIB styles
    previewBibCategory.textContent = config.label;
    
    // Update sidebar summary details
    summaryCategory.textContent = config.name;
  }

  function updatePriceBreakdown() {
    const config = categoryConfigs[state.category];
    const total = config.price + config.chipDeposit + shippingFee;
    
    // Update Form Step 4 Pricing Card
    receiptCategoryLabel.textContent = `${config.name} 報名費`;
    receiptCategoryPrice.textContent = `NT$ ${config.price.toLocaleString()}`;
    receiptTotalPrice.textContent = `NT$ ${total.toLocaleString()}`;
    
    // Update Summary Sidebar Fee
    summaryTotal.textContent = `NT$ ${total.toLocaleString()}`;
  }

  function updateStepper() {
    // 1. Calculate stepper progress bar percentage
    const progressPercent = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
    stepperProgress.style.width = `${progressPercent}%`;

    // 2. Update step node classes
    stepNodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.remove('active', 'completed');
      
      if (stepNum < state.currentStep) {
        node.classList.add('completed');
      } else if (stepNum === state.currentStep) {
        node.classList.add('active');
      }
    });

    // 3. Toggle form steps visibility
    steps.forEach((step, idx) => {
      step.classList.remove('active');
      if (idx + 1 === state.currentStep) {
        step.classList.add('active');
      }
    });

    // 4. Update Prev / Next Buttons states & text
    btnPrev.disabled = state.currentStep === 1;

    if (state.currentStep === state.totalSteps) {
      btnNext.innerHTML = `
        確認送出報名
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
      `;
      btnNext.classList.add('btn-success');
    } else {
      btnNext.innerHTML = `
        下一步
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
      `;
      btnNext.classList.remove('btn-success');
    }
  }

  // ==========================================
  // 6. Validation System
  // ==========================================
  function handleNextStep() {
    if (validateStep(state.currentStep)) {
      if (state.currentStep < state.totalSteps) {
        state.currentStep++;
        updateStepper();
      } else {
        // Last step submitted: handle final registration
        submitRegistration();
      }
    } else {
      // Find the invalid field card and play shake animation
      const activeStepEl = document.querySelector('.form-step.active');
      const invalidFields = activeStepEl.querySelectorAll('.form-field.invalid');
      if (invalidFields.length > 0) {
        invalidFields[0].classList.add('shake');
        setTimeout(() => {
          invalidFields[0].classList.remove('shake');
        }, 500);
        
        // Scroll to first invalid field
        invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function handlePrevStep() {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateStepper();
    }
  }

  function validateStep(step) {
    let isValid = true;

    // Reset error styling
    const activeStepEl = document.querySelector('.form-step.active');
    activeStepEl.querySelectorAll('.form-field').forEach(field => field.classList.remove('invalid'));

    if (step === 1) {
      // Step 1: Category selection (validated by click selecting cards, always has one selected)
      return true;
    }

    if (step === 2) {
      // Step 2: Personal details validation
      // Name validation
      const nameVal = inputName.value.trim();
      if (nameVal.length < 2) {
        document.getElementById('field-name').classList.add('invalid');
        isValid = false;
      }

      // ID / Passport validation (Simple Taiwan ID format / general check)
      const idVal = inputIdentity.value.trim().toUpperCase();
      const idRegex = /^[A-Z][12]\d{8}$/; // Regular Taiwan ID
      const generalPassportRegex = /^[A-Z0-9]{7,12}$/; // Passport approximation
      if (!idRegex.test(idVal) && !generalPassportRegex.test(idVal)) {
        document.getElementById('field-identity').classList.add('invalid');
        isValid = false;
      }

      // Birthdate validation
      const birthVal = inputBirth.value;
      if (!birthVal) {
        document.getElementById('field-birth').classList.add('invalid');
        isValid = false;
      } else {
        const birthDateObj = new Date(birthVal);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        if (age < 5 || age > 110) { // Age limit
          document.getElementById('field-birth').classList.add('invalid');
          isValid = false;
        }
      }
    }

    if (step === 3) {
      // Step 3: Contacts & Gear details validation
      // Mobile phone validation (Taiwan mobile starts with 09 and is 10 digits)
      const phoneVal = inputPhone.value.trim();
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(phoneVal)) {
        document.getElementById('field-phone').classList.add('invalid');
        isValid = false;
      }

      // Email validation
      const emailVal = inputEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        document.getElementById('field-email').classList.add('invalid');
        isValid = false;
      }

      // Emergency Contact Name
      const emNameVal = inputEmergencyName.value.trim();
      if (emNameVal.length < 1) {
        document.getElementById('field-emergency-name').classList.add('invalid');
        isValid = false;
      }

      // Emergency Contact Phone
      const emPhoneVal = inputEmergencyPhone.value.trim();
      if (emPhoneVal.length < 6) {
        document.getElementById('field-emergency-phone').classList.add('invalid');
        isValid = false;
      }
    }

    if (step === 4) {
      // Step 4: Terms consent checkbox
      if (!checkboxConsent.checked) {
        document.getElementById('field-consent').classList.add('invalid');
        isValid = false;
      }
    }

    return isValid;
  }

  // ==========================================
  // 7. Submission & Success Dashboard
  // ==========================================
  function submitRegistration() {
    // 1. Save final field details to state
    state.name = inputName.value.trim();
    state.identity = inputIdentity.value.trim().toUpperCase();
    state.birthdate = inputBirth.value;
    state.phone = inputPhone.value.trim();
    state.email = inputEmail.value.trim();
    state.emergencyName = inputEmergencyName.value.trim();
    state.emergencyPhone = inputEmergencyPhone.value.trim();

    // 2. Set details on Success Screen
    const config = categoryConfigs[state.category];
    const total = config.price + config.chipDeposit + shippingFee;
    
    // Copy computed styles over to the printable ticket
    successBibCategory.textContent = config.label;
    successBibNumber.textContent = state.bibNumber;
    successBibName.textContent = state.name.toUpperCase();
    successBibBlood.textContent = `${state.blood}型`;
    successBibSize.textContent = state.shirtSize;
    successBibEmergency.textContent = state.emergencyPhone;

    // Apply color theme class/variables specifically to success card
    successBibCard.style.setProperty('--accent-color', config.themeColor);
    successBibCard.style.setProperty('--accent-color-rgb', config.themeRGB);
    
    // Unique registration receipt number
    const receiptNum = `NR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    successTicketId.textContent = `報名編號：${receiptNum}`;
    successTicketAmount.textContent = `付款狀態：已完成付款 (NT$ ${total.toLocaleString()})`;

    // 3. Swap UI Views
    mainAppGrid.style.display = 'none';
    successDashboard.style.display = 'flex';

    // 4. Trigger Confetti celebration
    triggerConfetti();
  }

  // ==========================================
  // 8. Custom Confetti Engine
  // ==========================================
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas sizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#d4ff00', '#00f2fe', '#f355ff', '#ff5722', '#00e676', '#ffffff'];
    const particleCount = 120;
    const particles = [];

    // Particle blueprint
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20; // start above screen
        this.size = Math.random() * 8 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedY = Math.random() * 4 + 4;
        this.speedX = Math.random() * 3 - 1.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        
        // Random particle shape (squares and rectangles)
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        ctx.restore();
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    let animationFrameId;
    let frameCount = 0;
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let allDone = true;
      particles.forEach(p => {
        p.update();
        p.draw();
        
        if (p.y < canvas.height) {
          allDone = false;
        }
      });

      frameCount++;
      // Stop animating after 300 frames (approx 5 seconds) or when all particles have fallen
      if (!allDone && frameCount < 350) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Start loop
    animate();

    // Re-adjust canvas size on resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // Launch app
  init();
});
