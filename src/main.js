import './style.css'
import questionsData from './questions.json'
import { initDarkVeil } from './DarkVeil.js';

// --- Dark Veil Background ---
const canvasContainer = document.getElementById('canvas-container');
initDarkVeil(canvasContainer, {
  speed: 0.5
});

// --- Welcome Page Logic ---
const welcomePage = document.getElementById('welcome-page');
const formContainer = document.getElementById('form-container');
const beginBtn = document.getElementById('begin-btn');

beginBtn.addEventListener('click', () => {
  // Fade out welcome page
  welcomePage.style.opacity = '0';
  welcomePage.style.transition = 'opacity 0.5s ease-out';

  setTimeout(() => {
    welcomePage.classList.add('hidden');
    formContainer.classList.remove('hidden');

    // Fade in form
    formContainer.style.opacity = '0';
    requestAnimationFrame(() => {
      formContainer.style.transition = 'opacity 0.5s ease-in';
      formContainer.style.opacity = '1';
    });
  }, 500);
});

// --- Form Logic ---

const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const stepIndicator = document.getElementById('step-indicator');
const form = document.getElementById('onboarding-form');

const STORAGE_KEY = 'aurora_onboarding_data';
const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
let currentQuestionIndex = savedData.currentIndex || 0;

// Initialize History
history.replaceState({ index: currentQuestionIndex }, '', '');

window.addEventListener('popstate', (e) => {
  if (e.state && typeof e.state.index === 'number') {
    saveCurrentAnswer(); // Save state before switching
    currentQuestionIndex = e.state.index;
    renderQuestion(currentQuestionIndex);
    saveToStorage();
  }
});

// --- Clear Progress Functionality ---
const clearProgressBtn = document.getElementById('clear-progress-btn');

clearProgressBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  showClearConfirmationModal();
});

function showClearConfirmationModal() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
  `;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl';
  modal.style.cssText = `
    position: relative;
    z-index: 10000;
    animation: scaleIn 0.3s ease-out;
  `;

  modal.innerHTML = `
    <div class="text-center">
      <!-- Warning Icon -->
      <div class="w-16 h-16 bg-red-500/10 border-2 border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-white mb-3">Clear All Progress?</h3>
      
      <!-- Message -->
      <p class="text-gray-300 mb-6 leading-relaxed">
        This action will permanently delete all your saved answers and reset the form to the beginning. 
        <strong class="text-white">This cannot be undone.</strong>
      </p>

      <!-- Buttons -->
      <div class="flex gap-3 justify-center">
        <button id="cancel-clear-btn" 
          class="px-6 py-3 rounded-lg text-sm font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
          Cancel
        </button>
        <button id="confirm-clear-btn"
          class="px-6 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg hover:shadow-red-500/20 transition-all duration-300">
          Yes, Clear All
        </button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add animations to style
  if (!document.getElementById('modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  // Handle cancel
  document.getElementById('cancel-clear-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  });

  // Handle confirm
  document.getElementById('confirm-clear-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem(STORAGE_KEY);
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
      overlay.remove();
      // Reload the page to reset everything
      window.location.reload();
    }, 200);
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      e.preventDefault();
      e.stopPropagation();
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 200);
    }
  });
}


const allQuestions = [];

// Flatten questions
questionsData.sections.forEach(section => {
  section.questions.forEach(q => {
    allQuestions.push({ ...q, sectionTitle: section.title });
  });
});

