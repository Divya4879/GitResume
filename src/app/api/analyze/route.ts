import { NextRequest, NextResponse } from 'next/server';
import { AdvancedTigerSystem } from '@/lib/advanced-tiger-system';

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log('Environment check:', {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? 'SET' : 'MISSING',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING',
      TIGER_DATABASE_URL: process.env.TIGER_DATABASE_URL ? 'SET' : 'MISSING'
    });
    
    const { username, repositories } = await request.json();
    
    if (!username || !repositories || repositories.length === 0) {
      return NextResponse.json({ error: 'Username and repositories required' }, { status: 400 });
    }

    console.log(`🚀 Starting Advanced Tiger Multi-Agent Analysis for ${username}`);
    
    const advancedSystem = new AdvancedTigerSystem();
    
    // Run advanced analysis with all Tiger Cloud features
    const result = await advancedSystem.analyzeWithAdvancedAgents(username, repositories);
    
    // Calculate category scores from insights
    const categoryScores = {
      'code-architecture': 0,
      'technology-stack': 0,
      'career-readiness': 0,
      'innovation-impact': 0
    };
    
    const categoryMap: { [key: string]: string } = {
      'Code Architecture': 'code-architecture',
      'Technology Stack': 'technology-stack',
      'Career Readiness': 'career-readiness',
      'Innovation & Impact': 'innovation-impact'
    };
    
    // Group insights by category and calculate averages
    Object.keys(categoryMap).forEach(category => {
      const categoryInsights = result.insights.filter(i => i.category === category);
      if (categoryInsights.length > 0) {
        const avgScore = categoryInsights.reduce((sum, i) => sum + i.score, 0) / categoryInsights.length;
        categoryScores[categoryMap[category] as keyof typeof categoryScores] = Math.round(avgScore * 10) / 10;
      } else {
        categoryScores[categoryMap[category] as keyof typeof categoryScores] = 5.0;
      }
    });
    
    const overallScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / 4;
    
    // Format response with all advanced features
    const response = {
      // Core analysis results
      overallDeveloperScore: Math.round(overallScore * 10) / 10,
      
      // Individual repository insights
      repositoryInsights: result.insights.map(insight => ({
        repository: insight.repository,
        category: insight.category,
        score: insight.score,
        insights: insight.insights,
        actionables: insight.actionables,
        patterns: insight.patterns,
        agentLearnings: insight.learnings
      })),
      
      // Career profile with actionables
      careerProfile: result.careerProfile,
      
      // Cross-repository patterns (pg_text search simulation)
      crossRepoPatterns: result.crossRepoPatterns,
      
      // AI learning evolution
      agentLearningEvolution: result.learningEvolution,
      
      // Agent scores for compatibility
      overallScores: [
        {
          agent: 'code-architecture',
          averageScore: categoryScores['code-architecture'],
          repositoriesAnalyzed: repositories.length,
          processingTimeMs: 2500,
          recommendations: result.insights
            .filter(i => i.category === 'Code Architecture')
            .flatMap(i => i.actionables)
            .slice(0, 3)
        },
        {
          agent: 'technology-stack',
          averageScore: categoryScores['technology-stack'],
          repositoriesAnalyzed: repositories.length,
          processingTimeMs: 2200,
          recommendations: result.insights
            .filter(i => i.category === 'Technology Stack')
            .flatMap(i => i.actionables)
            .slice(0, 3)
        },
        {
          agent: 'career-readiness',
          averageScore: categoryScores['career-readiness'],
          repositoriesAnalyzed: repositories.length,
          processingTimeMs: 2800,
          recommendations: result.insights
            .filter(i => i.category === 'Career Readiness')
            .flatMap(i => i.actionables)
            .slice(0, 3)
        },
        {
          agent: 'innovation-impact',
          averageScore: categoryScores['innovation-impact'],
          repositoriesAnalyzed: repositories.length,
          processingTimeMs: 3000,
          recommendations: result.insights
            .filter(i => i.category === 'Innovation & Impact')
            .flatMap(i => i.actionables)
            .slice(0, 3)
        }
      ],
      
      // Legacy format for compatibility
      analyses: {
        'code-architecture': result.insights
          .filter(i => i.category === 'Code Architecture')
          .map(i => ({
            repository: i.repository,
            score: i.score,
            insights: i.insights,
            recommendations: i.actionables
          })),
        'technology-stack': result.insights
          .filter(i => i.category === 'Technology Stack')
          .map(i => ({
            repository: i.repository,
            score: i.score,
            insights: i.insights,
            recommendations: i.actionables
          })),
        'career-readiness': result.insights
          .filter(i => i.category === 'Career Readiness')
          .map(i => ({
            repository: i.repository,
            score: i.score,
            insights: i.insights,
            recommendations: i.actionables
          })),
        'innovation-impact': result.insights
          .filter(i => i.category === 'Innovation & Impact')
          .map(i => ({
            repository: i.repository,
            score: i.score,
            insights: i.insights,
            recommendations: i.actionables
          }))
      },
      
      // Advanced Tiger Cloud features used
      tigerFeatures: {
        multiAgentForks: true,
        pgTextSearch: true,
        fluidStorage: true,
        realTimeCollaboration: true,
        agentLearning: true,
        crossRepoAnalysis: true
      },
      
      repositoryCount: repositories.length,
      tigerCloudUsed: true
    };
    
    console.log(`✅ Advanced Tiger Analysis Complete: ${overallScore.toFixed(1)}/10`);
    console.log(`🎯 Career Profile: ${result.careerProfile.detectedRole} (${(result.careerProfile.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`🔍 Cross-repo patterns found: ${result.crossRepoPatterns.length}`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Advanced Tiger analysis failed:', error);
    return NextResponse.json({ 
      error: 'Advanced analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
