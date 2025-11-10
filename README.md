# 🐅 GitResume : TigerData-Powered Github Resume Analyzer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitResume-brightgreen)](https://gitresumeassessment.netlify.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![Tiger Cloud](https://img.shields.io/badge/Tiger%20Cloud-Agentic%20Postgres-purple)](https://tigerdata.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**Transform your GitHub repositories into professional developer insights with AI-powered multi-agent analysis**

GitResume leverages Tiger Cloud's Agentic Postgres architecture to provide comprehensive analysis of GitHub repositories through 4
specialized AI agents. The platform integrates Tiger CLI for service management and implements a multi-agent system that analyzes
real repository code, providing actionable career guidance and professional development recommendations.

---

## 🎥 **Live Demo**

**🔗 Check it out here: [GitResumeAssessment](https://gitresumeassessment.netlify.app)**

<img width="1920" height="3997" alt="screencapture-gitresumeassessment-netlify-app-2025-11-10-05_46_00" src="https://github.com/user-attachments/assets/d60f53de-31b0-4dc8-b27b-82c1175ae8cd" />

---

## 🚀 **Key Features**

### **🤖 Multi-Agent AI Analysis System**
- **4 Specialized AI Agents** working in parallel:
  - **Code Architect**: Analyzes code structure, design patterns, and architectural quality.
  - **Tech Scout**: Evaluates technology stack, framework usage, and modern practices.
  - **Career Advisor**: Assesses professional readiness and portfolio quality.
  - **Innovation Detector**: Identifies cutting-edge technologies and problem-solving approaches.

### **🐅 Advanced Tiger Cloud Integration**
- **pg_text Search**: Semantic pattern detection across repositories.
- **Agent Learning Evolution**: AI agents improve accuracy over time.
- **Fluid Storage**: Dynamic scaling for analysis workloads.

### **📊 Comprehensive Analysis Features**
- **Individual Repository Insights**: Detailed 2-3 lines analysis per repository.
- **Cross-Repository Pattern Detection**: Identifies consistent patterns across projects.
- **Career Profile Generation**: Role detection with confidence scoring.
- **Actionable Recommendations**: Specific next steps for career advancement.
- **Professional Scoring**: Quantitative assessment across multiple dimensions.

### **💼 Career Guidance System**
- **Role Detection**: Automatically identifies career trajectory (Full-Stack Developer, Senior Engineer, etc.)
- **Hiring Path Recommendations**: 
  - Next project suggestions
  - Technology stack gaps
  - Concepts to learn
  - Portfolio improvements

---

## 🏗️ **Architecture**

### **Frontend**
- **Next.js 16.0.1** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization

### **Backend**
- **Next.js API Routes** as serverless functions
- **Tiger Cloud CLI** integration
- **GitHub API** for repository data
- **Google Gemini AI** for enhanced analysis

### **Multi-Agent System**
```typescript
class AdvancedTigerSystem {
  // Creates separate Tiger database forks for each agent
  async initializeMultiAgentSystem(username: string)
  
  // Runs parallel analysis with real-time collaboration
  async analyzeWithAdvancedAgents(username: string, repositories: string[])
  
  // Detects patterns across repositories using pg_text search
  async detectCrossRepoPatterns(insights: AgentInsight[])
  
  // Generates career profile with actionable recommendations
  async generateCareerProfile(insights: AgentInsight[], patterns: any[])
}
```

---

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 20+
- npm or yarn
- Tiger Cloud account
- GitHub Personal Access Token
- Gemini AI API Key

### **Local Development**

1. **Clone the repository**
```bash
git clone https://github.com/Divya4879/GitResume.git
cd GitResume
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` file:
```env
# GitHub API
GITHUB_TOKEN=your_github_token_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Tiger Cloud Database
TIGER_DATABASE_URL=your_tiger_database_url_here

# Next.js Authentication
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

4. **Run development server**
```bash
npm run dev
```

5. **Access the application**

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 **API Endpoints**

### **Analysis API**
```typescript
POST /api/analyze
{
  "username": "github_username",
  "repositories": ["repo1", "repo2", "repo3"]
}
```

**Response:**
```typescript
{
  "overallDeveloperScore": 0-1,
  "repositoryInsights": [...],
  "careerProfile": {
    "detectedRole": "Full-Stack Developer",
    "confidence": 0.85,
    "hiringPath": {...}
  },
  "crossRepoPatterns": [...],
  "agentLearningEvolution": [...]
}
```

### **GitHub Integration**
```typescript
GET /api/github?username=github_username
```

---

## 🎯 **Usage Flow**

### **Basic Analysis**
1. Enter your GitHub username
2. Chose your best repositories to analyze
3. Wait for multi-agent analysis (2-5 secs)
4. Review comprehensive insights and recommendations

### **Advanced Features**
- **Individual Repository Analysis**: Detailed breakdown per repository
- **Career Guidance**: Role-specific recommendations and hiring paths
- **Cross-Repository Insights**: Patterns detected across your entire portfolio

---


## 📈 **Performance & Scalability**

- **Parallel Processing**: 4 agents analyze repositories simultaneously
- **Efficient Caching**: Optimized GitHub API usage
- **Serverless Architecture**: Auto-scaling with Netlify Functions
- **Real-time Updates**: Live progress tracking during analysis

---

## 🔒 **Security & Privacy**

- **Secure API Integration**: Environment variables for sensitive data
- **GitHub Token Scoping**: Minimal required permissions
- **No Data Storage**: Analysis results are not permanently stored
- **Privacy-First**: Only public repository data is analyzed

---

## 🚀 **Deployment**

### **Netlify Deployment**
1. Connect GitHub repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Deploy with automatic builds on push

### **Environment Variables for Production**
```env
GITHUB_TOKEN=your_production_token
GEMINI_API_KEY=your_production_key
TIGER_DATABASE_URL=your_production_db_url
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.netlify.app
```

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with 💜 by Divya for the Tiger Cloud Agentic Postgres Challenge**.

*Transform your GitHub into professional insights - [Try GitResume Now](https://gitresumeassessment.netlify.app)*