const countryCodes = [
  { code: 'manual', label: '✍️ Enter Full Number' },
  { code: '+1', label: '🇺🇸/🇨🇦 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+7', label: '🇷🇺 +7' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+52', label: '🇲🇽 +52' },
  { code: '+27', label: '🇿🇦 +27' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+20', label: '🇪🇬 +20' },
  { code: '+234', label: '🇳🇬 +234' },
  { code: '+254', label: '🇰🇪 +254' },
  { code: '+82', label: '🇰🇷 +82' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+60', label: '🇲🇾 +60' },
  { code: '+62', label: '🇮🇩 +62' },
  { code: '+63', label: '🇵🇭 +63' },
  { code: '+66', label: '🇹🇭 +66' },
  { code: '+84', label: '🇻🇳 +84' },
  { code: '+92', label: '🇵🇰 +92' },
  { code: '+880', label: '🇧🇩 +880' },
  { code: '+94', label: '🇱🇰 +94' },
  { code: '+977', label: '🇳🇵 +977' },
  { code: '+98', label: '🇮🇷 +98' },
  { code: '+90', label: '🇹🇷 +90' },
  { code: '+972', label: '🇮🇱 +972' },
  { code: '+31', label: '🇳🇱 +31' },
  { code: '+32', label: '🇧🇪 +32' },
  { code: '+41', label: '🇨🇭 +41' },
  { code: '+43', label: '🇦🇹 +43' },
  { code: '+45', label: '🇩🇰 +45' },
  { code: '+46', label: '🇸🇪 +46' },
  { code: '+47', label: '🇳🇴 +47' },
  { code: '+358', label: '🇫🇮 +358' },
  { code: '+48', label: '🇵🇱 +48' },
  { code: '+351', label: '🇵🇹 +351' },
  { code: '+30', label: '🇬🇷 +30' },
  { code: '+353', label: '🇮🇪 +353' },
  { code: '+64', label: '🇳🇿 +64' },
  { code: '+54', label: '🇦🇷 +54' },
  { code: '+56', label: '🇨🇱 +56' },
  { code: '+57', label: '🇨🇴 +57' },
  { code: '+51', label: '🇵🇪 +51' },
  { code: '+58', label: '🇻🇪 +58' },
];

function renderQuestion(index) {
  questionContainer.innerHTML = ''; // Clear previous
  questionContainer.style.opacity = '0';
  questionContainer.style.transform = 'translateY(10px)';

  // Handle Review Step
  if (index === allQuestions.length) {
    renderReview();
    return;
  }

  const q = allQuestions[index];

  setTimeout(() => {
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full';

    // Section Title
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'text-aurora-accent text-sm font-bold uppercase tracking-wider mb-2';
    sectionTitle.textContent = q.sectionTitle;
    wrapper.appendChild(sectionTitle);

    // Question Label
    const label = document.createElement('label');
    label.className = 'text-2xl md:text-3xl font-bold text-white mb-6 block leading-tight';
    label.textContent = q.question;
    if (!isOptional(q)) {
      label.innerHTML += ' <span class="text-red-400 text-lg align-top">*</span>';
    }
    wrapper.appendChild(label);

    // Input
    let inputEl;
    const isRequired = !isOptional(q);

    switch (q.type) {
      case 'short_answer':
      case 'email':
      case 'number':
      case 'date':
        if (q.id === 'phone_number') {
          inputEl = document.createElement('div');
          inputEl.className = 'flex gap-3';

          const select = document.createElement('select');
          select.id = 'phone_code';
          select.className = 'form-select w-40 text-lg px-2 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-aurora-accent outline-none text-white cursor-pointer';

          countryCodes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code;
            option.textContent = c.label;
            option.className = 'text-black';
            select.appendChild(option);
          });
          // Set default country code to US/Canada (+1) unless a saved value overrides it
          select.value = '+1';

          const input = document.createElement('input');
          input.type = 'tel';
          input.id = 'phone_number_input';
          input.className = 'form-input flex-1 text-lg px-6 py-4';
          input.placeholder = 'Phone Number';
          if (isRequired) input.required = true;

          // Restore value
          if (formData[q.id]) {
            if (formData[q.id].startsWith('manual:')) {
              select.value = 'manual';
              input.value = formData[q.id].substring(7);
              input.placeholder = 'e.g., +1 234 567 8900';
            } else {
              const parts = formData[q.id].split(' ');
              if (parts.length > 1) {
                select.value = parts[0];
                input.value = parts.slice(1).join(' ');
              } else {
                input.value = formData[q.id];
              }
            }
          }

          // Handle mode switching
          select.addEventListener('change', () => {
            if (select.value === 'manual') {
              input.placeholder = 'e.g., +1 234 567 8900';
              input.value = '';
            } else {
              input.placeholder = 'Phone Number';
              input.value = '';
            }
            input.focus();
          });

          inputEl.appendChild(select);
          inputEl.appendChild(input);

          // Auto-focus
          setTimeout(() => input.focus(), 100);

          // Enter key to next
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleNext();
            }
          });

        } else if (q.id === 'email_address') {
          inputEl = document.createElement('input');
          inputEl.type = 'email';
          inputEl.id = q.id;
          inputEl.name = q.id;
          inputEl.className = 'form-input text-lg px-6 py-4';
          inputEl.placeholder = 'your.email@example.com';
          if (isRequired) inputEl.required = true;
          if (formData[q.id]) inputEl.value = formData[q.id];

          // Auto-focus
          setTimeout(() => inputEl.focus(), 100);

          // Enter key to next
          inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleNext();
            }
          });
        } else {
          inputEl = document.createElement('input');
          inputEl.type = q.type === 'short_answer' ? 'text' : q.type;
          inputEl.id = q.id;
          inputEl.name = q.id;
          inputEl.className = 'form-input text-lg px-6 py-4';
          inputEl.placeholder = 'Type your answer here...';
          if (q.type === 'date') inputEl.placeholder = '';
          if (isRequired) inputEl.required = true;
          // Restore value if exists
          if (formData[q.id]) inputEl.value = formData[q.id];

          // Auto-focus
          setTimeout(() => inputEl.focus(), 100);

          // Enter key to next
          inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleNext();
            }
          });
        }
        break;

      case 'paragraph':
        inputEl = document.createElement('textarea');
        inputEl.id = q.id;
        inputEl.name = q.id;
        inputEl.className = 'form-input min-h-[150px] resize-y text-lg px-6 py-4';
        inputEl.placeholder = 'Type your answer here...';
        if (isRequired) inputEl.required = true;
        if (formData[q.id]) inputEl.value = formData[q.id];
        setTimeout(() => inputEl.focus(), 100);
        break;

      case 'multiple_choice':
        inputEl = document.createElement('div');
        inputEl.className = 'space-y-3 mt-4';
        q.options.forEach(opt => {
          const optWrapper = document.createElement('label');
          optWrapper.className = 'flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-aurora-accent/50 transition-all cursor-pointer group';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = q.id;
          radio.value = opt;
          radio.className = 'form-radio w-5 h-5 text-aurora-accent border-gray-500 focus:ring-aurora-accent bg-transparent';
          if (isRequired) radio.required = true;
          if (formData[q.id] === opt) radio.checked = true;

          const optText = document.createElement('span');
          optText.className = 'ml-4 text-lg text-gray-200 group-hover:text-white transition-colors';
          optText.textContent = opt;

          optWrapper.appendChild(radio);
          optWrapper.appendChild(optText);
          inputEl.appendChild(optWrapper);

          // Click to select
          optWrapper.addEventListener('click', (e) => {
            // If clicking the wrapper, ensure radio is checked (default behavior for label)
            // We can also auto-advance for single choice if desired, but maybe safer to let user click Next
          });
        });
        break;

      case 'checkboxes':
        inputEl = document.createElement('div');
        inputEl.className = 'space-y-3 mt-4';
        q.options.forEach(opt => {
          const optWrapper = document.createElement('label');
          optWrapper.className = 'flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-aurora-accent/50 transition-all cursor-pointer group';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = q.id;
          checkbox.value = opt;
          checkbox.className = 'form-checkbox w-5 h-5 rounded text-aurora-accent border-gray-500 focus:ring-aurora-accent bg-transparent';

          // Check if value was selected
          if (formData[q.id] && formData[q.id].includes(opt)) {
            checkbox.checked = true;
          }

          const optText = document.createElement('span');
          optText.className = 'ml-4 text-lg text-gray-200 group-hover:text-white transition-colors';
          optText.textContent = opt;

          optWrapper.appendChild(checkbox);
          optWrapper.appendChild(optText);
          inputEl.appendChild(optWrapper);
        });
        break;

      case 'linear_scale':
        inputEl = document.createElement('div');
        inputEl.className = 'mt-8';

        const scaleWrapper = document.createElement('div');
        scaleWrapper.className = 'flex justify-between items-center max-w-xl mx-auto';

        for (let i = q.min; i <= q.max; i++) {
          const item = document.createElement('label');
          item.className = 'flex flex-col items-center cursor-pointer group';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = q.id;
          radio.value = i;
          radio.className = 'peer sr-only'; // Hide default radio
          if (isRequired) radio.required = true;
          if (formData[q.id] == i) radio.checked = true;

          const customRadio = document.createElement('div');
          customRadio.className = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-lg font-medium text-gray-400 peer-checked:border-aurora-accent peer-checked:bg-aurora-accent peer-checked:text-white hover:border-white/50 transition-all';
          customRadio.textContent = i;

          item.appendChild(radio);
          item.appendChild(customRadio);
          scaleWrapper.appendChild(item);
        }
        inputEl.appendChild(scaleWrapper);

        const labels = document.createElement('div');
        labels.className = 'flex justify-between text-sm text-gray-400 mt-4 px-2';
        labels.innerHTML = `<span>${q.labels[0]}</span><span>${q.labels[1]}</span>`;
        inputEl.appendChild(labels);
        break;
    }

    if (inputEl) {
      wrapper.appendChild(inputEl);
      questionContainer.appendChild(wrapper);
    }

    // Fade in
    requestAnimationFrame(() => {
      questionContainer.style.opacity = '1';
      questionContainer.style.transform = 'translateY(0)';
    });

  }, 300); // Wait for fade out

  updateProgress();
  updateButtons();
}

