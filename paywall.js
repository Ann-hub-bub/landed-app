function payOpen(e) {
  if (e) e.preventDefault();
  var overlay = document.getElementById('payOverlay');
  document.getElementById('payForm').classList.add('active');
  document.getElementById('payLoading').classList.remove('active');
  document.getElementById('paySuccess').classList.remove('active');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() { document.getElementById('fmPosition').focus(); }, 300);
}

function payClose() {
  document.getElementById('payOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function paySubmit() {
  var phone = document.getElementById('fmPosition').value.trim();
  if (!phone) { document.getElementById('fmPosition').focus(); return; }
  fetch('https://script.google.com/macros/s/AKfycbyP0O7xn4wW_ii3INRgC60uvZtjPPuyxwOL-5fYIIZ2iu7e_laQ0AiIJyxdTaDdQE7KOg/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ phone: phone })
  }).catch(function() {});
  document.getElementById('payForm').classList.remove('active');
  document.getElementById('payLoading').classList.add('active');
  setTimeout(function() {
    document.getElementById('payLoading').classList.remove('active');
    document.getElementById('paySuccess').classList.add('active');
  }, 2000);
}

(function() {
  document.body.insertAdjacentHTML('beforeend', `
<div class="pay-overlay" id="payOverlay" role="dialog" aria-modal="true">
  <div class="pay-box">
    <button class="pay-close" onclick="payClose()" aria-label="Close">&times;</button>
    <div class="pay-screen active" id="payForm">
      <div class="pay-kicker">Secure checkout</div>
      <h3>Prepare for departure.</h3>
      <p class="pay-sub">$20/mo — cancel any tide. We'll confirm your spot and send the link to get started.</p>
      <div class="pay-field">
        <label for="fmPosition">Phone number</label>
        <input type="tel" id="fmPosition" placeholder="+1 (555) 000-0000" autocomplete="tel" />
      </div>
      <button class="pay-submit" id="demoSubmit" onclick="paySubmit()">Complete purchase &nbsp;→</button>
      <div class="pay-trust"><b>30-day offer guarantee.</b> No offer, full refund. One click — no support call.</div>
    </div>
    <div class="pay-screen" id="payLoading">
      <div class="pay-loading">
        <div class="pay-spinner"></div>
        <p>Securing your spot on the crew&hellip;</p>
      </div>
    </div>
    <div class="pay-screen" id="paySuccess">
      <div class="pay-success">
        <div class="pay-icon">&#9875;</div>
        <h3>Yer aboard, mate.</h3>
        <p>We want to know more about you so Cap'n Jack can hit the ground running. Book a quick 15-min call — we'll set up your pipeline together.</p>
        <a class="pay-calendly-btn" href="https://calendly.com/aboytsova9/coffee-break" target="_blank" rel="noopener">Book your onboarding call &nbsp;→</a>
      </div>
    </div>
  </div>
</div>`);

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
