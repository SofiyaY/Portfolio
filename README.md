# Portfolio

Simple static portfolio to showcase projects, skills, and contact info.

## Contents

- `index.html` — main page with sections (About, Skills, Projects, Contact)
- `assets/css/styles.css` — responsive styling with dark/light theme
- `assets/js/script.js` — loads `assets/data/projects.json`, renders cards, search/filters
- `assets/data/projects.json` — projects with fields: title, description, category, tags, skills, year, repo/link

## Usage

1. Open `index.html` directly in your browser to view the site.
2. Edit `assets/data/projects.json` and add your own projects.
3. Update contact links in `index.html`.

### Optional: run a simple local server
If you prefer using a local server, you can use Python (if installed):

```powershell
# From the root folder (c:\Users\Bruker\OneDrive\Portfolio)
python -m http.server 5500 ; Start-Process http://localhost:5500
```

## Customization

- Add images: set the `image` field in `projects.json` to a relative URL (e.g., `assets/img/project1.png`).
- Categories: use one of `web`, `data`, `ml`, `script`, `other` (can be extended by updating the dropdown in `index.html`).
- Tags and skills: displayed as chips and labels.

## License
This project is open and free to use. © SofiyaY
