import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import PostFeed from '../components/PostFeed.jsx';
import useAdminBarangayInfo from '../hooks/useAdminBarangayInfo.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SuccessMessage from '../components/SuccessMessage.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import '../css/PostAdmin.css';

// Category Icons with colors
const CategoryIcons = {
    announcement: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#a855f7">
            <path d="M12 2c-.5 0-1 .2-1.4.6l-7 7A2 2 0 0 0 3 11v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-.6-1.4l-7-7A2 2 0 0 0 12 2zm0 2.8L18.2 11H5.8L12 4.8z" />
            <path d="M12 13a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
    ),
    event: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#3b82f6">
            <path d="M19 3h-1V2a1 1 0 0 0-2 0v1H8V2a1 1 0 0 0-2 0v1H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm1 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1z" />
            <circle cx="12" cy="12" r="2" fill="#3b82f6" />
        </svg>
    ),
    news: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#10b981">
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 12H7v2h2v-2zm10 6H5v-2h14v2zm0-4H5V7h14v7z" />
        </svg>
    ),
    emergency: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#ef4444">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm3.5-9h-3v-3a1 1 0 0 0-2 0v3h-3a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2z" />
        </svg>
    ),
    weather: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#06b6d4">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45c.9-.86 1.48-2.06 1.48-3.36 0-.89-.23-1.71-.63-2.47zM6 19h8v-2H6z" />
        </svg>
    ),
};

