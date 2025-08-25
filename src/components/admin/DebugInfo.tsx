import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

const DebugInfo: React.FC = () => {
  const { user, profile, loading } = useAuthContext();
  const [debugData, setDebugData] = useState<any>({});

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Test profile query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user?.id);

        // Test leads query
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*');

        // Test direct profile query
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*');

        setDebugData({
          user: user,
          profile: profile,
          profileData,
          profileError,
          leadsData,
          leadsError,
          allProfiles,
          allProfilesError,
          loading
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugData({ error: error.message });
      }
    };

    if (user) {
      fetchDebugData();
    }
  }, [user, profile]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Debug Information</h3>
      <pre className="text-xs overflow-auto max-h-96 bg-white dark:bg-gray-900 p-4 rounded">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo;