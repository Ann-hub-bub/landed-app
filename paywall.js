var __scrollLockCount = 0;
function lockBodyScroll() {
  if (__scrollLockCount === 0) {
    // html also needs overflow:hidden here: the site's `html,body{overflow-x:hidden}`
    // rule stops browsers from letting body's overflow control page scroll on its own.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }
  __scrollLockCount++;
}
function unlockBodyScroll() {
  __scrollLockCount = Math.max(0, __scrollLockCount - 1);
  if (__scrollLockCount === 0) {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }
}

// Calendly's popup widget injects/removes .calendly-overlay itself;
// there's no public open/close callback, so watch the DOM for it.
new MutationObserver(function(mutations) {
  for (var i = 0; i < mutations.length; i++) {
    var m = mutations[i];
    for (var j = 0; j < m.addedNodes.length; j++) {
      var n = m.addedNodes[j];
      if (n.nodeType === 1 && n.classList && n.classList.contains('calendly-overlay')) {
        lockBodyScroll();
      }
    }
    for (var k = 0; k < m.removedNodes.length; k++) {
      var r = m.removedNodes[k];
      if (r.nodeType === 1 && r.classList && r.classList.contains('calendly-overlay')) {
        unlockBodyScroll();
      }
    }
  }
}).observe(document.body, { childList: true });

function payOpen(e) {
  if (e) e.preventDefault();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'step5_contact_form_open', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'payOpen' });
  var overlay = document.getElementById('payOverlay');
  document.getElementById('payFormPane').classList.add('active');
  document.getElementById('payPaymentPane').classList.remove('active');
  document.getElementById('paySuccessPane').classList.remove('active');
  document.getElementById('payProcessing').classList.remove('show');
  overlay.classList.add('open');
  lockBodyScroll();
  setTimeout(function() { document.getElementById('payNameInput').focus(); }, 300);
}

function payClose() {
  document.getElementById('payOverlay').classList.remove('open');
  unlockBodyScroll();
}

function paySubmit() {
  var phone = document.getElementById('payPhoneInput').value.trim();
  var name = document.getElementById('payNameInput').value.trim();
  if (phone.length < 5) {
    document.getElementById('payPhoneInput').classList.add('err');
    document.getElementById('payPhoneErr').classList.add('show');
    document.getElementById('payPhoneInput').focus();
    return;
  }
  document.getElementById('payPhoneInput').classList.remove('err');
  document.getElementById('payPhoneErr').classList.remove('show');

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'step6_lead_contact_submitted', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'payOpen' });

  fetch('https://script.google.com/macros/s/AKfycbyP0O7xn4wW_ii3INRgC60uvZtjPPuyxwOL-5fYIIZ2iu7e_laQ0AiIJyxdTaDdQE7KOg/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ email: name, phone: phone })
  }).catch(function() {});

  document.getElementById('payOverlay').dataset.name = name;
  document.getElementById('payOverlay').dataset.phone = phone;
  document.getElementById('payDoneName').textContent = name ? name + '.' : 'Captain.';
  document.getElementById('payDonePhone').textContent = phone;
  document.getElementById('payFormPane').classList.remove('active');
  document.getElementById('payPaymentPane').classList.add('active');
}

function payPay(method) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'step7_payment_method_selected', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'payOpen', method: method });
  document.getElementById('payPtext').textContent = method === 'card'
    ? 'Taking you to secure checkout…'
    : 'Confirming payment…';
  document.getElementById('payProcessing').classList.add('show');

  var overlay = document.getElementById('payOverlay');
  fetch('https://script.google.com/macros/s/AKfycbyP0O7xn4wW_ii3INRgC60uvZtjPPuyxwOL-5fYIIZ2iu7e_laQ0AiIJyxdTaDdQE7KOg/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ email: overlay.dataset.name, phone: overlay.dataset.phone, plan: 'landed_monthly', amount: 2000 })
  }).catch(function() {});

  setTimeout(function() {
    document.getElementById('payPaymentPane').classList.remove('active');
    document.getElementById('payProcessing').classList.remove('show');
    document.getElementById('paySuccessPane').classList.add('active');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'step8_trial_success_shown', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'payOpen' });
  }, 1600);
}

