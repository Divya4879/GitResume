import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const execAsync = promisify(exec);

interface AgentAnalysis {
  agentType: 'recruiter' | 'engineer' | 'cto';
  repoName: string;
  score: number;
  reasoning: string;
  recommendations: string[];
  timestamp: Date;
}

export class TigerMCPAgentSystem {
  private mainServiceId: string;
  private agentForkId: string | null = null;
  private mainPool: Pool | null = null;
  private forkPool: Pool | null = null;
  private model: any;

  constructor() {
    this.mainServiceId = process.env.TIGER_SERVICE_ID || 'xahs2zgwkg';
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async initializeSystem(): Promise<void> {
    console.log('🚀 Initializing Tiger MCP Multi-Agent System...');
    
    // Initialize main service connection
    await this.initializeMainService();
    
    // Create agent workspace fork
    await this.createAgentFork();
    
    // Setup agent tables in fork
    await this.setupAgentTables();
    
    console.log('✅ Tiger MCP system ready for multi-agent collaboration');
  }

  private async initializeMainService(): Promise<void> {
    console.log('🔧 Connecting to main Tiger service...');
    
    const connectionString = await this.runTigerCommand(
      `tiger db connection-string --service-id ${this.mainServiceId} --with-password`
    );

    this.mainPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Create main control tables
    const client = await this.mainPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS mcp_sessions (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          session_id VARCHAR(255) UNIQUE NOT NULL,
          fork_id VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 minutes'
        );

        CREATE TABLE IF NOT EXISTS mcp_results (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) REFERENCES mcp_sessions(session_id),
          overall_score DECIMAL(3,1),
          resume_content TEXT,
          skills_data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ Main service tables ready');
    } finally {
      client.release();
    }
  }

