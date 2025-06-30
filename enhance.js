// enhance.js (Node.js only, for build-time enhancement)
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { JSDOM } = require('jsdom');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const PORTFOLIO_HTML = 'index.html';
const GITHUB_REPOS = [
  'irenicsunshine/Beyond-the-window',
  'irenicsunshine/Sentiment-Analysis',
  'irenicsunshine/Multi-Class-Image-Classifier-using-PyTorch-CNNs',
  'irenicsunshine/Odoo',
  'irenicsunshine/DataNexus',
  'irenicsunshine/Image-Colorization-using-Pix2Pix-GAN'
];

// --- Helper functions ---
async function safeGitHubFetch(url, maxRetries = 3) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Portfolio-Enhancement-Script',
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, { headers });
      if (response.status === 404) throw new Error('Resource not found');
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const resetDate = new Date(resetTime * 1000);
        console.warn(`Rate limited. Resets at: ${resetDate}`);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000 * (attempt + 1)));
          continue;
        }
        throw new Error('GitHub API rate limit exceeded');
      }
      if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
}

async function fetchRepoDataWithSkills(owner, repo) {
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
  // Basic repo info
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
  } catch (error) {}

  // Languages
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const languagesResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    repoData.languages = await languagesResponse.json();
  } catch (error) {}

  // README
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const readmeResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
    const readmeData = await readmeResponse.json();
    repoData.readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
  } catch (error) {}

  // Contents
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const contentsResponse = await safeGitHubFetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
    const contents = await contentsResponse.json();
    repoData.contents = Array.isArray(contents) ? contents : [];
  } catch (error) {}

  // Technology/skills detection
  repoData.detectedSkills = analyzeRepositoryTechnologies(repoData, repo);

  return repoData;
}

function analyzeRepositoryTechnologies(repoData, repoName) {
  const detectedSkills = new Set();
  Object.keys(repoData.languages).forEach(lang => detectedSkills.add(lang));
  const searchText = (repoData.readme + ' ' + repoData.description + ' ' + repoName).toLowerCase();
  const fileNames = (repoData.contents || []).map(item => item.name.toLowerCase()).join(' ');

  const techPatterns = {
    'React': ['react', 'jsx', 'package.json.*react'],
    'Next.js': ['next', 'nextjs', 'next.config'],
    'Vue.js': ['vue', '.vue'],
    'Angular': ['angular', 'angular.json'],
    'Tailwind CSS': ['tailwind', 'tailwind.config'],
    'Bootstrap': ['bootstrap'],
    'Vite': ['vite', 'vite.config'],
    'Express': ['express', 'require.*express'],
    'Django': ['django', 'manage.py', 'settings.py'],
    'Flask': ['flask', 'from flask import'],
    'FastAPI': ['fastapi', 'from fastapi import'],
    'Node.js': ['nodejs', 'node.js', 'package.json'],
    'MongoDB': ['mongodb', 'mongo', 'mongoose'],
    'PostgreSQL': ['postgresql', 'postgres', 'psycopg2'],
    'MySQL': ['mysql', 'pymysql'],
    'Redis': ['redis'],
    'SQLite': ['sqlite'],
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
    'Docker': ['docker', 'dockerfile', 'docker-compose'],
    'Kubernetes': ['kubernetes', 'k8s', 'kubectl'],
    'Git': ['git', '.gitignore'],
    'AWS': ['aws', 'boto3', 'aws-sdk'],
    'Google Cloud': ['google cloud', 'gcp', 'google-cloud'],
    'Azure': ['azure', 'microsoft azure'],
    'API': ['api', 'rest', 'restful', 'endpoint'],
    'GraphQL': ['graphql', 'apollo'],
    'WebSocket': ['websocket', 'socket.io'],
    'CLI': ['cli', 'command line', 'argparse'],
    'Jest': ['jest', '.test.js'],
    'Pytest': ['pytest', 'test_'],
    'Mocha': ['mocha'],
    'Cypress': ['cypress'],
    'Webpack': ['webpack', 'webpack.config'],
    'Parcel': ['parcel'],
    'TypeScript': ['typescript', '.ts', 'tsconfig.json'],
    'ERP': ['erp', 'odoo', 'enterprise resource'],
    'Jupyter Notebook': ['jupyter', '.ipynb'],
    'CSS': ['css', 'stylesheet'],
    'HTML': ['html', '.html'],
    'Streamlit': ['streamlit', 'st.'],
    'Telegram Bot': ['telegram', 'bot', 'telebot']
  };

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

// --- AI Description Enhancement ---
async function aiEnhanceDescription(repo, detectedSkills) {
  const prompt = `Write a detailed, professional, and engaging summary for a developer portfolio project.
Project name: ${repo.name}
GitHub description: ${repo.description}
Technologies: ${detectedSkills.join(', ')}
README snippet: ${(repo.readme || '').replace(/!\[[^\]]*\]\([^)]+\)/g, '').replace(/\[[^\]]*\]\([^)]+\)/g, '').replace(/[#*`>]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300)}
Highlight the project's purpose, features, and technical depth.`;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/BioGPT-Large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 120 } })
    });

    if (!response.ok) throw new Error(`HF API error: ${response.status}`);
    const result = await response.json();
    const text = Array.isArray(result)
      ? (result[0].generated_text || result[0].summary_text || '')
      : (result.generated_text || result.summary_text || '');
    return text.trim() || fallbackEnhanceDescription(repo, detectedSkills);
  } catch (e) {
    console.error(`HF API failed for ${repo.name}:`, e.message);
    return fallbackEnhanceDescription(repo, detectedSkills);
  }
}

