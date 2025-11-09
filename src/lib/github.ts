export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  topics: string[];
}

export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token = process.env.GITHUB_TOKEN;
  private cache = new Map<string, any>();
  private callCount = 0;

  constructor() {
    console.log('GitHub token loaded:', this.token ? 'YES' : 'NO');
    console.log('Token starts with:', this.token?.substring(0, 10));
  }

  private getCacheKey(endpoint: string): string {
    return `github_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private async fetchGitHub(endpoint: string) {
    // Check cache first
    const cacheKey = this.getCacheKey(endpoint);
    if (this.cache.has(cacheKey)) {
      console.log(`♻️ Cache hit for: ${endpoint}`);
      return this.cache.get(cacheKey);
    }

    this.callCount++;
    console.log(`📡 API Call #${this.callCount}: ${endpoint}`);

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitResume-App'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', response.status, errorText);
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Cache for 10 minutes
    this.cache.set(cacheKey, data);
    setTimeout(() => this.cache.delete(cacheKey), 10 * 60 * 1000);
    
    return data;
  }

  getCallCount(): number {
    return this.callCount;
  }

  resetCallCount(): void {
    this.callCount = 0;
  }

  async getUserProfile(username: string): Promise<GitHubUser> {
    if (username.toLowerCase() === 'demo') {
      return {
        login: 'demo',
        name: 'Demo Developer',
        bio: 'Full-stack developer passionate about AI and open source',
        public_repos: 6,
        followers: 150,
        following: 75,
        created_at: '2020-01-01T00:00:00Z',
        avatar_url: 'https://github.com/github.png'
      };
    }
    return this.fetchGitHub(`/users/${username}`);
  }

  async getUserRepositories(username: string): Promise<GitHubRepo[]> {
    if (username.toLowerCase() === 'demo') {
      return [
        {
          id: 1, name: 'ai-chatbot', full_name: 'demo/ai-chatbot',
          description: 'Advanced AI chatbot built with React and OpenAI API',
          language: 'TypeScript', stargazers_count: 245, forks_count: 67, size: 15420,
          created_at: '2023-06-15T10:30:00Z', updated_at: '2024-11-01T14:22:00Z', pushed_at: '2024-11-01T14:22:00Z',
          html_url: 'https://github.com/demo/ai-chatbot', topics: ['ai', 'chatbot', 'react']
        },
        {
          id: 2, name: 'e-commerce-platform', full_name: 'demo/e-commerce-platform',
          description: 'Full-stack e-commerce platform with Next.js and Stripe',
          language: 'JavaScript', stargazers_count: 189, forks_count: 43, size: 28750,
          created_at: '2023-03-20T09:15:00Z', updated_at: '2024-10-28T16:45:00Z', pushed_at: '2024-10-28T16:45:00Z',
          html_url: 'https://github.com/demo/e-commerce-platform', topics: ['ecommerce', 'nextjs']
        },
        {
          id: 3, name: 'ml-classifier', full_name: 'demo/ml-classifier',
          description: 'Machine learning image classifier using TensorFlow',
          language: 'Python', stargazers_count: 278, forks_count: 92, size: 23450,
          created_at: '2023-04-18T15:20:00Z', updated_at: '2024-10-10T09:30:00Z', pushed_at: '2024-10-10T09:30:00Z',
          html_url: 'https://github.com/demo/ml-classifier', topics: ['machine-learning', 'python']
        },
        {
          id: 4, name: 'blockchain-voting', full_name: 'demo/blockchain-voting',
          description: 'Secure voting system built on Ethereum blockchain',
          language: 'Solidity', stargazers_count: 423, forks_count: 156, size: 8920,
          created_at: '2023-01-12T08:30:00Z', updated_at: '2024-09-15T12:00:00Z', pushed_at: '2024-09-15T12:00:00Z',
          html_url: 'https://github.com/demo/blockchain-voting', topics: ['blockchain', 'ethereum']
        }
      ];
    }
    
    const repos = await this.fetchGitHub(`/users/${username}/repos?sort=updated&per_page=100`);
    return repos.filter((repo: GitHubRepo) => !repo.name.includes('fork'));
  }

  async getRepositoryDetails(owner: string, repo: string) {
    const [repoData, languages, contributors, commits] = await Promise.all([
      this.fetchGitHub(`/repos/${owner}/${repo}`),
      this.fetchGitHub(`/repos/${owner}/${repo}/languages`),
      this.fetchGitHub(`/repos/${owner}/${repo}/contributors`),
      this.fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=10`)
    ]);

    return {
      ...repoData,
      languages,
      contributors: contributors.length,
      recent_commits: commits.length
    };
  }

  async getRepositoryContent(owner: string, repo: string, path: string = '') {
    try {
      return await this.fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
    } catch (error) {
      return null;
    }
  }

  // Smart repository ranking algorithm
  rankRepositories(repos: GitHubRepo[]): GitHubRepo[] {
    return repos
      .map(repo => ({
        ...repo,
        score: this.calculateRepoScore(repo)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 repositories
  }

  private calculateRepoScore(repo: GitHubRepo): number {
    let score = 0;
    
    // Stars weight (max 30 points)
    score += Math.min(repo.stargazers_count * 2, 30);
    
    // Forks weight (max 20 points)
    score += Math.min(repo.forks_count * 3, 20);
    
    // Size weight (max 15 points) - larger projects get more points
    score += Math.min(repo.size / 1000, 15);
    
    // Language popularity (max 10 points)
    const popularLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'];
    if (popularLanguages.includes(repo.language)) {
      score += 10;
    }
    
    // Recent activity (max 15 points)
    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 15;
    else if (daysSinceUpdate < 90) score += 10;
    else if (daysSinceUpdate < 180) score += 5;
    
    // Description quality (max 10 points)
    if (repo.description && repo.description.length > 20) {
      score += 10;
    }
    
    return score;
  }

  // Hybrid search implementation
  async hybridSearch(username: string, query: string): Promise<GitHubRepo[]> {
    const repos = await this.getUserRepositories(username);
    
    // Text-based search
    const textMatches = repos.filter(repo => 
      repo.name.toLowerCase().includes(query.toLowerCase()) ||
      repo.description?.toLowerCase().includes(query.toLowerCase()) ||
      repo.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Combine with ranking
    const rankedRepos = this.rankRepositories(repos);
    
    // Merge results with preference for text matches
    const hybridResults = [
      ...textMatches.slice(0, 4),
      ...rankedRepos.filter(repo => !textMatches.find(match => match.id === repo.id)).slice(0, 4)
    ];
    
    return hybridResults.slice(0, 8);
  }
}
