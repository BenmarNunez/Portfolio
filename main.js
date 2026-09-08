// nav toggle/active-state, scroll-reveal, form validation — added in later tasks

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(form) {
  const errors = {};
  const name = form.elements['name'].value.trim();
  const email = form.elements['email'].value.trim();
  const message = form.elements['message'].value.trim();

  if (!name) errors.name = 'Name is required.';
  if (!email) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!message) errors.message = 'Message is required.';

  return errors;
}

function showFormErrors(errors) {
  ['name', 'email', 'message'].forEach((field) => {
    const el = document.getElementById(`${field}-error`);
    el.textContent = errors[field] || '';
    contactForm.elements[field].setAttribute('aria-invalid', String(Boolean(errors[field])));
  });
}

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validateContactForm(contactForm);
    showFormErrors(errors);
    const firstInvalidField = ['name', 'email', 'message'].find((field) => errors[field]);
    if (firstInvalidField) {
      contactForm.elements[firstInvalidField].focus();
      return;
    }

    formStatus.textContent = 'Sending...';
    formStatus.className = '';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        formStatus.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
        formStatus.className = 'success';
        contactForm.reset();
      } else {
        formStatus.textContent = 'Something went wrong. Please email me directly instead.';
        formStatus.className = 'error';
      }
    } catch (err) {
      formStatus.textContent = 'Network error. Please email me directly instead.';
      formStatus.className = 'error';
    }
  });
}
