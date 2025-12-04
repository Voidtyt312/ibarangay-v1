import React, { useState, useEffect } from 'react';
import '../css/PostFeed.css';

export default function PostFeed({
  post = {},
  onLike = () => {},
  onComment = () => {},
  onShare = () => {},
  onDelete = () => {},
}) {
  const {
    id,
    author = 'Unknown',
    role = '',
    category = '',
    content = '',
    title = '',
    timestamp = 'Just now',
    likes: initialLikes = 0,
    comments: initialComments = 0,
    shares: initialShares = 0,
    image = null,
    BarangayName = '',
    OfficialID = '',
  } = post;

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReaction, setSubmittingReaction] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    caption: content,
    category: category,
    image: null,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

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

  const handleOpenEdit = () => {
    setEditData({
      title: post.title || '',
      caption: content,
      category: category,
      image: null,
    });
    setShowEditModal(true);
    setOptionsOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      compressImage(files[0], (compressedFile) => {
        setEditData((prev) => ({ ...prev, image: compressedFile }));
      });
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const arr = compressedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const compressedBlob = new Blob([u8arr], { type: mime });
        const compressedFile = new File([compressedBlob], file.name, { type: mime });
        callback(compressedFile);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editData.caption.trim()) {
      alert('Message is required');
      return;
    }

    try {
      setSubmittingEdit(true);
      const formDataToSend = new FormData();
      formDataToSend.append('Title', editData.title);
      formDataToSend.append('Content', editData.caption);
      formDataToSend.append('Category', editData.category);
      
      if (editData.image) {
        formDataToSend.append('Image', editData.image);
      }

      const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to update post');
      
      setShowEditModal(false);
      onDelete({ id, updated: true });
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeletePost = async () => {
     if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
       return;
     }

     try {
       setDeleting(true);
       const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
         method: 'DELETE',
       });

       if (!response.ok) throw new Error('Failed to delete post');
       
       setOptionsOpen(false);
       onDelete({ id });
     } catch (error) {
       console.error('Error deleting post:', error);
       alert('Failed to delete post. Please try again.');
     } finally {
       setDeleting(false);
     }
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
          <div className="options-menu-container">
            <button className="options-btn" onClick={() => setOptionsOpen(!optionsOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {optionsOpen && userId === OfficialID && (
              <div className="options-dropdown">
                <button
                  className="edit-option"
                  onClick={handleOpenEdit}
                  disabled={submittingEdit}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Post
                </button>
                <button
                  className="delete-option"
                  onClick={handleDeletePost}
                  disabled={deleting}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  {deleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
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
        <div className="share-modal" role="dialog" aria-modal="true">
          <div className="share-content">
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

      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h2>Edit Post</h2>
              <button
                className="edit-modal-close"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="edit-modal-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  placeholder="Give your post a title"
                  maxLength="100"
                />
              </div>

              <div className="form-group category-select-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                >
                  <option value="announcement">Announcement</option>
                  <option value="news">News</option>
                  <option value="emergency">Emergency</option>
                  <option value="weather">Weather</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-caption">Message</label>
                <textarea
                  id="edit-caption"
                  name="caption"
                  value={editData.caption}
                  onChange={handleEditChange}
                  placeholder="What would you like to share with your barangay?"
                  rows="6"
                  maxLength="2000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Update Image (Optional)</label>
                <div className="file-input-wrapper-edit">
                  <input
                    id="edit-image"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                  {editData.image ? (
                    <div className="file-preview">
                      <img src={URL.createObjectURL(editData.image)} alt="Preview" />
                      <div className="file-info">
                        <p className="file-name">{editData.image.name}</p>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setEditData({ ...editData, image: null })}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="file-input-label-edit">
                      📷 Click to upload new image (optional)
                    </div>
                  )}
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
