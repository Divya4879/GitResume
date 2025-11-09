import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';

const execAsync = promisify(exec);

export class TigerGitResumeManager {
  private serviceId: string;
  private pool: Pool | null = null;

  constructor() {
    this.serviceId = process.env.TIGER_SERVICE_ID || 'xahs2zgwkg';
  }

  async runTigerCommand(command: string): Promise<string> {
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

  async initializeDatabase(): Promise<void> {
    console.log('🔧 Initializing Tiger Cloud GitResume database...');
    
    try {
      // Get connection string
      const connectionString = await this.runTigerCommand(
        `tiger db connection-string --service-id ${this.serviceId} --with-password`
      );

      this.pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      const client = await this.pool.connect();
      
      try {
        // Create GitResume tables
        await client.query(`
          CREATE TABLE IF NOT EXISTS gitresume_sessions (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 minutes',
            status VARCHAR(50) DEFAULT 'active'
          );

          CREATE TABLE IF NOT EXISTS repositories (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) REFERENCES gitresume_sessions(session_id),
            repo_name VARCHAR(255) NOT NULL,
            repo_data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS agent_analyses (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) REFERENCES gitresume_sessions(session_id),
            repo_name VARCHAR(255) NOT NULL,
            agent_type VARCHAR(100) NOT NULL,
            score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
            reasoning TEXT NOT NULL,
            recommendations TEXT[],
            analysis_data JSONB,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS final_resumes (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) REFERENCES gitresume_sessions(session_id),
            overall_score DECIMAL(3,1) NOT NULL,
            resume_content TEXT NOT NULL,
            skills_data JSONB,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_session_expires ON gitresume_sessions(expires_at);
          CREATE INDEX IF NOT EXISTS idx_session_status ON gitresume_sessions(session_id, status);
        `);

        console.log('✅ Tiger Cloud GitResume database initialized successfully');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createSession(username: string): Promise<string> {
    const sessionId = `gitresume_${username}_${Date.now()}`;
    
    const client = await this.pool!.connect();
    try {
      await client.query(
        'INSERT INTO gitresume_sessions (username, session_id) VALUES ($1, $2)',
        [username, sessionId]
      );
      console.log(`📝 Created GitResume session: ${sessionId}`);
      return sessionId;
    } finally {
      client.release();
    }
  }

  async storeRepositoryData(sessionId: string, repoName: string, repoData: any): Promise<void> {
    const client = await this.pool!.connect();
    try {
      await client.query(
        'INSERT INTO repositories (session_id, repo_name, repo_data) VALUES ($1, $2, $3)',
        [sessionId, repoName, JSON.stringify(repoData)]
      );
      console.log(`💾 Stored repository data: ${repoName}`);
    } finally {
      client.release();
    }
  }

  async storeAgentAnalysis(sessionId: string, repoName: string, agentType: string, analysis: any): Promise<void> {
    const client = await this.pool!.connect();
    try {
      await client.query(
        `INSERT INTO agent_analyses (session_id, repo_name, agent_type, score, reasoning, recommendations, analysis_data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          repoName,
          agentType,
          analysis.score,
          analysis.reasoning,
          analysis.recommendations,
          JSON.stringify(analysis.data)
        ]
      );
      console.log(`🤖 Stored ${agentType} analysis for ${repoName}: ${analysis.score}/10`);
    } finally {
      client.release();
    }
  }

  async getSessionAnalyses(sessionId: string): Promise<any[]> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        'SELECT * FROM agent_analyses WHERE session_id = $1 ORDER BY created_at',
        [sessionId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async storeFinalResume(sessionId: string, overallScore: number, resumeContent: string, skillsData: any): Promise<void> {
    const client = await this.pool!.connect();
    try {
      await client.query(
        'INSERT INTO final_resumes (session_id, overall_score, resume_content, skills_data) VALUES ($1, $2, $3, $4)',
        [sessionId, overallScore, resumeContent, JSON.stringify(skillsData)]
      );
      console.log(`📄 Stored final resume with score: ${overallScore}/10`);
    } finally {
      client.release();
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(
        `DELETE FROM gitresume_sessions 
         WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '30 minutes'
         RETURNING session_id`
      );
      
      if (result.rows.length > 0) {
        console.log(`🧹 Cleaned up ${result.rows.length} expired sessions`);
      }
    } finally {
      client.release();
    }
  }

  async closeConnection(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
