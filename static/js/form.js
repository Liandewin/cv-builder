// Dynamic form counters
let workExperienceCount = 1;
let educationCount = 1;
let certificationCount = 1;

// Handle form submission
document.getElementById('cvForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = collectFormData();
    
    // Send data to server first (to store in session)
    fetch('/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // Now navigate to preview page (GET request)
            // This creates proper browser history so back button works
            window.location.href = '/preview';
        } else {
            throw new Error('Server error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting form. Please try again.');
    });
});

// Collect all form data into JSON structure
function collectFormData() {
    const formData = {
        personal_info: {
            name: document.getElementById('name').value,
            title: document.getElementById('title').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: {
                street: "",
                city: document.getElementById('city').value,
                state: "",
                zip: "",
                country: document.getElementById('country').value
            },
            linkedin: document.getElementById('linkedin').value,
            website: document.getElementById('website').value,
            photo_url: ""
        },
        professional_summary: document.getElementById('summary').value,
        work_experience: collectWorkExperience(),
        education: collectEducation(),
        skills: {
            technical: collectSkills('technical_skills'),
            soft: collectSkills('soft_skills'),
            languages: []
        },
        certifications: collectCertifications(),
        projects: [],
        references: []
    };
    
    return formData;
}

// Collect work experience entries
function collectWorkExperience() {
    const experiences = [];
    const containers = document.querySelectorAll('#workExperienceContainer .repeatable-item');
    
    containers.forEach(container => {
        const index = container.getAttribute('data-index');
        const responsibilities = document.querySelector(`textarea[name="work_responsibilities_${index}"]`)?.value || '';
        
        const experience = {
            job_title: document.querySelector(`input[name="work_title_${index}"]`)?.value || '',
            company: document.querySelector(`input[name="work_company_${index}"]`)?.value || '',
            location: document.querySelector(`input[name="work_location_${index}"]`)?.value || '',
            start_date: formatDate(document.querySelector(`input[name="work_start_${index}"]`)?.value),
            end_date: formatDate(document.querySelector(`input[name="work_end_${index}"]`)?.value),
            current: document.querySelector(`input[name="work_current_${index}"]`)?.checked || false,
            responsibilities: responsibilities.split('\n').filter(r => r.trim() !== '').map(r => r.replace(/^[•\-]\s*/, '')),
            achievements: []
        };
        
        if (experience.job_title && experience.company) {
            experiences.push(experience);
        }
    });
    
    return experiences;
}

// Collect education entries
function collectEducation() {
    const educationList = [];
    const containers = document.querySelectorAll('#educationContainer .repeatable-item');
    
    containers.forEach(container => {
        const index = container.getAttribute('data-index');
        
        const education = {
            degree: document.querySelector(`input[name="edu_degree_${index}"]`)?.value || '',
            field_of_study: document.querySelector(`input[name="edu_field_${index}"]`)?.value || '',
            institution: document.querySelector(`input[name="edu_institution_${index}"]`)?.value || '',
            location: document.querySelector(`input[name="edu_location_${index}"]`)?.value || '',
            start_date: formatDate(document.querySelector(`input[name="edu_start_${index}"]`)?.value),
            end_date: formatDate(document.querySelector(`input[name="edu_end_${index}"]`)?.value),
            current: false,
            gpa: document.querySelector(`input[name="edu_gpa_${index}"]`)?.value || '',
            honors: ""
        };
        
        if (education.degree && education.institution) {
            educationList.push(education);
        }
    });
    
    return educationList;
}

// Collect skills from comma-separated input
function collectSkills(fieldId) {
    const value = document.getElementById(fieldId)?.value || '';
    return value.split(',').map(s => s.trim()).filter(s => s !== '');
}

