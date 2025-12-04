// Admin-specific API calls for barangay-filtered data

const API_BASE = '/api';

// Get document requests for admin's barangay
export const getDocumentRequestsByBarangay = async (barangayId) => {
  try {
    const response = await fetch(`${API_BASE}/document-requests/barangay/${barangayId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document requests');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching document requests:', error);
    throw error;
  }
};

// Get concerns for admin's barangay
export const getConcernsByBarangay = async (barangayId) => {
  try {
    const response = await fetch(`${API_BASE}/concerns/barangay/${barangayId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch concerns');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching concerns:', error);
    throw error;
  }
};

// Get posts for admin's barangay
export const getPostsByBarangay = async (barangayId) => {
  try {
    const response = await fetch(`${API_BASE}/posts/barangay/${barangayId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Update request status (admin only)
export const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await fetch(`${API_BASE}/document-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      throw new Error('Failed to update request');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Update concern status (admin only)
export const updateConcernStatus = async (concernId, status, remarks) => {
  try {
    const body = { status };
    if (remarks) {
      body.remarks = remarks;
    }
    const response = await fetch(`${API_BASE}/concerns/${concernId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error('Failed to update concern');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating concern:', error);
    throw error;
  }
};

// Get admin statistics for barangay
export const getBarangayStatistics = async (barangayId) => {
  try {
    const [requests, concerns, posts] = await Promise.all([
      getDocumentRequestsByBarangay(barangayId),
      getConcernsByBarangay(barangayId),
      getPostsByBarangay(barangayId)
    ]);

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.Status === 'pending').length,
      completedRequests: requests.filter(r => r.Status === 'completed').length,
      
      totalConcerns: concerns.length,
      newConcerns: concerns.filter(c => c.Status === 'pending').length,
      resolvedConcerns: concerns.filter(c => c.Status === 'resolved').length,
      
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.Status === 'published').length
    };
  } catch (error) {
    console.error('Error fetching barangay statistics:', error);
    throw error;
  }
};
