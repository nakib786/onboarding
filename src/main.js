import './style.css'
import questionsData from './questions.json'
import { initDarkVeil } from './DarkVeil.js';

// --- Dark Veil Background ---
const canvasContainer = document.getElementById('canvas-container');
initDarkVeil(canvasContainer, {
  speed: 0.5
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

const allQuestions = [];

// Flatten questions
questionsData.sections.forEach(section => {
  section.questions.forEach(q => {
    allQuestions.push({ ...q, sectionTitle: section.title });
  });
});

const countryCodes = [
  { code: '+1', label: '🇺🇸/🇨🇦 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+52', label: '🇲🇽 +52' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+7', label: '🇷🇺 +7' },
  { code: '+27', label: '🇿🇦 +27' },
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
          select.className = 'form-select w-32 text-lg px-2 py-4 bg-white/5 border border-white/10 rounded-lg focus:border-aurora-accent outline-none text-white cursor-pointer';

          countryCodes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code;
            option.textContent = c.label;
            option.className = 'text-black';
            select.appendChild(option);
          });

          const input = document.createElement('input');
          input.type = 'tel';
          input.id = 'phone_number_input';
          input.className = 'form-input flex-1 text-lg px-6 py-4';
          input.placeholder = 'Phone Number';
          if (isRequired) input.required = true;

          // Restore value
          if (formData[q.id]) {
            const parts = formData[q.id].split(' ');
            if (parts.length > 1) {
              select.value = parts[0];
              input.value = parts.slice(1).join(' ');
            } else {
              input.value = formData[q.id];
            }
          }

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
        inputEl.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4';
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

      const val = formData[q.id];
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
    formData[q.id] = `${code} ${num}`;
  } else {
    if (inputs[0]) formData[q.id] = inputs[0].value;
  }
}

function validateCurrent() {
  const q = allQuestions[currentQuestionIndex];
  if (isOptional(q)) return true;

  const inputs = document.getElementsByName(q.id);
  let isValid = false;

  if (q.type === 'checkboxes' || q.type === 'multiple_choice' || q.type === 'linear_scale') {
    inputs.forEach(input => {
      if (input.checked) isValid = true;
    });
  } else if (q.id === 'phone_number') {
    const num = document.getElementById('phone_number_input');
    if (num && num.value.trim() !== '') isValid = true;
  } else {
    if (inputs[0] && inputs[0].value.trim() !== '') isValid = true;
  }

  if (!isValid) {
    // Show error
    const wrapper = questionContainer.firstElementChild;
    wrapper.classList.add('animate-shake');
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
renderQuestion(0);

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
    const value = formData[q.id];

    if (Array.isArray(value)) {
      value.forEach(v => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = q.id;
        input.value = v;
        form.appendChild(input);
      });
    } else {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = q.id;
      // Send '-' for unanswered optional questions to maintain order in email
      input.value = (value !== undefined && value !== null && value !== '') ? value : '-';
      form.appendChild(input);
    }
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
