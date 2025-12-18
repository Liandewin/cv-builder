# 🎨 Professional CV Builder

A modern, intuitive web application for creating professional CVs/resumes with beautiful design and PDF export functionality.

## 🚀 Live Demo

**Dev URL**: [Your Render URL will go here]

## ✨ Features

- **Dynamic Form Interface** - Add unlimited jobs, education entries, and certifications
- **Real-time Validation** - Ensures data quality before submission
- **Beautiful UI** - Modern glassmorphism design with smooth animations
- **PDF Export** - High-quality PDF generation with professional formatting
- **Mobile Responsive** - Works seamlessly on all devices
- **Session Persistence** - Data saved during navigation
- **Smart Numbering** - Automatic renumbering when items are removed

## 🛠️ Tech Stack

### Backend
- **Python 3.9**
- **Flask 3.0.0** - Lightweight web framework
- **WeasyPrint 62.3** - HTML to PDF conversion
- **Gunicorn** - Production WSGI server

### Frontend
- **HTML5/CSS3/JavaScript**
- **Google Fonts** (Poppins, Inter)
- **Font Awesome 6.4.0** - Icons
- **Responsive Design** - Mobile-first approach

### Infrastructure
- **Flask Sessions** - Server-side data persistence
- **Virtual Environment** - Isolated dependencies
- **Git/GitHub** - Version control

## 📦 Installation (Local Development)

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/cv-builder.git
cd cv-builder

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies (macOS)
brew install cairo pango gdk-pixbuf libffi

# Set library paths (macOS)
export DYLD_LIBRARY_PATH="/opt/homebrew/lib:$DYLD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/opt/homebrew/lib/pkgconfig:$PKG_CONFIG_PATH"

# Run application
python app.py
```

Visit `http://127.0.0.1:5001` in your browser.

## 🎯 How to Use

1. **Fill in your information** in the form sections
2. **Add multiple entries** for work experience, education, and certifications
3. **Click "Preview CV"** to see formatted preview
4. **Click "Download PDF"** to generate and download your CV
5. **Use "Edit CV" button** to go back and make changes

## 📁 Project Structure

```
cv-builder/
├── app.py                 # Flask application
├── cv_schema.json        # CV data structure
├── requirements.txt      # Python dependencies
├── Procfile             # Deployment configuration
├── static/
│   ├── css/
│   │   ├── styles.css      # Main UI styling
│   │   └── cv_styles.css   # CV document styling
│   └── js/
│       └── form.js         # Form logic
└── templates/
    ├── index.html          # Main form page
    ├── preview.html        # CV preview
    └── cv_template.html    # PDF template
```

## 🔄 Development Workflow

```bash
# Make changes to code
# Test locally
python app.py

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# Auto-deploys to Render
```

## 🐛 Known Issues / TODOs

- [ ] Add user authentication
- [ ] Multiple CV template options
- [ ] Color theme customization
- [ ] Save draft functionality (requires database)
- [ ] Share CV via link
- [ ] Email CV feature

## 📝 Notes for CTO

### **Architecture Decisions**

1. **No Database (Current)**: Session-based storage for simplicity. Data doesn't persist across sessions.
   - **Next Step**: PostgreSQL for user accounts and saved CVs

2. **WeasyPrint for PDF**: Chosen for high-quality rendering and CSS support
   - **Alternative Considered**: ReportLab (too low-level), pdfkit (webkit dependency issues)

3. **Flask Sessions**: Server-side storage enables back button functionality
   - **Security**: Uses secret key for encryption (needs env variable in production)

### **Performance**
- Current load time: ~1-2 seconds
- PDF generation: ~3-5 seconds
- No caching implemented yet

### **Security Considerations**
- Input sanitization via Jinja2 auto-escaping
- Session-based storage (temporary)
- No SQL injection risk (no database)
- **TODO**: CSRF tokens, rate limiting, environment variables

### **Scalability**
- Stateless design (except sessions)
- Easy to add database layer
- Can scale horizontally
- PDF generation is CPU-intensive (consider queue system for scale)

## 📊 Metrics

- Lines of Code: ~1,500
- Development Time: ~2 weeks
- Dependencies: 8 core packages
- Supported Browsers: Chrome 90+, Firefox 88+, Safari 14+

## 🤝 Contributing

This is currently a development/demo project. For production deployment, consider:
- Moving secrets to environment variables
- Adding comprehensive error handling
- Implementing user authentication
- Setting up logging and monitoring
- Adding unit/integration tests

## 📄 License

MIT License

## 👤 Developer

[Your Name]  
[Your Email]  
[Your GitHub]

---

**Status**: Development/Demo  
**Version**: 1.0.0  
**Last Updated**: December 2025