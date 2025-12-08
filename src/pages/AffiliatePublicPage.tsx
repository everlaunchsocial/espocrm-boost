import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAffiliateContext } from '@/hooks/useAffiliateContext';
import { storeAffiliateAttribution } from '@/utils/affiliateAttribution';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Presentation, Phone, Mail, UserCheck } from 'lucide-react';

export default function AffiliatePublicPage() {
  const { username } = useParams<{ username: string }>();
  const { affiliate, isLoading, notFound, error } = useAffiliateContext(username);

  // Store affiliate attribution in session when page loads
  useEffect(() => {
    if (affiliate?.id) {
      storeAffiliateAttribution(affiliate.id);
    }
  }, [affiliate?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // 404 - Affiliate not found
  if (notFound || !affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Representative Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              We couldn't find a representative with the username "{username}".
              Please check the URL and try again.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/sales'}>
              Visit Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Something Went Wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affiliate found - show placeholder page
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-semibold">EverLaunch AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Rep: <span className="font-medium text-foreground">{affiliate.username}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Welcome to EverLaunch AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your AI-powered business assistant is just a demo away.
            <br />
            Representative: <span className="font-semibold text-primary">{affiliate.username}</span>
          </p>

          {/* Placeholder Cards */}
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Presentation className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Request Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  See AI in action on your business website
                </p>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Schedule Call</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Book a call with your representative
                </p>
                <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Contact Rep</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get in touch with questions
                </p>
                <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </div>

          {/* Development Notice */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                <strong>This is a replicated affiliate page.</strong>
                <br />
                Product sales page, demo request form, and contact features coming in Phase B3-B4.
                <br />
                <span className="text-xs">Affiliate ID: {affiliate.id}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EverLaunch AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
