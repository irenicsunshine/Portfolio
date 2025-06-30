// enhance.js
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
async function fetchRepoData(repo) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Enhancer',
    'Authorization': `token ${GITHUB_TOKEN}`
  };
  const [owner, repoName] = repo.split('/');
  const repoUrl = `https://api.github.com/repos/${owner}/${repoName}`;
  const readmeUrl = `https://api.github.com/repos/${owner}/${repoName}/readme`;
  const languagesUrl = `https://api.github.com/repos/${owner}/${repoName}/languages`;

  const repoResp = await fetch(repoUrl, { headers });
  const repoData = await repoResp.json();

  let readme = '';
  try {
    const readmeResp = await fetch(readmeUrl, { headers });
    const readmeData = await readmeResp.json();
    readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
  } catch (e) {}

  let languages = [];
  try {
    const langResp = await fetch(languagesUrl, { headers });
    const langData = await langResp.json();
    languages = Object.keys(langData);
  } catch (e) {}

  return {
    name: repoData.name,
    description: repoData.description || '',
    topics: repoData.topics || [],
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    updated: repoData.updated_at ? new Date(repoData.updated_at).toLocaleDateString() : '',
    language: repoData.language || '',
    languages,
    readme
  };
}

function cleanReadmeSnippet(readme) {
  return readme
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/\[[^\]]*\]\([^)]+\)/g, '') // Remove links
    .replace(/[#*`>]/g, ' ')             // Remove markdown
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);
}

// --- AI Description Enhancement ---
async function aiEnhanceDescription(repo) {
  const prompt = `Write a detailed, professional, and engaging summary for a developer portfolio project.
Project name: ${repo.name}
GitHub description: ${repo.description}
Technologies: ${repo.languages.join(', ')}
README snippet: ${cleanReadmeSnippet(repo.readme)}
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

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    const result = await response.json();
    // The result is usually an array of objects with .generated_text or .summary_text
    const text = Array.isArray(result)
      ? (result[0].generated_text || result[0].summary_text || '')
      : (result.generated_text || result.summary_text || '');
    return text.trim() || fallbackEnhanceDescription(repo);
  } catch (e) {
    console.error(`HF API failed for ${repo.name}:`, e.message);
    return fallbackEnhanceDescription(repo);
  }
}

// Fallback if HF API fails
function fallbackEnhanceDescription(repo) {
  let desc = repo.description ? repo.description + ' ' : '';
  if (repo.readme) {
    const snippet = cleanReadmeSnippet(repo.readme);
    if (snippet && !desc.includes(snippet)) desc += snippet + ' ';
  }
  if (repo.languages.length) desc += `Built with ${repo.languages.slice(0, 3).join(', ')}. `;
  desc += `This project demonstrates expertise in ${repo.languages.join(', ')} and modern development practices.`;
  return desc.trim();
}

// --- Main Enhancement ---
(async function main() {
  // Load HTML
  const html = fs.readFileSync(PORTFOLIO_HTML, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  for (const repoPath of GITHUB_REPOS) {
    const repo = await fetchRepoData(repoPath);

    // Find the project card by GitHub link
    const card = Array.from(document.querySelectorAll('.project-card')).find(card => {
      const link = card.querySelector('a[href*="github.com"]');
      return link && link.href.includes(repo.name);
    });
    if (!card) continue;

    // AI-enhanced description
    const descElem = card.querySelector('p');
    if (descElem) descElem.textContent = await aiEnhanceDescription(repo);

    // Add stats
    let statsElem = card.querySelector('.repo-stats');
    if (!statsElem) {
      statsElem = document.createElement('div');
      statsElem.className = 'repo-stats';
      descElem.after(statsElem);
    }
    statsElem.innerHTML = `
      <span><i class="fas fa-star" style="color: #ffd700;"></i> ${repo.stars}</span>
      <span><i class="fas fa-code-branch" style="color: #28a745;"></i> ${repo.forks}</span>
      <span><i class="fas fa-code" style="color: #007bff;"></i> ${repo.language}</span>
      <span><i class="fas fa-clock" style="color: #6c757d;"></i> ${repo.updated}</span>
    `;

    // Add topics as tags
    const tagsElem = card.querySelector('.project-tags');
    if (tagsElem && repo.topics.length) {
      repo.topics.forEach(topic => {
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
  }

  // Save the updated HTML
  fs.writeFileSync(PORTFOLIO_HTML, dom.serialize(), 'utf-8');
  console.log('✅ Portfolio HTML enhanced and saved!');
})();
