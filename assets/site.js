(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  const menu = document.getElementById('mobileNav');
  const menuButton = document.querySelector('.hamburger');

  // Native modal: closed links are neither visible nor keyboard-focusable.
  menuButton.addEventListener('click', () => {
    if (menu.open) { menu.close(); return; }
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close navigation');
    document.body.classList.add('menu-open');
  });
  menu.querySelector('.mobile-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches && menu.open) menu.close();
  });

  // Progressive enhancement: all layouts remain readable if JavaScript is off.
  const tabList = document.querySelector('.unit-tabs');
  const tabs = [...tabList.querySelectorAll('.unit-tab')];
  const panels = tabs.map(button => document.getElementById(button.dataset.panel));
  const selectTab = index => {
    tabs.forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  };
  tabList.setAttribute('role', 'tablist');
  tabs.forEach((button, index) => {
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', button.id);
    panels[index].tabIndex = 0;
    button.addEventListener('click', () => selectTab(index));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    });
  });
  selectTab(0);
  tabList.hidden = false;

  // Closed FAQ answers are truly hidden, not just clipped to zero height.
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    button.type = 'button';
    button.id = `faq-question-${index}`;
    answer.id = `faq-answer-${index}`;
    button.setAttribute('aria-controls', answer.id);
    answer.setAttribute('aria-labelledby', button.id);
    answer.hidden = true;
    button.addEventListener('click', () => {
      const open = answer.hidden;
      answer.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      item.classList.toggle('open', open);
    });
  });

  // Analytics is optional and never changes the outcome of a submitted enquiry.
  const track = (name, data = {}) => {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, data); } catch { /* optional */ }
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', name, data); } catch { /* optional */ }
  };
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => track('whatsapp_enquiry', { placement: link.closest('.unit-card') ? 'unit' : 'general' }));
  });

  const step1 = document.getElementById('enquiryStep1');
  const step2 = document.getElementById('enquiryStep2');
  const next = document.getElementById('enquiryNext');
  const back = document.getElementById('enquiryBack');
  const submit = document.getElementById('submitBtn');
  const progress = form.querySelector('.form-progress');
  const summary = document.getElementById('enquirySummary');
  const status = document.getElementById('formStatus');
  const statusText = document.getElementById('formStatusText');
  const fallback = document.getElementById('formFallback');
  const success = document.getElementById('enquirySuccess');
  const fields = {
    unit: document.getElementById('enquiryUnit'),
    name: document.getElementById('enquiryName'),
    phone: document.getElementById('enquiryPhone'),
    email: document.getElementById('enquiryEmail')
  };
  let currentStep = 1;
  let submitting = false;
  let completed = false;

  const params = new URLSearchParams(location.search);
  const attribution = { source_url: location.origin + location.pathname };
  ['source', 'medium', 'campaign', 'content'].forEach(key => {
    attribution[`utm_${key}`] = (params.get(`utm_${key}`) || '').slice(0, 160);
  });
  const restoreAttribution = () => {
    Object.entries(attribution).forEach(([name, value]) => { form.elements.namedItem(name).value = value; });
  };
  const showStatus = (message, kind = 'pending') => {
    status.hidden = false;
    status.dataset.kind = kind;
    status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    statusText.textContent = message;
    fallback.hidden = kind !== 'error';
  };
  const showStep = (number, moveFocus = true) => {
    currentStep = number;
    step1.hidden = number !== 1;
    step2.hidden = number !== 2;
    [...progress.children].forEach((item, i) => {
      if (i + 1 === number) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    summary.textContent = fields.unit.value;
    summary.hidden = !fields.unit.value;
    if (moveFocus) {
      document.getElementById(`step${number}Heading`).focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  };
  const validationMessage = key => {
    const value = fields[key].value.trim();
    if (key === 'unit' && !value) return 'Choose a layout, or select “Help me choose”.';
    if (key === 'name' && value.length < 2) return 'Please enter your name (at least two characters).';
    if (key === 'phone') {
      const digitCount = value.replace(/\D/g, '').length;
      if (!/^[+\d\s().-]+$/.test(value) || digitCount < 7 || digitCount > 15) return 'Enter a valid phone number, including your country code if outside Kenya.';
    }
    if (key === 'email' && value && !fields.email.validity.valid) return 'Please enter a valid email address, or leave it empty.';
    return '';
  };
  const setFieldError = (key, message) => {
    const error = document.getElementById(`${key}Error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) fields[key].setAttribute('aria-invalid', 'true');
    else fields[key].removeAttribute('aria-invalid');
  };
  const validate = keys => {
    let firstInvalid;
    keys.forEach(key => {
      const message = validationMessage(key);
      setFieldError(key, message);
      if (message && !firstInvalid) firstInvalid = fields[key];
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };
  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') setFieldError(key, validationMessage(key));
    });
  });
  const resetEnquiry = () => {
    form.reset();
    restoreAttribution();
    completed = false;
    success.hidden = true;
    progress.hidden = false;
    status.hidden = true;
    form.querySelector('.enquiry-message').open = false;
    Object.keys(fields).forEach(key => setFieldError(key, ''));
    showStep(1);
  };
  next.addEventListener('click', () => {
    if (validate(['unit', 'name', 'phone'])) showStep(2);
  });
  back.addEventListener('click', () => { if (!submitting) showStep(1); });
  document.getElementById('newEnquiry').addEventListener('click', resetEnquiry);

  // Unit and project-info links carry the visitor's selection into the form.
  document.querySelectorAll('[data-unit], [data-next-step]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (!submitting) {
        if (completed) resetEnquiry();
        if (link.dataset.unit) fields.unit.value = link.dataset.unit;
        if (link.dataset.nextStep) document.getElementById('enquiryAction').value = link.dataset.nextStep;
        showStep(currentStep);
      }
      form.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || completed) return;
    if (currentStep === 1) {
      if (validate(['unit', 'name', 'phone'])) showStep(2);
      return; // Enter in step one must never submit an incomplete request.
    }
    if (['unit', 'name', 'phone'].some(key => validationMessage(key))) {
      showStep(1);
      validate(['unit', 'name', 'phone']);
      return;
    }
    if (!validate(['email'])) return;
    if (form.elements.namedItem('_gotcha').value) {
      showStatus('Unable to send this enquiry. Please contact the sales team directly.', 'error');
      return;
    }

    restoreAttribution();
    const payload = new FormData(form);
    ['name', 'phone', 'email'].forEach(key => payload.set(key, fields[key].value.trim()));
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    back.disabled = true;
    step2.disabled = true;
    submit.textContent = 'Sending your enquiry…';
    showStatus('Sending your request securely…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: payload, headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok) throw new Error('Enquiry service did not accept the request.');
      completed = true;
      status.hidden = true;
      step1.hidden = true;
      step2.hidden = true;
      progress.hidden = true;
      document.getElementById('successMessage').textContent = `The sales team has your request for ${fields.unit.value} and can contact you about availability and your next step.`;
      success.hidden = false;
      success.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: 'auto' });
      track('generate_lead', { form_name: 'property_enquiry' });
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'This is taking longer than expected. We could not confirm delivery. Your details are still here. Check with sales on WhatsApp before retrying to avoid a duplicate enquiry.'
        : 'We couldn’t confirm delivery. Your details are still here. Please try again or contact sales on WhatsApp.';
      showStatus(message, 'error');
      status.focus();
    } finally {
      clearTimeout(timeout);
      submitting = false;
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      back.disabled = false;
      step2.disabled = false;
      submit.textContent = 'Send my enquiry →';
    }
  });

  restoreAttribution();
  form.noValidate = true;
  form.classList.add('is-enhanced');
  progress.hidden = false;
  document.getElementById('step1Actions').hidden = false;
  back.hidden = false;
  showStep(1, false);
})();
