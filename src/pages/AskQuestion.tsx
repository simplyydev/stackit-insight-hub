import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
}

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to ask a question",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and description",
        variant: "destructive",
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: "Tags required",
        description: "Please select at least one tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Add tags
      const tagInserts = selectedTags.map(tag => ({
        question_id: question.id,
        tag_id: tag.id,
      }));

      const { error: tagsError } = await supabase
        .from('question_tags')
        .insert(tagInserts);

      if (tagsError) throw tagsError;

      toast({
        title: "Question posted!",
        description: "Your question has been posted successfully",
      });

      navigate(`/questions/${question.id}`);
    } catch (error: any) {
      toast({
        title: "Error posting question",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.find(selected => selected.id === tag.id)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ask a Question</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question? Be specific and clear."
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Provide details about your question. Include any relevant code, error messages, or examples."
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags *</Label>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} variant="default" className="flex items-center gap-1">
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag.id)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Type to search tags..."
                />
                
                {/* Tag Suggestions */}
                {tagInput && filteredTags.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-1 max-h-48 overflow-y-auto z-10">
                    {filteredTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagSelect(tag)}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Select tags that describe your question topic. You can select multiple tags.
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post Question'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/questions')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}