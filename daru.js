// Constants
const GRADE_POINTS = {
    'S': 10, 'A': 9, 'B': 8, 
    'C': 7, 'D': 6, 'E': 5};

const PERFORMANCE_THRESHOLDS = [
    { threshold: 9, message: 'Outstanding Performance! 🏆' },
    { threshold: 8, message: 'Excellent Work! 👍' },
    { threshold: 7, message: 'Good Performance 👌' },
    { threshold: 6, message: 'Satisfactory 🤨' },
    { threshold: 0, message: 'Need Improvement 📚' }
];

// Helper Functions
const animateValue = (start, end, duration, element) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = progress * (end - start) + start;
        element.textContent = currentValue.toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const validateInput = (value, min, max, fieldName) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        throw new Error(`Please enter a valid number for ${fieldName}`);
    }
    if (numValue < min || numValue > max) {
        throw new Error(`${fieldName} should be between ${min} and ${max}`);
    }
    return numValue;
};

const formatCredit = (value) => {
    // Convert to float and round to 2 decimal places
    return parseFloat(parseFloat(value).toFixed(2));
};

const getPerformanceRemark = (score) => {
    return PERFORMANCE_THRESHOLDS.find(({ threshold }) => score >= threshold)?.message || 'Need Improvement 📚';
};

const showResult = (resultDiv, score, isGPA = true) => {
    const scoreType = isGPA ? 'GPA' : 'CGPA';
    resultDiv.innerHTML = `
        <h3>Your ${scoreType}: <span class="score-value">0.00</span></h3>
        <p>Performance: ${getPerformanceRemark(score)}</p>
        <p class="total-credits">Total Credits: <span class="credits-value">0.00</span></p>
    `;
    resultDiv.classList.add('show');
    
    // Animate the score value
    const scoreElement = resultDiv.querySelector('.score-value');
    animateValue(0, score, 1000, scoreElement);
};

const showError = (message) => {
    alert(message);
};

// Main Functions
function switchTab(type) {
    try {
        const sections = document.querySelectorAll('.calculator-section');
        const tabs = document.querySelectorAll('.tab');
        
        sections.forEach(section => {
            section.style.display = section.id === `${type}-section` ? 'block' : 'none';
        });

        tabs.forEach(tab => {
            tab.classList.toggle('active', 
                tab.textContent.toLowerCase().includes(type)
            );
        });

        // Reset results when switching tabs
        document.querySelectorAll('.result-card').forEach(card => {
            card.classList.remove('show');
            card.innerHTML = '';
        });
    } catch (error) {
        showError('Error switching tabs. Please try again.');
    }
}

function generateSubjectFields() {
    try {
        const numSubjects = parseInt(document.getElementById('num-subjects').value);
        const subjectFieldsDiv = document.getElementById('subject-fields');
        const calculateButton = document.getElementById('calculate-gpa-btn');
        
        if (numSubjects < 1 || numSubjects > 20) {
            throw new Error("Please enter a valid number of subjects (1-20).");
        }

        subjectFieldsDiv.innerHTML = '';
        
        // Create subject fields with animation delay
        for (let i = 0; i < numSubjects; i++) {
            const row = document.createElement('div');
            row.classList.add('subject-row');
            row.style.animation = `fadeIn 0.5s ease forwards ${i * 0.1}s`;
            
            row.innerHTML = `
                <input type="number" 
                    id="credit-${i}" 
                    min="0.5" 
                    max="6" 
                    step="0.5"
                    placeholder="Credits for Subject ${i + 1} (0.5-6.0)"
                    required>
                <select id="grade-${i}" required>
                    ${Object.keys(GRADE_POINTS).map(grade => 
                        `<option value="${grade}">${grade}</option>`
                    ).join('')}
                </select>
            `;
            
            // Add input event listener for credit validation
            const creditInput = row.querySelector(`#credit-${i}`);
            creditInput.addEventListener('input', function(e) {
                let value = e.target.value;
                if (value !== "") {
                    // Ensure the value is within bounds
                    value = Math.max(0.5, Math.min(6, parseFloat(value) || 0.5));
                    // Format to at most 2 decimal places
                    value = formatCredit(value);
                    e.target.value = value;
                }
            });

            subjectFieldsDiv.appendChild(row);
        }

        calculateButton.style.display = 'block';
        calculateButton.style.animation = 'fadeIn 0.5s ease forwards';
    } catch (error) {
        showError(error.message);
    }
}

