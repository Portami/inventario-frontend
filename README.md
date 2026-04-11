# Frontend

[![CI](https://github.com/Portami/frontend/actions/workflows/ci.yaml/badge.svg)](https://github.com/Portami/frontend/actions/workflows/ci.yaml)
[![Quality Gate Status](https://sonarqube.pm4.init-lab.ch/api/project_badges/measure?project=inventario-frontend&metric=alert_status&token=sqb_7dd514c621fd92f93e621131137af3ac172a0307)](https://sonarqube.pm4.init-lab.ch/dashboard?id=inventario-frontend)
This project is built with **React**, **TypeScript**, and **Vite**.

Before contributing, please read the project guidelines.

---

# Documentation

- [Project Structure](./docs/project-structure.md)  
  Explains the folder layout, where code should live, and general React project organization.

- [Dependency Management](./docs/dependency-management.md)  
  Explains npm rules, versioning (`~`), semantic versions (`x.x.x`), and package management guidelines.

---

# SonarQube

Sonar analysis runs inside `.github/workflows/ci.yaml` through the reusable workflow
`.github/workflows/reusable-sonar.yml`.

Configure these repository settings before running the workflow:

- GitHub secret: `SONAR_TOKEN`
- GitHub variable: `SONAR_HOST_URL` (for example `https://sonarqube.pm4.init-lab.ch`)

For local SonarLint connected mode, this project includes `.sonarlint/connectMode.json` with the frontend project key.

---

# Getting Started

Install dependencies:

```bash
npm install
```

Copy the `.env.example` file to `.env` and fill in any required environment variables. **NEVER** commit your `.env` file
to version control.
The .env file is used to store environment-specific variables, such as API keys or database connection strings. It
should not be committed to version control to prevent sensitive information from being exposed.

# General Workflow

Before committing changes, please ensure the code follows the project's
formatting and linting rules.

---

## 1. Format the code

Run Prettier to automatically format the codebase.

```bash
npm run format
```

---

## 2. Run all checks

Run the full linting suite:

```bash
npm run check:all
```

This runs:

- **ESLint** → checks JavaScript/TypeScript code quality
- **Stylelint** → checks SCSS/CSS styling rules
- **CSpell** → checks spelling in code and comments

---

## 3. Fix lint issues if needed

Some issues can be fixed automatically.

### Fix ESLint issues

```bash
npm run check:eslint:fix
```

### Fix Stylelint issues

```bash
npm run check:stylelint:fix
```

---

## 4. Verify formatting

Check if Prettier formatting is correct:

```bash
npm run format:check
```

---

# Recommended Commit Workflow

A typical development workflow should look like this:

```bash
npm run format
npm run check:all
git add .
git commit -m "your message"
```

This ensures:

- code formatting is consistent
- linting rules pass
- spelling errors are caught
- the project still builds

---

# Development Commands

Start development server:

```bash
npm run dev
```

---

# Important Rules

- Do **not commit code that fails linting**
- Always run formatting before committing
- Fix spelling errors reported by CSpell
- Do not manually edit `package-lock.json`