function renderReview() {
  setTimeout(() => {
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full space-y-8';

    const title = document.createElement('h2');
    title.className = 'text-3xl font-bold text-white mb-6 text-center';
    title.textContent = 'Review Your Answers';
    wrapper.appendChild(title);

    const list = document.createElement('div');
    list.className = 'space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar';

    allQuestions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'bg-white/5 rounded-xl p-6 border border-white/10';

      const qTitle = document.createElement('h4');
      qTitle.className = 'text-aurora-accent text-sm font-bold uppercase tracking-wider mb-2';
      qTitle.textContent = q.sectionTitle;

      const qLabel = document.createElement('p');
      qLabel.className = 'text-lg font-medium text-white mb-2';
      qLabel.textContent = q.question;

      const answer = document.createElement('div');
      answer.className = 'text-gray-300';

      let val = formData[q.id];

      // Clean up manual phone entry for display
      if (q.id === 'phone_number' && typeof val === 'string' && val.startsWith('manual:')) {
        val = val.substring(7);
      }

      if (Array.isArray(val)) {
        answer.textContent = val.length ? val.join(', ') : 'No selection';
      } else {
        answer.textContent = val || 'Not answered';
      }

      // Edit Button
      const editBtn = document.createElement('button');
      editBtn.className = 'text-xs text-gray-500 hover:text-white mt-2 underline';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => {
        currentQuestionIndex = idx;
        renderQuestion(currentQuestionIndex);
        saveToStorage();
      };

      item.appendChild(qTitle);
      item.appendChild(qLabel);
      item.appendChild(answer);
      item.appendChild(editBtn);
      list.appendChild(item);
    });

    wrapper.appendChild(list);
    questionContainer.appendChild(wrapper);

    requestAnimationFrame(() => {
      questionContainer.style.opacity = '1';
      questionContainer.style.transform = 'translateY(0)';
    });

    updateProgress();
    updateButtons();
  }, 300);
}