function fallbackEnhanceDescription(repo, detectedSkills) {
  let desc = repo.description ? repo.description + ' ' : '';
  if (repo.readme) {
    let snippet = repo.readme
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/[#*`>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 300);
    if (snippet && !desc.includes(snippet)) desc += snippet + ' ';
  }
  if (detectedSkills.length) desc += `Built with ${detectedSkills.slice(0, 3).join(', ')}. `;
  desc += `This project demonstrates expertise in ${detectedSkills.join(', ')} and modern development practices.`;
  return desc.trim();
}

// --- Main Enhancement ---
(async function main() {
  const html = fs.readFileSync(PORTFOLIO_HTML, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  let allSkills = new Set();

  for (const repoPath of GITHUB_REPOS) {
    const [owner, repo] = repoPath.split('/');
    const repoData = await fetchRepoDataWithSkills(owner, repo);
    const detectedSkills = repoData.detectedSkills;
    detectedSkills.forEach(skill => allSkills.add(skill));

    // Find the project card by GitHub link
    const card = Array.from(document.querySelectorAll('.project-card')).find(card => {
      const link = card.querySelector('a[href*="github.com"]');
      return link && link.href.includes(repo);
    });
    if (!card) continue;

    // AI-enhanced description
    const descElem = card.querySelector('p');
    if (descElem) descElem.textContent = await aiEnhanceDescription(repoData, detectedSkills);

    // Add stats
    let statsElem = card.querySelector('.repo-stats');
    if (!statsElem) {
      statsElem = document.createElement('div');
      statsElem.className = 'repo-stats';
      descElem.after(statsElem);
    }
    statsElem.innerHTML = `
      <span><i class="fas fa-star" style="color: #ffd700;"></i> ${repoData.stars}</span>
      <span><i class="fas fa-code-branch" style="color: #28a745;"></i> ${repoData.forks}</span>
      <span><i class="fas fa-code" style="color: #007bff;"></i> ${repoData.language}</span>
      <span><i class="fas fa-clock" style="color: #6c757d;"></i> ${repoData.lastUpdated}</span>
    `;

    // Add topics and detected skills as tags
    const tagsElem = card.querySelector('.project-tags');
    if (tagsElem) {
      // Add repo topics
      if (repoData.topics.length) {
        repoData.topics.forEach(topic => {
          if (![...tagsElem.children].some(tag => tag.textContent.toLowerCase() === topic.toLowerCase())) {
            const tag = document.createElement('span');
            tag.textContent = topic;
            tag.style.background = '#e3f2fd';
            tag.style.color = '#1976d2';
            tag.style.margin = '2px';
            tagsElem.appendChild(tag);
          }
        });
      }
      // Add detected skills as tags
      detectedSkills.slice(0, 3).forEach(skill => {
        if (![...tagsElem.children].some(tag => tag.textContent.toLowerCase() === skill.toLowerCase())) {
          const skillTag = document.createElement('span');
          skillTag.textContent = skill;
          skillTag.style.background = '#f0f8f0';
          skillTag.style.color = '#2e7d2e';
          skillTag.style.margin = '2px';
          tagsElem.appendChild(skillTag);
        }
      });
    }
  }

  // Update skills section
  const skillsGrid = document.querySelector('.skills-grid');
  if (skillsGrid) {
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
    Array.from(allSkills).sort().forEach(skill => {
      if (skill.trim()) {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        const icon = skillIcons[skill] || 'fas fa-tools';
        skillItem.innerHTML = `<i class="${icon}"></i> ${skill}`;
        skillsGrid.appendChild(skillItem);
      }
    });
  }

  fs.writeFileSync(PORTFOLIO_HTML, dom.serialize(), 'utf-8');
  console.log('✅ Portfolio HTML enhanced and saved!');
})();
