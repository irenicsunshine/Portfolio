// enhance.js (Node.js only, for build-time enhancement with ALL advanced features)
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { JSDOM } = require('jsdom');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const PORTFOLIO_VERSION = '1.0.2'; // Increment to refresh cache
const PORTFOLIO_HTML = 'index.html';
const GITHUB_REPOS = [
  'irenicsunshine/Beyond-the-window',
  'irenicsunshine/Sentiment-Analysis',
  'irenicsunshine/Multi-Class-Image-Classifier-using-PyTorch-CNNs',
  'irenicsunshine/Odoo',
  'irenicsunshine/DataNexus',
  'irenicsunshine/Image-Colorization-using-Pix2Pix-GAN'
];

// ================== FILE-BASED CACHING SYSTEM (replacing localStorage) ==================
const CACHE_DIR = '.portfolio-cache';

function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR);
    }
}

function getCacheKey(repoName) {
    return `portfolio_${repoName}_${PORTFOLIO_VERSION}`;
}

function getCachedDescription(repoName) {
    try {
        const cachePath = `${CACHE_DIR}/${getCacheKey(repoName)}.json`;
        if (fs.existsSync(cachePath)) {
            return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        }
    } catch (e) {}
    return null;
}

function setCachedDescription(repoName, data) {
    try {
        ensureCacheDir();
        const cachePath = `${CACHE_DIR}/${getCacheKey(repoName)}.json`;
        fs.writeFileSync(cachePath, JSON.stringify({
            ...data,
            timestamp: Date.now()
        }));
    } catch (e) {}
}

function getCachedSkills() {
    try {
        const cachePath = `${CACHE_DIR}/portfolio_skills_${PORTFOLIO_VERSION}.json`;
        if (fs.existsSync(cachePath)) {
            return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        }
    } catch (e) {}
    return null;
}

function setCachedSkills(skills) {
    try {
        ensureCacheDir();
        const cachePath = `${CACHE_DIR}/portfolio_skills_${PORTFOLIO_VERSION}.json`;
        fs.writeFileSync(cachePath, JSON.stringify({
            skills: skills,
            timestamp: Date.now()
        }));
    } catch (e) {}
}

function clearOldCache() {
    try {
        if (!fs.existsSync(CACHE_DIR)) return;
        const files = fs.readdirSync(CACHE_DIR);
        files.forEach(file => {
            if (file.startsWith('portfolio_') && !file.includes(PORTFOLIO_VERSION)) {
                fs.unlinkSync(`${CACHE_DIR}/${file}`);
            }
        });
    } catch (e) {}
}

// ================== GITHUB API INTEGRATION ==================
function getGitHubRepoInfo(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, '')
        };
    }
    return null;
}

