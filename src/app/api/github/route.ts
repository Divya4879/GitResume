import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const [userProfile, repositories] = await Promise.all([
      githubService.getUserProfile(username),
      githubService.getUserRepositories(username)
    ]);

    const rankedRepos = githubService.rankRepositories(repositories);

    return NextResponse.json({
      user: userProfile,
      repositories: rankedRepos,
      totalRepos: repositories.length
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, selectedRepos } = await request.json();
    
    if (!username || !selectedRepos) {
      return NextResponse.json({ error: 'Username and selected repositories are required' }, { status: 400 });
    }

    // Get detailed information for selected repositories
    const detailedRepos = await Promise.all(
      selectedRepos.map(async (repoName: string) => {
        return await githubService.getRepositoryDetails(username, repoName);
      })
    );

    return NextResponse.json({
      repositories: detailedRepos
    });
  } catch (error) {
    console.error('GitHub detailed fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed repository data' }, 
      { status: 500 }
    );
  }
}
