function payOpen(e) {
  if (e) e.preventDefault();
  var overlay = document.getElementById('payOverlay');
  document.getElementById('payFormPane').classList.add('active');
  document.getElementById('paySuccessPane').classList.remove('active');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() { document.getElementById('payNameInput').focus(); }, 300);
}

function payClose() {
  document.getElementById('payOverlay').classList.remove('open');
  document.body.style.overflow = '';
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

  fetch('https://script.google.com/macros/s/AKfycbyP0O7xn4wW_ii3INRgC60uvZtjPPuyxwOL-5fYIIZ2iu7e_laQ0AiIJyxdTaDdQE7KOg/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ name: name, phone: phone })
  }).catch(function() {});

  document.getElementById('payDoneName').textContent = name ? name + '.' : 'Captain.';
  document.getElementById('payDonePhone').textContent = phone;
  document.getElementById('payFormPane').classList.remove('active');
  document.getElementById('paySuccessPane').classList.add('active');
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
        <button class="pay-done-btn" onclick="payClose()">Got it &mdash; take me in &nbsp;&rarr;</button>
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
