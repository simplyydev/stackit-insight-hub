import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  role: string;
}

interface UserQuestion {
  id: string;
  title: string;
  vote_count: number;
  created_at: string;
  answers: { id: string }[];
}

interface UserAnswer {
  id: string;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  questions: {
    id: string;
    title: string;
  };
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get user's questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          vote_count,
          created_at,
          answers (id)
        `)
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      setQuestions((questionsData as any) || []);

      // Get user's answers
      const { data: answersData } = await supabase
        .from('answers')
        .select(`
          id,
          content,
          vote_count,
          is_accepted,
          created_at,
          questions (id, title)
        `)
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      setAnswers((answersData as any) || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link to="/questions">
            <Button>Back to Questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes = questions.reduce((sum, q) => sum + q.vote_count, 0) + 
                    answers.reduce((sum, a) => sum + a.vote_count, 0);
  const acceptedAnswers = answers.filter(a => a.is_accepted).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Questions
      </Link>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {profile.display_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground mb-2">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{totalVotes} total votes</span>
                </div>
                {acceptedAnswers > 0 && (
                  <Badge variant="secondary">
                    {acceptedAnswers} accepted answer{acceptedAnswers !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'questions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('questions')}
          >
            Questions ({questions.length})
          </Button>
          <Button
            variant={activeTab === 'answers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('answers')}
          >
            Answers ({answers.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'questions' ? (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No questions posted yet</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-semibold">{question.vote_count}</div>
                      <div className="text-xs text-muted-foreground">votes</div>
                    </div>
                    
                    <div className="flex-1">
                      <Link 
                        to={`/questions/${question.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {question.title}
                      </Link>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
                        <span>{question.answers.length} answers</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {answers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No answers posted yet</p>
              </CardContent>
            </Card>
          ) : (
            answers.map((answer) => (
              <Card key={answer.id} className={`hover:shadow-md transition-shadow ${answer.is_accepted ? 'border-green-500' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-semibold">{answer.vote_count}</div>
                      <div className="text-xs text-muted-foreground">votes</div>
                      {answer.is_accepted && (
                        <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                          ✓
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Link 
                        to={`/questions/${answer.questions.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {answer.questions.title}
                      </Link>
                      
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-3"
                           dangerouslySetInnerHTML={{ __html: answer.content.substring(0, 200) + '...' }} />
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(answer.created_at))} ago</span>
                        {answer.is_accepted && <span className="text-green-600">Accepted</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}