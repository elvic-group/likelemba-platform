# Likelemba WhatsApp Platform — R&D (Green API + Mobile Money + Stripe + Escrow)

> **Goal:** Build a WhatsApp-first rotating savings groups platform (ROSCA) with transparent ledgers, automated reminders, mobile-money + Stripe payments, and **escrow + refunds + disputes**.  
> **Primary interface:** WhatsApp Business via **Green API**.  
> **Build stack:** Cursor + Claude CLI for dev, **OpenAI Agents SDK** for AI orchestration.

---

## 1) Product overview

### 1.1 What users can do (WhatsApp-first)
- Create a savings group (circle/ROSCA).
- Invite members via WhatsApp link/QR.
- Set rules: contribution amount, schedule, payout order, fees, penalties, grace period.
- Collect contributions through:
  - **Mobile Money:** M‑Pesa, Orange Money, Tigo Pesa (via provider aggregator APIs)
  - **Card/Bank:** Stripe (Payment Intents)
- Funds flow through **escrow**:
  - Contributions enter escrow
  - Release to payout recipient on schedule when conditions are met
  - Handle **refund** and **dispute** with event-based workflows
- Track everything:
  - Contributions, reminders, late fees
  - Payout schedule, payout execution
  - Group ledger and receipts

### 1.2 Roles
- **Member:** contributes, views schedule, requests support, opens disputes.
- **Group Admin (Organizer):** creates group, configures rules, manages members, approves exceptions.
- **Platform Admin (Operator):** manages compliance, escalations, disputes, refunds, fraud rules, configurations.

---

## 2) System architecture (high-level)

### 2.1 Channels
- **WhatsApp (Green API):** main UI for users + group admins + platform admins.
- **Web Admin Console (optional but recommended):** full dashboards + auditing (still can keep “mini admin” inside WhatsApp).
- **Webhook service:** receives provider callbacks + Green API incoming messages.

### 2.2 Core services
- **WhatsApp Orchestrator**
  - Parses inbound messages, routes to flows (state machine)
  - Sends templates, interactive lists/buttons (as supported)
- **Payments Service**
  - Stripe Payment Intents + webhooks
  - Mobile money STK push / checkout + webhooks
- **Escrow & Ledger Service**
  - Escrow accounts per group/cycle
  - Immutable ledger (append-only event store)
  - Release rules + refunds
- **Dispute Service**
  - Dispute lifecycle, evidence, outcomes
- **Identity & Auth**
  - Phone-based login
  - OTP + optional WhatsApp verification + device binding
  - **2FA** via OTP + optional authenticator (for admins)
- **AI Agent Service (OpenAI Agents SDK)**
  - Natural language → structured intents
  - Support triage, FAQ, guided setup, compliance checks
  - Tool-calling into internal APIs (safe, permissioned)
- **Notification Scheduler**
  - Cron-based reminders, due-date nudges, delinquency escalations

### 2.3 Data stores
- **Primary DB:** Postgres (transactions + relational constraints)
- **Event Store:** Postgres append-only table or Kafka/Redpanda (optional)
- **Cache/Queue:** Redis + worker (BullMQ, Celery, etc.)
- **Object store:** S3 compatible (receipts, dispute evidence)
- **Secrets:** Vault or managed secrets (e.g., Doppler)

---

## 3) Key product flows (WhatsApp UX)

### 3.1 Onboarding (phone login + 2FA)
1. User writes: “Hi” → bot responds with language selection and “Continue”.
2. User enters phone number (or bot reads from WhatsApp metadata if available).
3. OTP sent via SMS (or WhatsApp OTP if provider).
4. Verified → user profile created.
5. Optional: set PIN (4–6 digits) for sensitive actions (payout changes, refunds).

### 3.2 Create group
- Bot asks step-by-step:
  - Group name
  - Contribution amount + currency
  - Frequency (weekly/monthly)
  - Start date
  - Members count and invite method
  - Payout order (random/choose/auction/manual)
  - Rules: late fee, grace period, min quorum
- Bot returns a **Group Summary** and asks “Confirm”.
- Group created → invite link sent.

### 3.3 Join group
- Member taps invite link → bot recognizes group code.
- Accept rules + identity check.
- Member added; group admin notified.

### 3.4 Contribute (escrow deposit)
- Bot sends due reminder + “Pay Now”.
- User selects payment method:
  - **Mobile Money:** prompts wallet number + initiates STK/checkout
  - **Stripe:** sends secure hosted link (Stripe Checkout) or Payment Link
