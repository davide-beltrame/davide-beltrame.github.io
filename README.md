# davidebeltrame.com

The source of my personal website, [davidebeltrame.com](https://davidebeltrame.com): research, projects, a timeline and a few personal pages, in English and Italian.

It is a static Jekyll site, built and served by GitHub Pages from `main`. The content is YAML in `_data/`, in both languages, and the templates in `_layouts/` and `_includes/` render it into complete pages at build time, so every page reads in full without JavaScript.

## Building

```bash
bundle install
bundle exec jekyll serve
```

The site is then at `http://127.0.0.1:4000/`. [CONTRIBUTING.md](CONTRIBUTING.md) covers installing a recent Ruby on macOS.

## Licence

- Text: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Photos: all rights reserved.
- Code (`_layouts/`, `_includes/`, `assets/css/`, `assets/js/` and `script/`): the MIT License, in [LICENSE](LICENSE).
- Illustrations are public domain; paper figures belong to their authors.
