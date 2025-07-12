import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Search, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string;
  vote_count: number;
  view_count: number;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
  };
  question_tags: {
    tags: {
      name: string;
    };
  }[];
  answers: { id: string }[];
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (username, display_name),
          question_tags (
            tags (name)
          ),
          answers (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions((data as any) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to your questions or help others by sharing your knowledge
          </p>
        </div>
        
        {user && (
          <Link to="/ask">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ask Question
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No questions found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
              </p>
              {user && !searchTerm && (
                <Link to="/ask">
                  <Button>Ask the First Question</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link 
                      to={`/questions/${question.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      {question.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>by <Link to={`/user/${question.profiles?.username}`} className="hover:text-primary">{question.profiles?.display_name || question.profiles?.username}</Link></span>
                      <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 min-w-[60px]">
                    <div className="flex items-center gap-1 text-sm">
                      <ChevronUp className="h-4 w-4" />
                      <span>{question.vote_count}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">votes</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {question.question_tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.tags.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{question.answers?.length || 0} answers</span>
                    <span>{question.view_count} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}