import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '../models/Context'
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'

export class OctokitService {
  private GHA_BOT_NAME = 'Birbal-Bot'
  private CCR_COMMENT_TAG = '### :robot: Code Review By Birbal-Bot'
  private MODULE_NAME_TAG = '#### '
  private NEXT_LINE = '\n'
  private octokit

  constructor() {
    const GITHUB_TOKEN = core.getInput('github_token')
    this.octokit = github.getOctokit(GITHUB_TOKEN)
  }

  public async postComment(
    context: Context,
    filename: string,
    commentBody: string,
  ): Promise<RestEndpointMethodTypes['issues']['createComment']['response']> {
    return this.octokit.rest.issues.createComment({
      owner: context.repositoryOwner,
      repo: context.repository,
      issue_number: context.pullRequest,
      body: this.comment(context, commentBody, filename)
    })
  }

  public async deleteOldComments(context: Context): Promise<void> {
    const comments = await this.listComments(context)

    if (comments && comments.data) {
      const ccrComments = comments.data.filter(
        comment =>
          comment.user?.login === this.GHA_BOT_NAME &&
          comment.body?.startsWith(this.commentKey(context, ""))
      )

      try {
        await Promise.all(
          ccrComments.map(comment => this.deleteComment(context, comment.id))
        )
      } catch (err) {
        core.error(`Failed to delete old comments: ${ccrComments}`)
        throw err
      }
    }
  }

  public async getCommitPullRequest(
    repoOwner: string,
    repo: string,
    commitSha: string
  ): Promise<number> {
    const prMatches = await this.octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: repoOwner,
      repo,
      commit_sha: commitSha
    })

    if (prMatches.data.length > 1) {
      throw new Error('More than one PRs found matching the merge commit SHA!')
    } else if (prMatches.data.length === 0) {
      throw new Error(
        'No PRs found matching the HEAD! Please do not push directly to your main branch for this action to work in single build mode.'
      )
    }

    return prMatches.data[0].number
  }


  public getContext():Context {
    core.startGroup('Resolving context...')

    const repoOwner = github.context.repo.owner
    const repoName = github.context.repo.repo
    const pullRequest = github.context.issue.number;

    const context: Context = {
      repository: repoName,
      repositoryOwner: repoOwner,
      pullRequest,
    }

    core.info(JSON.stringify(context, undefined, 2))
    // core.endGroup()

    return context
  }
  public async getFileContent(file: any) {

    const context = this.getContext();
    const { data: pullRequest } = await this.octokit.rest.git.getBlob({
      owner: context.repositoryOwner,
      repo: context.repository,
      file_sha: file.sha,
      mediaType: {
        format: 'diff'
      }
    });
    return pullRequest;
  }


  public async getPullRequestFiles() {
    const context = this.getContext();
    const { data: pullRequest } = await this.octokit.rest.pulls.listFiles({
      owner: context.repositoryOwner,
      repo: context.repository,
      pull_number: context.pullRequest,
      mediaType: {
        format: 'diff'
      }
    });
    return pullRequest;
  }

  private async listComments(
    context: Context
  ): Promise<RestEndpointMethodTypes['issues']['listComments']['response']> {
    return this.octokit.rest.issues.listComments({
      owner: context.repositoryOwner,
      repo: context.repository,
      issue_number: context.pullRequest
    })
  }

  private async deleteComment(
    context: Context,
    commentId: number
  ): Promise<RestEndpointMethodTypes['issues']['deleteComment']['response']> {
    return this.octokit.rest.issues.deleteComment({
      owner: context.repositoryOwner,
      repo: context.repository,
      comment_id: commentId
    })
  }

  private comment(context: Context, commentBody: string, filename: string): string {
    return this.commentKey(context, filename) + commentBody
  }

  private commentKey(context: Context, filename: string): string {
    return this.CCR_COMMENT_TAG
    + this.NEXT_LINE + this.MODULE_NAME_TAG + this.NEXT_LINE
    + this.NEXT_LINE + "Review for: " + filename + this.NEXT_LINE
  }
}

let octokitInstance: OctokitService | null;

function getOctokit() {
  if(!octokitInstance) {
    octokitInstance = new OctokitService();
  }
  return octokitInstance;
}

export { getOctokit };