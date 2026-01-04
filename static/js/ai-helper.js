// AI Writing Assistant Functions

let currentFieldForTone = null;

// Open AI Generate Summary Modal
function openAIGenerateSummary() {
    document.getElementById('aiSummaryModal').style.display = 'flex';
    // Pre-fill job title if available
    const titleField = document.getElementById('title');
    if (titleField && titleField.value) {
        document.getElementById('aiJobTitle').value = titleField.value;
    }
}

// Open AI Skills Suggester Modal
function openAISkillsSuggester() {
    document.getElementById('aiSkillsModal').style.display = 'flex';
    // Pre-fill job title if available
    const titleField = document.getElementById('title');
    if (titleField && titleField.value) {
        document.getElementById('aiSkillJobTitle').value = titleField.value;
    }
}

// Close AI Modal
function closeAIModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear results
    const results = document.querySelectorAll('.ai-result');
    results.forEach(result => result.innerHTML = '');
}

// Generate Summary with AI
async function generateSummaryAI() {
    const jobTitle = document.getElementById('aiJobTitle').value;
    const experience = document.getElementById('aiExperience').value;
    const skills = document.getElementById('aiKeySkills').value;
    
    if (!jobTitle) {
        alert('Please enter your job title');
        return;
    }
    
    const resultDiv = document.getElementById('aiSummaryResult');
    resultDiv.innerHTML = '<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> Generating...</div>';
    
    try {
        const response = await fetch('/ai/generate-summary', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                job_title: jobTitle,
                experience_years: experience,
                key_skills: skills
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="ai-success">
                    <p>${data.summary}</p>
                    <div class="ai-actions">
                        <button class="ai-use-btn" onclick="useSummary('${data.summary.replace(/'/g, "\\'")}')">
                            <i class="fas fa-check"></i> Use This
                        </button>
                        <button class="ai-regenerate-btn" onclick="generateSummaryAI()">
                            <i class="fas fa-redo"></i> Regenerate
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="ai-error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="ai-error">Error: ${error.message}</div>`;
    }
}

// Use Generated Summary
function useSummary(summary) {
    document.getElementById('summary').value = summary;
    closeAIModal('aiSummaryModal');
}

// Suggest Skills with AI
async function suggestSkillsAI() {
    const jobTitle = document.getElementById('aiSkillJobTitle').value;
    
    if (!jobTitle) {
        alert('Please enter a job title');
        return;
    }
    
    const resultDiv = document.getElementById('aiSkillsResult');
    resultDiv.innerHTML = '<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> Suggesting skills...</div>';
    
    try {
        const response = await fetch('/ai/suggest-skills', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({job_title: jobTitle})
        });
        
        const data = await response.json();
        
        if (data.success) {
            const technical = data.skills.technical.join(', ');
            const soft = data.skills.soft.join(', ');
            
            resultDiv.innerHTML = `
                <div class="ai-success">
                    <h4>Technical Skills:</h4>
                    <p class="skill-preview">${technical}</p>
                    <h4>Soft Skills:</h4>
                    <p class="skill-preview">${soft}</p>
                    <div class="ai-actions">
                        <button class="ai-use-btn" onclick="useSkills('${technical}', '${soft}')">
                            <i class="fas fa-check"></i> Add These Skills
                        </button>
                        <button class="ai-regenerate-btn" onclick="suggestSkillsAI()">
                            <i class="fas fa-redo"></i> Regenerate
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="ai-error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="ai-error">Error: ${error.message}</div>`;
    }
}

// Use Suggested Skills
function useSkills(technical, soft) {
    const technicalField = document.getElementById('technical_skills');
    const softField = document.getElementById('soft_skills');
    
    // Get existing skills
    const existingTechnical = technicalField.value.trim();
    const existingSoft = softField.value.trim();
    
    // Add new skills to existing ones (avoiding duplicates)
    if (existingTechnical) {
        // Combine and remove duplicates
        const allTechnical = existingTechnical + ', ' + technical;
        const technicalArray = allTechnical.split(',').map(s => s.trim()).filter(s => s);
        const uniqueTechnical = [...new Set(technicalArray)];
        technicalField.value = uniqueTechnical.join(', ');
    } else {
        technicalField.value = technical;
    }
    
    if (existingSoft) {
        // Combine and remove duplicates
        const allSoft = existingSoft + ', ' + soft;
        const softArray = allSoft.split(',').map(s => s.trim()).filter(s => s);
        const uniqueSoft = [...new Set(softArray)];
        softField.value = uniqueSoft.join(', ');
    } else {
        softField.value = soft;
    }
    
    closeAIModal('aiSkillsModal');
}

