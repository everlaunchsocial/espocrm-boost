import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrentAffiliate {
  id: string;
  username: string;
  userId: string;
}

interface UseCurrentAffiliateResult {
  affiliate: CurrentAffiliate | null;
  isLoading: boolean;
  affiliateId: string | null;
}

/**
 * Hook to get the current logged-in user's affiliate record (if they are an affiliate)
 * Used for attributing leads/demos created within the affiliate back office
 */
export function useCurrentAffiliate(): UseCurrentAffiliateResult {
  const [affiliate, setAffiliate] = useState<CurrentAffiliate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentAffiliate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (isMounted) {
            setAffiliate(null);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('affiliates')
          .select('id, username, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (isMounted) {
          if (error || !data) {
            setAffiliate(null);
          } else {
            setAffiliate({
              id: data.id,
              username: data.username,
              userId: data.user_id,
            });
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching current affiliate:', err);
        if (isMounted) {
          setAffiliate(null);
          setIsLoading(false);
        }
      }
    };

    fetchCurrentAffiliate();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCurrentAffiliate();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    affiliate,
    isLoading,
    affiliateId: affiliate?.id ?? null,
  };
}