function calculateGPA() {
    try {
        const numSubjects = parseInt(document.getElementById('num-subjects').value);
        let totalCredits = 0;
        let weightedGradePoints = 0;

        // Validate and calculate for each subject
        for (let i = 0; i < numSubjects; i++) {
            const creditInput = document.getElementById(`credit-${i}`);
            const gradeSelect = document.getElementById(`grade-${i}`);
            
            const credit = validateInput(creditInput.value, 0.5, 6, `Subject ${i + 1} credits`);
            const grade = gradeSelect.value;

            totalCredits = formatCredit(totalCredits + credit);
            weightedGradePoints = formatCredit(weightedGradePoints + (credit * GRADE_POINTS[grade]));
        }

        if (totalCredits === 0) {
            throw new Error("Total credits cannot be zero");
        }

        const gpa = formatCredit(weightedGradePoints / totalCredits);
        const resultDiv = document.getElementById('gpa-result');
        showResult(resultDiv, gpa, true);
        
        // Update total credits display
        const creditsElement = resultDiv.querySelector('.credits-value');
        if (creditsElement) {
            creditsElement.textContent = totalCredits.toFixed(2);
        }

        // Add success animation to calculator wrapper
        document.querySelector('.calculator-wrapper').classList.add('calculation-success');
        setTimeout(() => {
            document.querySelector('.calculator-wrapper').classList.remove('calculation-success');
        }, 1000);

    } catch (error) {
        showError(error.message);
    }
}

function calculateCGPA() {
    try {
        const previousCGPA = validateInput(
            document.getElementById('previous-cgpa').value,
            0, 10,
            'Previous CGPA'
        );
        const currentGPA = validateInput(
            document.getElementById('current-gpa').value,
            0, 10,
            'Current GPA'
        );
        const totalCredits = validateInput(
            document.getElementById('total-credits').value,
            0.5, 200,
            'Total Credits'
        );
        const currentCredits = validateInput(
            document.getElementById('current-credits').value,
            0.5, 31,
            'Current Credits'
        );

        const newCGPA = formatCredit(
            ((previousCGPA * totalCredits) + (currentGPA * currentCredits)) / 
            (totalCredits + currentCredits)
        );
        
        const resultDiv = document.getElementById('cgpa-result');
        showResult(resultDiv, newCGPA, false);
        
        // Update total credits display
        const creditsElement = resultDiv.querySelector('.credits-value');
        if (creditsElement) {
            creditsElement.textContent = formatCredit(totalCredits + currentCredits).toFixed(2);
        }

        // Add success animation
        document.querySelector('.calculator-wrapper').classList.add('calculation-success');
        setTimeout(() => {
            document.querySelector('.calculator-wrapper').classList.remove('calculation-success');
        }, 1000);

    } catch (error) {
        showError(error.message);
    }
}

function toggleDarkMode() {
    try {
        document.body.classList.toggle('dark-mode');
        const button = document.querySelector('.mode-toggle');
        button.textContent = document.body.classList.contains('dark-mode') ? '🌞' : '🌓';
        
        // Add rotation animation
        button.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            button.style.transform = 'rotate(0deg)';
        }, 500);
    } catch (error) {
        showError('Error toggling dark mode');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add input validation for number of subjects
    const numSubjectsInput = document.getElementById('num-subjects');
    numSubjectsInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > 20) {
            e.target.value = 20;
        } else if (value < 0) {
            e.target.value = 0;
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') { // Ctrl + D for dark mode
            e.preventDefault();
            toggleDarkMode();
        }
    });
});

// Add these CSS keyframes to your stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes calculation-success {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);