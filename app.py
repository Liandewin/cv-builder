from flask import Flask, render_template, request, jsonify, send_file
from weasyprint import HTML
from datetime import datetime
import json
import os
from io import BytesIO

app = Flask(__name__)

# Route for the main page (form input)
@app.route('/')
def index():
    """Display the CV input form"""
    return render_template('index.html')

# Route to handle form submission and show preview
@app.route('/preview', methods=['POST'])
def preview():
    """
    Receive CV data from the form and display a preview
    """
    # Get JSON data from the request
    cv_data = request.get_json()
    
    # Validate the data against schema (optional but recommended)
    # For now, we'll just pass it to the template
    
    # Store in session or pass directly to template
    return render_template('preview.html', cv_data=cv_data)

# Route to generate and download PDF
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate a PDF from the CV data
    """
    try:
        # Get CV data from request
        cv_data = request.get_json()
        
        # Render the CV template with the data
        rendered_html = render_template('cv_template.html', cv_data=cv_data)
        
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
    app.run(debug=True, port=5000)