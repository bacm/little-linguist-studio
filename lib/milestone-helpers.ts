import { supabase } from '../integrations/supabase/client';

/**
 * Updates vocabulary milestones based on the current word count for a child
 */
export async function updateVocabularyMilestones(childId: string, userId: string): Promise<void> {
  try {
    // Get total word count for this child
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id')
      .eq('child_id', childId)
      .eq('user_id', userId);

    if (wordsError) throw wordsError;

    const wordCount = words?.length || 0;

    // Get all vocabulary milestones for this child
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .eq('milestone_type', 'vocabulary');

    if (milestonesError) throw milestonesError;

    if (!milestones || milestones.length === 0) return;

    // Update each milestone's current value and achievement status
    const updates = milestones.map(async (milestone) => {
      const isAchieved = wordCount >= milestone.target_value;
      const wasAchieved = milestone.achieved;

      // Only update if something changed
      if (milestone.current_value !== wordCount || wasAchieved !== isAchieved) {
        const updateData: any = {
          current_value: wordCount,
        };

        // If newly achieved, set achieved flag and date
        if (isAchieved && !wasAchieved) {
          updateData.achieved = true;
          updateData.achieved_date = new Date().toISOString();
        }
        // If no longer achieved (word was deleted), unmark
        else if (!isAchieved && wasAchieved) {
          updateData.achieved = false;
          updateData.achieved_date = null;
        }

        const { error } = await supabase
          .from('milestones')
          .update(updateData)
          .eq('id', milestone.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating milestone:', milestone.title, error);
        } else {
          console.log(`✅ Updated milestone "${milestone.title}": ${wordCount}/${milestone.target_value}`);
          if (isAchieved && !wasAchieved) {
            console.log(`🎉 Milestone achieved: ${milestone.title}!`);
          }
        }
      }
    });

    await Promise.all(updates);
  } catch (error) {
    console.error('Error updating vocabulary milestones:', error);
    throw error;
  }
}

/**
 * Gets the next unachieved milestone for display
 */
export async function getNextMilestone(childId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .eq('achieved', false)
      .order('target_value', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    return data;
  } catch (error) {
    console.error('Error getting next milestone:', error);
    return null;
  }
}

/**
 * Returns a congratulations message when a milestone is achieved
 */
export function getMilestoneAchievedMessage(milestoneTitle: string): string {
  const messages: { [key: string]: string } = {
    'First Word': '🎉 Amazing! Your child just said their first word!',
    '10 Words': '🌟 Wow! 10 words already! Your little one is growing fast!',
    '50 Words': '🚀 Incredible! 50 words is a huge milestone!',
    '100 Words': '🏆 Outstanding! 100 words - your child is becoming a great communicator!',
  };

  return messages[milestoneTitle] || `🎊 Congratulations! Milestone achieved: ${milestoneTitle}`;
}