function PostAdmin({ onLogout, onNavigate }) {
    const [activeNav, setActiveNav] = useState('post');
    const [posts, setPosts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        category: 'announcement',
        image: null,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { barangayInfo } = useAdminBarangayInfo();

    // Fetch posts from database on component mount
    useEffect(() => {
        fetchPosts();
    }, [barangayInfo?.barangayId]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const barangayId = barangayInfo?.barangayId || localStorage.getItem('barangayId');
            if (!barangayId) {
                setErrorMessage('Unable to load posts - barangay information missing');
                setLoading(false);
                return;
            }
            const response = await fetch(`http://localhost:3001/api/posts/barangay/${barangayId}`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setErrorMessage('Failed to load posts. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (itemId) => {
        setActiveNav(itemId);
        if (onNavigate) {
            const pageMap = {
                statistics: 'statistics',
                post: 'post',
                'manage-request': 'manage-request',
                'manage-concern': 'manage-concern',
                history: 'admin-history',
            };
            const page = pageMap[itemId] || itemId;
            onNavigate(page);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.title.trim() || !formData.caption.trim()) {
            setErrorMessage('Title and message are required');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage('');
            
            const barangayId = barangayInfo?.id || localStorage.getItem('barangayId');
            const officialId = localStorage.getItem('userId');
            
            if (!barangayId || !officialId) {
                setErrorMessage('Unable to create post - missing admin information. Please log in again.');
                return;
            }

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('Title', formData.title);
            formDataToSend.append('Content', formData.caption);
            formDataToSend.append('Category', formData.category);
            formDataToSend.append('BarangayID', barangayId);
            formDataToSend.append('OfficialID', officialId);
            formDataToSend.append('Status', 'published');
            
            if (formData.image) {
                formDataToSend.append('Image', formData.image);
            }

            const response = await fetch('http://localhost:3001/api/posts', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                let errorMessage = 'Failed to create post';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Response is not JSON
                }
                throw new Error(errorMessage);
            }

            const newPost = await response.json();
            // Refresh posts to ensure database data is consistent
            await fetchPosts();
            setFormData({ title: '', caption: '', category: 'announcement', image: null });
            setShowCreateModal(false);
            setSuccessMessage('Post published successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error creating post:', error);
            setErrorMessage(error.message || 'Failed to create post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            if (files && files[0]) {
                compressAndSetImage(files[0]);
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileInputClick = (e) => {
        e.preventDefault();
        document.getElementById('post-image')?.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        
        const files = e.dataTransfer?.files;
        if (files && files[0]) {
            compressAndSetImage(files[0]);
        }
    };

    const compressAndSetImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize to max 800x800
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

                // Convert to base64 JPEG with 70% quality
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                // Convert base64 to Blob for form submission
                const arr = compressedDataUrl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                const n = bstr.length;
                const u8arr = new Uint8Array(n);
                for (let i = 0; i < n; i++) {
                    u8arr[i] = bstr.charCodeAt(i);
                }
                const compressedBlob = new Blob([u8arr], { type: mime });
                
                // Create a File object with the original filename
                const compressedFile = new File([compressedBlob], file.name, { type: mime });
                setFormData((prev) => ({ ...prev, image: compressedFile }));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };


    return (
        <div className="admin-post-feed">
            <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} isAdmin={true} barangayName={barangayInfo?.barangay || 'iBarangay'} />

            <main className="post-feed-main">
                {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage('')} />}
                {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />}

                <header className="feed-header">
                    <div className="header-left">
                        <h1>
                            Barangay: <span className="highlight">{barangayInfo?.barangay || 'iBarangay'}</span>
                        </h1>
                        <p className="feed-subtitle">Stay updated with the latest news and events in your barangay</p>
                    </div>
                    <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Post
                    </button>
                </header>

                {loading ? (
                    <LoadingSpinner />
                ) : posts.length === 0 ? (
                    <EmptyState
                        icon="📰"
                        title="No Posts Yet"
                        description="Be the first to share news, announcements, or events with your barangay. Click the button above to create a post!"
                    />
                ) : (
                    <div className="posts-feed">
                        {posts.map((post) => (
                            <PostFeed
                                key={post.PostID}
                                post={{
                                    id: post.PostID,
                                    author: post.OfficialName || 'Admin',
                                    BarangayName: post.BarangayName,
                                    category: post.Category,
                                    content: post.Content,
                                    timestamp: new Date(post.CreatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }),
                                    likes: post.ReactionCount || 0,
                                    comments: post.CommentCount || 0,
                                    image: post.Image ? (typeof post.Image === 'string' && post.Image.startsWith('data:') ? post.Image : `data:image/jpeg;base64,${post.Image}`) : null,
                                }}
                                onLike={({ id, liked, likes }) => {
                                    setPosts((prev) =>
                                        prev.map((p) => (p.PostID === id ? { ...p, ReactionCount: likes } : p))
                                    );
                                }}
                                onComment={({ id, action, text }) => {
                                    if (action === 'submit') {
                                        setPosts((prev) =>
                                            prev.map((p) => (p.PostID === id ? { ...p, CommentCount: (p.CommentCount || 0) + 1 } : p))
                                        );
                                    }
                                }}
                                onShare={({ id, platform }) => {
                                    // Share functionality
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showCreateModal && (
                <div className="post-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <div>
                                <h2>Create Post</h2>
                                <p className="post-modal-subtitle">Share news, announcements, events, or emergency alerts with your community</p>
                            </div>
                            <button className="post-modal-close" onClick={() => setShowCreateModal(false)} aria-label="Close modal">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="post-modal-form">
                            <div className="form-group">
                                <label htmlFor="post-title">Title</label>
                                <input
                                    id="post-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Give your post a title"
                                    maxLength="100"
                                />
                                <span className="char-count">{formData.title.length}/100</span>
                            </div>

                            <div className="form-group category-select-group">
                                <label htmlFor="post-category">Category *</label>
                                <div className="select-with-icon">
                                    {CategoryIcons[formData.category] && (
                                        <span className="select-icon">{CategoryIcons[formData.category]}</span>
                                    )}
                                    <select
                                        id="post-category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="news">News</option>
                                        <option value="emergency">Emergency</option>
                                        <option value="weather">Weather</option>
                                        <option value="event">Event</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="post-caption">Message *</label>
                                <textarea
                                    id="post-caption"
                                    name="caption"
                                    value={formData.caption}
                                    onChange={handleChange}
                                    placeholder="What would you like to share with your barangay?"
                                    rows="6"
                                    required
                                    maxLength="2000"
                                />
                                <span className="char-count">{formData.caption.length}/2000</span>
                            </div>

                            <div className="form-group">
                                 <label htmlFor="post-image">Image (Optional)</label>
                                 <div 
                                     className="file-input-wrapper"
                                     onDragOver={handleDragOver}
                                     onDragLeave={handleDragLeave}
                                     onDrop={handleDrop}
                                 >
                                     <input
                                         id="post-image"
                                         type="file"
                                         name="image"
                                         accept="image/*"
                                         onChange={handleChange}
                                     />
                                     {formData.image ? (
                                         <div className="file-preview">
                                             <img src={URL.createObjectURL(formData.image)} alt="Preview" />
                                             <div className="file-info">
                                                 <p className="file-name">{formData.image.name}</p>
                                                 <p className="file-size">({(formData.image.size / 1024).toFixed(2)} KB)</p>
                                             </div>
                                             <button
                                                 type="button"
                                                 className="remove-file-btn"
                                                 onClick={() => setFormData({ ...formData, image: null })}
                                                 aria-label="Remove image"
                                             >
                                                 ✕
                                             </button>
                                         </div>
                                     ) : (
                                         <div 
                                             className="file-input-label"
                                             onClick={handleFileInputClick}
                                             role="button"
                                             tabIndex="0"
                                             onKeyDown={(e) => e.key === 'Enter' && handleFileInputClick(e)}
                                         >
                                             📷 Click to upload or drag image here
                                         </div>
                                     )}
                                 </div>
                             </div>

                            <div className="post-modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span style={{ marginRight: '8px' }}>⏳</span> Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <span>✓</span> Publish Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostAdmin;
