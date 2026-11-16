# Grima contact integration

Angular and Grima remain independent projects. The browser calls
`POST /grima-bot` directly. No proxy to Render and no automatic request retries
are used. Backend validation is still authoritative.

## Public Angular configuration

- `src/environments/environment.development.ts`:
  local API URL `http://localhost:8888/grima-bot` and the development Site key.
- `src/environments/environment.ts`:
  production Site key and the production API URL.
- The Site keys were copied once from the variables the owner explicitly confirmed
  are PUBLIC Site keys, despite their historical FRONTEND_SECRET_KEY names.
  Angular does not read Grima's .env at build time or runtime.
- The production API URL is intentionally empty until the real Grima deployment URL
  is known. Set apiUrl to `https://YOUR-GRIMA-PROJECT.netlify.app/grima-bot`.
  Do not guess another project's hostname. An empty URL disables the contact form.
- Angular CLI replaces the environment module for development builds and npm start.
  npm run build uses production configuration.
- turnstileAction is contact in both environments and must match Grima.

Every value in these modules is public and included in browser bundles. Never
put the Turnstile Secret key, Telegram bot token or chat ID in Angular. There is
no shared private credential between this browser and Grima.

## Run locally

Use Node.js 24 in both terminals. If you have not installed dependencies, run
npm ci in each project first. No production deployment is needed.

### 1. Verify Grima's local .env

```dotenv
ALLOWED_ORIGINS=http://localhost:4200
TURNSTILE_ALLOWED_HOSTNAMES=localhost
TURNSTILE_ACTION=contact
CONTACT_ENABLED=false
```

You may keep your existing production origins/hostnames as comma-separated
additional entries. The local origin and hostname were added during integration.

Set the ACTIVE variable `TURNSTILE_SECRET_KEY` to your development widget's
Secret key. Merely defining `TURNSTILE_SECRET_KEY_DEV` does not select it: Grima
reads `TURNSTILE_SECRET_KEY`. Do not include real values in shared documentation.

The Telegram token/chat ID must also be present. Keep CONTACT_ENABLED=false
while preparing. Change it to true yourself when ready to send a real test
message, then restart Grima. Tests on your computer still send real messages if
you use real Telegram credentials and enable delivery.

### 2. Start Grima in terminal 1

```sh
cd /Volumes/MAC_DEV/Node/Typescript/grima
nvm use
npm run dev
```

This requires Netlify CLI. If netlify is not installed, use
`npx netlify-cli dev` in that directory instead; npm will offer to download the
CLI. There is no need to create a second cloud project or run a deploy command
to test locally. Netlify Dev sets NETLIFY_DEV=true, allowing the HTTP localhost
origin in Grima. Wait until it reports readiness on port 8888.

Do not use a generic static server for Grima: it would not execute the function.

### 3. Start Angular in terminal 2

```sh
cd /Volumes/MAC_DEV/Node/Typescript/my-portfolio
nvm use
npm start
```

Open `http://localhost:4200/#/contact`. Use localhost consistently; opening
127.0.0.1 requires explicitly adding that origin/hostname in Grima and Cloudflare.

### 4. Verify the real browser flow

1. Your separate development Turnstile widget must allow localhost and use the
   Site key already configured in environment.development.ts. Managed mode and
   pre-clearance disabled are appropriate for this setup.
2. Fill all fields. Names accept spaces and accented characters. Limits match
   Grima: name 3-60, email up to 254, subject 4-300, message 1-3000.
3. Wait for Turnstile verification. Sending remains disabled without valid input
   and a current proof.
4. With CONTACT_ENABLED=false, submission should show temporary unavailability.
   With CONTACT_ENABLED=true, submit ONE test and check your Telegram conversation.
5. In browser Network tools, expect an OPTIONS preflight when needed, followed by
   POST http://localhost:8888/grima-bot. The five JSON fields stay unchanged;
   proof travels in X-Turnstile-Token. Do not share captured proof/headers.
6. HTTP 200 retains the legacy response message and navigates to /#/contact/success.
   The confirmation uses the selected language, counts down seven seconds and
   navigates home. A button allows immediate navigation if needed.
   The visitor does not receive a confirmation email.
7. Try invalid email, missing fields, expired verification and stopped Grima.
   Input should remain after errors, loading should clear, and a new verification
   should be available. Do not auto-retry a failed send: Telegram may have received it.

The widget can request renewal on expiry and can be retried manually on failure.
Its script loads only when the contact widget is mounted. It is removed from the
page on navigation; the shared script is reused on a later visit.

Native Netlify throttling is a DEPLOYED platform feature. A local test or the
mocked unit tests do not prove real rate-limit enforcement. A platform 429 can
lack CORS/JSON, surfacing as status 0 in Angular; the UI shows safe failure text
without claiming to know whether delivery occurred.

## Local checks and evidence

```sh
npm run test:contact
npm run build
```

The focused suite uses Chrome Headless and mocked Turnstile/HTTP providers.
No real verification or Telegram call is made by it. Chrome must be installed;
set CHROME_BIN to its executable if it is not discovered automatically.

Verified during implementation:
- Angular TypeScript and templates compile.
- Development and production builds pass.
- 25 contact service/form/widget/script-loader/confirmation tests pass in Chrome Headless.
- Grima's handler returns 204 for a local-origin preflight with the actual local
  configuration; the check forbids any upstream calls.
- Private Grima configuration is not copied to frontend configuration.
- No real Telegram delivery, real widget challenge, live Netlify deployment,
  deployed throttling or production permission/billing checks were performed.

The unrestricted existing test suite is not green: the original
app.component.spec.ts references AppComponent.title, which does not exist, and
contains scaffolding expectations unrelated to the current app.
test:contact isolates the migration tests rather than changing unrelated tests.

The production build still reports the initial-bundle warning and CommonJS
warnings for aos/jquery. These warnings do not prevent the build.

In this agent environment, Angular's build aborted with exit 134 in the sandbox,
including with one worker. The same build completed outside the sandbox without
a source change. TypeScript/template checks passed independently. No project
workaround or weakened build budget was added for that environment issue.

## Before production

Fill the production Grima URL, configure the production Secret key on the backend,
keep the production widget limited to actual portfolio hostnames, and verify one
authorized real delivery. Confirm CORS/preflight/429 in a deployed environment.
Do not publish the development localhost API URL or development keys.
A production contact form remains disabled until its API URL is configured.

For rollback, revert the contact integration commit or restore the old service
URL deliberately while Render is still available. The implementation does not
automatically fall back to Render or send the same contact to both providers.

References:
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/

## Turnstile asynchronous loading regression

The original loader combined an async/defer script with turnstile.ready(), which
Cloudflare rejects. The script-loader regression tests reproduced the exact
exception before the fix. The loader now resolves on the script load event and
reuses an already loaded API directly, without calling ready().

Four added tests cover async loading, API reuse, concurrent loads/error recovery,
and timeouts. Tests use a simulated Cloudflare API and never load remote scripts.
A real browser verification and Telegram delivery still require a user-run test.
After updating, restart the local frontend/backend and fully reload the browser
to remove the old script and failed widget state. Cloudflare keys need no change
for this specific error.

## Success confirmation

After confirmed delivery, Angular navigates to /#/contact/success. This page
preserves the portfolio header, footer and visual styles, provides Spanish and
English confirmation text, counts down from seven seconds and offers a home
button. The timer is cancelled on manual navigation or component destruction.
The button remains usable if automatic navigation is cancelled or fails.

Preview the layout without sending a message by opening
http://localhost:4200/#/contact/success. This static page does not query Grima
or send a message by itself. The form only navigates there after code=0.