- On success webhook:
  - ledger event `contribution.captured`
  - escrow balance updated
  - receipt issued in WhatsApp

### 3.5 Payout (escrow release)
- On payout date/time and conditions met:
  - bot notifies group + recipient
  - executes payout:
    - mobile money disbursement / transfer API
    - Stripe Connect payout (if using Connect) or bank transfer
- ledger event `payout.released`

### 3.6 Refund + dispute
- Refund paths:
  - automatic (payment failed / duplicate / group canceled)
  - manual (admin-approved)
- Dispute triggers:
  - “I paid but not recorded”
  - “Payout wrong recipient”
  - “Organizer fraud”
- Dispute workflow:
  - open → collect evidence → freeze escrow portion → investigation → resolution → release/refund/chargeback.

---

## 4) Payments & escrow design

### 4.1 Stripe
**Recommended:** Stripe Payment Intents + webhooks  
- `payment_intent.succeeded` → `contribution.captured`
- `charge.refunded` → `refund.completed`
- `charge.dispute.created/updated/closed` → dispute events

**If marketplace:** Stripe Connect  
- platform holds funds, releases to recipients (transfers/payouts)
- consider regional availability

### 4.2 Mobile money (M‑Pesa / Orange / Tigo)
You’ll typically integrate through:
- Direct operator APIs (harder, country-specific), or
- Aggregator (Flutterwave, Paystack, Africa’s Talking, Cellulant, etc.)

**Typical flow:**
- Create payment request (STK push / USSD prompt)
- Receive callback webhook (success/fail)
- Record ledger event, update escrow
- For payout: disbursement endpoint + callback

### 4.3 Escrow model (recommended)
- **Escrow “wallet” per group cycle** with **sub-ledgers per member**
- Funds become “available” after:
  - payment confirmed AND anti-fraud checks pass
- Funds become “releasable” when:
  - cycle due date reached AND contribution quorum met AND no active freeze/dispute
- **Freezing rules:**
  - if dispute opened affecting cycle → freeze related funds
  - if KYC/AML flag → freeze user funds

### 4.4 Refund rules
- **Pre-release refunds:** allowed with group admin + platform admin approval
- **Post-release refunds:** only via dispute resolution or organizer reversal
- Always ledger-driven:
  - `refund.requested` → `refund.approved` → `refund.executed` → `refund.completed`

---

## 5) Event-driven design (core)

### 5.1 Event types (minimum set)
#### Identity
- `user.created`
- `user.verified`
- `user.2fa.enabled`

#### Group
- `group.created`
- `group.updated`
- `group.member.invited`
- `group.member.joined`
- `group.member.removed`

#### Cycle (round)
- `cycle.created`
- `cycle.started`
- `cycle.contribution.due`
- `cycle.quorum.met`
- `cycle.completed`

#### Payments / escrow
- `payment.intent.created`
- `payment.captured`
- `payment.failed`
- `escrow.deposit.recorded`
- `escrow.funds.frozen`
- `escrow.funds.released`

#### Payout
- `payout.scheduled`
- `payout.released`
- `payout.failed`
- `payout.completed`

#### Refunds
- `refund.requested`
- `refund.approved`
- `refund.executed`
- `refund.completed`
- `refund.failed`

#### Disputes
- `dispute.opened`
- `dispute.evidence.added`
- `dispute.investigation.started`
- `dispute.resolved`
- `dispute.closed`

### 5.2 Event payload schema (example)
```json
{
  "event_id": "evt_01J...",
  "event_type": "payment.captured",
  "occurred_at": "2025-12-18T20:15:04Z",
  "actor": { "type": "user", "id": "usr_123" },
  "subject": { "type": "contribution", "id": "ctr_789" },
  "group_id": "grp_456",
  "cycle_id": "cyc_2025_12",
  "data": {
    "provider": "stripe",
    "amount": 2500,
    "currency": "KES",
    "provider_ref": "pi_3N..."
  }
}
```

---

## 6) Data model (Postgres)