// Improve Text with AI (for summary or any field)
async function improveWithAI(fieldId) {
    const field = document.getElementById(fieldId);
    const text = field.value.trim();
    
    if (!text) {
        alert('Please enter some text first');
        return;
    }
    
    // Show loading
    const originalValue = field.value;
    field.disabled = true;
    field.style.opacity = '0.6';
    
    try {
        // First improve the content
        const response = await fetch('/ai/improve-bullet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({bullet: text})
        });
        
        const data = await response.json();
        
        if (data.success) {
            field.value = data.improved;
            field.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                field.style.backgroundColor = '';
            }, 2000);
        } else {
            alert('Error: ' + data.error);
            field.value = originalValue;
        }
    } catch (error) {
        alert('Error: ' + error.message);
        field.value = originalValue;
    } finally {
        field.disabled = false;
        field.style.opacity = '1';
    }
}

// Improve Multiple Bullets (for responsibilities textarea)
async function improveBullets(fieldId) {
    const field = document.querySelector(`textarea[name="${fieldId}"]`);
    const text = field.value.trim();
    
    if (!text) {
        alert('Please enter some text first');
        return;
    }
    
    const bullets = text.split('\n').filter(b => b.trim());
    
    if (bullets.length === 0) {
        alert('No bullets found');
        return;
    }
    
    field.disabled = true;
    field.style.opacity = '0.6';
    
    try {
        const improved = [];
        
        for (const bullet of bullets) {
            const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '');
            
            const response = await fetch('/ai/improve-bullet', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({bullet: cleanBullet})
            });
            
            const data = await response.json();
            
            if (data.success) {
                improved.push('• ' + data.improved);
            } else {
                improved.push(bullet);
            }
        }
        
        field.value = improved.join('\n');
        field.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            field.style.backgroundColor = '';
        }, 2000);
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        field.disabled = false;
        field.style.opacity = '1';
    }
}

// Check Grammar
async function checkGrammar(fieldId) {
    const field = document.getElementById(fieldId) || document.querySelector(`textarea[name="${fieldId}"]`);
    const text = field.value.trim();
    
    if (!text) {
        alert('Please enter some text first');
        return;
    }
    
    field.disabled = true;
    field.style.opacity = '0.6';
    
    try {
        const response = await fetch('/ai/check-grammar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: text})
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.has_changes) {
                field.value = data.corrected;
                field.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    field.style.backgroundColor = '';
                }, 2000);
            } else {
                alert('✓ No grammar errors found!');
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        field.disabled = false;
        field.style.opacity = '1';
    }
}

// Rewrite with Tone
async function rewriteTone(tone) {
    if (!currentFieldForTone) return;
    
    const field = document.getElementById(currentFieldForTone);
    const text = field.value.trim();
    
    if (!text) {
        alert('Please enter some text first');
        return;
    }
    
    const resultDiv = document.getElementById('aiToneResult');
    resultDiv.innerHTML = '<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> Rewriting...</div>';
    
    try {
        const response = await fetch('/ai/rewrite-tone', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: text, tone: tone})
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="ai-success">
                    <p>${data.rewritten}</p>
                    <div class="ai-actions">
                        <button class="ai-use-btn" onclick="useRewritten('${data.rewritten.replace(/'/g, "\\'")}')">
                            <i class="fas fa-check"></i> Use This
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="ai-error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="ai-error">Error: ${error.message}</div>`;
    }
}

// Open Tone Rewriter Modal
function openToneRewriter(fieldId) {
    currentFieldForTone = fieldId;
    document.getElementById('aiToneModal').style.display = 'flex';
}

// Use Rewritten Text
function useRewritten(text) {
    if (currentFieldForTone) {
        document.getElementById(currentFieldForTone).value = text;
    }
    closeAIModal('aiToneModal');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('ai-modal')) {
        event.target.style.display = 'none';
    }
}