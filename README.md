# Prime Casa CRM modules (Next.js App Router)

## Install
Copy into your project (keep the paths, or adjust the imports):

    lib/crm-store.js            state, rules, storage adapter, stats
    components/crm/*.jsx        Dashboard, LeadsView, FollowUps, LeadDialog
    app/crm/page.jsx + crm.css  example page wiring everything together

The files import from `@/lib/crm-store`. Next.js sets up the `@/` alias by default.
Open `/crm` and it works with no other dependencies.

## Connect your database
All data goes through `storage` in `lib/crm-store.js`. Replace its two methods:

    async load() { return (await fetch('/api/crm')).json(); }
    async save(data) { await fetch('/api/crm', { method: 'PUT', body: JSON.stringify(data) }); }

Then add `app/api/crm/route.js` with GET and PUT handlers that read and write
your DB, and check the user's session there. For a multi-user team, move to
per-action endpoints (POST /api/leads, PATCH /api/leads/:id) so two people
editing at once don't overwrite each other.

## Rules built in
- Logging a "Connected" call moves a New lead to Contacted
- "Not interested" marks the lead Lost
- "Callback requested" sets the next follow-up to tomorrow if empty
- Changing the site visit date resets the visited flag

## Not included yet
Site visits, Properties, Team and Reports screens. They read the same
`useCRM()` data (visits, properties, agents, call logs), so they plug in the same way.
