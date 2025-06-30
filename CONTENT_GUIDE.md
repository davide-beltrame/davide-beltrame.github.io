# Content Management Guide

This website now uses a JSON-based content management system that makes it super easy to update your information without touching any code!

## Quick Updates

To update your website content, simply edit the `content.json` file. The website will automatically load and display the new information.

### Common Updates

#### Adding a New Job/Position
```json
{
  "id": "new_company",
  "company": "New Company Name",
  "position": {
    "en": "Your Position",
    "it": "La Tua Posizione"
  },
  "period": "2025–present",
  "status": "current",
  "description": {
    "en": "Description of what you do...",
    "it": "Descrizione di cosa fai..."
  },
  "link": "https://company-website.com",
  "type": "work"
}
```

Add this to the beginning of the `experience` array in `content.json`.

#### Adding a New Publication/Paper
```json
{
  "id": "my_new_paper",
  "title": {
    "en": "Title of Your Paper",
    "it": "Titolo del Tuo Paper"
  },
  "authors": ["Davide Beltrame", "Co-Author"],
  "venue": "Conference/Journal Name",
  "year": 2025,
  "status": "published", // or "draft", "submitted", "accepted"
  "link": "https://link-to-paper.com",
  "description": {
    "en": "Brief description...",
    "it": "Breve descrizione..."
  }
}
```

Add this to the `publications` array in `content.json`.

#### Adding a New Education Entry
```json
{
  "id": "new_course",
  "institution": "Institution Name",
  "degree": {
    "en": "Course/Degree Name",
    "it": "Nome Corso/Laurea"
  },
  "period": "2025",
  "status": "completed", // or "current"
  "details": {
    "en": "Details about the course...",
    "it": "Dettagli sul corso..."
  },
  "link": "optional-link-to-page.html"
}
```

Add this to the `education` array in `content.json`.

#### Updating Personal Information
Simply modify the values in the `personal` section:
- `name`: Your name
- `title`: Your professional title/role
- `status`: Website status message
- `about`: Your about text
- `email`: Your email address
- `social`: Your social media links

#### Updating Skills
Modify the `skills` section:
- `languages`: Your language skills
- `programming`: Programming languages you know
- `tools`: Tools and software you use

### Tips

1. **Always validate your JSON**: Use a JSON validator online to make sure your syntax is correct
2. **Backup before changes**: Keep a copy of the working `content.json` before making changes
3. **Use consistent IDs**: Give each entry a unique, descriptive ID
4. **Test bilingual content**: Make sure you provide both English and Italian versions
5. **Update the last_updated date**: Change `meta.last_updated` when you make updates

### File Structure
```
content.json              # Main content file (EDIT THIS!)
assets/js/content.js      # Content management system (don't edit)
assets/js/script.js       # Main website scripts (don't edit)
```

### Emergency Fallback
If something goes wrong with the JSON, the website will fall back to the static content in the HTML files, so your site won't break completely.

---

**Remember**: After editing `content.json`, commit and push your changes to GitHub to update the live website!