async function safeGitHubFetch(url, maxRetries = 3) {
    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Portfolio-Enhancement-Script',
        'X-GitHub-Api-Version': '2022-11-28'
    };
    
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, { headers });
            
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const resetTime = response.headers.get('X-RateLimit-Reset');
            
            if (remaining) {
                console.log(`GitHub API: ${remaining} requests remaining`);
            }
            
            if (response.status === 404) {
                console.warn(`Resource not found: ${url}`);
                throw new Error('Resource not found');
            }
            
            if (response.status === 403) {
                const resetDate = new Date(resetTime * 1000);
                console.warn(`Rate limited. Resets at: ${resetDate}`);
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000 * (attempt + 1)));
                    continue;
                }
                throw new Error('GitHub API rate limit exceeded');
            }
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (attempt === maxRetries - 1) {
                throw error;
            }
            console.log(`Attempt ${attempt + 1} failed for ${url}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
    }
}

// ================== DEEP REPOSITORY ANALYSIS ==================
async function fetchRepoDataWithSkills(owner, repo) {
    try {
        console.log(`🔍 Fetching data for: ${repo}`);
        
        let repoData = {
            name: repo,
            description: '',
            language: '',
            topics: [],
            stars: 0,
            forks: 0,
            lastUpdated: 'Recently',
            readme: '',
            languages: {},
            contents: [],
            detectedSkills: []
        };
        
        // Get basic repo info
        try {
            const response = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}`);
            const data = await response.json();
            
            repoData = {
                ...repoData,
                name: data.name,
                description: data.description || '',
                language: data.language || '',
                topics: data.topics || [],
                stars: data.stargazers_count || 0,
                forks: data.forks_count || 0,
                lastUpdated: new Date(data.updated_at).toLocaleDateString()
            };
            
            console.log(`✅ Basic repo data fetched for ${repo}`);
        } catch (error) {
            console.warn(`⚠️ Could not fetch repo data for ${repo}: ${error.message}`);
        }
        
        // Get languages with delay
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const languagesResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
            repoData.languages = await languagesResponse.json();
            console.log(`✅ Languages fetched for ${repo}:`, Object.keys(repoData.languages));
        } catch (error) {
            console.log(`⚠️ Could not fetch languages for ${repo}: ${error.message}`);
        }
        
        // Get README with delay
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const readmeResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
            const readmeData = await readmeResponse.json();
            const decodedContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            repoData.readme = decodedContent.substring(0, 1000);
            console.log(`✅ README fetched for ${repo} (${decodedContent.length} chars)`);
        } catch (error) {
            console.log(`⚠️ No README found for ${repo}: ${error.message}`);
        }

        // Get repository contents with delay
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const contentsResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
            const contents = await contentsResponse.json();
            repoData.contents = Array.isArray(contents) ? contents : [];
            console.log(`✅ Contents fetched for ${repo} (${repoData.contents.length} items)`);
        } catch (error) {
            console.log(`⚠️ Could not fetch contents for ${repo}: ${error.message}`);
            repoData.contents = [];
        }

        // ALWAYS analyze technologies
        repoData.detectedSkills = analyzeRepositoryTechnologies(repoData, repo);
        console.log(`🔧 Detected skills for ${repo}:`, repoData.detectedSkills);
        
        return repoData;
    } catch (error) {
        console.error(`❌ Error fetching repo data for ${repo}:`, error);
        
        return {
            name: repo,
            description: '',
            language: '',
            topics: [],
            stars: 0,
            forks: 0,
            lastUpdated: 'Recently',
            readme: '',
            languages: {},
            contents: [],
            detectedSkills: inferSkillsFromRepoName(repo)
        };
    }
}

