import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/assessments/[id]/comments - Get comments for an assessment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Verify assessment access (owner or shared)
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, companies!inner(org_id)')
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    // If not owner, check if shared
    if (!assessment) {
      const { data: share } = await supabase
        .from('assessment_shares')
        .select('id')
        .eq('assessment_id', id)
        .eq('shared_with_user_id', session.user.id)
        .single()

      if (!share) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }
    }

    // Get comments with user info
    const { data: comments, error } = await supabase
      .from('assessment_comments')
      .select(`
        id,
        content,
        parent_id,
        created_at,
        updated_at,
        user_id,
        users(id, email, name, avatar_url)
      `)
      .eq('assessment_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    // Transform users array to object and organize into threaded structure
    const transformedComments = (comments || []).map((comment) => ({
      ...comment,
      users: Array.isArray(comment.users) ? comment.users[0] : comment.users,
    })) as Comment[]

    const threadedComments = organizeComments(transformedComments)

    return NextResponse.json(threadedComments)
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/assessments/[id]/comments - Add a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, parentId } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify assessment access
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, companies!inner(org_id)')
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    // If not owner, check if shared with comment permission
    if (!assessment) {
      const { data: share } = await supabase
        .from('assessment_shares')
        .select('id, permission')
        .eq('assessment_id', id)
        .eq('shared_with_user_id', session.user.id)
        .single()

      if (!share || share.permission === 'view') {
        return NextResponse.json({ error: 'No permission to comment' }, { status: 403 })
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('assessment_comments')
      .insert({
        assessment_id: id,
        user_id: session.user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select(`
        id,
        content,
        parent_id,
        created_at,
        updated_at,
        user_id,
        users(id, email, name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE /api/assessments/[id]/comments - Delete a comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify comment ownership
    const { data: comment } = await supabase
      .from('assessment_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('assessment_id', id)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Cannot delete others comments' }, { status: 403 })
    }

    // Delete comment (and replies via cascade)
    const { error: deleteError } = await supabase
      .from('assessment_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}

interface Comment {
  id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  users: {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
  }
  replies?: Comment[]
}

function organizeComments(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: organize into tree structure
  comments.forEach((comment) => {
    const processedComment = commentMap.get(comment.id)!
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(processedComment)
      }
    } else {
      rootComments.push(processedComment)
    }
  })

  return rootComments
}
