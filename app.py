from flask import Flask, render_template, request, jsonify, send_file, session
from weasyprint import HTML
from datetime import datetime
import json
import os
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'  # Required for sessions

# Route for the main page (form input)
@app.route('/')
def index():
    """Display the CV input form"""
    return render_template('index.html')

# Route to handle form submission and show preview
@app.route('/preview', methods=['GET', 'POST'])
def preview():
    """
    Receive CV data from the form and display a preview
    """
    if request.method == 'POST':
        # Get JSON data from the request
        cv_data = request.get_json()
        # Store in Flask session
        session['cv_data'] = cv_data
    else:
        # For GET request, retrieve from session
        cv_data = session.get('cv_data', {})
    
    return render_template('preview.html', cv_data=cv_data)

# Route to generate and download PDF
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate a PDF from the CV data
    """
    try:
        # Get data from request
        request_data = request.get_json()
        
        # Extract CV data and template
        if isinstance(request_data, dict) and 'cv_data' in request_data:
            cv_data = request_data['cv_data']
            template = request_data.get('template', 'modern')
        else:
            # Fallback for old format or session data
            cv_data = request_data or session.get('cv_data', {})
            template = 'modern'
        
        # Render the CV template with the data and template selection
        rendered_html = render_template('cv_template.html', cv_data=cv_data, template=template)
        
        # Convert HTML to PDF using WeasyPrint
        pdf_file = HTML(string=rendered_html).write_pdf()
        
        # Create a filename with timestamp
        filename = f"CV_{cv_data.get('personal_info', {}).get('name', 'Unknown').replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        # Return PDF as downloadable file
        return send_file(
            BytesIO(pdf_file),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        # Print full error to console for debugging
        import traceback
        print("=" * 50)
        print("PDF GENERATION ERROR:")
        print("=" * 50)
        traceback.print_exc()
        print("=" * 50)
        return jsonify({'error': str(e)}), 500

# Route to validate CV data against schema
@app.route('/validate', methods=['POST'])
def validate_cv_data():
    """
    Validate submitted CV data against the JSON schema
    """
    try:
        cv_data = request.get_json()
        
        # Load schema
        with open('cv_schema.json', 'r') as f:
            schema = json.load(f)
        
        # Here you would add JSON schema validation
        # For now, we'll do basic validation
        errors = []
        
        # Check required fields
        if not cv_data.get('personal_info', {}).get('name'):
            errors.append('Name is required')
        if not cv_data.get('personal_info', {}).get('email'):
            errors.append('Email is required')
        
        if errors:
            return jsonify({'valid': False, 'errors': errors}), 400
        
        return jsonify({'valid': True, 'message': 'CV data is valid'})
    
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

# API route to get the CV schema (useful for frontend)
@app.route('/api/schema')
def get_schema():
    """Return the CV schema as JSON"""
    try:
        with open('cv_schema.json', 'r') as f:
            schema = json.load(f)
        return jsonify(schema)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app in debug mode
    app.run(debug=True, port=5001)