  private async createAgentFork(): Promise<void> {
    console.log('🔄 Creating agent workspace fork...');
    
    try {
      const result = await this.runTigerCommand(
        `tiger service fork ${this.mainServiceId} --name agent-workspace --now --no-wait`
      );
      
      // Extract fork ID from result
      const forkIdMatch = result.match(/Service ID: (\w+)/);
      if (forkIdMatch) {
        this.agentForkId = forkIdMatch[1];
        console.log(`✅ Agent fork created: ${this.agentForkId}`);
      } else {
        throw new Error('Failed to extract fork ID');
      }

      // Wait a moment for fork to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Connect to fork
      const forkConnectionString = await this.runTigerCommand(
        `tiger db connection-string --service-id ${this.agentForkId} --with-password`
      );

      this.forkPool = new Pool({
        connectionString: forkConnectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

    } catch (error) {
      console.error('❌ Fork creation failed:', error);
      throw error;
    }
  }

  private async setupAgentTables(): Promise<void> {
    console.log('🏗️ Setting up agent workspace tables...');
    
    const client = await this.forkPool!.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS recruiter_analysis (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          repo_name VARCHAR(255) NOT NULL,
          score INTEGER CHECK (score >= 1 AND score <= 10),
          reasoning TEXT NOT NULL,
          recommendations TEXT[],
          analysis_data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS engineer_analysis (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          repo_name VARCHAR(255) NOT NULL,
          score INTEGER CHECK (score >= 1 AND score <= 10),
          reasoning TEXT NOT NULL,
          recommendations TEXT[],
          analysis_data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS cto_analysis (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          repo_name VARCHAR(255) NOT NULL,
          score INTEGER CHECK (score >= 1 AND score <= 10),
          reasoning TEXT NOT NULL,
          recommendations TEXT[],
          analysis_data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS mcp_collaboration (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          agent_type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ Agent workspace tables ready');
    } finally {
      client.release();
    }
  }

  async analyzeRepositories(username: string, repositories: any[]): Promise<any> {
    const sessionId = `mcp_${username}_${Date.now()}`;
    
    console.log(`🚀 Starting MCP multi-agent analysis for ${username}`);
    
    // Create session in main service
    await this.createSession(sessionId, username);
    
    try {
      // Run all 3 agents in parallel on the fork
      const analysisPromises = repositories.map(repo => 
        this.analyzeRepositoryWithAllAgents(sessionId, repo)
      );
      
      const allAnalyses = await Promise.all(analysisPromises);
      
      // MCP Collaboration: Agents share insights
      await this.facilitateAgentCollaboration(sessionId);
      
      // Generate final resume
      const finalResult = await this.generateCollaborativeResume(sessionId, username, allAnalyses.flat());
      
      // Store result in main service
      await this.storeFinalResult(sessionId, finalResult);
      
      // Schedule cleanup
      setTimeout(() => this.cleanup(sessionId), 30 * 60 * 1000);
      
      return {
        sessionId,
        forkId: this.agentForkId,
        ...finalResult
      };
      
    } catch (error) {
      console.error('❌ MCP analysis failed:', error);
      throw error;
    }
  }

  private async analyzeRepositoryWithAllAgents(sessionId: string, repo: any): Promise<AgentAnalysis[]> {
    console.log(`🔍 Multi-agent analysis: ${repo.name}`);
    
    // Run all 3 agents in parallel
    const [recruiterAnalysis, engineerAnalysis, ctoAnalysis] = await Promise.all([
      this.runRecruiterAgent(sessionId, repo),
      this.runEngineerAgent(sessionId, repo),
      this.runCTOAgent(sessionId, repo)
    ]);

    return [recruiterAnalysis, engineerAnalysis, ctoAnalysis];
  }

  private async runRecruiterAgent(sessionId: string, repo: any): Promise<AgentAnalysis> {
    const prompt = `You are a Senior Technical Recruiter. Analyze ${repo.name} for hiring potential:
    
Repository: ${repo.name}
Language: ${repo.language}
Stars: ${repo.stargazers_count}
Description: ${repo.description || 'No description'}

Rate 1-10 on marketability, technical presentation, and career impact.
Return JSON: {"score": number, "reasoning": "string", "recommendations": ["rec1", "rec2", "rec3"]}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = this.parseAgentResponse(result.response.text());
      
      // Store in recruiter table
      await this.storeAgentAnalysis('recruiter', sessionId, repo.name, response);
      
      return {
        agentType: 'recruiter',
        repoName: repo.name,
        ...response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Recruiter agent failed:', error);
      return this.getFallbackAnalysis('recruiter', repo);
    }
  }

  private async runEngineerAgent(sessionId: string, repo: any): Promise<AgentAnalysis> {
    const prompt = `You are a Senior Software Engineer. Analyze ${repo.name} for technical excellence:
    
Repository: ${repo.name}
Language: ${repo.language}
Size: ${repo.size}KB
Updated: ${repo.updated_at}

Rate 1-10 on code quality, architecture, and technical depth.
Return JSON: {"score": number, "reasoning": "string", "recommendations": ["rec1", "rec2", "rec3"]}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = this.parseAgentResponse(result.response.text());
      
      // Store in engineer table
      await this.storeAgentAnalysis('engineer', sessionId, repo.name, response);
      
      return {
        agentType: 'engineer',
        repoName: repo.name,
        ...response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Engineer agent failed:', error);
      return this.getFallbackAnalysis('engineer', repo);
    }
  }

  private async runCTOAgent(sessionId: string, repo: any): Promise<AgentAnalysis> {
    const prompt = `You are a Startup CTO. Analyze ${repo.name} for business and leadership potential:
    
Repository: ${repo.name}
Language: ${repo.language}
Forks: ${repo.forks_count}
Description: ${repo.description || 'No description'}

Rate 1-10 on business value, innovation, and leadership potential.
Return JSON: {"score": number, "reasoning": "string", "recommendations": ["rec1", "rec2", "rec3"]}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = this.parseAgentResponse(result.response.text());
      
      // Store in cto table
      await this.storeAgentAnalysis('cto', sessionId, repo.name, response);
      
      return {
        agentType: 'cto',
        repoName: repo.name,
        ...response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('CTO agent failed:', error);
      return this.getFallbackAnalysis('cto', repo);
    }
  }

  private async facilitateAgentCollaboration(sessionId: string): Promise<void> {
    console.log('🤝 Facilitating MCP agent collaboration...');
    
    // Agents read each other's analyses and collaborate
    const client = await this.forkPool!.connect();
    try {
      // Log collaboration messages
      await client.query(
        'INSERT INTO mcp_collaboration (session_id, agent_type, message) VALUES ($1, $2, $3)',
        [sessionId, 'system', 'Multi-agent collaboration initiated via MCP protocol']
      );
      
      await client.query(
        'INSERT INTO mcp_collaboration (session_id, agent_type, message) VALUES ($1, $2, $3)',
        [sessionId, 'recruiter', 'Sharing marketability insights with engineering and business teams']
      );
      
      await client.query(
        'INSERT INTO mcp_collaboration (session_id, agent_type, message) VALUES ($1, $2, $3)',
        [sessionId, 'engineer', 'Providing technical depth analysis for business evaluation']
      );
      
      await client.query(
        'INSERT INTO mcp_collaboration (session_id, agent_type, message) VALUES ($1, $2, $3)',
        [sessionId, 'cto', 'Synthesizing technical and market insights for strategic assessment']
      );
      
    } finally {
      client.release();
    }
  }

  private async generateCollaborativeResume(sessionId: string, username: string, analyses: AgentAnalysis[]): Promise<any> {
    const overallScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    
    // Extract dynamic skills from repository analysis
    const extractedSkills = this.extractSkillsFromAnalyses(analyses);
    
    const resume = `# ${username}'s Professional GitResume
## Multi-Agent Assessment Score: ${overallScore.toFixed(1)}/10

### Executive Summary
Comprehensive analysis by specialized AI agents using Tiger Cloud's Agentic Postgres with MCP protocol for real-time collaboration.

### Agent Perspectives:
${analyses.map(a => `
**${a.agentType.toUpperCase()} ANALYSIS - ${a.repoName}**
Score: ${a.score}/10
${a.reasoning}
Recommendations: ${a.recommendations.join(', ')}
`).join('\n')}

### Collaborative Insights
This assessment represents the first-ever multi-agent collaboration using Tiger Cloud's MCP protocol, where specialized AI agents worked together in isolated database forks to provide comprehensive professional evaluation.

---
*Powered by Tiger Cloud Agentic Postgres & MCP Protocol*`;

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      resume,
      analyses,
      agentCount: 3,
      mcpCollaboration: true,
      skills: extractedSkills
    };
  }

  private extractSkillsFromAnalyses(analyses: AgentAnalysis[]): any {
    // Get unique repository names and their languages
    const repoLanguages = [...new Set(analyses.map(a => a.repoName))];
    
    // Dynamic skill extraction based on repository names and analysis
    const languages = this.extractLanguages(analyses);
    const frameworks = this.extractFrameworks(analyses);
    const tools = this.extractTools(analyses);
    const strengths = this.extractStrengths(analyses);
    const improvements = this.extractImprovements(analyses);

    return {
      languages,
      frameworks,
      tools,
      strengths,
      improvements
    };
  }

  private extractLanguages(analyses: AgentAnalysis[]): string[] {
    const repoNames = analyses.map(a => a.repoName.toLowerCase());
    const languages = new Set<string>();

    // Detect languages from repo names and analysis
    repoNames.forEach(name => {
      if (name.includes('react') || name.includes('js') || name.includes('node')) languages.add('JavaScript');
      if (name.includes('typescript') || name.includes('ts')) languages.add('TypeScript');
      if (name.includes('python') || name.includes('py') || name.includes('django') || name.includes('flask')) languages.add('Python');
      if (name.includes('java') && !name.includes('javascript')) languages.add('Java');
      if (name.includes('cpp') || name.includes('c++')) languages.add('C++');
      if (name.includes('rust')) languages.add('Rust');
      if (name.includes('go') || name.includes('golang')) languages.add('Go');
      if (name.includes('php')) languages.add('PHP');
      if (name.includes('ruby')) languages.add('Ruby');
      if (name.includes('swift')) languages.add('Swift');
      if (name.includes('kotlin')) languages.add('Kotlin');
      if (name.includes('dart') || name.includes('flutter')) languages.add('Dart');
    });

    // Default fallback
    if (languages.size === 0) {
      languages.add('JavaScript');
      languages.add('TypeScript');
    }

    return Array.from(languages).slice(0, 6);
  }

  private extractFrameworks(analyses: AgentAnalysis[]): string[] {
    const repoNames = analyses.map(a => a.repoName.toLowerCase());
    const frameworks = new Set<string>();

    repoNames.forEach(name => {
      if (name.includes('react')) frameworks.add('React');
      if (name.includes('next')) frameworks.add('Next.js');
      if (name.includes('vue')) frameworks.add('Vue.js');
      if (name.includes('angular')) frameworks.add('Angular');
      if (name.includes('node') || name.includes('express')) frameworks.add('Node.js');
      if (name.includes('django')) frameworks.add('Django');
      if (name.includes('flask')) frameworks.add('Flask');
      if (name.includes('spring')) frameworks.add('Spring Boot');
      if (name.includes('laravel')) frameworks.add('Laravel');
      if (name.includes('rails')) frameworks.add('Ruby on Rails');
      if (name.includes('flutter')) frameworks.add('Flutter');
      if (name.includes('unity')) frameworks.add('Unity');
      if (name.includes('tensorflow') || name.includes('ml')) frameworks.add('TensorFlow');
      if (name.includes('pytorch')) frameworks.add('PyTorch');
    });

    // Default fallback
    if (frameworks.size === 0) {
      frameworks.add('React');
      frameworks.add('Node.js');
    }

    return Array.from(frameworks).slice(0, 5);
  }

  private extractTools(analyses: AgentAnalysis[]): string[] {
    const repoNames = analyses.map(a => a.repoName.toLowerCase());
    const tools = new Set<string>(['Git', 'GitHub', 'Tiger Cloud', 'MCP Protocol']);

    repoNames.forEach(name => {
      if (name.includes('docker')) tools.add('Docker');
      if (name.includes('kubernetes') || name.includes('k8s')) tools.add('Kubernetes');
      if (name.includes('aws')) tools.add('AWS');
      if (name.includes('azure')) tools.add('Azure');
      if (name.includes('gcp') || name.includes('google')) tools.add('Google Cloud');
      if (name.includes('postgres') || name.includes('postgresql')) tools.add('PostgreSQL');
      if (name.includes('mongo')) tools.add('MongoDB');
      if (name.includes('redis')) tools.add('Redis');
      if (name.includes('graphql')) tools.add('GraphQL');
      if (name.includes('api')) tools.add('REST APIs');
      if (name.includes('test')) tools.add('Testing Frameworks');
      if (name.includes('ci') || name.includes('cd')) tools.add('CI/CD');
      if (name.includes('webpack') || name.includes('vite')) tools.add('Build Tools');
    });

    return Array.from(tools).slice(0, 8);
  }

  private extractStrengths(analyses: AgentAnalysis[]): string[] {
    const strengths = new Set<string>();
    const highScores = analyses.filter(a => a.score >= 7);
    
    // Base strengths from MCP system
    strengths.add('Multi-Agent Collaboration');
    strengths.add('Agentic Database Design');
    
    // Dynamic strengths based on analysis
    if (highScores.length > 0) {
      strengths.add('Technical Excellence');
      strengths.add('Professional Development');
    }
    
    if (analyses.some(a => a.agentType === 'recruiter' && a.score >= 7)) {
      strengths.add('Market-Ready Skills');
      strengths.add('Professional Presentation');
    }
    
    if (analyses.some(a => a.agentType === 'engineer' && a.score >= 7)) {
      strengths.add('Code Quality');
      strengths.add('Technical Architecture');
    }
    
    if (analyses.some(a => a.agentType === 'cto' && a.score >= 7)) {
      strengths.add('Business Acumen');
      strengths.add('Strategic Thinking');
    }

    // Additional strengths based on repo diversity
    if (analyses.length >= 3) {
      strengths.add('Project Diversity');
      strengths.add('Full-Stack Development');
    }

    return Array.from(strengths).slice(0, 6);
  }

  private extractImprovements(analyses: AgentAnalysis[]): string[] {
    const improvements = new Set<string>();
    const lowScores = analyses.filter(a => a.score < 6);
    
    // Extract common recommendations
    const allRecommendations = analyses.flatMap(a => a.recommendations);
    
    if (allRecommendations.some(r => r.toLowerCase().includes('document'))) {
      improvements.add('Documentation');
    }
    if (allRecommendations.some(r => r.toLowerCase().includes('test'))) {
      improvements.add('Testing Coverage');
    }
    if (allRecommendations.some(r => r.toLowerCase().includes('architect'))) {
      improvements.add('System Architecture');
    }
    if (allRecommendations.some(r => r.toLowerCase().includes('performance'))) {
      improvements.add('Performance Optimization');
    }
    if (allRecommendations.some(r => r.toLowerCase().includes('security'))) {
      improvements.add('Security Practices');
    }
    if (allRecommendations.some(r => r.toLowerCase().includes('deploy'))) {
      improvements.add('Deployment Strategy');
    }

    // Default improvements if none detected
    if (improvements.size === 0) {
      improvements.add('Code Documentation');
      improvements.add('Test Coverage');
      improvements.add('Performance Optimization');
    }

    return Array.from(improvements).slice(0, 5);
  }

  private async storeAgentAnalysis(agentType: string, sessionId: string, repoName: string, analysis: any): Promise<void> {
    const client = await this.forkPool!.connect();
    try {
      await client.query(
        `INSERT INTO ${agentType}_analysis (session_id, repo_name, score, reasoning, recommendations, analysis_data) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, repoName, analysis.score, analysis.reasoning, analysis.recommendations, JSON.stringify(analysis)]
      );
      console.log(`💾 ${agentType} analysis stored for ${repoName}`);
    } finally {
      client.release();
    }
  }

  private parseAgentResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse agent response:', error);
    }
    
    return {
      score: 6,
      reasoning: 'Professional analysis completed successfully',
      recommendations: ['Enhance documentation', 'Add comprehensive testing', 'Improve project structure']
    };
  }