### 6.1 Core tables
- `users` (id, phone_e164, display_name, locale, status, created_at)
- `auth_sessions` (id, user_id, otp_hash, expires_at, device_fingerprint, verified_at)
- `groups` (id, owner_user_id, name, currency, rules_json, status)
- `group_members` (group_id, user_id, role, status, joined_at)
- `cycles` (id, group_id, start_date, frequency, status, payout_order_json)
- `contributions` (id, cycle_id, user_id, amount, due_at, status)
- `payments` (id, contribution_id, provider, provider_ref, status, raw_payload_json)
- `escrow_accounts` (id, group_id, cycle_id, balance_available, balance_frozen)
- `ledger_events` (append-only; event_type, payload_json, hash_chain, created_at)
- `payouts` (id, cycle_id, recipient_user_id, amount, provider, status)
- `refunds` (id, payment_id, amount, status, reason, approved_by)
- `disputes` (id, group_id, cycle_id, opened_by, type, status, outcome, notes)

### 6.2 Immutability and audit
- Ledger is append-only + hash-chain to detect tampering.
- Business state derives from ledger (or keep projections/materialized views).

---

## 7) WhatsApp UX spec (menus, commands, templates)

### 7.1 Universal commands
- `menu` — show main menu
- `help` — support + FAQs
- `status` — show account and group statuses
- `stop` — pause notifications
- `language` — switch language

### 7.2 Main menu (User)
1. **My Groups**
2. **Pay Contribution**
3. **Next Payout**
4. **My Receipts**
5. **Support**
6. **Settings**

### 7.3 Group Admin menu
1. **Create Group**
2. **Manage Members**
3. **Edit Rules**
4. **Cycle Status**
5. **Approve Exceptions** (late fee waive, manual add payment, etc.)
6. **Reports**

### 7.4 Platform Admin (inside WhatsApp)
- `admin menu` available only to whitelisted numbers + 2FA
1. **Search User**
2. **Search Group**
3. **Disputes Queue**
4. **Refund Requests**
5. **Risk Flags**
6. **Broadcast Message**
7. **Config**

> Note: a **web dashboard** is still strongly recommended for deep reporting; WhatsApp admin can be “fast actions”.

---

## 8) AI Agent design (OpenAI Agents SDK)

### 8.1 Agent responsibilities
- Convert free-text into structured actions:
  - “Create a group for 10 people, weekly, 5000 KES starting next Friday”
- Explain rules, fees, schedule in user’s language
- Detect risky intent:
  - scams, coercion, money laundering patterns
- Automate support:
  - payment not received, wrong amount, account change

### 8.2 Tools exposed to the agent (strict)
- `get_user_profile(user_id)`
- `list_groups(user_id)`
- `create_group(payload)`
- `initiate_payment(payload)`
- `get_payment_status(payment_id)`
- `open_dispute(payload)`
- `request_refund(payload)`
- `send_whatsapp_message(payload)`

**Safety rules:**
- Tool calls require permissions (role-based).
- High-risk actions need confirmation:
  - payout order change
  - refunds > threshold
  - member removal

### 8.3 Intent schema (example)
```json
{
  "intent": "create_group",
  "confidence": 0.91,
  "entities": {
    "group_name": "Family Circle",
    "members_count": 10,
    "frequency": "weekly",
    "amount": 5000,
    "currency": "KES",
    "start_date": "2026-01-09"
  },
  "needs_confirmation": true
}
```

---

## 9) Security, compliance, reliability

### 9.1 Security
- Phone login + OTP
- Admins: OTP + PIN + optional authenticator (TOTP)
- Signed webhooks (Stripe, mobile money providers)
- Idempotency keys for payment and ledger writes
- Encrypt PII at rest; mask phone numbers in logs

### 9.2 Compliance considerations (non-legal guidance)
- Escrow / money transmission rules vary by country.
- If you hold funds, you may need regulated partners.
- Prefer using regulated payment providers + “platform” model where possible.

### 9.3 Reliability
- Exactly-once-ish processing via idempotency + event dedupe.
- Retry strategy for webhooks and outbound messages.
- Dead-letter queue for failed jobs.

---

## 10) APIs & webhooks (integration plan)

### 10.1 Green API
- Incoming messages webhook
- Outbound send message
- Delivery/read receipts (if supported)
- Media upload (receipts, dispute evidence)

### 10.2 Stripe
- Create PaymentIntent / Checkout Session
- Webhooks:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `charge.dispute.*`

### 10.3 Mobile money
- `POST /payments` create request
- Provider callback `payment.success|failed`
- `POST /disbursements` payout
- Callback `disbursement.success|failed`

---

## 11) Development workflow (Cursor + Claude CLI)

