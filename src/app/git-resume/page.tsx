'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Github, Brain, CheckCircle, Clock, Download, ArrowLeft, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ResumeData {
  resume: string;
  overallScore: number;
  skills?: {
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
    strengths?: string[];
    improvements?: string[];
  };
}

interface AnalysisData {
  overallScores: Array<{
    agent: string;
    averageScore: number;
    totalInsights: number;
    recommendations: string[];
  }>;
}

function GitResumeContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const repos = searchParams.get('repos')?.split(',') || [];
  
  const [step, setStep] = useState(1); // 1: Analysis, 2: Results
  const [currentRepo, setCurrentRepo] = useState(0);
  const [currentAgent, setCurrentAgent] = useState(0);
  const [completedRepos, setCompletedRepos] = useState<string[]>([]);
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState<string>('');
  const [analyses, setAnalyses] = useState<AnalysisData | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const agents = [
    { name: "Code Quality", icon: "🔧", focus: "Architecture & Best Practices" },
    { name: "Documentation", icon: "📚", focus: "Communication & Clarity" },
    { name: "Tech Stack", icon: "⚙️", focus: "Technology & Innovation" },
    { name: "Impact/Innovation", icon: "🚀", focus: "Business Value & Creativity" }
  ];

  const [analysisStarted, setAnalysisStarted] = useState(false);

  const formatResumeContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        // Main title
        elements.push(
          <h1 key={index} className="text-4xl font-bold mb-6 text-center">
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        // Section title
        elements.push(
          <h2 key={index} className="text-2xl font-bold mb-4 mt-8 border-b-2 border-gray-300 pb-2">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        // Subsection title
        elements.push(
          <h3 key={index} className="text-xl font-bold mb-3 mt-6">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Bold text
        elements.push(
          <p key={index} className="font-bold mb-2">
            {trimmedLine.substring(2, trimmedLine.length - 2)}
          </p>
        );
      } else if (trimmedLine.startsWith('- ')) {
        // List item
        elements.push(
          <li key={index} className="mb-1 ml-4">
            {trimmedLine.substring(2)}
          </li>
        );
      } else if (trimmedLine.includes('**')) {
        // Inline bold text
        const parts = trimmedLine.split('**');
        const formattedParts = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
        elements.push(
          <p key={index} className="mb-2">
            {formattedParts}
          </p>
        );
      } else if (trimmedLine.length > 0) {
        // Regular paragraph
        elements.push(
          <p key={index} className="mb-2">
            {trimmedLine}
          </p>
        );
      } else {
        // Empty line
        elements.push(<br key={index} />);
      }
    });

    return <div>{elements}</div>;
  };

  useEffect(() => {
    if (username && repos.length > 0 && !analysisStarted) {
      // Reset progress state
      setCompletedRepos([]);
      setCurrentlyAnalyzing('');
      setCurrentRepo(0);
      setCurrentAgent(0);
      setAnalysisStarted(true);
      
      startAnalysis();
    }
  }, [username, repos, analysisStarted]);

  const startAnalysis = useCallback(async () => {
    try {
      console.log(`🚀 [GitResume] Starting analysis for ${repos.length} repositories`);
      console.log(`📊 [GitResume] Repositories:`, repos);
      
      // Start real backend analysis immediately
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          repositories: repos 
        })
      });

      console.log(`📡 [GitResume] Analysis API response:`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [GitResume] Analysis complete:`, data);
        setAnalyses(data);
        setStep(2); // Move to results immediately
        
        // Get user profile
        const profileResponse = await fetch(`/api/github?username=${username}`);
        const profileData = await profileResponse.json();
        setUserProfile(profileData.user);
        
        console.log(`👤 [GitResume] User profile loaded:`, profileData.user);
        
        // Generate resume
        console.log(`📝 [GitResume] Generating resume...`);
        const resumeResponse = await fetch('/api/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            userProfile: profileData.user,
            analyses: data.analyses,
            overallScores: data.overallScores
          })
        });

        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          console.log(`✅ [GitResume] Resume generated successfully`);
          setResume(resumeData);
          setStep(2); // Move to results step
        } else {
          console.error(`❌ [GitResume] Resume generation failed:`, resumeResponse.status);
        }
        
        console.log(`🎉 [GitResume] Complete analysis finished for ${username}!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [GitResume] Analysis failed:`, response.status, errorData);
        
        if (response.status === 429) {
          alert('Analysis is already in progress. Please wait for it to complete.');
        } else {
          alert(`Analysis failed: ${errorData.error || 'Unknown error'}. Please try again.`);
        }
      }
      
    } catch (error) {
      console.error(`💥 [GitResume] Analysis error:`, error);
      alert('Analysis failed. Please check console for details and try again.');
    }
  }, [repos, username]);

  const completeAnalysis = async () => {
    try {
      // Get detailed repo data
      const detailResponse = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, selectedRepos: repos })
      });
      const detailData = await detailResponse.json();
      
      // Start AI analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          repositories: detailData.repositories 
        })
      });
      const analysisData = await analysisResponse.json();
      
      setAnalyses(analysisData);
      
      // Get user profile
      const profileResponse = await fetch(`/api/github?username=${username}`);
      const profileData = await profileResponse.json();
      setUserProfile(profileData.user);
      
      // Generate resume
      const resumeResponse = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          userProfile: profileData.user,
          analyses: analysisData.analyses,
          overallScores: analysisData.overallScores
        })
      });
      const resumeData = await resumeResponse.json();
      
      setResume(resumeData);
      setStep(2);
    } catch (error) {
      console.error('Analysis completion error:', error);
    }
  };

  const downloadResumeSnapshot = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('resume-content');
      
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `${username}-resume-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Resume download failed:', error);
      alert('Resume download failed. Please try again.');
    }
  };

  if (!username || repos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Analysis Request</h1>
          <p className="text-gray-300 mb-6">Missing username or repository selection</p>
          <Link href="/github-analysis" className="text-purple-400 hover:text-purple-300">
            Start New Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Github className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">GitResume</span>
          </Link>
          <Link href="/github-analysis" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>New Analysis</span>
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Step 1: Analysis in Progress */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Tiger Cloud Multi-Agent Analysis
            </h1>
            <p className="text-gray-300 mb-12">
              3 specialized AI agents analyzing your repositories in a Tiger Cloud zero-copy fork with pg_text search
            </p>

            {/* Current Progress */}
            <div className="bg-white/5 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-center mb-6">
                <Brain className="w-16 h-16 text-purple-400 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentlyAnalyzing ? `Analyzing: ${currentlyAnalyzing}` : 'Starting Analysis...'}
              </h2>
              
              <div className="flex items-center justify-center mb-6">
                <div className="text-6xl mb-4">{agents[currentAgent]?.icon || '🔄'}</div>
              </div>
              
              <h3 className="text-xl text-purple-400 mb-2">{agents[currentAgent]?.name || 'Initializing...'}</h3>
              <p className="text-gray-300 mb-6">{agents[currentAgent]?.focus || 'Preparing analysis...'}</p>
              
              {/* Repository Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedRepos.length / repos.length) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-gray-400 text-sm">
                {completedRepos.length} of {repos.length} repositories analyzed
              </p>
            </div>

            {/* Agent Status Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <div 
                  key={index} 
                  className={`bg-white/5 rounded-lg p-4 border transition-all ${
                    index === currentAgent ? 'border-purple-400 bg-purple-500/10' : 'border-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{agent.icon}</div>
                  <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
                  <div className="flex items-center justify-center mt-2">
                    {index < currentAgent || (index === currentAgent && currentRepo > 0) ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : index === currentAgent ? (
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    ) : (
                      <Clock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Repository Progress */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Repository Analysis Progress</h3>
              <div className="grid md:grid-cols-4 gap-3">
                {repos.map((repo, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      index < currentRepo ? 'bg-green-500/20 text-green-400' :
                      index === currentRepo ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-700/50 text-gray-500'
                    }`}
                  >
                    {index < currentRepo ? '✅' : index === currentRepo ? '🔄' : '⏳'} {repo}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Results */}
        {step === 2 && (
          <motion.div
            id="gitresume-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Show loading state if no valid data */}
            {(!analyses || !analyses.overallScores) && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">🐅 Tiger Cloud Analysis in Progress</h2>
                  <p className="text-gray-300">3 specialized agents analyzing your repositories in isolated Tiger fork...</p>
                  <div className="text-sm text-gray-400">Zero-copy fork created • pg_text search active • 10-minute lifecycle</div>
                </div>
              </div>
            )}

            {/* Show results when data is ready */}
            {(analyses && analyses.overallScores) && (
              <div>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    🎉 Your Tiger GitResume is Ready!
                  </h1>
                  <p className="text-gray-300">
                    Comprehensive analysis by 3 specialized agents using Tiger Cloud's zero-copy forks and pg_text search
                  </p>
                </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-8 mb-8 text-center border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">Overall Developer Score</h2>
              <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                {(analyses as any)?.overallDeveloperScore?.toFixed(1) || '0.0'}/10
              </div>
              <p className="text-gray-300 mb-6">Based on comprehensive multi-agent analysis</p>
            </div>

            {/* Skills Radar Chart */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Skills Assessment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analyses?.overallScores?.map((score: any) => ({
                    skill: score.agent.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                    score: score.averageScore
                  })) || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" className="text-white text-xs" />
                    <PolarRadiusAxis domain={[0, 10]} className="text-gray-400" />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyses?.overallScores?.map((score: any) => ({
                    name: score.agent.replace('_', ' '),
                    score: score.averageScore
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Generated Resume */}
            <div className="bg-white/5 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Professional Resume</h3>
                <div className="text-sm text-gray-400">
                  Generated on {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div id="resume-content" className="bg-white/5 rounded-lg p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {resume?.resume || 'Resume generation in progress...'}
              </div>
            </div>

            {/* Skills & Recommendations */}
            {resume?.skills && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Technical Skills</h3>
                  <div className="space-y-4">
                    {Object.entries(resume?.skills || {}).slice(0, 3).map(([category, items]: [string, any]) => (
                      <div key={category}>
                        <h4 className="text-purple-400 font-semibold capitalize mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {items?.slice(0, 6).map((item: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Growth Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {resume?.skills?.strengths?.slice(0, 3).map((strength: string, index: number) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-2">Areas for Growth</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {resume?.skills?.improvements?.slice(0, 3).map((improvement: string, index: number) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Insights */}
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Detailed Agent Insights</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses?.overallScores?.map((agentScore: any, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{agents[index]?.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold">{agents[index]?.name}</h4>
                        <div className="text-purple-400 font-bold">{agentScore.averageScore.toFixed(1)}/10</div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{agentScore.totalInsights} insights discovered</p>
                    
                    {/* Show actual detailed insights */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-gray-300 mb-2">Key Insights:</h5>
                        <div className="space-y-1">
                          {(analyses as any).analyses[agentScore.agent]?.map((analysis: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-400">
                              • {analysis.insights?.[0] || 'Professional analysis completed'}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-gray-300 mb-2">Recommendations:</h5>
                        <div className="space-y-1">
                          {agentScore.recommendations?.slice(0, 2).map((rec: string, idx: number) => (
                            <div key={idx} className="text-xs text-gray-400">
                              • {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Repos: {agentScore.repositoriesAnalyzed}</span>
                          <span>{Math.round(agentScore.processingTimeMs / 1000)}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-12">
              <div className="flex justify-center space-x-4">
                <Link href="/github-analysis">
                  <button className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Analyze Another Profile
                  </button>
                </Link>
                <Link href="/">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function GitResumePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-4">Loading Analysis...</h1>
        </div>
      </div>
    }>
      <GitResumeContent />
    </Suspense>
  );
}