// Store form data
const formData = savedData.formData || {};

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    formData,
    currentIndex: currentQuestionIndex
  }));
}

function saveCurrentAnswer() {
  const q = allQuestions[currentQuestionIndex];
  const inputs = document.getElementsByName(q.id);

  if (q.type === 'checkboxes') {
    const values = [];
    inputs.forEach(input => {
      if (input.checked) values.push(input.value);
    });
    formData[q.id] = values;
  } else if (q.type === 'multiple_choice' || q.type === 'linear_scale') {
    inputs.forEach(input => {
      if (input.checked) formData[q.id] = input.value;
    });
  } else if (q.id === 'phone_number') {
    const code = document.getElementById('phone_code').value;
    const num = document.getElementById('phone_number_input').value;
    if (code === 'manual') {
      formData[q.id] = `manual:${num}`;
    } else {
      formData[q.id] = `${code} ${num}`;
    }
  } else {
    if (inputs[0]) formData[q.id] = inputs[0].value;
  }
}

function validateCurrent() {
  const q = allQuestions[currentQuestionIndex];
  if (isOptional(q)) return true;

  const inputs = document.getElementsByName(q.id);
  let isValid = false;
  let errorMessage = 'This field is required.';

  // Remove any existing error message
  const existingError = questionContainer.querySelector('.error-message');
  if (existingError) existingError.remove();

  if (q.type === 'checkboxes' || q.type === 'multiple_choice' || q.type === 'linear_scale') {
    inputs.forEach(input => {
      if (input.checked) isValid = true;
    });
  } else if (q.id === 'phone_number') {
    const code = document.getElementById('phone_code');
    const num = document.getElementById('phone_number_input');

    if (num && num.value.trim() !== '') {
      if (code.value === 'manual') {
        // For manual entry, just check if it starts with + and has reasonable length
        const manualPhone = num.value.trim();
        if (manualPhone.startsWith('+') && manualPhone.length >= 10) {
          isValid = true;
        } else {
          errorMessage = 'Please enter a valid phone number starting with + (e.g., +1 234 567 8900)';
        }
      } else {
        // For country code selection, validate 10 digits
        const phoneDigits = num.value.replace(/\D/g, ''); // Remove non-digits
        if (phoneDigits.length === 10) {
          isValid = true;
        } else if (phoneDigits.length > 0) {
          errorMessage = `Please enter exactly 10 digits (you entered ${phoneDigits.length})`;
        } else {
          errorMessage = 'Please enter your phone number';
        }
      }
    } else {
      errorMessage = 'Please enter your phone number';
    }
  } else if (q.id === 'email_address') {
    const emailInput = inputs[0];
    if (emailInput && emailInput.value.trim() !== '') {
      // RFC 5322 compliant email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (emailRegex.test(emailInput.value.trim())) {
        isValid = true;
      } else {
        errorMessage = 'Please enter a valid email address (e.g., name@example.com)';
      }
    } else {
      errorMessage = 'Please enter your email address';
    }
  } else {
    if (inputs[0] && inputs[0].value.trim() !== '') isValid = true;
  }

  if (!isValid) {
    // Show error message
    const wrapper = questionContainer.firstElementChild;
    wrapper.classList.add('animate-shake');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-400 text-sm mt-2 font-medium';
    errorDiv.textContent = errorMessage;

    // Insert error after the label
    const label = wrapper.querySelector('label');
    if (label) {
      label.parentNode.insertBefore(errorDiv, label.nextSibling);
    } else {
      wrapper.insertBefore(errorDiv, wrapper.firstChild.nextSibling);
    }

    setTimeout(() => wrapper.classList.remove('animate-shake'), 500);
    return false;
  }
  return true;
}