### 11.1 Repo structure (suggested)
```
/apps
  /wa-bot            # WhatsApp orchestration service
  /api               # core backend APIs (groups, ledger, escrow, disputes)
  /workers           # schedulers + webhook processors
  /admin-web         # optional web admin console
/packages
  /shared            # types, schemas, utils
  /sdk               # internal client SDK
```

### 11.2 Local dev
- ngrok for webhooks
- Stripe CLI for webhook forwarding
- Green API webhook → local URL
- Use `.env` for secrets; never commit

### 11.3 Testing
- Unit tests for ledger projections
- Integration tests for payment state machines
- Simulation scripts:
  - 10 members, 4 cycles, random delays, disputes

---

## 12) Beautiful WhatsApp message templates

> Replace variables like `{{name}}`, `{{group_name}}`, `{{amount}}`, `{{currency}}`, `{{date}}`, `{{link}}`.

### 12.1 Welcome + language
**Template:**
> 👋 Hi {{name}}! Welcome to **Likelemba** — save money together with your community.  
> Choose language:  
> 1️⃣ English  2️⃣ Français  3️⃣ Kiswahili  
> Reply with **1, 2, or 3**.

### 12.2 Main menu
> ✅ **Menu**  
> 1) My Groups  
> 2) Pay Contribution  
> 3) Next Payout  
> 4) Receipts  
> 5) Support  
> 6) Settings  
>  
> Reply with a number.

### 12.3 Create group (step prompt)
> 🧩 **Create a new group**  
> What should we call your group?  
> (Example: *Family Circle*, *Friends Savings*, *Market Women*)  

### 12.4 Group created + invite link
> 🎉 **Group created!**  
> **{{group_name}}**  
> • Contribution: **{{amount}} {{currency}}** ({{frequency}})  
> • Starts: **{{start_date}}**  
> • Payout: **{{payout_rule}}**  
>  
> Invite members using this link:  
> {{invite_link}}  
>  
> Reply **RULES** to view full rules or **START** when everyone has joined.

### 12.5 Join group + confirm rules
> 🤝 You’ve been invited to **{{group_name}}**.  
> Contribution: **{{amount}} {{currency}}** ({{frequency}})  
> Rules: late fee **{{late_fee}}**, grace period **{{grace_days}}** days.  
>  
> Reply **AGREE** to join, or **RULES** to see details.

### 12.6 Contribution due reminder
> ⏰ **Payment reminder — {{group_name}}**  
> Hi {{name}}, your contribution of **{{amount}} {{currency}}** is due on **{{due_date}}**.  
>  
> Reply:  
> **PAY** to pay now ✅  
> **STATUS** to see your history  
> **HELP** if you have an issue

### 12.7 Payment method selection
> 💳 **Choose payment method**  
> 1) Mobile Money (M‑Pesa / Orange / Tigo)  
> 2) Card/Bank (Stripe)  
>  
> Reply **1** or **2**.

### 12.8 Mobile money request sent
> 📲 Mobile Money request sent!  
> Please confirm the prompt on your phone to pay **{{amount}} {{currency}}**.  
>  
> I’ll notify you as soon as it’s received.  
> Ref: **{{payment_ref}}**

### 12.9 Stripe payment link
> 🔒 Secure payment link (Stripe):  
> {{stripe_link}}  
>  
> After payment, you’ll receive a receipt here.

### 12.10 Payment success + receipt
> ✅ **Payment received**  
> **{{amount}} {{currency}}** for **{{group_name}}**  
> Date: **{{paid_at}}**  
> Receipt: **{{receipt_id}}**  
>  
> Thank you, {{name}} 🙏

### 12.11 Cycle quorum met
> 🎯 **Great news!**  
> **{{group_name}}** has reached the required contributions for this cycle.  
> Next payout: **{{payout_date}}** to **{{recipient_name}}**.

### 12.12 Payout notification (before release)
> 💰 **Payout scheduled**  
> On **{{payout_date}}**, **{{amount}} {{currency}}** will be released to **{{recipient_name}}**.  
>  
> Reply **OK** to confirm, or **DISPUTE** if something is wrong.

### 12.13 Payout completed
> 🎉 **Payout sent!**  
> **{{amount}} {{currency}}** has been paid to **{{recipient_name}}** for **{{group_name}}**.  
> Ref: **{{payout_ref}}**