// Collect certifications
function collectCertifications() {
    const certifications = [];
    const containers = document.querySelectorAll('#certificationsContainer .repeatable-item');
    
    containers.forEach(container => {
        const index = container.getAttribute('data-index');
        
        const cert = {
            name: document.querySelector(`input[name="cert_name_${index}"]`)?.value || '',
            issuing_organization: document.querySelector(`input[name="cert_org_${index}"]`)?.value || '',
            date_obtained: formatDate(document.querySelector(`input[name="cert_date_${index}"]`)?.value),
            expiry_date: "",
            credential_id: ""
        };
        
        if (cert.name) {
            certifications.push(cert);
        }
    });
    
    return certifications;
}

// Format date from YYYY-MM-DD to readable format
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${day}, ${year}`;
}

// Add work experience entry
function addWorkExperience() {
    const container = document.getElementById('workExperienceContainer');
    const newItem = document.createElement('div');
    newItem.className = 'repeatable-item';
    newItem.setAttribute('data-index', workExperienceCount);
    
    newItem.innerHTML = `
        <h3>Job #${workExperienceCount + 1}</h3>
        <div class="form-grid">
            <div class="form-group">
                <label>Job Title *</label>
                <input type="text" name="work_title_${workExperienceCount}" required>
            </div>
            <div class="form-group">
                <label>Company *</label>
                <input type="text" name="work_company_${workExperienceCount}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="work_location_${workExperienceCount}" placeholder="City, Country">
            </div>
            <div class="form-group">
                <label>Start Date *</label>
                <input type="date" name="work_start_${workExperienceCount}" required>
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="work_end_${workExperienceCount}">
            </div>
            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" name="work_current_${workExperienceCount}"> Currently working here
                </label>
            </div>
            <div class="form-group full-width">
                <label>Key Responsibilities (one per line)</label>
                <textarea name="work_responsibilities_${workExperienceCount}" rows="4" placeholder="• Managed team of 5 developers&#10;• Led project delivery&#10;• Improved system performance"></textarea>
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeItem(this)">Remove Job</button>
    `;
    
    container.appendChild(newItem);
    workExperienceCount++;
}

// Add education entry
function addEducation() {
    const container = document.getElementById('educationContainer');
    const newItem = document.createElement('div');
    newItem.className = 'repeatable-item';
    newItem.setAttribute('data-index', educationCount);
    
    newItem.innerHTML = `
        <h3>Education #${educationCount + 1}</h3>
        <div class="form-grid">
            <div class="form-group">
                <label>Degree *</label>
                <input type="text" name="edu_degree_${educationCount}" placeholder="e.g. Bachelor of Science" required>
            </div>
            <div class="form-group">
                <label>Field of Study *</label>
                <input type="text" name="edu_field_${educationCount}" placeholder="e.g. Computer Science" required>
            </div>
            <div class="form-group full-width">
                <label>Institution *</label>
                <input type="text" name="edu_institution_${educationCount}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="edu_location_${educationCount}">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="edu_start_${educationCount}">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="edu_end_${educationCount}">
            </div>
            <div class="form-group">
                <label>GPA (optional)</label>
                <input type="text" name="edu_gpa_${educationCount}" placeholder="e.g. 3.8/4.0">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeItem(this)">Remove Education</button>
    `;
    
    container.appendChild(newItem);
    educationCount++;
}

// Add certification entry
function addCertification() {
    const container = document.getElementById('certificationsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'repeatable-item';
    newItem.setAttribute('data-index', certificationCount);
    
    newItem.innerHTML = `
        <h3>Certification #${certificationCount + 1}</h3>
        <div class="form-grid">
            <div class="form-group">
                <label>Certification Name</label>
                <input type="text" name="cert_name_${certificationCount}" placeholder="e.g. AWS Solutions Architect">
            </div>
            <div class="form-group">
                <label>Issuing Organization</label>
                <input type="text" name="cert_org_${certificationCount}" placeholder="e.g. Amazon Web Services">
            </div>
            <div class="form-group">
                <label>Date Obtained</label>
                <input type="date" name="cert_date_${certificationCount}">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeItem(this)">Remove Certification</button>
    `;
    
    container.appendChild(newItem);
    certificationCount++;
}

// Remove a repeatable item
function removeItem(button) {
    const item = button.closest('.repeatable-item');
    item.remove();
}