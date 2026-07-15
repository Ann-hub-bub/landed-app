# Landed.today — Analytics Documentation

Last updated: 2026-07-14
This file describes how analytics works on landed.today: architecture, IDs, every event, every GTM tag/trigger/variable, and where things live in the code. Keep it updated when events change.

---

## 1. Architecture — how data flows

The site NEVER sends data to Google Analytics directly from code. The flow is:

```
Site code (dataLayer.push)  →  Google Tag Manager (GTM-MWVWW2F5)  →  GA4 + Google Ads
```

1. **Site code** pushes events into `window.dataLayer` (a plain array in the browser).
2. **Google Tag Manager** (one container: `GTM-MWVWW2F5`, loaded in the `<head>` of `index.html` and `job.html`) listens for those events via Custom Event triggers.
3. GTM tags forward events to **GA4** and one conversion to **Google Ads**.

Do NOT add gtag.js / GA snippets directly to the pages — there is a comment about this in `index.html` (line ~11). The only GA4 loader is the "Ga4" Google Tag inside GTM.

Separately from analytics, lead contact data (name + phone) is sent by the site's own `fetch()` to a Google Apps Script webhook that writes to a Google Sheet (see §7). This works even when ad blockers block GTM/GA4, so the Sheet always has equal or MORE leads than GA4 — that discrepancy is expected.

---

## 2. IDs and accounts

| Thing | Value |
|---|---|
| GTM container | `GTM-MWVWW2F5` (name: landed.today) |
| GA4 property | "Landed 13_02_2026" |
| GA4 web stream | "Landed.today", Stream ID `13606884753` |
| GA4 Measurement ID | `G-QN2NL0W57G` (Google also shows alias `GT-M3LWWSLC` — same tag, normal) |
| Google Ads Conversion ID | `17936383307`, label `222BCPfm2MkcEMv63ehC` — conversion action "Submit lead form" (**Primary**) |
| Microsoft Clarity project | `v86k1myfni` |
| Leads webhook | Google Apps Script URL hardcoded in `paywall.js` and `buynow.js` (`script.google.com/macros/s/AKfycbyP0O7...`) |
| Deploy | GitHub `Ann-hub-bub/landed-app`, branch `main` → Vercel auto-deploy. Vercel sometimes misses a push — fix: empty commit + push again. |

A second Measurement ID `G-LDD9RBBW48` existed historically (old experiments). It was fully removed from GTM in July 2026. It STILL shows up in Tag Assistant ("3 Google tags found") — verified July 2026: it is NOT debugger cache. It is an alias ID on the combined Google tag of the Ads conversion (Tag IDs: G-LDD9RBBW48, GT-TNSMHFCV, AW-17936383307, GT-MR2BVN36; Destination ID: AW-17936383307 only), loaded by the GTM Ads conversion tag. Hits Sent shows only "Submit lead form" → Google Ads; NO data goes to the old GA4 property. Harmless; can be detached in Google Ads → Google tag settings if ever desired. Likely the cause of the "Tag quality: Needs attention" notice (§10).

---

## 3. Event naming system

- All event names are **lowercase** (GA4 is case-sensitive).
- Events are **shared lego bricks**: the same event is reused by several funnels. Never create a duplicate event for another funnel — use funnel-step parameter filters in GA4 instead.
- `stepN_...` = main funnel (Funnel 1). `demo_stepN_..._click` = demo funnel (Funnel 2). `chat_stepN_...` = chat funnel (Funnel 3). Numbers reflect position inside their own funnel.
- The `entry_type` value ("which door the visitor entered through") is saved in `sessionStorage` under key `landed_entry_type` and attached to most later events, so any funnel step can be broken down by entry door.

---

## 4. Full event reference

### Funnel 1 — Master (Visit → booked call)

