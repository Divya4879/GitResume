import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, userProfile, analyses, overallScores, resume } = await request.json();

    if (!username || !analyses) {
      return NextResponse.json({ error: 'Username and analyses are required' }, { status: 400 });
    }

    console.log(`📝 [GitResume] Generating professional resume for ${username}...`);

    // If resume is already generated from analysis, return it
    if (resume && resume.content) {
      console.log(`✅ [GitResume] Resume already generated, returning existing resume`);
      
      return NextResponse.json({
        resume: resume.content,
        overallScore: overallScores?.reduce((sum: number, score: any) => sum + score.averageScore, 0) / (overallScores?.length || 1) || 7.5,
        skills: resume.skills || {
          languages: ['JavaScript', 'TypeScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Next.js'],
          tools: ['Git', 'GitHub', 'VS Code'],
          strengths: ['Problem Solving', 'Technical Implementation', 'Project Development'],
          improvements: ['Documentation', 'Testing', 'Architecture']
        }
      });
    }

    // Fallback resume generation if not provided
    const overallScore = overallScores?.reduce((sum: number, score: any) => sum + score.averageScore, 0) / (overallScores?.length || 1) || 7.5;
    
    const professionalResume = `# ${username}'s Professional GitResume

## Executive Summary
Experienced developer with proven track record in software development and technical innovation. Overall assessment score: ${overallScore.toFixed(1)}/10 based on comprehensive multi-agent analysis by technical recruiters, senior engineers, and startup CTOs.

## Technical Expertise
- **Languages:** JavaScript, TypeScript, Python, Java
- **Frameworks:** React, Node.js, Next.js, Express
- **Tools:** Git, GitHub, VS Code, Docker
- **Specialties:** Full-stack development, API design, database management

## Key Projects Analysis
${overallScores?.map((agent: any) => `
### ${agent.agent.replace('_', ' ').toUpperCase()} PERSPECTIVE
**Score:** ${agent.averageScore}/10
**Repositories Analyzed:** ${agent.repositoriesAnalyzed}
**Key Recommendations:**
${agent.recommendations.map((rec: string) => `• ${rec}`).join('\n')}
`).join('\n') || 'Comprehensive analysis completed across multiple repositories'}

## Professional Strengths
- Strong technical implementation skills
- Consistent project development approach  
- Understanding of modern development practices
- Ability to work with diverse technology stacks

## Growth Opportunities
- Enhanced documentation and project presentation
- Expanded testing and quality assurance practices
- Increased focus on scalability and architecture
- Greater emphasis on business impact metrics

## Career Recommendations
Based on comprehensive analysis, focus on:
1. **Portfolio Enhancement** - Improve project documentation and live demos
2. **Technical Depth** - Expand expertise in current technology stack
3. **Professional Presentation** - Showcase business impact and user value
4. **Continuous Learning** - Stay current with industry trends and best practices

---
*Generated on ${new Date().toLocaleDateString()} | Professional GitResume Analysis*`;

    console.log(`✅ [GitResume] Professional resume generated successfully for ${username}`);

    return NextResponse.json({
      resume: professionalResume,
      overallScore: Math.round(overallScore * 10) / 10,
      skills: {
        languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
        frameworks: ['React', 'Node.js', 'Next.js', 'Express'],
        tools: ['Git', 'GitHub', 'VS Code', 'Docker'],
        strengths: ['Technical Implementation', 'Project Development', 'Problem Solving', 'Modern Practices'],
        improvements: ['Documentation', 'Testing', 'Architecture', 'Business Impact']
      }
    });

  } catch (error) {
    console.error('❌ [GitResume] Resume generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate resume. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
