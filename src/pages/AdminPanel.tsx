import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Database, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { createSampleData } from '@/lib/sampleData';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Link to="/questions">
            <Button>Back to Questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateSampleData = async () => {
    setLoading(true);
    try {
      await createSampleData();
      toast({
        title: "Sample data created!",
        description: "15 sample questions with answers have been added to the database.",
      });
    } catch (error) {
      toast({
        title: "Error creating sample data",
        description: "Something went wrong. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Questions
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your StackIt platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sample Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Populate the database with 15 sample questions and multiple answers to demonstrate the platform.
              </p>
              <Button 
                onClick={handleCreateSampleData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Sample Data'}
              </Button>
            </CardContent>
          </Card>

          {/* User Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage user accounts, roles, and permissions.
              </p>
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Content Moderation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review and moderate questions, answers, and user-generated content.
              </p>
              <Button variant="outline" className="w-full">
                Moderate Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">-</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">-</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">-</div>
                <div className="text-sm text-muted-foreground">Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">-</div>
                <div className="text-sm text-muted-foreground">Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}