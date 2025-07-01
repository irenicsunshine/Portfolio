// Skill Animation System

// Animation creators
const animationCreators = {
    // Programming Languages
    'Python': createCodingAnimation,
    'JavaScript': createCodingAnimation,
    'TypeScript': createCodingAnimation,
    'HTML': createWebAnimation,
    'CSS': createWebAnimation,
    'SCSS': createWebAnimation,
    'Shell': createTerminalAnimation,
    'CLI': createTerminalAnimation,
    
    // AI/ML
    'PyTorch': createAIAnimation,
    'RAG': createAIAnimation,
    'NLP': createAIAnimation,
    'NLTK': createAIAnimation,
    'Transformers': createAIAnimation,
    'GAN': createAIAnimation,
    'Deep Learning': createAIAnimation,
    'Computer Vision': createAIAnimation,
    'CNN': createAIAnimation,
    
    // Web Development
    'React': createWebAnimation,
    'Next.js': createWebAnimation,
    'Node.js': createWebAnimation,
    'Vite': createWebAnimation,
    'API': createWebAnimation,
    'GraphQL': createWebAnimation,
    
    // Data Science
    'NumPy': createDataScienceAnimation,
    'OpenCV': createDataScienceAnimation,
    'Scikit-learn': createDataScienceAnimation,
    'Pandas': createDataScienceAnimation,
    
    // Tools & Platforms
    'Git': createTerminalAnimation,
    'Docker': createTerminalAnimation,
    'Odoo': createTerminalAnimation,
    'Flask': createTerminalAnimation,
    'Streamlit': createTerminalAnimation,
    'Telegram Bot': createTerminalAnimation,
    'Pytest': createTerminalAnimation,
    
    // Other Categories
    'ERP': createTerminalAnimation,
    'Analysis': createTerminalAnimation,
    'Research': createTerminalAnimation
};

// Function to get the appropriate animation creator based on skill name
function getAnimationCreator(skillName) {
    // First try exact match
    if (animationCreators[skillName]) {
        return animationCreators[skillName];
    }
    
    // Try case-insensitive match
    const lowerSkill = skillName.toLowerCase();
    for (const [key, creator] of Object.entries(animationCreators)) {
        if (key.toLowerCase() === lowerSkill) {
            return creator;
        }
    }
    
    // Default to coding animation
    return createCodingAnimation;
}

// Function to show skill animation
function showSkillAnimation(skillName) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'skill-animation-overlay';
    
    // Create container
    const container = document.createElement('div');
    container.className = 'skill-animation-container';
    
    // Get the appropriate animation creator
    const creator = getAnimationCreator(skillName);
    const animation = creator(skillName);
    
    // Create close button
    const closeBtn = document.createElement('div');
    closeBtn.className = 'animation-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', hideSkillAnimation);
    
    // Create title
    const title = document.createElement('div');
    title.className = 'animation-title';
    title.textContent = skillName;
    
    // Assemble the animation
    container.appendChild(animation);
    container.appendChild(closeBtn);
    container.appendChild(title);
    overlay.appendChild(container);
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Add class to show animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 10);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            hideSkillAnimation();
        }
    });
    
    // Close on Escape key
    const handleKeyDown = function(e) {
        if (e.key === 'Escape') {
            hideSkillAnimation();
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Store reference for cleanup
    overlay._keyDownHandler = handleKeyDown;
    
    return overlay;
}

// Function to hide skill animation
function hideSkillAnimation() {
    const overlay = document.querySelector('.skill-animation-overlay');
    if (overlay) {
        // Remove keydown event listener
        document.removeEventListener('keydown', overlay._keyDownHandler);
        
        // Start fade out
        overlay.classList.remove('visible');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Add click listeners to all skill items
function addSkillClickListeners() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('click', function() {
            const skillName = this.textContent.trim();
            showSkillAnimation(skillName);
        });
    });
}

// Initialize skill animations
function initSkillAnimations() {
    // Add click listeners to existing skills
    addSkillClickListeners();
    
    // Also observe for dynamically added skills
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                addSkillClickListeners();
            }
        });
    });
    
    // Start observing the skills container
    const skillsContainer = document.querySelector('.skills-grid');
    if (skillsContainer) {
        observer.observe(skillsContainer, { childList: true, subtree: true });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSkillAnimations();
});
