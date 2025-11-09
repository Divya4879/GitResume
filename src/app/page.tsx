'use client';

import Link from 'next/link';
import { Github, Zap, Brain, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">GitResume</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
            <Link href="/github-analysis" className="bg-purple-500 px-4 py-2 rounded-lg text-white hover:bg-purple-600 transition-colors">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
            🐅 Powered by Tiger Cloud Agentic Postgres
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Transform Your GitHub Into a
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}Professional Analysis
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Get comprehensive analysis of your GitHub repositories by a veteran technical expert. 
            Discover your coding strengths, get professional recommendations, and understand your development profile.
          </p>

          <Link href="/github-analysis">
            <button className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-lg transform hover:scale-105 shadow-xl">
              Analyze My GitHub
              <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <p className="text-gray-400 text-sm mt-4">
            ✨ Free • No signup required • Instant results • Real expert analysis
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Comprehensive Repository Analysis
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: "🔧",
              title: "Code Quality",
              description: "Analysis of code structure, organization, and development practices across your repositories"
            },
            {
              icon: "📚", 
              title: "Documentation",
              description: "Evaluation of README files, project descriptions, and overall presentation quality"
            },
            {
              icon: "⚙️",
              title: "Tech Stack",
              description: "Assessment of technologies used, framework choices, and technical diversity"
            },
            {
              icon: "🚀",
              title: "Impact & Innovation", 
              description: "Review of project creativity, problem-solving approach, and practical applications"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tiger Cloud Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-12 border border-purple-500/20">
          <div className="text-center">
            <div className="text-5xl mb-6">🐅</div>
            <h2 className="text-3xl font-bold text-white mb-6">Built on Tiger Cloud</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Built using Tiger Cloud integration for the Agentic Postgres Challenge. 
              Provides structured analysis and professional insights about your development work.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">4</div>
                <div className="text-sm text-gray-400">Analysis Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">Instant</div>
                <div className="text-sm text-gray-400">Results</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">Free</div>
                <div className="text-sm text-gray-400">Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Enter GitHub Username",
              description: "Simply provide your GitHub username - no authentication or signup required"
            },
            {
              step: "2", 
              title: "Repository Analysis",
              description: "System analyzes your public repositories across 4 categories with scoring and insights"
            },
            {
              step: "3",
              title: "Professional Insights",
              description: "Get detailed scores, expert recommendations, and a professional resume showcase"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-white/5 rounded-2xl p-12 text-center backdrop-blur-sm border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Showcase Your Skills?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            See how your GitHub repositories score across different categories and get insights 
            about your development profile and areas for improvement.
          </p>
          <Link href="/github-analysis">
            <button className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xl transform hover:scale-105 shadow-xl">
              Start Your Analysis Now
            </button>
          </Link>
          <div className="mt-6 text-sm text-gray-400">
            🚀 Powered by Tiger Cloud • ⚡ Instant Results • 🎯 Professional Insights • 🆓 Completely Free
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p className="mb-4 text-lg">Professional developer portfolio analysis powered by Tiger Cloud</p>
          <p className="mb-2">Built with 💜 by Divya</p>
          <p className="text-sm">
            <a 
              href="https://github.com/Divya4879/GitResume.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Checkout the code here →
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
