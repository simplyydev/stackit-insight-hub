import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronUp, ChevronDown, Check, ArrowLeft, MessageSquare } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { createMentionNotifications } from '@/lib/mentions';
import { getUserRank, calculateUserScore } from '@/lib/ranking';

interface Question {
  id: string;
  title: string;
  content: string;
  vote_count: number;
  view_count: number;
  created_at: string;
  author_id: string;
  accepted_answer_id?: string;
  profiles: {
    username: string;
    display_name: string;
    bio?: string;
  };
  question_tags: {
    tags: {
      name: string;
    };
  }[];
}

interface Answer {
  id: string;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    bio?: string;
  };
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
      if (user) {
        fetchUserVotes();
      }
    }
  }, [id, user]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (username, display_name, bio),
          question_tags (
            tags (name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setQuestion(data as Question);

      // Increment view count
      await supabase
        .from('questions')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:author_id (username, display_name, bio)
        `)
        .eq('question_id', id)
        .order('is_accepted', { ascending: false })
        .order('vote_count', { ascending: false });

      if (error) throw error;
      setAnswers(data as Answer[] || []);
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('question_id, answer_id, vote_type')
        .eq('user_id', user!.id);

      if (error) throw error;
      
      const votes: Record<string, 'up' | 'down'> = {};
      data?.forEach(vote => {
        const key = vote.question_id || vote.answer_id;
        if (key) votes[key] = vote.vote_type as 'up' | 'down';
      });
      
      setUserVotes(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (targetId: string, voteType: 'up' | 'down', isQuestion: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentVote = userVotes[targetId];
      
      if (currentVote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq(isQuestion ? 'question_id' : 'answer_id', targetId);
        
        setUserVotes(prev => {
          const updated = { ...prev };
          delete updated[targetId];
          return updated;
        });
      } else {
        // Add or update vote
        await supabase
          .from('votes')
          .upsert({
            user_id: user.id,
            [isQuestion ? 'question_id' : 'answer_id']: targetId,
            vote_type: voteType,
          });
        
        setUserVotes(prev => ({ ...prev, [targetId]: voteType }));
      }

      // For questions, if upvoted, also increment view count
      if (isQuestion && voteType === 'up') {
        const currentQuestion = question;
        if (currentQuestion) {
          await supabase
            .from('questions')
            .update({ 
              view_count: (currentQuestion.view_count || 0) + 1 
            })
            .eq('id', targetId);
        }
      }

      // Refresh data
      if (isQuestion) {
        fetchQuestion();
      } else {
        fetchAnswers();
      }
    } catch (error: any) {
      toast({
        title: "Error voting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || question.author_id !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the question author can accept answers",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update question with accepted answer
      await supabase
        .from('questions')
        .update({ accepted_answer_id: answerId })
        .eq('id', question.id);

      // Update answer as accepted
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      // Mark other answers as not accepted
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', question.id)
        .neq('id', answerId);

      toast({
        title: "Answer accepted",
        description: "The answer has been marked as accepted",
      });

      fetchQuestion();
      fetchAnswers();
    } catch (error: any) {
      toast({
        title: "Error accepting answer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post an answer",
        variant: "destructive",
      });
      return;
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          content: newAnswer.trim(),
          question_id: id!,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create mention notifications
      await createMentionNotifications(newAnswer, user.id, id!, answer.id, 'answer');

      toast({
        title: "Answer posted!",
        description: "Your answer has been posted successfully",
      });

      setNewAnswer('');
      fetchAnswers();
    } catch (error: any) {
      toast({
        title: "Error posting answer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading question...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Question not found</h1>
          <Link to="/questions">
            <Button>Back to Questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link to="/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Questions
      </Link>

      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(question.id, 'up', true)}
                className={userVotes[question.id] === 'up' ? 'text-primary' : ''}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className="font-semibold">{question.vote_count}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(question.id, 'down', true)}
                className={userVotes[question.id] === 'down' ? 'text-destructive' : ''}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3">{question.title}</h1>
              <div className="prose prose-sm max-w-none mb-4" 
                   dangerouslySetInnerHTML={{ __html: question.content }} />
              
              <div className="flex flex-wrap gap-2 mb-4">
                {question.question_tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.tags.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>asked by <Link to={`/user/${question.profiles?.username}`} className="hover:text-primary">{question.profiles?.display_name || question.profiles?.username}</Link></span>
                <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
                <span>{question.view_count} views</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        
        {answers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No answers yet</h3>
              <p className="text-muted-foreground text-center">
                Be the first to answer this question!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <Card key={answer.id} className={answer.is_accepted ? 'border-green-500' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.id, 'up', false)}
                        className={userVotes[answer.id] === 'up' ? 'text-primary' : ''}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="font-semibold">{answer.vote_count}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.id, 'down', false)}
                        className={userVotes[answer.id] === 'down' ? 'text-destructive' : ''}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                      
                      {user && question.author_id === user.id && !answer.is_accepted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Accept this answer"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                      )}
                      
                      {answer.is_accepted && (
                        <div className="text-green-600" title="Accepted answer">
                          <Check className="h-5 w-5 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none mb-4" 
                           dangerouslySetInnerHTML={{ __html: answer.content }} />
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>answered by <Link to={`/user/${answer.profiles?.username}`} className="hover:text-primary">{answer.profiles?.display_name || answer.profiles?.username}</Link></span>
                        <span>{formatDistanceToNow(new Date(answer.created_at))} ago</span>
                        {answer.is_accepted && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      {user ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                content={newAnswer}
                onChange={setNewAnswer}
                placeholder="Share your knowledge and help the community..."
              />
              
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Your Answer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Sign in to post an answer and help the community
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}