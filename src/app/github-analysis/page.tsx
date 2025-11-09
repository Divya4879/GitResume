'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GitHubAnalysisPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchGitHubData = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/github?username=${username}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setUserProfile(data.user);
      setRepositories(data.repositories);
      setSelectedRepos(data.repositories.slice(0, 6).map((repo: any) => repo.name));
      setStep(2);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      alert('Failed to fetch GitHub data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = () => {
    if (selectedRepos.length < 4) {
      alert('Please select at least 4 repositories');
      return;
    }
    
    // Navigate to git-resume page with data
    const params = new URLSearchParams({
      username,
      repos: selectedRepos.join(',')
    });
    router.push(`/git-resume?${params.toString()}`);
  };

  const toggleRepo = (repoName: string) => {
    setSelectedRepos(prev => 
      prev.includes(repoName) 
        ? prev.filter(name => name !== repoName)
        : prev.length < 6 ? [...prev, repoName] : prev // Max 6 repos
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Github className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">GitResume</span>
          </Link>
          <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-8">Tiger Cloud GitHub Analysis</h1>
          <div className="flex justify-center space-x-8 mb-8">
            {[
              { num: 1, label: 'Enter Username' },
              { num: 2, label: 'Select Repositories' }
            ].map((stepItem) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepItem.num ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {step > stepItem.num ? <CheckCircle className="w-6 h-6" /> : stepItem.num}
                </div>
                <span className={`ml-3 ${step >= stepItem.num ? 'text-white' : 'text-gray-400'}`}>
                  {stepItem.label}
                </span>
                {stepItem.num < 2 && <div className={`w-16 h-1 ml-6 ${
                  step > stepItem.num ? 'bg-purple-500' : 'bg-gray-600'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Username Input */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Enter Your GitHub Username</h2>
            <p className="text-gray-300 mb-8">
              Tiger Cloud will create a zero-copy fork and deploy 3 AI agents to analyze your repositories
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchGitHubData()}
                className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              
              <button
                onClick={fetchGitHubData}
                disabled={loading || !username.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Fetching Repositories...
                  </div>
                ) : (
                  'Analyze Repositories'
                )}
              </button>
              
              <p className="text-gray-400 text-sm">
                Try: octocat, torvalds, or your own username
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Repository Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* User Profile */}
            {userProfile && (
              <div className="bg-white/5 rounded-xl p-6 mb-8 text-center">
                <img 
                  src={(userProfile as any).avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-white mb-2">
                  {(userProfile as any).name || (userProfile as any).login}
                </h2>
                <p className="text-gray-300 mb-4">{(userProfile as any).bio}</p>
                <div className="flex justify-center space-x-6 text-sm text-gray-400">
                  <span>📚 {(userProfile as any).public_repos} repos</span>
                  <span>👥 {(userProfile as any).followers} followers</span>
                  <span>👤 {(userProfile as any).following} following</span>
                </div>
              </div>
            )}

            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Select Your Best Repositories
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Choose 4-6 repositories that best showcase your skills. We've pre-selected your top repositories based on activity and engagement.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {repositories.map((repo: any) => (
                <div
                  key={repo.id}
                  onClick={() => toggleRepo(repo.name)}
                  className={`p-6 rounded-lg border cursor-pointer transition-all ${
                    selectedRepos.includes(repo.name)
                      ? 'bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white truncate">{repo.name}</h3>
                    {selectedRepos.includes(repo.name) && (
                      <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {repo.language || 'Unknown'}
                    </span>
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span className="flex items-center">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="flex items-center">
                        🍴 {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Summary & Action */}
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <p className="text-gray-300 mb-4">
                Selected: <span className="text-purple-400 font-semibold">{selectedRepos.length}/8</span> repositories
              </p>
              
              {selectedRepos.length < 4 && (
                <p className="text-yellow-400 text-sm mb-4">
                  Please select at least 4 repositories for comprehensive analysis
                </p>
              )}
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Change Username
                </button>
                
                <button
                  onClick={startAnalysis}
                  disabled={selectedRepos.length < 4}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                >
                  Start AI Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
