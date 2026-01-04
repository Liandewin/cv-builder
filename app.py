from flask import Flask, render_template, request, jsonify, send_file, session
from flask_session import Session
from weasyprint import HTML
from datetime import datetime
import json
import os
from io import BytesIO
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Configure server-side sessions
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session'
Session(app)

# Initialize Anthropic client
anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

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
            colors = request_data.get('colors', {'primary': '#667eea', 'accent': '#764ba2'})
        else:
            # Fallback for old format or session data
            cv_data = request_data or session.get('cv_data', {})
            template = 'modern'
            colors = {'primary': '#667eea', 'accent': '#764ba2'}
        
        # Render the CV template with the data, template selection, and colors
        rendered_html = render_template('cv_template.html', cv_data=cv_data, template=template, colors=colors)
        
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

# ==========================================
# AI WRITING ASSISTANT ROUTES
# ==========================================

@app.route('/ai/generate-summary', methods=['POST'])
def ai_generate_summary():
    """Generate professional summary using AI"""
    try:
        data = request.get_json()
        job_title = data.get('job_title', '')
        experience_years = data.get('experience_years', '')
        key_skills = data.get('key_skills', '')
        
        prompt = f"""Write a professional CV summary for a {job_title} with {experience_years} years of experience. 
Key skills: {key_skills}

CRITICAL REQUIREMENTS:
- 2-3 sentences
- Professional tone
- Use active voice
- DO NOT include any specific numbers, percentages, or dollar amounts
- DO NOT fabricate metrics or achievements
- Focus on skills, experience, and professional qualities
- Keep it general and truthful

Only return the summary text, no preamble."""

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        summary = message.content[0].text
        return jsonify({'success': True, 'summary': summary})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ai/improve-bullet', methods=['POST'])
def ai_improve_bullet():
    """Improve a responsibility bullet point using AI"""
    try:
        data = request.get_json()
        bullet = data.get('bullet', '')
        
        prompt = f"""Improve this CV responsibility bullet point to make it more professional and impactful:

"{bullet}"

CRITICAL REQUIREMENTS:
- Make it more professional and action-oriented
- Use strong action verbs (Led, Managed, Developed, Implemented, etc.)
- Keep the SAME core facts and responsibilities
- DO NOT add any numbers, percentages, or metrics that weren't in the original
- DO NOT add dollar amounts, team sizes, or timeframes unless specified in the original
- DO NOT fabricate achievements or results
- Only improve the wording and professionalism
- Keep it concise (1-2 lines)

Only return the improved bullet point, no preamble or explanation."""

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        improved = message.content[0].text.strip()
        return jsonify({'success': True, 'improved': improved})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ai/suggest-skills', methods=['POST'])
def ai_suggest_skills():
    """Suggest relevant skills based on job title"""
    try:
        data = request.get_json()
        job_title = data.get('job_title', '')
        
        prompt = f"""Suggest relevant skills for a {job_title} position.

Provide:
- 8 technical skills
- 6 soft skills

Format as JSON:
{{
  "technical": ["skill1", "skill2", ...],
  "soft": ["skill1", "skill2", ...]
}}

Only return the JSON, no preamble."""

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = message.content[0].text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        skills = json.loads(response_text)
        return jsonify({'success': True, 'skills': skills})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ai/rewrite-tone', methods=['POST'])
def ai_rewrite_tone():
    """Rewrite text in different tone"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        tone = data.get('tone', 'professional')
        
        tone_instructions = {
            'professional': 'more formal and professional',
            'concise': 'more concise and direct, removing unnecessary words',
            'action': 'more action-oriented with strong verbs and impact focus'
        }
        
        instruction = tone_instructions.get(tone, 'professional')
        
        prompt = f"""Rewrite the following text to be {instruction}:

"{text}"

CRITICAL: Keep the same facts and information. DO NOT add numbers, metrics, or achievements that weren't in the original text.

Only return the rewritten text, no preamble or explanation."""

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        rewritten = message.content[0].text.strip()
        return jsonify({'success': True, 'rewritten': rewritten})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ai/check-grammar', methods=['POST'])
def ai_check_grammar():
    """Check and fix grammar/spelling"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        prompt = f"""Check and fix any grammar or spelling errors in this text:

"{text}"

If there are no errors, return the original text.
Only return the corrected text, no preamble or explanation."""

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        corrected = message.content[0].text.strip()
        has_changes = corrected.lower() != text.lower()
        
        return jsonify({
            'success': True, 
            'corrected': corrected,
            'has_changes': has_changes
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app in debug mode
    app.run(debug=True, port=5001)