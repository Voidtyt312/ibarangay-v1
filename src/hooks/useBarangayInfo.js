import { useState, useEffect } from 'react';

function useBarangayInfo(userId) {
  const [barangayInfo, setBarangayInfo] = useState(null);
  const [barangayLoading, setBarangayLoading] = useState(true);
  const [barangayError, setBarangayError] = useState(null);

  useEffect(() => {
    const fetchBarangayInfo = async () => {
      try {
        setBarangayLoading(true);
        setBarangayError(null);

        if (!userId) {
          setBarangayInfo(null);
          return;
        }

        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) return;

        const user = await userResponse.json();
        const barangayId = user.BarangayID;

        if (barangayId) {
          const barangayResponse = await fetch('/api/barangays');
          if (barangayResponse.ok) {
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
          }
        }
      } catch (err) {
        console.error('Failed to fetch barangay info:', err);
        setBarangayError(err.message);
      } finally {
        setBarangayLoading(false);
      }
    };

    fetchBarangayInfo();
  }, [userId]);

  return { barangayInfo, barangayLoading, barangayError };
}

export default useBarangayInfo;