(function() {
  document.body.insertAdjacentHTML('beforeend', `
<div class="pay-overlay" id="payOverlay" role="dialog" aria-modal="true" aria-labelledby="payHeadline">
  <div class="pay-box">
    <div class="pay-accent"></div>
    <button class="pay-close" onclick="payClose()" aria-label="Close">&#x2715;</button>

    <div class="pay-pane active" id="payFormPane">
      <div class="pay-body">
        <div class="pay-who">
          <div class="av"><img src="joe-bone-bust.svg" alt="Joe" /></div>
          <div class="bubble">&ldquo;Give me a name and a number, matey &mdash; I&rsquo;ll take it from here.&rdquo;</div>
        </div>
        <div class="pay-kicker">Get hired</div>
        <h3 id="payHeadline">A couple of details.</h3>
        <div class="pay-field">
          <label for="payNameInput">Your name</label>
          <input type="text" id="payNameInput" placeholder="First name" autocomplete="given-name" />
        </div>
        <div class="pay-field">
          <label for="payPhoneInput">Phone number</label>
          <input type="tel" id="payPhoneInput" placeholder="+1 (555) 000-0000" autocomplete="tel" aria-describedby="payPhoneErr" />
          <div class="pay-err-msg" id="payPhoneErr" aria-live="polite">Enter a phone number so the crew can reach you.</div>
        </div>
        <button class="pay-submit" id="paySubmitBtn" onclick="paySubmit()">Sign up &nbsp;&rarr;</button>
      </div>
    </div>

    <div class="pay-pane" id="payPaymentPane">
      <div class="pay-body">
        <div class="pay-kicker">Get hired</div>
        <h3>Lock in your trial.</h3>
        <div class="ch-line"><span>Landed, monthly</span><span>$20.00</span></div>
        <div class="ch-total" style="margin-bottom:22px;"><span class="ch-lab">Due today</span><span class="ch-amt">$20<small>/mo</small></span></div>
        <div class="ch-express">
          <button class="ch-btn-applepay" onclick="payPay('applepay')">Apple Pay</button>
          <button class="ch-btn-gpay" onclick="payPay('gpay')">Google Pay</button>
        </div>
        <div class="ch-divider">or pay by card</div>
        <button class="ch-btn-card" onclick="payPay('card')">Credit or debit card &nbsp;&rarr;</button>
        <div class="ch-card-note"><span class="ch-lk">&#x1F512;</span><span>You&rsquo;ll enter your card on <b>Stripe&rsquo;s</b> secure checkout. We never see or store your card number.</span></div>
      </div>
    </div>

    <div class="ch-processing" id="payProcessing">
      <div class="ch-spinner"></div>
      <div class="ch-ptext" id="payPtext">Taking you to secure checkout&hellip;</div>
      <div class="ch-psub">&#x1F512; Powered by Stripe</div>
    </div>

    <div class="pay-pane" id="paySuccessPane">
      <div class="pay-success-wrap">
        <img class="joe-hero" src="joe-bone-salute.svg" alt="Joe salutes" />
        <div class="pay-badge">You&rsquo;re aboard</div>
        <h3>Welcome, <em id="payDoneName">Captain.</em></h3>
        <p>Your trial&rsquo;s live. We&rsquo;ll text <b id="payDonePhone">your number</b> within <b>24 hours</b> to set your course.</p>
        <div class="pay-next">
          <div class="row"><span class="n">1</span><span class="t"><b>A recruiter reaches out</b> &mdash; within 24 hours, by text.</span></div>
          <div class="row"><span class="n">2</span><span class="t"><b>We build your shortlist</b> &mdash; roles matched to your profile.</span></div>
          <div class="row"><span class="n">3</span><span class="t"><b>You start applying</b> &mdash; one tap per role.</span></div>
        </div>
        <button class="pay-submit" onclick="window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'step9_calendly_popup_open',popup_source:'onboarding'});Calendly.initPopupWidget({url:'https://calendly.com/aboytsova9/coffee-break'})">Book your onboarding call &nbsp;&rarr;</button>
      </div>
    </div>
  </div>
</div>`);

  document.getElementById('payPhoneInput').addEventListener('input', function() {
    this.classList.remove('err');
    document.getElementById('payPhoneErr').classList.remove('show');
  });

  document.getElementById('payNameInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('payPhoneInput').focus();
  });

  document.getElementById('payPhoneInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') paySubmit();
  });

  document.getElementById('payOverlay').addEventListener('click', function(e) {
    if (e.target === this) payClose();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') payClose();
  });

  if (new URLSearchParams(location.search).get('pour') === '1') {
    setTimeout(payOpen, 500);
  }
})();
