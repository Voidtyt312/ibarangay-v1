import { useMemo, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';
import PostFeed from '../components/PostFeed.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { getPosts } from '../services/api.js';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/HomePageUser.css';
import '../css/WeatherWidget.css';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'news', label: 'News' },
    { id: 'event', label: 'Events' },
    { id: 'weather', label: 'Weather' },
];

function HomePageUser({ onLogout, onNavigate }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeNav, setActiveNav] = useState('newsfeed');
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userBarangayId, setUserBarangayId] = useState(null);
    const [fetchRetry, setFetchRetry] = useState(0);

    const userId = localStorage.getItem('userId');
    const { barangayInfo } = useBarangayInfo(userId);

    const handleRetry = () => {
      setFetchRetry((prev) => prev + 1);
    };

    useEffect(() => {
      if (barangayInfo) {
        setUserBarangayId(barangayInfo.barangayId);
      }
    }, [barangayInfo]);

    useEffect(() => {
        const fetchFeedData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/posts/barangay/${userBarangayId}`);
                if (!response.ok) throw new Error('Failed to fetch posts');
                const posts = await response.json();

                const allPosts = (posts || [])
                    .map((post) => ({
                        id: post.PostID,
                        type: post.Category?.toLowerCase() || 'news',
                        badge: post.Category || 'News',
                        author: post.OfficialName || 'Barangay Official',
                        org: 'Barangay',
                        time: new Date(post.CreatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        title: post.Title,
                        body: post.Content,
                        image: post.Image ? (typeof post.Image === 'string' && post.Image.startsWith('data:') ? post.Image : `data:image/jpeg;base64,${post.Image}`) : null,
                        metrics: {
                            likes: post.ReactionCount || 0,
                            comments: post.CommentCount || 0,
                            shares: 0,
                        },
                    }))
                    .sort((a, b) => new Date(b.time) - new Date(a.time));

                setFeedItems(allPosts);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching feed data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userBarangayId) {
            fetchFeedData();
        }
    }, [userBarangayId, fetchRetry]);

    const filteredFeed = useMemo(() => {
        if (activeFilter === 'all') return feedItems;
        return feedItems.filter((item) => item.type === activeFilter);
    }, [activeFilter, feedItems]);

    const handleLike = (payload) => {
        console.log('Post liked:', payload)
    };

    const handleComment = (payload) => {
        console.log('Comment action:', payload)
    };

    const handleShare = (payload) => {
        console.log('Share action:', payload)
    };

    const handleNavigate = (itemId) => {
        setActiveNav(itemId);
        if (onNavigate) {
            const pageMap = {
                newsfeed: 'home',
                request: 'request',
                concern: 'concern',
                emergency: 'emergency',
                profile: 'profile',
                history: 'history',
            };
            const page = pageMap[itemId] || itemId;
            onNavigate(page);
        }
    };

    return (
        <div className="user-home">
            <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} barangayName={barangayInfo?.barangay || 'iBarangay'} />

            <main className="feed-area">
                <header className="feed-header">
                    <div className="header-content">
                        <p className="feed-eyebrow">Barangay</p>
                        <h1>{barangayInfo?.barangay || 'Loading...'}</h1>
                        <p className="feed-subtitle">Stay updated with the latest news and events in your barangay</p>
                    </div>
                    <div className="header-weather"><WeatherWidget location={barangayInfo} /></div>
                </header>

                <div className="filter-row">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            className={activeFilter === filter.id ? 'active' : ''}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="feed-list">
                    {error && (
                        <div style={{ marginBottom: '20px' }}>
                            <ErrorAlert 
                                message={`Error loading feed: ${error}`}
                                type="error"
                                onRetry={handleRetry}
                                onDismiss={() => setError(null)}
                            />
                        </div>
                    )}
                    {loading && <LoadingSpinner label="Loading posts..." />}

                    {!loading && filteredFeed.length === 0 && feedItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>No posts yet from your barangay admin</p>
                            <p style={{ fontSize: '14px', color: '#999' }}>Check back soon for updates and announcements</p>
                        </div>
                    )}

                    {!loading && filteredFeed.length === 0 && feedItems.length > 0 && (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No {activeFilter} posts available</p>
                    )}

                    {!loading &&
                        filteredFeed.map((item) => (
                            <PostFeed
                                key={item.id}
                                post={{
                                    id: item.id,
                                    author: item.author,
                                    role: item.org,
                                    category: item.badge,
                                    content: item.body,
                                    timestamp: item.time,
                                    likes: item.metrics?.likes || 0,
                                    comments: item.metrics?.comments || 0,
                                    shares: item.metrics?.shares || 0,
                                    image: item.image,
                                }}
                                onLike={handleLike}
                                onComment={handleComment}
                                onShare={handleShare}
                            />
                        ))}
                </div>
            </main>
        </div>
    );
}

export default HomePageUser;

