# davide-beltrame.github.io

Welcome!
---
This is my first personal website, built from scratch. 

It's currently in development and I'm teaching myself as I write its code. I will be updating and improving it over time. 

Feel free to explore and provide feedback through the contacts in the header.

### Features
- EN-IT switch button (in progress, rough manual translation)
- Dark/Light mode button
- EN-IT translation with an LLM (in progress)

### Structure

```bash
davide-beltrame.github.io/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── files/
│   │   └── Beltrame_Davide_CV_ENG.pdf
│   ├── images/
│   │   └── profile.jpg
│   └── js/
│       └── script.js
├── education/
│   ├── bsc.html
│   ├── highschool.html
│   └── msc.html
├── experience/
│   └── experience.html
├── projects/
│   └── projects.html
├── index.html
└── README.md
```

Thank you for visiting!

## Git Naming Conventions

### 🌱 Branch Naming

```bash
<type>/<short-description>
```

**Allowed branch types**
 | Type | When to use |
 | --- | --- |
 | `feature` | New feature |
 | `bugfix` | Non-critical bug fix |
 | `hotfix` | Urgent critical fix |
 | `test` | Experimental/test code |
 | `docs` | Documentation updates |

**Examples**
- `feature/user-authentication`
- `bugfix/login-error`
- `hotfix/payment-timeout`
- `test/new-database-driver`
- `docs/update-api-reference`

**General Guidelines**
-  ✅ Use **lowercase** and **kebab-case** (`-`) 
-  ✅ Be descriptive but concise
-  ✅ Optionally include ticket IDs: `feature/PROJ-123-add-login`

---

### ✍️ Commit Messages

```bash
<type>(<scope>): <subject>

<body>
```

**Header** (mandatory)
- `type` — what you did
- `scope` — (optional) area/module
- `subject` — short imperative sentence, no period

**Example**
```
feat(auth): add JWT-based authentication
```

**Body** (optional)
- Use for non-trivial changes
- Add context, reasoning, or implementation details

**Allowed type values**
 | Type | Description |
 | --- | --- |
 | `feat` | New feature |
 | `fix` | Bug fix |
 | `refactor` | Code improvement |
 | `test` | Add/update tests |
 | `docs` | Documentation |
 | `chore` | Maintenance tasks |
 | `style` | Formatting |
 | `perf` | Performance |
 | `ci` | CI/CD changes |

**Examples**

```bash
# Good
fix(login): prevent crash on empty password

# Good
docs(readme): update setup instructions

# Bad!
fixed bug
changes
```

---

### 🔀 Pull Request Naming

PR titles follow the **same structure as commit headers**:

```
<type>(<scope>): <subject>
```

**Examples**
- `feat(auth): implement JWT-based authentication`
- `fix(login): handle empty password`
- `docs(api): update endpoint documentation`

**Tips**
- ✅ Use imperative mood
- ✅ Match the `type` with commit types
- 🚫 Avoid vague titles like: `stuff`, `update`, `fixes`

---

### 📌 Quick Reference

| Convention | Title/Message Example |
| --- | --- |
| Branch | `feature/user-authentication` |
| Commit | `feat(auth): add JWT-based authentication` |
| PR  | `feat(auth): implement JWT-based authentication` |