// ================== ADVANCED TECHNOLOGY DETECTION ==================
function analyzeRepositoryTechnologies(repoData, repoName) {
    const detectedSkills = new Set();
    
    // Add programming languages
    Object.keys(repoData.languages).forEach(lang => {
        detectedSkills.add(lang);
    });

    const searchText = (repoData.readme + ' ' + repoData.description + ' ' + repoName).toLowerCase();
    const fileNames = (repoData.contents || []).map(item => item.name.toLowerCase()).join(' ');
    
    // Enhanced detection patterns (ALL your patterns)
    const techPatterns = {
        // Frontend Frameworks
        'React': ['react', 'jsx', 'package.json.*react'],
        'Next.js': ['next', 'nextjs', 'next.config'],
        'Vue.js': ['vue', '.vue'],
        'Angular': ['angular', 'angular.json'],
        'Tailwind CSS': ['tailwind', 'tailwind.config'],
        'Bootstrap': ['bootstrap'],
        'Vite': ['vite', 'vite.config'],
        
        // Backend Frameworks
        'Express': ['express', 'require.*express'],
        'Django': ['django', 'manage.py', 'settings.py'],
        'Flask': ['flask', 'from flask import'],
        'FastAPI': ['fastapi', 'from fastapi import'],
        'Node.js': ['nodejs', 'node.js', 'package.json'],
        
        // Databases
        'MongoDB': ['mongodb', 'mongo', 'mongoose'],
        'PostgreSQL': ['postgresql', 'postgres', 'psycopg2'],
        'MySQL': ['mysql', 'pymysql'],
        'Redis': ['redis'],
        'SQLite': ['sqlite'],
        
        // ML/AI Frameworks
        'TensorFlow': ['tensorflow', 'import tensorflow'],
        'PyTorch': ['pytorch', 'torch', 'import torch'],
        'Scikit-learn': ['scikit', 'sklearn', 'from sklearn'],
        'Pandas': ['pandas', 'import pandas'],
        'NumPy': ['numpy', 'import numpy'],
        'OpenCV': ['opencv', 'cv2', 'import cv2'],
        'NLTK': ['nltk', 'import nltk'],
        'Transformers': ['transformers', 'huggingface', 'from transformers'],
        'Computer Vision': ['computer vision', 'image classifier', 'cnn', 'convolutional'],
        'NLP': ['sentiment analysis', 'nlp', 'natural language', 'text processing'],
        'GAN': ['gan', 'generative', 'pix2pix', 'adversarial'],
        'RAG': ['rag', 'retrieval', 'augmented generation'],
        'Deep Learning': ['deep learning', 'neural network', 'cnn', 'rnn'],
        
        // DevOps & Tools
        'Docker': ['docker', 'dockerfile', 'docker-compose'],
        'Kubernetes': ['kubernetes', 'k8s', 'kubectl'],
        'Git': ['git', '.gitignore'],
        'AWS': ['aws', 'boto3', 'aws-sdk'],
        'Google Cloud': ['google cloud', 'gcp', 'google-cloud'],
        'Azure': ['azure', 'microsoft azure'],
        
        // Web Technologies
        'API': ['api', 'rest', 'restful', 'endpoint'],
        'GraphQL': ['graphql', 'apollo'],
        'WebSocket': ['websocket', 'socket.io'],
        'CLI': ['cli', 'command line', 'argparse'],
        
        // Testing
        'Jest': ['jest', '.test.js'],
        'Pytest': ['pytest', 'test_'],
        'Mocha': ['mocha'],
        'Cypress': ['cypress'],
        
        // Build Tools
        'Webpack': ['webpack', 'webpack.config'],
        'Parcel': ['parcel'],
        
        // Other Technologies
        'TypeScript': ['typescript', '.ts', 'tsconfig.json'],
        'ERP': ['erp', 'odoo', 'enterprise resource'],
        'Jupyter Notebook': ['jupyter', '.ipynb'],
        'CSS': ['css', 'stylesheet'],
        'HTML': ['html', '.html'],
        'Streamlit': ['streamlit', 'st.'],
        'Telegram Bot': ['telegram', 'bot', 'telebot']
    };

    // Check each pattern
    for (const [tech, keywords] of Object.entries(techPatterns)) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword) || fileNames.includes(keyword)) {
                detectedSkills.add(tech);
                break;
            }
        }
    }
    
    return Array.from(detectedSkills);
}

function inferSkillsFromRepoName(repoName) {
    const name = repoName.toLowerCase();
    const skills = [];
    
    if (name.includes('python') || name.includes('ml') || name.includes('ai')) skills.push('Python');
    if (name.includes('react') || name.includes('next')) skills.push('React');
    if (name.includes('node')) skills.push('Node.js');
    if (name.includes('docker')) skills.push('Docker');
    if (name.includes('sentiment')) skills.push('NLP');
    if (name.includes('image') || name.includes('classifier')) skills.push('Computer Vision');
    if (name.includes('gan')) skills.push('GAN');
    if (name.includes('pytorch')) skills.push('PyTorch');
    if (name.includes('odoo') || name.includes('erp')) skills.push('ERP');
    
    return skills;
}

// ================== AI DESCRIPTION GENERATION ==================
async function generateAIDescription(repoData) {
    // Try HF API first
    if (HF_TOKEN && HF_TOKEN !== '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') {
        try {
            const prompt = `Write a detailed, professional, and engaging summary for a developer portfolio project.
Project name: ${repoData.name}
GitHub description: ${repoData.description}
Technologies: ${repoData.detectedSkills.join(', ')}
README snippet: ${repoData.readme ? repoData.readme.substring(0, 300) : ''}
Highlight the project's purpose, features, and technical depth.`;

            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/BioGPT-Large', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 120 } })
            });

            if (response.ok) {
                const result = await response.json();
                const text = Array.isArray(result)
                    ? (result[0].generated_text || result[0].summary_text || '')
                    : (result.generated_text || result.summary_text || '');
                if (text.trim()) return text.trim();
            }
        } catch (error) {
            console.log('HF API failed, using smart fallback');
        }
    }
    
    return createSmartEnhancement(repoData);
}

