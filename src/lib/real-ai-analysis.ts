interface RepoFile {
  name: string;
  content: string;
  language: string;
}

interface RealAnalysis {
  score: number;
  insights: string[];
  recommendations: string[];
}

export class RealAIAnalyzer {
  private async fetchRepoFiles(username: string, repo: string): Promise<RepoFile[]> {
    const token = process.env.GITHUB_TOKEN;
    const files: RepoFile[] = [];
    
    try {
      // Get repository tree
      const treeResponse = await fetch(
        `https://api.github.com/repos/${username}/${repo}/git/trees/main?recursive=1`,
        { headers: { Authorization: `token ${token}` } }
      );
      const tree = await treeResponse.json();
      
      // Get important files (README, main code files, package.json, etc.)
      const importantFiles = tree.tree?.filter((file: any) => 
        file.type === 'blob' && (
          file.path.includes('README') ||
          file.path.endsWith('.js') ||
          file.path.endsWith('.ts') ||
          file.path.endsWith('.py') ||
          file.path.endsWith('.java') ||
          file.path === 'package.json' ||
          file.path === 'requirements.txt'
        )
      ).slice(0, 10); // Limit to 10 files
      
      // Fetch file contents
      for (const file of importantFiles || []) {
        try {
          const contentResponse = await fetch(file.url, {
            headers: { Authorization: `token ${token}` }
          });
          const contentData = await contentResponse.json();
          
          if (contentData.content) {
            const content = Buffer.from(contentData.content, 'base64').toString('utf-8');
            files.push({
              name: file.path,
              content: content.slice(0, 2000), // Limit content size
              language: this.detectLanguage(file.path)
            });
          }
        } catch (error) {
          console.log(`Failed to fetch ${file.path}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch repo files:', error);
    }
    
    return files;
  }
  
  private detectLanguage(filename: string): string {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'JavaScript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'TypeScript';
    if (filename.endsWith('.py')) return 'Python';
    if (filename.endsWith('.java')) return 'Java';
    if (filename.includes('README')) return 'Markdown';
    return 'Text';
  }
  
  async analyzeCodeQuality(username: string, repo: string): Promise<RealAnalysis> {
    const files = await this.fetchRepoFiles(username, repo);
    
    // Real analysis based on actual code
    let score = 5.0;
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze code structure
    const codeFiles = files.filter(f => f.language !== 'Markdown' && f.language !== 'Text');
    
    if (codeFiles.length === 0) {
      return {
        score: 3.0,
        insights: ['No code files found for analysis'],
        recommendations: ['Add source code files to enable quality analysis']
      };
    }
    
    // Check for modern practices
    const hasTypeScript = files.some(f => f.language === 'TypeScript');
    if (hasTypeScript) {
      score += 1.0;
      insights.push('Uses TypeScript for better type safety and code quality');
    }
    
    // Check for proper file organization
    const hasPackageJson = files.some(f => f.name === 'package.json');
    if (hasPackageJson) {
      score += 0.5;
      insights.push('Proper Node.js project structure with package.json');
    }
    
    // Analyze code complexity (basic)
    let totalLines = 0;
    let functionsFound = 0;
    
    codeFiles.forEach(file => {
      const lines = file.content.split('\n').length;
      totalLines += lines;
      
      // Count functions/methods
      const functionMatches = file.content.match(/function\s+\w+|const\s+\w+\s*=|class\s+\w+/g);
      if (functionMatches) {
        functionsFound += functionMatches.length;
      }
    });
    
    const avgLinesPerFunction = functionsFound > 0 ? totalLines / functionsFound : 0;
    
    if (avgLinesPerFunction > 0 && avgLinesPerFunction < 50) {
      score += 0.5;
      insights.push('Good function size - functions are reasonably sized');
    } else if (avgLinesPerFunction > 100) {
      recommendations.push('Consider breaking down large functions for better maintainability');
    }
    
    // Check for comments
    const hasComments = codeFiles.some(file => 
      file.content.includes('//') || file.content.includes('/*') || file.content.includes('#')
    );
    
    if (hasComments) {
      score += 0.3;
      insights.push('Code includes comments for better readability');
    } else {
      recommendations.push('Add comments to explain complex logic');
    }
    
    return {
      score: Math.min(score, 10),
      insights,
      recommendations
    };
  }
  
  async analyzeDocumentation(username: string, repo: string): Promise<RealAnalysis> {
    const files = await this.fetchRepoFiles(username, repo);
    
    let score = 3.0;
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Check for README
    const readmeFile = files.find(f => f.name.toLowerCase().includes('readme'));
    
    if (!readmeFile) {
      return {
        score: 2.0,
        insights: ['No README file found'],
        recommendations: ['Add a comprehensive README.md file', 'Include project description and setup instructions']
      };
    }
    
    const readmeContent = readmeFile.content.toLowerCase();
    
    // Analyze README quality
    if (readmeContent.length > 200) {
      score += 2.0;
      insights.push('README has substantial content');
    }
    
    if (readmeContent.includes('install') || readmeContent.includes('setup')) {
      score += 1.0;
      insights.push('README includes installation/setup instructions');
    }
    
    if (readmeContent.includes('usage') || readmeContent.includes('example')) {
      score += 1.0;
      insights.push('README provides usage examples');
    }
    
    if (readmeContent.includes('api') || readmeContent.includes('documentation')) {
      score += 0.5;
      insights.push('README mentions API or additional documentation');
    }
    
    // Check for badges or links
    if (readmeFile.content.includes('![') || readmeFile.content.includes('http')) {
      score += 0.5;
      insights.push('README includes images, badges, or external links');
    }
    
    if (score < 7) {
      recommendations.push('Expand README with more detailed project information');
      recommendations.push('Add usage examples and API documentation');
    }
    
    return {
      score: Math.min(score, 10),
      insights,
      recommendations
    };
  }
  
  async analyzeTechStack(username: string, repo: string): Promise<RealAnalysis> {
    const files = await this.fetchRepoFiles(username, repo);
    
    let score = 4.0;
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Detect technologies
    const technologies: string[] = [];
    
    files.forEach(file => {
      if (file.language === 'TypeScript') technologies.push('TypeScript');
      if (file.language === 'JavaScript') technologies.push('JavaScript');
      if (file.language === 'Python') technologies.push('Python');
      if (file.language === 'Java') technologies.push('Java');
      
      // Check for frameworks
      if (file.content.includes('import React') || file.content.includes('from "react"')) {
        technologies.push('React');
      }
      if (file.content.includes('next/') || file.name === 'next.config.js') {
        technologies.push('Next.js');
      }
      if (file.content.includes('express') || file.content.includes('app.listen')) {
        technologies.push('Express.js');
      }
    });
    
    const uniqueTech = [...new Set(technologies)];
    
    if (uniqueTech.length > 3) {
      score += 2.0;
      insights.push(`Uses diverse tech stack: ${uniqueTech.join(', ')}`);
    } else if (uniqueTech.length > 1) {
      score += 1.0;
      insights.push(`Multi-technology project: ${uniqueTech.join(', ')}`);
    }
    
    // Check for modern practices
    if (technologies.includes('TypeScript')) {
      score += 1.0;
      insights.push('Uses TypeScript for better development experience');
    }
    
    if (technologies.includes('React') || technologies.includes('Next.js')) {
      score += 0.5;
      insights.push('Uses modern frontend framework');
    }
    
    return {
      score: Math.min(score, 10),
      insights,
      recommendations: recommendations.length > 0 ? recommendations : ['Consider exploring additional modern technologies']
    };
  }
  
  async analyzeImpactInnovation(username: string, repo: string): Promise<RealAnalysis> {
    const files = await this.fetchRepoFiles(username, repo);
    
    let score = 4.0;
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze project scope and complexity
    const codeFiles = files.filter(f => f.language !== 'Markdown' && f.language !== 'Text');
    
    if (codeFiles.length > 5) {
      score += 1.0;
      insights.push('Substantial project with multiple code files');
    }
    
    // Check for API or database usage
    const hasAPI = files.some(file => 
      file.content.includes('fetch(') || 
      file.content.includes('axios') || 
      file.content.includes('api/')
    );
    
    if (hasAPI) {
      score += 1.0;
      insights.push('Integrates with external APIs or services');
    }
    
    // Check for modern patterns
    const hasModernPatterns = files.some(file =>
      file.content.includes('async/await') ||
      file.content.includes('Promise') ||
      file.content.includes('useState') ||
      file.content.includes('useEffect')
    );
    
    if (hasModernPatterns) {
      score += 0.5;
      insights.push('Uses modern programming patterns');
    }
    
    // Check README for project description
    const readmeFile = files.find(f => f.name.toLowerCase().includes('readme'));
    if (readmeFile) {
      const content = readmeFile.content.toLowerCase();
      if (content.includes('problem') || content.includes('solution') || content.includes('purpose')) {
        score += 1.0;
        insights.push('Clear problem-solution approach documented');
      }
    }
    
    return {
      score: Math.min(score, 10),
      insights,
      recommendations: recommendations.length > 0 ? recommendations : ['Consider adding more innovative features']
    };
  }
}
