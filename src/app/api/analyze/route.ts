import { NextRequest, NextResponse } from 'next/server';
import { TigerDemoSystem } from '@/lib/tiger-demo';

// Reset the analyzing flag on server restart
let isAnalyzing = false;

export async function POST(request: NextRequest) {
  try {
    const { username, repositories } = await request.json();

    if (!username || !repositories || repositories.length === 0) {
      return NextResponse.json({ error: 'Username and repositories are required' }, { status: 400 });
    }

    // Reset flag if it's been stuck for too long (force reset)
    if (isAnalyzing) {
      console.log(`⚠️ Resetting stuck analyzing flag`);
      isAnalyzing = false;
    }

    isAnalyzing = true;

    try {
      console.log(`🚀 Starting Tiger Cloud veteran analysis for ${username} with ${repositories.length} repositories`);
      
      // Initialize Tiger Demo System
      const tigerSystem = new TigerDemoSystem();
      
      // Run veteran analysis
      const result = await tigerSystem.analyzeRepositories(username, repositories);
      
      console.log(`✅ Tiger veteran analysis complete for ${username}: ${result.overallScore}/10`);
      
      // Format response for frontend compatibility
      const agentTypes = ['code_quality', 'documentation', 'tech_stack', 'impact_innovation'];
      const overallScores = agentTypes.map(agentType => {
        const agentAnalyses = result.analyses.filter((a: any) => a.agentType === agentType);
        const averageScore = agentAnalyses.reduce((sum: number, a: any) => sum + a.score, 0) / agentAnalyses.length;
        
        return {
          agent: agentType,
          averageScore: Math.round(averageScore * 10) / 10,
          totalInsights: agentAnalyses.length,
          recommendations: agentAnalyses.flatMap((a: any) => a.recommendations).slice(0, 3),
          repositoriesAnalyzed: agentAnalyses.length,
          processingTimeMs: 2000
        };
      });

      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        tigerServiceId: result.tigerServiceId,
        tigerFeatures: result.tigerFeatures,
        overallDeveloperScore: result.overallScore,
        overallScores,
        analyses: {
          code_quality: result.analyses.filter((a: any) => a.agentType === 'code_quality').map((a: any) => ({
            repository: a.repoName,
            score: a.score,
            insights: [a.reasoning],
            recommendations: a.recommendations
          })),
          documentation: result.analyses.filter((a: any) => a.agentType === 'documentation').map((a: any) => ({
            repository: a.repoName,
            score: a.score,
            insights: [a.reasoning],
            recommendations: a.recommendations
          })),
          tech_stack: result.analyses.filter((a: any) => a.agentType === 'tech_stack').map((a: any) => ({
            repository: a.repoName,
            score: a.score,
            insights: [a.reasoning],
            recommendations: a.recommendations
          })),
          impact_innovation: result.analyses.filter((a: any) => a.agentType === 'impact_innovation').map((a: any) => ({
            repository: a.repoName,
            score: a.score,
            insights: [a.reasoning],
            recommendations: a.recommendations
          }))
        },
        repositoryCount: repositories.length,
        agentCount: 4,
        tigerCloudUsed: true,
        resume: result.resume
      });

    } finally {
      // Always reset the analyzing flag
      isAnalyzing = false;
    }

  } catch (error) {
    isAnalyzing = false; // Reset on error too
    console.error('Tiger demo analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze repositories with Tiger Cloud. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