function createSmartEnhancement(repoData) {
    const enhancements = [];
    
    // Add GitHub description
    if (repoData.description && repoData.description.trim()) {
        enhancements.push(repoData.description);
    }
    
    // Add README insights (with ALL your cleaning logic)
    if (repoData.readme && repoData.readme.trim()) {
        let cleanReadme = repoData.readme
            .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images ![alt](url)
            .replace(/\[[^\]]*\]\([^)]+\)/g, '') // Remove links [text](url)
            .replace(/[#*`>]/g, ' ')             // Remove markdown symbols
            .replace(/\s+/g, ' ')                // Collapse whitespace
            .trim();
        const readmeSnippet = cleanReadme.substring(0, 150);
        if (readmeSnippet && readmeSnippet.length > 20) {
            enhancements.push(`${readmeSnippet}...`);
        }
    }
    
    // Add technology summary
    if (repoData.detectedSkills.length > 0) {
        const topSkills = repoData.detectedSkills.slice(0, 3);
        enhancements.push(`Built with ${topSkills.join(', ')}, demonstrating expertise in modern development practices`);
    }
    
    // Add project context based on detected technologies (ALL your context logic)
    const projectContext = getProjectContext(repoData);
    if (projectContext) {
        enhancements.push(projectContext);
    }
    
    // Ensure we always have an enhancement
    if (enhancements.length === 0) {
        enhancements.push('This project showcases advanced software development skills and modern architectural patterns');
    }
    
    return enhancements.filter(Boolean).join(' ');
}

function getProjectContext(repoData) {
    const skills = repoData.detectedSkills.map(s => s.toLowerCase());
    const name = repoData.name.toLowerCase();
    
    if (skills.includes('pytorch') || skills.includes('tensorflow') || skills.includes('machine learning')) {
        return 'This AI/ML project demonstrates proficiency in machine learning algorithms and neural network architectures';
    }
    if (skills.includes('react') || skills.includes('next.js') || skills.includes('vue.js')) {
        return 'This web application showcases modern frontend development with responsive design and optimal user experience';
    }
    if (skills.includes('docker') || skills.includes('kubernetes') || skills.includes('aws')) {
        return 'This project implements DevOps best practices with containerization and cloud deployment strategies';
    }
    if (skills.includes('api') || skills.includes('express') || skills.includes('flask')) {
        return 'This backend service provides robust API architecture with scalable server-side solutions';
    }
    if (name.includes('analysis') || skills.includes('pandas') || skills.includes('numpy')) {
        return 'This data science project applies analytical techniques to extract meaningful insights from complex datasets';
    }
    
    return 'This software project demonstrates technical excellence and innovative problem-solving approaches';
}

