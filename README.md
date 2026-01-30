# Paste-Link

Drop text. Get a link. Share anywhere.

No sign-up, no friction — just paste and go. Optional TTL and max-view limits keep sensitive stuff from lingering. Runs on Next.js with Neon Postgres, ready for Vercel.

---

**Get running in under a minute**

```bash
npm install
cp .env.example .env
```

Grab a connection string from [Neon](https://neon.tech) (free tier is plenty), drop it into `.env` as `DATABASE_URL`, and set `NEXT_PUBLIC_APP_URL` to your dev URL (e.g. `http://localhost:3000`).

```bash
npm run dev
```

The database table spins up on first request — no migrations, no extra setup. 