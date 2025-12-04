import React, { useState, useEffect } from 'react';
import '../css/PostFeed.css';

export default function PostFeed({
  post = {},
  onLike = () => {},
  onComment = () => {},
  onShare = () => {},
}) {
  const {
    id,
    author = 'Unknown',
    role = '',
    category = '',
    content = '',
    timestamp = 'Just now',
    likes: initialLikes = 0,
    comments: initialComments = 0,
    shares: initialShares = 0,
    image = null,
    BarangayName = '',
  } = post;

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReaction, setSubmittingReaction] = useState(false);

  const userId = localStorage.getItem('userId');

  // Check if user has already liked this post on mount
  useEffect(() => {
    if (id && userId) {
      checkUserReaction();
    }
  }, [id, userId]);

  const checkUserReaction = async () => {
    try {
      const response = await fetch(`/api/reactions/${id}`);
      if (!response.ok) return;
      const reactions = await response.json();
      const userLiked = reactions.some(r => r.UserID === userId);
      setLiked(userLiked);
    } catch (error) {
      console.error('Error checking reaction:', error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'announcement':
        return '#a855f7';
      case 'event':
        return '#3b82f6';
      case 'news':
        return '#10b981';
      case 'emergency':
        return '#ef4444';
      case 'weather':
        return '#06b6d4';
      default:
        return '#64748b';
    }
  };

  const toggleLike = async () => {
    if (!userId) {
      alert('Please log in to react to posts');
      return;
    }

    try {
      setSubmittingReaction(true);
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PostID: id, UserID: userId })
      });

      if (!response.ok) throw new Error('Failed to toggle reaction');
      
      const result = await response.json();
      const nextLiked = result.action === 'added';
      setLiked(nextLiked);
      setLikes((l) => nextLiked ? l + 1 : l - 1);
      onLike({ id, liked: nextLiked, likes: nextLiked ? likes + 1 : likes - 1 });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      alert('Failed to react to post');
    } finally {
      setSubmittingReaction(false);
    }
  };

  const openComment = () => {
    setShowCommentBox((s) => !s);
    onComment({ id, action: 'open' });
  };

  const submitComment = async (e) => {
    e && e.preventDefault();
    if (!commentText.trim()) return;

    if (!userId) {
      alert('Please log in to comment on posts');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await fetch('http://localhost:3001/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PostID: id, UserID: userId, Content: commentText })
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      await response.json();
      setCommentsCount((c) => c + 1);
      onComment({ id, action: 'submit', text: commentText });
      setCommentText('');
      setShowCommentBox(false);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const doShare = (platform) => {
    const shareText = content;
    const encoded = encodeURIComponent(window.location.href);
    const textEncoded = encodeURIComponent(shareText);
    let shareUrl = '';

    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encoded}&text=${textEncoded}`;
    if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    if (platform === 'copy') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      onShare({ id, platform: 'copy', url: window.location.href });
      setShareOpen(false);
      return;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'noopener');
    onShare({ id, platform, url: shareUrl || window.location.href });
    setShareOpen(false);
  };

  return (
    <div className="postfeed-card">
      <div className="post-header-info">
        <div className="post-author">
          <div className="author-avatar">{getInitials(BarangayName || author)}</div>
          <div className="author-details">
            <span className="author-name">{BarangayName ? `${BarangayName} Admin` : author}</span>
            <span className="author-role">
              {timestamp}
            </span>
          </div>
        </div>
        <div className="post-header-right">
          {category && (
            <span
              className="category-tag"
              style={{ backgroundColor: getCategoryColor(category) }}
            >
              {category}
            </span>
          )}
          <button className="options-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="post-content-text">{content}</div>

      {image && (
        <div className="post-image">
          <img src={image} alt="Post" />
        </div>
      )}

      <div className="post-interactions">
        <button 
          className={`interaction-btn ${liked ? 'liked' : ''}`} 
          onClick={toggleLike}
          disabled={submittingReaction}
        >
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {submittingReaction ? '...' : likes}
        </button>
        <button className="interaction-btn" onClick={openComment}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {commentsCount}
        </button>
        <button className="interaction-btn" onClick={() => setShareOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {sharesCount}
        </button>
      </div>

      {showCommentBox && (
        <form className="comment-box" onSubmit={submitComment}>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            disabled={submittingComment}
          />
          <button type="submit" disabled={submittingComment}>
            {submittingComment ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {shareOpen && (
        <div className="share-modal" role="dialog" aria-modal="true" onClick={() => setShareOpen(false)}>
          <div className="share-content" onClick={(e) => e.stopPropagation()}>
            <h4>Share post</h4>
            <div className="share-options">
              <button onClick={() => doShare('facebook')}>Facebook</button>
              <button onClick={() => doShare('twitter')}>Twitter</button>
              <button onClick={() => doShare('linkedin')}>LinkedIn</button>
              <button onClick={() => doShare('copy')}>Copy Link</button>
            </div>
            <button className="close" onClick={() => setShareOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