function isOptional(q) {
  return q.question.toLowerCase().includes('(if any)') || q.id === 'additional_notes';
}

function handleNext() {
  // If on review page, do nothing (submit handled by form submit)
  if (currentQuestionIndex === allQuestions.length) return;

  if (!validateCurrent()) return;
  saveCurrentAnswer();

  if (currentQuestionIndex < allQuestions.length) {
    currentQuestionIndex++;
    history.pushState({ index: currentQuestionIndex }, '', '');
    renderQuestion(currentQuestionIndex);
    saveToStorage();
  }
}

function handlePrev() {
  if (currentQuestionIndex > 0) {
    saveCurrentAnswer(); // Save partial work
    currentQuestionIndex--;
    history.pushState({ index: currentQuestionIndex }, '', '');
    renderQuestion(currentQuestionIndex);
    saveToStorage();
  }
}

function updateProgress() {
  const progress = ((currentQuestionIndex) / allQuestions.length) * 100;
  progressBar.style.width = `${Math.min(progress, 100)}%`;

  if (currentQuestionIndex === allQuestions.length) {
    progressText.textContent = 'Review';
    stepIndicator.textContent = 'Final Step';
  } else {
    progressText.textContent = `${Math.round(progress)}% completed`;
    stepIndicator.textContent = `Step ${currentQuestionIndex + 1} of ${allQuestions.length}`;
  }
}

function updateButtons() {
  if (currentQuestionIndex === 0) {
    prevBtn.classList.add('opacity-0', 'pointer-events-none');
  } else {
    prevBtn.classList.remove('opacity-0', 'pointer-events-none');
  }

  const nextButtonText = nextBtn.childNodes[0]; // Text node

  if (currentQuestionIndex === allQuestions.length) {
    // On Review Page
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else if (currentQuestionIndex === allQuestions.length - 1) {
    // On Last Question
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
    nextButtonText.textContent = 'Review ';
  } else {
    // Normal Question
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
    nextButtonText.textContent = 'Next ';
  }
}

nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);

// Initial Render
renderQuestion(currentQuestionIndex);

// Add shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
`;
document.head.appendChild(style);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // If not on review page, don't submit
  if (currentQuestionIndex !== allQuestions.length) return;

  // Show loading state
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Submitting...
  `;

  // Clear existing hidden inputs (except the default ones)
  const existingHidden = form.querySelectorAll('input[type="hidden"]:not([name^="_"])');
  existingHidden.forEach(el => el.remove());

  // Create hidden inputs for all data in correct order
  allQuestions.forEach(q => {
    let value = formData[q.id];

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = q.id;

    // Clean up manual phone entry prefix
    if (q.id === 'phone_number' && typeof value === 'string' && value.startsWith('manual:')) {
      value = value.substring(7);
    }

    if (Array.isArray(value)) {
      // For checkboxes, send as comma-separated string
      input.value = value.length > 0 ? value.join(', ') : '-';
    } else {
      // Send '-' for unanswered optional questions to maintain order in email
      input.value = (value !== undefined && value !== null && value !== '') ? value : '-';
    }

    form.appendChild(input);
  });

  // Submit via Fetch
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = '/thank-you.html';
      } else {
        throw new Error('Submission failed');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error submitting the form. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    });
});

// Prevent form submission on Enter key for radio/checkboxes and navigate instead
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.target.type === 'radio' || e.target.type === 'checkbox')) {
    e.preventDefault();
    handleNext();
  }
});
