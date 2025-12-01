import { supabase } from '../integrations/supabase/client';

export const testDatabaseSetup = async () => {
  const results = {
    tablesExist: false,
    hasCategories: false,
    authWorking: false,
    errors: [] as string[],
  };

  try {
    console.log('🔍 Testing database setup...');

    // Test 1: Check if word_categories table exists and has data
    try {
      const { data: categories, error: catError } = await supabase
        .from('word_categories')
        .select('*')
        .limit(5);

      if (catError) {
        console.error('Categories table error:', catError);
        results.errors.push(`Categories: ${catError.message}`);
      } else {
        results.tablesExist = true;
        results.hasCategories = (categories?.length || 0) > 0;
        console.log('✅ Categories table:', categories);
      }
    } catch (error) {
      results.errors.push(`Categories fetch failed: ${error}`);
    }

    // Test 2: Check if children table exists
    try {
      const { data: children, error: childError } = await supabase
        .from('children')
        .select('*')
        .limit(1);

      if (childError) {
        console.error('Children table error:', childError);
        results.errors.push(`Children: ${childError.message}`);
      } else {
        console.log('✅ Children table accessible');
      }
    } catch (error) {
      results.errors.push(`Children fetch failed: ${error}`);
    }

    // Test 3: Check auth functionality
    try {
      const { data: session, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        results.errors.push(`Auth: ${authError.message}`);
      } else {
        results.authWorking = true;
        console.log('✅ Auth working, session:', session);
      }
    } catch (error) {
      results.errors.push(`Auth failed: ${error}`);
    }

  } catch (error) {
    console.error('❌ Database setup test failed:', error);
    results.errors.push(`General error: ${error}`);
  }

  return results;
};

export const setupDefaultCategories = async () => {
  try {
    console.log('🔧 Setting up default categories...');

    const defaultCategories = [
      { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#FF6B6B' },
      { name: 'Food', icon: '🍎', color: '#4ECDC4' },
      { name: 'Toys', icon: '🧸', color: '#45B7D1' },
      { name: 'Actions', icon: '🏃', color: '#96CEB4' },
      { name: 'Animals', icon: '🐶', color: '#FFEAA7' },
      { name: 'Body Parts', icon: '👂', color: '#A29BFE' },
      { name: 'Colors', icon: '🌈', color: '#FD79A8' },
      { name: 'Numbers', icon: '🔢', color: '#FDCB6E' },
    ];

    const { data, error } = await supabase
      .from('word_categories')
      .upsert(defaultCategories, { onConflict: 'name' })
      .select();

    if (error) {
      console.error('❌ Failed to setup categories:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Default categories setup:', data);
    return { success: true, categories: data };

  } catch (error) {
    console.error('❌ Category setup error:', error);
    return { success: false, error: `${error}` };
  }
};