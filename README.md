# GitResume - AI-Powered Developer Portfolio Generator

🏆 **Built for the Agentic Postgres Challenge**

Transform your GitHub profile into a professional resume using advanced multi-agent AI analysis powered by Agentic Postgres.

## 🚀 Live Demo

[Visit GitResume](https://your-deployment-url.vercel.app)

## ✨ Features

### 🤖 Multi-Agent AI Analysis
- **6 Specialized Agents** working in parallel using separate database forks
- **Code Architect Agent** - Analyzes design patterns, architecture quality, SOLID principles
- **Security Auditor Agent** - Detects vulnerabilities, evaluates security practices
- **Performance Detective Agent** - Identifies optimization opportunities, scalability issues
- **Innovation Scout Agent** - Discovers cutting-edge tech usage, creative solutions
- **Collaboration Analyst Agent** - Evaluates teamwork patterns, code review quality
- **Impact Assessor Agent** - Measures real-world usage, community adoption

### 🔧 Agentic Postgres Integration
- **Tiger MCP** - Seamless multi-agent communication protocol
- **Fast Zero-Copy Forks** - Isolated agent workspaces for parallel processing
- **Hybrid Search** - Combines pg_text search with semantic analysis
- **Fluid Storage** - Dynamic scaling based on repository complexity

### 📊 Intelligent Analysis
- **Smart Repository Ranking** - AI-powered selection of your best projects
- **Comprehensive Scoring** - Detailed evaluation across multiple dimensions
- **Career Insights** - Personalized recommendations for skill development
- **Interactive Visualizations** - Radar charts, progress tracking, skill breakdowns

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: Agentic Postgres (Tiger Cloud)
- **AI**: Google Gemini API
- **APIs**: GitHub REST API
- **Deployment**: Vercel/Netlify

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │  Agentic        │
│   (Next.js)     │◄──►│   (Serverless)   │◄──►│  Postgres       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   GitHub API     │    │  Agent Forks    │
                       │   Integration    │    │  (Parallel)     │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Gemini AI      │    │  Tiger MCP      │
                       │   Analysis       │    │  Communication  │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Tiger Cloud account
- GitHub Personal Access Token
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gitresume.git
cd gitresume
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
TIGER_DATABASE_URL=postgresql://username:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=github_pat_your_token_here
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🔧 Setup Guide

### 1. Tiger Cloud Setup
1. Visit [Tiger Cloud](https://cloud.timescale.com)
2. Create a free account
3. Create a new Agentic Postgres database
4. Copy the connection string to `TIGER_DATABASE_URL`

### 2. GitHub Token Setup
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` and `user` scopes
3. Add to `GITHUB_TOKEN` in your environment

### 3. Gemini API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in your environment

## 📁 Project Structure

```
gitresume/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/route.ts      # GitHub API integration
│   │   │   ├── analyze/route.ts     # AI analysis endpoint
│   │   │   └── resume/route.ts      # Resume generation
│   │   ├── analyze/page.tsx         # Analysis interface
│   │   └── page.tsx                 # Landing page
│   └── lib/
│       ├── agents.ts                # Multi-agent system
│       ├── database.ts              # Agentic Postgres integration
│       └── github.ts                # GitHub service
├── .env.example                     # Environment template
└── README.md
```

## 🎯 Key Features Showcase

### Multi-Agent Collaboration
```typescript
// Each agent gets its own database fork
const codeAgent = await createAgentFork('code_analysis');
const securityAgent = await createAgentFork('security_audit');

// Agents communicate via Tiger MCP
const collaborativeResult = await agentCollaboration([
  codeAgent, securityAgent, performanceAgent
]);
```

### Hybrid Search Implementation
```sql
-- Combines full-text and semantic search
SELECT * FROM repositories 
WHERE to_tsvector(repo_data) @@ plainto_tsquery('authentication')
AND embedding <-> query_embedding < 0.3;
```

### Real-time Agent Status
- Live progress tracking of each agent's analysis
- Visual representation of agent collaboration
- Real-time score updates and insights

## 🏆 Agentic Postgres Challenge Features

This project showcases **every required feature** of the challenge:

✅ **Multi-agent collaboration using separate database forks**
- 6 specialized agents with isolated workspaces
- Parallel processing with zero-copy forks

✅ **Developer productivity hacks**
- Automated skill gap analysis
- Career path recommendations
- Code quality insights

✅ **Novel uses of hybrid search**
- Semantic code analysis
- Cross-repository pattern matching
- Intelligent repository ranking

✅ **Agent-first applications**
- Collaborative debugging between agents
- Dynamic agent specialization
- Swarm intelligence for code analysis

✅ **Tiger MCP integration**
- Real-time agent communication
- Consensus building mechanisms

✅ **Tiger CLI usage**
- Automated database operations
- Bulk analysis processing

✅ **pg_text search**
- Full-text search across code and documentation
- Pattern recognition and best practice mining

✅ **Fast, zero-copy forks**
- Instant agent workspace creation
- Efficient parallel processing

✅ **Fluid Storage**
- Dynamic scaling based on analysis complexity
- Intelligent resource management

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables
4. Set up serverless functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tiger Data** for Agentic Postgres and the amazing challenge
- **Google** for the Gemini AI API
- **GitHub** for the comprehensive API
- **Vercel** for seamless deployment

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Demo**: [GitResume Live](https://your-deployment-url.vercel.app)

---

**Built with ❤️ for the Agentic Postgres Challenge**