// ================== MAIN ENHANCEMENT FUNCTION ==================
async function enhanceProjectDescriptions() {
    const html = fs.readFileSync(PORTFOLIO_HTML, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const projects = document.querySelectorAll('.project-card');
    console.log(`🚀 Found ${projects.length} project cards`);
    
    if (projects.length === 0) {
        console.error('❌ No project cards found! Check HTML structure.');
        return;
    }
    
    clearOldCache();
    
    const allDetectedSkills = new Set();
    const projectsToEnhance = [];
    
    // First pass: Apply cached data immediately
    for (let project of projects) {
        const gitHubLink = project.querySelector('a[href*="github.com"]');
        const descriptionElement = project.querySelector('p');
        
        if (gitHubLink && descriptionElement) {
            const repoInfo = getGitHubRepoInfo(gitHubLink.href);
            
            if (repoInfo) {
                const cachedData = getCachedDescription(repoInfo.repo);
                
                if (cachedData) {
                    console.log(`💾 Using cached data for: ${repoInfo.repo}`);
                    
                    descriptionElement.innerHTML = cachedData.enhancedDescription;
                    cachedData.detectedSkills.forEach(skill => allDetectedSkills.add(skill));
                    
                    // Add repo stats if not present
                    let existingStats = project.querySelector('.repo-stats');
                    if (!existingStats && cachedData.repoStatsHTML) {
                        const repoStats = document.createElement('div');
                        repoStats.className = 'repo-stats';
                        repoStats.style.cssText = 'margin-top: 10px; font-size: 0.9em; color: #666; display: flex; gap: 15px; flex-wrap: wrap;';
                        repoStats.innerHTML = cachedData.repoStatsHTML;
                        descriptionElement.parentNode.insertBefore(repoStats, descriptionElement.nextSibling);
                    }
                } else {
                    projectsToEnhance.push({ project, repoInfo, descriptionElement });
                }
            }
        }
    }
    
    // Second pass: Enhance uncached projects
    if (projectsToEnhance.length > 0) {
        console.log(`🔄 Enhancing ${projectsToEnhance.length} uncached projects...`);
        
        for (let { project, repoInfo, descriptionElement } of projectsToEnhance) {
            console.log('📝 Processing:', repoInfo.repo);
            
            let originalText = descriptionElement.textContent.trim();
            
            try {
                const repoData = await fetchRepoDataWithSkills(repoInfo.owner, repoInfo.repo);
                
                console.log('📊 Technologies detected:', repoData.detectedSkills);
                repoData.detectedSkills.forEach(skill => allDetectedSkills.add(skill));
                
                // Generate enhanced description
                let enhancedDescription = await generateAIDescription(repoData);
                
                // Ensure it's different from original
                if (enhancedDescription === originalText || !enhancedDescription) {
                    enhancedDescription = `${originalText} ${createSmartEnhancement(repoData)}`;
                }
                
                descriptionElement.innerHTML = enhancedDescription;
                
                // Add repo stats
                const repoStatsHTML = `
                    <span><i class="fas fa-star" style="color: #ffd700;"></i> ${repoData.stars}</span>
                    <span><i class="fas fa-code-branch" style="color: #28a745;"></i> ${repoData.forks}</span>
                    <span><i class="fas fa-code" style="color: #007bff;"></i> ${repoData.language || 'Mixed'}</span>
                    <span><i class="fas fa-clock" style="color: #6c757d;"></i> ${repoData.lastUpdated}</span>
                `;
                
                let existingStats = project.querySelector('.repo-stats');
                if (!existingStats) {
                    const repoStats = document.createElement('div');
                    repoStats.className = 'repo-stats';
                    repoStats.style.cssText = 'margin-top: 10px; font-size: 0.9em; color: #666; display: flex; gap: 15px; flex-wrap: wrap;';
                    repoStats.innerHTML = repoStatsHTML;
                    descriptionElement.parentNode.insertBefore(repoStats, descriptionElement.nextSibling);
                }
                
                // Add topics as tags (ALL your tagging logic)
                const tagsContainer = project.querySelector('.project-tags');
                if (tagsContainer && repoData.topics.length > 0) {
                    const existingTags = Array.from(tagsContainer.querySelectorAll('span')).map(span => span.textContent.toLowerCase());
                    
                    repoData.topics.forEach(topic => {
                        if (!existingTags.includes(topic.toLowerCase())) {
                            const topicTag = document.createElement('span');
                            topicTag.textContent = topic;
                            topicTag.style.cssText = 'background: #e3f2fd; color: #1976d2; margin: 2px;';
                            tagsContainer.appendChild(topicTag);
                        }
                    });
                    
                    // Add detected skills as tags
                    repoData.detectedSkills.slice(0, 3).forEach(skill => {
                        if (!existingTags.includes(skill.toLowerCase())) {
                            const skillTag = document.createElement('span');
                            skillTag.textContent = skill;
                            skillTag.style.cssText = 'background: #f0f8f0; color: #2e7d2e; margin: 2px;';
                            tagsContainer.appendChild(skillTag);
                            existingTags.push(skill.toLowerCase());
                        }
                    });
                }
                
                // Cache the enhanced data
                setCachedDescription(repoInfo.repo, {
                    enhancedDescription: enhancedDescription,
                    detectedSkills: repoData.detectedSkills,
                    repoStatsHTML: repoStatsHTML
                });
                
                console.log('✅ Description enhanced and cached for:', repoData.name);
                
            } catch (error) {
                console.error('❌ Error enhancing project:', error);
                const basicEnhancement = `${originalText} This project showcases technical expertise and modern development practices.`;
                descriptionElement.innerHTML = basicEnhancement;
            }
            
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }
    
    updateSkillsSection(allDetectedSkills, document);
    
    // Save the updated HTML
    fs.writeFileSync(PORTFOLIO_HTML, dom.serialize(), 'utf-8');
    console.log('✅ Portfolio HTML enhanced and saved!');
}

// ================== ADVANCED SKILLS SECTION ==================
function updateSkillsSection(detectedSkills, document) {
    const cachedSkills = getCachedSkills();
    if (cachedSkills && detectedSkills.size === 0) {
        console.log('💾 Using cached skills');
        displaySkills(cachedSkills.skills, document);
        return;
    }
    
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) {
        console.error('❌ Skills grid not found!');
        return;
    }

    const existingSkillElements = Array.from(skillsGrid.querySelectorAll('.skill-item'));
    const existingSkills = new Set(existingSkillElements.map(item => item.textContent.trim()));

    const projectTags = document.querySelectorAll('.project-tags span');
    const projectSkills = new Set(Array.from(projectTags).map(tag => tag.textContent.trim()));

    const allSkills = new Set([...existingSkills, ...projectSkills, ...detectedSkills]);
    const skillsArray = Array.from(allSkills).sort();
    
    setCachedSkills(skillsArray);
    displaySkills(skillsArray, document);
    console.log('✅ Skills section updated and cached with', skillsArray.length, 'skills');
}

function displaySkills(skillsArray, document) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    // ALL your skill icons
    const skillIcons = {
        'Python': 'fab fa-python', 'JavaScript': 'fab fa-js-square', 'React': 'fab fa-react',
        'Vue.js': 'fab fa-vuejs', 'Angular': 'fab fa-angular', 'Next.js': 'fab fa-react',
        'Node.js': 'fab fa-node-js', 'Express': 'fas fa-server', 'Django': 'fas fa-server',
        'Flask': 'fas fa-server', 'FastAPI': 'fas fa-server', 'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt', 'TypeScript': 'fab fa-js-square', 'C++': 'fas fa-code',
        'Java': 'fab fa-java', 'MongoDB': 'fas fa-database', 'PostgreSQL': 'fas fa-database',
        'MySQL': 'fas fa-database', 'SQL': 'fas fa-database', 'TensorFlow': 'fas fa-robot',
        'PyTorch': 'fas fa-robot', 'Scikit-learn': 'fas fa-chart-line', 'Pandas': 'fas fa-table',
        'NumPy': 'fas fa-calculator', 'OpenCV': 'fas fa-eye', 'NLTK': 'fas fa-language',
        'Transformers': 'fas fa-robot', 'Docker': 'fab fa-docker', 'AWS': 'fab fa-aws',
        'Jest': 'fas fa-vial', 'Webpack': 'fas fa-cube', 'Vite': 'fas fa-bolt',
        'Tailwind CSS': 'fas fa-paint-brush', 'Bootstrap': 'fab fa-bootstrap',
        'GraphQL': 'fas fa-project-diagram', 'Git': 'fab fa-git-alt', 'NLP': 'fas fa-language',
        'AI': 'fas fa-brain', 'Machine Learning': 'fas fa-brain', 'Deep Learning': 'fas fa-brain',
        'Computer Vision': 'fas fa-eye', 'CNN': 'fas fa-brain', 'GAN': 'fas fa-brain',
        'RAG': 'fas fa-robot', 'CLI': 'fas fa-terminal', 'Odoo': 'fas fa-cogs',
        'ERP': 'fas fa-building', 'Generative AI': 'fas fa-brain', 'API': 'fas fa-plug',
        'Jupyter Notebook': 'fas fa-book', 'Streamlit': 'fas fa-chart-line',
        'Telegram Bot': 'fas fa-robot'
    };

    skillsGrid.innerHTML = '';
    
    skillsArray.forEach(skill => {
        if (skill.trim()) {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            const icon = skillIcons[skill] || 'fas fa-tools';
            skillItem.innerHTML = `<i class="${icon}"></i> ${skill}`;
            skillsGrid.appendChild(skillItem);
        }
    });
}

// ================== MAIN EXECUTION ==================
(async function main() {
    try {
        console.log('🚀 Advanced Portfolio Enhancement Starting...');
        await enhanceProjectDescriptions();
        console.log('🎉 All project enhancements completed!');
    } catch (error) {
        console.error('❌ Enhancement failed:', error);
    }
})();
