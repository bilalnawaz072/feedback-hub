# Deploy and Host Feedback Hub

Feedback Hub is a self-hosted feedback and testimonial collector you deploy in one click. Collect ratings and written feedback from your customers, approve the best ones from a private admin dashboard, and display them on a public wall — all on infrastructure you own, with no monthly SaaS fee.

## About Hosting Feedback Hub
Feedback Hub runs as a single Node.js service backed by a Postgres database, both included in this template. On deploy, the app creates its database table automatically. Visitors leave a star rating and a message at the root URL. You review submissions in a password-protected admin dashboard at /admin.html, and only the ones you approve appear on the public wall. Set ADMIN_PASSWORD to secure your dashboard and PROJECT_NAME to display your product's name; the database connection is wired automatically.

## Common Use Cases
- Collecting testimonials from customers to display on your website
- Gathering private product feedback with a simple star rating
- Building a moderated wall of social proof you fully own

## Dependencies for Feedback Hub Hosting
- A Postgres database (included and auto-connected)
- Node.js 18+ runtime (handled by Railway)

### Deployment Dependencies
- Source: https://github.com/YOUR_GITHUB/feedback-hub

## Why Deploy Feedback Hub on Railway?
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Feedback Hub on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