| Event | Fired when | Parameters | Where in code |
|---|---|---|---|
| `step1_entry_click` | Click on any entry door: Get me hired, Drop your resume, Find live jobs, Buy Now, Book a call | `entry_type`: `get_me_hired`, `drop_resume`, `find_live_jobs`, `buy_now`, `book_call` | Generic listener on `[data-entry-cta]` elements — `index.html` (~line 4975) and `job.html` (~line 1215). "Find live jobs" sets the door only if none was set yet — inside `handleFindLiveJobs()` in `index.html` |
| `step2_sign_up_click` | Name+phone submitted. On Buy Now this is the SAME click as choosing the payment method | `entry_type`, `form_type` (`payOpen`/`buyNowOpen`), `method` (Buy Now only) | `paywall.js` → `paySubmit()`; `buynow.js` → `buyNowPay()` |
| `step3_payment_method_click` | Click Apple Pay / Google Pay / card. On Buy Now fired together with step2 by one click | `entry_type`, `form_type`, `method`: `applepay`, `gpay`, `card` (GTM renames it to `payment_type` for GA4) | `paywall.js` → `payPay()`; `buynow.js` → `buyNowPay()` |
| `step4_book_call_click` | Calendly popup opened | `popup_source`: `onboarding` (after payment), `booking_section` (direct "Book a call →" button), `joe_chat` (from chat) | `paywall.js` → `payBookOnboardingCall()` (lazy-loads Calendly — do not call `Calendly.initPopupWidget` directly, it crashes if the widget isn't loaded); `index.html` → `openCalendlyPopup()`; chat reply link in `index.html` |
| `step5_book_call_calendly` | Real meeting booked in Calendly | none (TODO: could add entry_type) | Not from site code! GTM Custom HTML tag **Listener_Calendly** listens to Calendly's postMessage and pushes dataLayer event `calendly_scheduled`; the GA4 tag renames it to `step5_book_call_calendly` |

Note: the direct "Book a call →" button fires `step1_entry_click` (door `book_call`) AND `step4_book_call_click` with one click — by design; Funnel 1 is an OPEN funnel.

### Funnel 2 — Demo

| Event | Fired when | Parameters | Where in code |
|---|---|---|---|
| `demo_step2_find_jobs_click` | Launched job search in the demo ("Find live jobs") | `entry_type` | `index.html` → `handleFindLiveJobs()` |
| `demo_step3_position_click` | Clicked a job card in the shortlist | `entry_type` | `index.html` job-list click listener (~line 4274) |
| `demo_step4_apply_click` | Clicked "Apply for …" (both buttons: sticky bottom bar and form submit). The top "Apply now →" button is just an anchor scroll — intentionally NOT tracked | `entry_type` | `job.html` onclick attributes (~lines 1117 and 1204). Same click also calls `payOpen()` — the bridge from demo into sign-up |
| `demo_step4_plunder_click` | Clicked "Plunder the market — $20/mo" under the shortlist (alternative exit from demo, same funnel position as apply) | `entry_type` | `index.html` onclick (~line 2672) |

Funnel 2 entry step = `step1_entry_click` filtered to `entry_type = drop_resume OR find_live_jobs`; final step = shared `step2_sign_up_click`.

### Funnel 3 — Chat

| Event | Fired when | Parameters | Where in code |
|---|---|---|---|
| `chat_step1_open_click` | Clicked a chat button (`#openChat` choice or `#chatFab` floating button). These buttons deliberately have NO `data-entry-cta` — chat is not an entry door | none | `index.html` (~lines 4697, 4702) |
| `chat_step2_message_sent` | Sent any message to the bot (typed text or quick-reply button). The "I just want a human" quick reply also counts — so that click fires step2 AND step3 together, by design | none | `index.html` → top of `handleUser()` (~line 4634) |
| `chat_step3_human_request_click` | Clicked "I just want a human →" | `entry_type` | `index.html` (~line 4643) |

Funnel 3 steps 4–5 reuse `step4_book_call_click` (filter `popup_source = joe_chat`) and `step5_book_call_calendly`.

---

## 5. GTM contents (container GTM-MWVWW2F5)

### Tags
| Tag | Type | Trigger |
|---|---|---|
| Ga4 | Google Tag (`G-QN2NL0W57G`) | Initialization — All Pages |
| Conversion Linker | Conversion Linker (for Google Ads click attribution) | All Pages |
| Listener_Calendly | Custom HTML (listens to Calendly postMessage, pushes `calendly_scheduled`) | All Pages |
| Step1_entry_click … Step5_book_call_calendly | GA4 Event (one per Funnel 1 event) | Matching `TN_*` custom-event trigger (Step5 uses `T_calendly_scheduled`) |
| Step2_sign_up_click_GAds | Google Ads Conversion Tracking ("Submit lead form") | TN_step2_sign_up_click |
| Demo_step2_find_jobs_click, Demo_step3_position_click, Demo_step4_apply_click, Demo_step4_plunder_click | GA4 Event | Matching `TN_demo_*` triggers |
| Chat_step1_open_click, Chat_step2_message_sent, Chat_step3_human_request_click | GA4 Event | Matching `TN_chat_*` triggers |

Naming convention: tag labels are Capitalized, triggers are `TN_<event name>`; the actual event name inside is always lowercase and must exactly match the dataLayer push.

### Triggers
All funnel triggers are **Custom Event** type listening for the exact dataLayer event name. Plus `T_calendly_scheduled` (custom event `calendly_scheduled` from the Listener).

### Variables (user-defined, all Data Layer Variables)
| Variable | Reads dataLayer key | Used as |
|---|---|---|
| DLV - entry_type | `entry_type` | GA4 param `entry_type` on most tags |
| DLV - form_type | `form_type` | GA4 param `form_type` on Step2 |
| DLV - payment method | `method` | GA4 param `payment_type` on Step3 (renamed in the tag) |
| DLV - bookings | `popup_source` | GA4 param `popup_source` on Step4 |

Important: DLV variables must be type "Data Layer Variable" (a past bug: entry_type was misconfigured as a DOM Element variable and returned null).

### Deleted history (July 2026 cleanup)
All old `F1–F5` click-based tags/triggers, duplicate Google Tags (`G-QN2NL0W57G` duplicate and `G-LDD9RBBW48`), and orphan events `step5_contact_form_open` / `step8_trial_success_shown` were removed from GTM and from code. Old GTM exports live in `Analitics/` folder for reference only.

---

## 6. GA4 configuration

- **Key events (conversions):** `step2_sign_up_click` (main business goal: lead captured) and `step5_book_call_calendly` (call booked). Built-in `purchase` is force-marked by Google and cannot be unmarked — it never fires here, ignore it.
- **Custom dimensions:** "Entry Source" ← event parameter `entry_type`; "Popup Source" ← event parameter `popup_source` (registered 2026-07-14 — collects data from that date onward only). In GA4 pickers search for the dimension names ("Entry Source", "Popup Source"), not the parameter names.
- **Funnel explorations (Explore):** Funnel 1 — Master (open funnel: session_start → step1 → step2 → step3 → step4 → step5, breakdown by Entry Source). Funnel 2 — Demo and Funnel 3 — Chat built the same way with parameter filters on shared steps.
- **Known lag:** a brand-new event name appears in Explore/report dropdowns up to ~24h after its first hit. Realtime report shows it within minutes — use Realtime to verify delivery.
- Buy Now visitors legitimately have no step4/step5 (their flow ends at the success screen) — not a data bug.

## 7. Leads capture (independent of analytics)

`paySubmit()`, `payPay()` (paywall.js) and `buyNowPay()` (buynow.js) POST name/phone to a Google Apps Script webhook → Google Sheet + email notification. `mode: 'no-cors'`, fire-and-forget. Expect Sheet ≥ GA4 counts (ad blockers). The checkout is a demo/fake payment — the business goal is capturing contacts to call back.

## 8. Microsoft Clarity

- Loaded on `index.html` AND `job.html` (project `v86k1myfni`), lazy-loaded ~2s after page load. (Added to job.html 2026-07-14 — before that there were no recordings from the job page.)
- **Events are sent via the Clarity API from code (since 2026-07-16), names identical to GA4 events.** A `clarityEvent(name)` helper is defined in the `<head>` of `index.html` and `job.html` next to the deferred Clarity loader (with a queue stub, so events fired before the tag loads are replayed). It is called right next to every funnel `dataLayer.push` — in `index.html`, `job.html`, and (guarded with `window.clarityEvent &&`) in `paywall.js` / `buynow.js`. Covered: all Funnel 1/2/3 events incl. the ones button-text matching couldn't catch (`demo_step3_position_click`, `demo_step4_apply_click`, `chat_step1_open_click`, `chat_step2_message_sent`). API events auto-appear in Clarity → Settings → Smart events (type "API") after their first hit; they are independent of button text/markup.
- History: the original 7 Smart Events (2026-07-14) were "Button clicks" type matched by button TEXT — they silently failed to match real clicks (0 sessions) and were replaced by the API approach above; delete them in Clarity UI so names don't collide.
- Deliberately NOT in Clarity (GA4 remains the counter): `step5_book_call_calendly` — its dataLayer event is pushed by the GTM Listener_Calendly tag, not by site code, so no `clarityEvent` call exists for it.

## 9. Testing checklist (after any analytics change)

Step-by-step walkthrough table for all three funnels with expected event counts: see `FUNNEL_TEST_CHECKLIST.md`.

1. GTM **Preview** → walk the flow → check tags fire and parameters are not null (especially `entry_type`).
2. **Submit → Publish** — until published, real visitors run the OLD container version while the site code may already send new event names → silent data gap.
3. Verify live delivery in GA4 **Realtime** (incognito window, not Preview).
   - Note: `google-analytics.com/g/collect` requests may show HTTP **503** in DevTools/network logs — verified July 2026 that events still arrive in GA4 Realtime despite this. Judge delivery by Realtime, not by the response code.
   - Note: GA4 **DebugView's live stream** may skip drawing some events entirely (July 2026: `step2_sign_up_click` and `step4_book_call_click` never rendered in the stream across multiple slow walkthroughs, while the same page's "Top events" panel counted them correctly). Display-only quirk — judge by DebugView's Top events panel or Realtime, not by the stream.
4. Delete test rows ("Test Claude" etc.) from the leads Sheet; cancel test Calendly bookings.
5. Remember: renaming an event = change it in code AND in the GTM trigger AND in the GTM tag's Event Name field. Update the funnel tables (Google Sheet maps) too.

## 10. Open items

- ~~Clarity on job.html + Smart Events~~ — DONE 2026-07-14 (see §8).
- `step5_book_call_calendly` has no parameters — consider passing entry_type through the Calendly listener.
- Google tag panel (GA4 Admin → Data Streams → Google tag) shows "Tag quality: Needs attention — 1 issue" — not yet investigated.
- GA4 custom dimensions for `payment_type` / `form_type` are not registered — register if breakdowns by them are needed in standard reports. (`popup_source` registered 2026-07-14 as "Popup Source".)
- Funnel 3 — Chat exploration: step 4 built without the `popup_source = joe_chat` parameter filter (dimension was freshly registered and not yet available in Explore pickers) — add the filter to step 4 the next day (~2026-07-15).
