import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TagWithCount {
  id: string;
  name: string;
  description?: string;
  question_count: number;
}

export default function Tags() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      // Get tags with question counts
      const { data, error } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          description,
          question_tags(count)
        `);

      if (error) throw error;

      // Transform data to include question counts
      const tagsWithCounts = data?.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        question_count: tag.question_tags?.length || 0
      })) || [];

      // Sort by question count (most used first)
      tagsWithCounts.sort((a, b) => b.question_count - a.question_count);
      setTags(tagsWithCounts);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading tags...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tags</h1>
        <p className="text-muted-foreground">
          Browse questions by topic. Click any tag to see related questions.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Popular Tags Section */}
      {!searchTerm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-3">
            {tags.slice(0, 10).map((tag) => (
              <Link
                key={tag.id}
                to={`/questions?tag=${encodeURIComponent(tag.name)}`}
                className="group"
              >
                <Badge 
                  variant="secondary" 
                  className="text-sm px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors group-hover:scale-105 transform"
                >
                  {tag.name} ({tag.question_count})
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tags found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'Try adjusting your search terms' : 'No tags available yet'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTags.map((tag) => (
            <Link
              key={tag.id}
              to={`/questions?tag=${encodeURIComponent(tag.name)}`}
              className="group"
            >
              <Card className="hover:shadow-md transition-all duration-200 group-hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {tag.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {tag.question_count} question{tag.question_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                {tag.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {tag.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="mt-12 p-6 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{tags.length}</div>
            <div className="text-sm text-muted-foreground">Total Tags</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {tags.reduce((sum, tag) => sum + tag.question_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Tagged Questions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {tags.filter(tag => tag.question_count > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Tags</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(tags.reduce((sum, tag) => sum + tag.question_count, 0) / Math.max(tags.filter(tag => tag.question_count > 0).length, 1))}
            </div>
            <div className="text-sm text-muted-foreground">Avg Questions/Tag</div>
          </div>
        </div>
      </div>
    </div>
  );
}