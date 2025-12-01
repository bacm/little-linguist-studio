import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Tables } from '../integrations/supabase/types';

interface Child extends Tables<'children'> {}

interface ChildContextType {
  currentChild: Child | null;
  children: Child[];
  setCurrentChild: (child: Child | null) => void;
  loading: boolean;
  refreshChildren: () => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const useChild = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
};

export const ChildProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshChildren = async () => {
    if (!user) {
      setChildrenList([]);
      setCurrentChild(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching children:', error);
        return;
      }

      setChildrenList(data || []);
      
      if (data && data.length > 0 && !currentChild) {
        setCurrentChild(data[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshChildren();
    } else {
      setLoading(false);
    }
  }, [user]);

  const value = {
    currentChild,
    children: childrenList,
    setCurrentChild,
    loading,
    refreshChildren
  };

  return (
    <ChildContext.Provider value={value}>
      {children}
    </ChildContext.Provider>
  );
};