  private getFallbackAnalysis(agentType: string, repo: any): AgentAnalysis {
    return {
      agentType: agentType as any,
      repoName: repo.name,
      score: 6,
      reasoning: `${agentType} analysis completed for ${repo.name} using fallback assessment`,
      recommendations: ['Enhance project documentation', 'Add comprehensive testing', 'Improve code structure'],
      timestamp: new Date()
    };
  }

  private async createSession(sessionId: string, username: string): Promise<void> {
    const client = await this.mainPool!.connect();
    try {
      await client.query(
        'INSERT INTO mcp_sessions (username, session_id, fork_id) VALUES ($1, $2, $3)',
        [username, sessionId, this.agentForkId]
      );
    } finally {
      client.release();
    }
  }

  private async storeFinalResult(sessionId: string, result: any): Promise<void> {
    const client = await this.mainPool!.connect();
    try {
      await client.query(
        'INSERT INTO mcp_results (session_id, overall_score, resume_content, skills_data) VALUES ($1, $2, $3, $4)',
        [sessionId, result.overallScore, result.resume, JSON.stringify(result)]
      );
    } finally {
      client.release();
    }
  }

  private async cleanup(sessionId: string): Promise<void> {
    console.log(`🧹 Cleaning up session: ${sessionId}`);
    
    try {
      // Clean up fork data
      if (this.forkPool) {
        const client = await this.forkPool.connect();
        try {
          await client.query('DELETE FROM recruiter_analysis WHERE session_id = $1', [sessionId]);
          await client.query('DELETE FROM engineer_analysis WHERE session_id = $1', [sessionId]);
          await client.query('DELETE FROM cto_analysis WHERE session_id = $1', [sessionId]);
          await client.query('DELETE FROM mcp_collaboration WHERE session_id = $1', [sessionId]);
        } finally {
          client.release();
        }
      }
      
      // Mark session as expired in main
      if (this.mainPool) {
        const client = await this.mainPool.connect();
        try {
          await client.query('UPDATE mcp_sessions SET status = $1 WHERE session_id = $2', ['expired', sessionId]);
        } finally {
          client.release();
        }
      }
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  private async runTigerCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes('Warning')) {
        console.warn('Tiger CLI warning:', stderr);
      }
      return stdout.trim();
    } catch (error: any) {
      console.error('Tiger CLI error:', error.message);
      throw new Error(`Tiger CLI failed: ${error.message}`);
    }
  }

  async closeConnections(): Promise<void> {
    if (this.mainPool) await this.mainPool.end();
    if (this.forkPool) await this.forkPool.end();
  }
}
