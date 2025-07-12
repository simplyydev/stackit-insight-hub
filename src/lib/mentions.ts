import { supabase } from '@/integrations/supabase/client';

export async function extractMentions(content: string): Promise<string[]> {
  // Extract @username mentions from HTML content
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

export async function createMentionNotifications(
  content: string,
  fromUserId: string,
  questionId: string,
  answerId?: string,
  type: 'question' | 'answer' = 'answer'
) {
  try {
    const mentionedUsernames = await extractMentions(content);
    
    if (mentionedUsernames.length === 0) return;

    // Get user IDs for mentioned usernames
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentionedUsernames);

    if (!profiles || profiles.length === 0) return;

    // Create notifications for each mentioned user
    const notifications = profiles.map(profile => ({
      user_id: profile.id,
      from_user_id: fromUserId,
      question_id: questionId,
      answer_id: answerId,
      type: 'mention' as const,
      title: 'You were mentioned',
      message: `@${profile.username} you were mentioned in ${type === 'question' ? 'a question' : 'an answer'}`,
      is_read: false,
    }));

    await supabase
      .from('notifications')
      .insert(notifications);

  } catch (error) {
    console.error('Error creating mention notifications:', error);
  }
}