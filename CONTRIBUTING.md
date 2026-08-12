# Contributing

This is my personal website. Issues and suggestions are welcome; the conventions below are what I follow myself.

## Local development

The site is built with [Jekyll](https://jekyllrb.com/) and deployed by GitHub Pages from `main`.

### One-time setup

macOS ships with Ruby 2.6, which is too old for Jekyll. Install a modern version via Homebrew and configure your shell:

```bash
# 1. Install Ruby
brew install ruby

# 2. Add Homebrew Ruby to your PATH (add this line to ~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. Install Jekyll and Bundler
gem install jekyll bundler
```

After step 2, `ruby -v` should report version 3 or newer. If it still reports 2.6, restart the terminal.

### Running locally

```bash
bundle install
bundle exec jekyll serve
```

The site is then available at `http://127.0.0.1:4000/`.

## Branch naming

```
<type>/<short-description>
```

| Type | When to use |
| --- | --- |
| `feature` | New feature |
| `bugfix` | Non-critical bug fix |
| `hotfix` | Urgent critical fix |
| `test` | Experimental/test code |
| `docs` | Documentation updates |
| `chore` | Maintenance tasks |

Examples: `feature/user-authentication`, `bugfix/login-error`, `docs/update-api-reference`.

Lowercase and kebab-case, descriptive but concise.

## Commit messages

```
<type>(<scope>): <subject>

<body>
```

The header is mandatory: `type` is what you did, `scope` is the optional area or module, `subject` is a short imperative sentence with no trailing period. The body is optional and carries context or reasoning for non-trivial changes.

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

```bash
# Good
fix(login): prevent crash on empty password
docs(readme): update setup instructions

# Bad
fixed bug
changes
```

## Pull requests

`main` only ever moves through a pull request. PR titles follow the same structure as commit headers:

```
<type>(<scope>): <subject>
```

Examples: `feat(auth): implement JWT-based authentication`, `fix(login): handle empty password`. Imperative mood; avoid vague titles like `stuff`, `update`, or `fixes`.

## Quick reference

| Convention | Example |
| --- | --- |
| Branch | `feature/user-authentication` |
| Commit | `feat(auth): add JWT-based authentication` |
| PR | `feat(auth): implement JWT-based authentication` |
