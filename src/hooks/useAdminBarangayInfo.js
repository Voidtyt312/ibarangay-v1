import { useState, useEffect } from 'react';

function useAdminBarangayInfo() {
  const [barangayInfo, setBarangayInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarangayInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const barangayId = localStorage.getItem('barangayId');
        
        if (!barangayId) {
          setBarangayInfo(null);
          return;
        }

        const barangayResponse = await fetch('/api/barangays');
        if (!barangayResponse.ok) return;

        const barangays = await barangayResponse.json();
        const barangay = barangays.find((b) => b.BarangayID === barangayId);
        
        if (barangay) {
          setBarangayInfo({
            barangayId: barangay.BarangayID,
            barangay: barangay.BarangayName,
            municipality: barangay.Municipality,
            province: barangay.Province,
          });
        }
      } catch (err) {
        console.error('Failed to fetch admin barangay info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBarangayInfo();
  }, []);

  return { barangayInfo, loading, error };
}

export default useAdminBarangayInfo;
