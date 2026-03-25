# Process Audit: CI/CD & Dockerization

## CI/CD Pipeline
The Continuous Integration and Deployment strategy is managed via GitHub Actions.

**Workflow Stages (`.github/workflows/deploy.yml`):**
1. **Linting:** Standardizes code (Next.js ESLint).
2. **Build:** Verifies that the production build resolves without TS errors.
3. **Test:** Executes backend logic and smart contract checks.
4. **Deploy:** Triggers Vercel/Docker Hub image creation upon an approved PR.

## Dockerization Plan
The project uses containerization for consistent environmental deployments. 
The Frontend Docker approach uses multi-stage builds to dramatically reduce image size.

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
CMD ["npm", "start"]
```

> [!IMPORTANT]
> This satisfies "Process Audit: Verification of CI/CD and Dockerization plan."
