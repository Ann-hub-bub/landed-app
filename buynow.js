function buyNowOpen(e) {
  if (e) e.preventDefault();
  var overlay = document.getElementById('chOverlay');
  document.getElementById('chCheckout').style.display = '';
  document.getElementById('chProcessing').classList.remove('show');
  document.getElementById('chSuccess').classList.remove('show');
  overlay.classList.add('open');
  lockBodyScroll();
  setTimeout(function() { document.getElementById('chNameInput').focus(); }, 300);
}

function buyNowClose() {
  document.getElementById('chOverlay').classList.remove('open');
  unlockBodyScroll();
}

function buyNowPay(method) {
  var phone = document.getElementById('chPhoneInput').value.trim();
  var name = document.getElementById('chNameInput').value.trim();
  if (phone.length < 5) {
    document.getElementById('chPhoneInput').classList.add('err');
    document.getElementById('chPhoneInput').focus();
    return;
  }
  document.getElementById('chPhoneInput').classList.remove('err');

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'step2_sign_up_click', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'buyNowOpen', method: method });
  window.dataLayer.push({ event: 'step3_payment_method_click', entry_type: sessionStorage.getItem('landed_entry_type') || 'unknown', form_type: 'buyNowOpen', method: method });
  window.clarityEvent && window.clarityEvent('step2_sign_up_click');
  window.clarityEvent && window.clarityEvent('step3_payment_method_click');

  fetch('https://script.google.com/macros/s/AKfycbyP0O7xn4wW_ii3INRgC60uvZtjPPuyxwOL-5fYIIZ2iu7e_laQ0AiIJyxdTaDdQE7KOg/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ email: name, phone: phone, plan: 'landed_monthly', amount: 2000 })
  }).catch(function() {});

  // Keep the checkout visible so the modal keeps its height — the processing
  // overlay sits on top of it; hiding it early collapses the box to a 2px line.
  document.getElementById('chPtext').textContent = method === 'card'
    ? 'Taking you to secure checkout…'
    : 'Confirming payment…';
  document.getElementById('chProcessing').classList.add('show');

  setTimeout(function() {
    document.getElementById('chCheckout').style.display = 'none';
    document.getElementById('chProcessing').classList.remove('show');
    document.getElementById('chSuccess').classList.add('show');
  }, 1600);
}

(function() {
  document.body.insertAdjacentHTML('beforeend', `
<div class="ch-overlay" id="chOverlay" role="dialog" aria-modal="true" aria-label="Checkout">
  <div class="ch-box">
    <button class="ch-close" onclick="buyNowClose()" aria-label="Close">&#x2715;</button>

    <div class="ch-checkout" id="chCheckout">
      <div class="ch-summary">
        <div class="ch-plan">One plan &middot; get hired</div>
        <h3>Landed &mdash; full crew</h3>
        <div class="ch-plan-sub">Everything, until you land the offer.</div>
        <div class="ch-vals">
          <div class="ch-val"><span class="ch-m">&#x2713;</span><span class="ch-t"><b>100+ applications/week</b> in your voice</span></div>
          <div class="ch-val"><span class="ch-m">&#x2713;</span><span class="ch-t"><b>Resume rewritten</b> for every role</span></div>
          <div class="ch-val"><span class="ch-m">&#x2713;</span><span class="ch-t"><b>Recruiters chased</b> on day 2</span></div>
          <div class="ch-val"><span class="ch-m">&#x2713;</span><span class="ch-t"><b>You approve</b> every send</span></div>
        </div>
        <div class="ch-rule"></div>
        <div class="ch-line"><span>Landed, monthly</span><span>$20.00</span></div>
        <div class="ch-line ch-free"><span>30-day guarantee</span><span>included</span></div>
        <div class="ch-total">
          <span class="ch-lab">Due today</span>
          <span class="ch-amt">$20<small>/mo</small></span>
        </div>
      </div>

      <div class="ch-pay-side">
        <h2>Checkout</h2>
        <div class="ch-sub">Where do we send your applications &amp; updates?</div>
        <div class="ch-contact">
          <div class="ch-fld">
            <label class="ch-field-lab" for="chNameInput">Your name</label>
            <input class="ch-field" id="chNameInput" placeholder="First name" autocomplete="given-name" />
          </div>
          <div class="ch-fld">
            <label class="ch-field-lab" for="chPhoneInput">Phone number</label>
            <input class="ch-field" id="chPhoneInput" type="tel" placeholder="+1 (555) 000-0000" autocomplete="tel" />
          </div>
        </div>
        <div class="ch-sub" style="margin-bottom:16px;">Then pick how to pay &mdash; card details are entered on Stripe&rsquo;s secure page, never stored by Landed.</div>
        <div class="ch-express">
          <button class="ch-btn-applepay" onclick="buyNowPay('applepay')">Apple Pay</button>
          <button class="ch-btn-gpay" onclick="buyNowPay('gpay')">Google Pay</button>
        </div>
        <div class="ch-divider">or pay by card</div>
        <button class="ch-btn-card" onclick="buyNowPay('card')">Credit or debit card &nbsp;&rarr;</button>
        <div class="ch-card-note"><span class="ch-lk">&#x1F512;</span><span>You&rsquo;ll enter your card on <b>Stripe&rsquo;s</b> secure checkout. We never see or store your card number.</span></div>
        <div class="ch-micro"><b>Cancel anytime</b><span class="ch-dot"></span>30-day refund<span class="ch-dot"></span><b>1,247</b> hired in &lsquo;25</div>
      </div>
    </div>

    <div class="ch-processing" id="chProcessing">
      <div class="ch-spinner"></div>
      <div class="ch-ptext" id="chPtext">Taking you to secure checkout&hellip;</div>
      <div class="ch-psub">&#x1F512; Powered by Stripe</div>
    </div>

    <div class="ch-success" id="chSuccess">
      <img class="ch-joe-hero" src="joe-bone-salute.svg" alt="Joe salutes" />
      <div class="ch-badge">Tab settled</div>
      <h2>You&rsquo;re <em>in.</em></h2>
      <p>Payment confirmed. Cap&rsquo;n Joe and the crew start the hunt now &mdash; first applications go out within <b>24 hours</b>.</p>
      <div class="ch-receipt">
        <div class="ch-r-l"><b>Landed &mdash; full crew</b>Receipt emailed &middot; renews monthly</div>
        <div class="ch-r-a">$20<small>/mo</small></div>
      </div>
      <div class="ch-next">
        <div class="ch-row"><span class="ch-n">1</span><span class="ch-t2"><b>We build your shortlist</b> &mdash; roles matched to your profile.</span></div>
        <div class="ch-row"><span class="ch-n">2</span><span class="ch-t2"><b>Applications go out</b> &mdash; in your voice, you approve each batch.</span></div>
        <div class="ch-row"><span class="ch-n">3</span><span class="ch-t2"><b>Recruiters get chased</b> &mdash; and you show up to the offer.</span></div>
      </div>
      <button class="ch-done-btn" onclick="buyNowClose()">Take me to my dashboard &nbsp;&rarr;</button>
    </div>
  </div>
</div>`);

  document.getElementById('chPhoneInput').addEventListener('input', function() {
    this.classList.remove('err');
  });

  document.getElementById('chNameInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('chPhoneInput').focus();
  });

  document.getElementById('chPhoneInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') buyNowPay('card');
  });

  document.getElementById('chOverlay').addEventListener('click', function(e) {
    if (e.target === this) buyNowClose();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('chOverlay').classList.contains('open')) buyNowClose();
  });
})();