### 12.14 Late payment gentle nudge
> 👀 Quick reminder, {{name}}  
> Your contribution for **{{group_name}}** is overdue by **{{days_late}}** day(s).  
> Amount due: **{{amount}} {{currency}}**  
>  
> Reply **PAY** to settle now, or **HELP** if you need assistance.

### 12.15 Refund requested
> 🧾 **Refund requested**  
> Amount: **{{amount}} {{currency}}**  
> Reason: **{{reason}}**  
>  
> Your request is under review. We’ll update you shortly.  
> Ref: **{{refund_ref}}**

### 12.16 Refund completed
> ✅ **Refund completed**  
> **{{amount}} {{currency}}** has been refunded to your payment method.  
> Ref: **{{refund_ref}}**

### 12.17 Dispute opened
> 🛑 **Dispute opened** (Ref: **{{dispute_id}}**)  
> Type: **{{dispute_type}}**  
>  
> Please send any evidence (screenshots/receipts) here.  
> We may temporarily freeze related escrow funds while investigating.

### 12.18 Support handoff
> 🧑‍💼 A support agent will assist you shortly.  
> In the meantime, reply with:  
> • **PAYMENT REF** (if you have it)  
> • A short description of the issue

---

## 13) Better prompts (Cursor / Claude / OpenAI Agent)

### 13.1 “Build plan” prompt (Claude/Cursor)
Copy/paste:
```text
You are a senior fintech architect. Design a WhatsApp-first ROSCA platform called Likelemba.
Constraints:
- WhatsApp UI via Green API webhooks + outbound messaging.
- Payments: Mobile Money (M-Pesa, Orange, Tigo) + Stripe.
- Escrow with release rules, refund workflows, and dispute handling.
- Phone login + OTP + 2FA for admins.
Deliver:
1) Services architecture diagram (text), DB schema tables, and event types.
2) State machines for: contribution payment, escrow release, refunds, disputes.
3) API endpoints (REST) and webhook handlers (pseudocode).
4) Security model, idempotency strategy, and audit ledger design.
Keep the output implementation-oriented for a TypeScript/Node backend with Postgres + Redis.
```

### 13.2 “WhatsApp flow builder” prompt
```text
Create a WhatsApp conversation flow spec for Likelemba:
- User menu, group admin menu, platform admin menu (WhatsApp-only)
- Commands, buttons/lists, fallback for plain text
- Onboarding, create group, invite/join, pay contribution, payout, receipts, disputes/refunds
Return as a structured JSON flow graph with states, transitions, and message templates.
```

### 13.3 OpenAI Agents SDK prompt (system + policies)
```text
You are Likelemba Assistant inside WhatsApp.
Your job: help users create and manage savings groups, pay contributions, track payouts, and contact support.
Rules:
- Never claim funds are received unless verified by payment webhooks.
- For any payout order change, refund, or member removal: ask for confirmation + require PIN.
- Use tools only when the user has permission for the requested action.
- If user asks for illegal activity, refuse and offer safe alternatives.
You must output:
1) A short WhatsApp-friendly message
2) If an action is needed: a JSON tool_call object with validated fields.
```

### 13.4 “Webhook implementation” prompt
```text
Generate TypeScript code (Express/Fastify) for:
- /webhooks/greenapi inbound messages
- /webhooks/stripe events with signature verification
- /webhooks/mobilemoney callbacks with HMAC verification
Include idempotency middleware and ledger event writes in a single DB transaction.
```

---

## 14) Milestones (suggested R&D plan)
1. **MVP WhatsApp flows:** onboarding, create/join group, view schedule, reminders.
2. **Stripe payments:** contribution capture + receipts + ledger.
3. **Mobile money payments:** STK/checkout + callbacks.
4. **Escrow release + payout:** automated cycle payout.
5. **Refunds + disputes:** freeze/release, admin review.
6. **AI agent:** natural language setup + support triage.
7. **Admin (WhatsApp + web):** queues, reporting, risk flags.
8. **Hardening:** audit hash-chain, monitoring, rate limits, compliance checks.

---

## 15) Deliverables checklist
- [ ] Postgres schema + migrations
- [ ] WhatsApp flow graph (JSON)
- [ ] Payment integrations + webhook verification
- [ ] Escrow ledger + projections
- [ ] Dispute/refund state machines
- [ ] Admin controls + 2FA
- [ ] Monitoring (Sentry/Logs/Metrics)
- [ ] Security review + threat model

---

### Notes
- Some escrow/payment features depend on your provider capabilities and country regulations. Design can stay the same; execution details adapt per provider.
