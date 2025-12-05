import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, Copy, ExternalLink, Eye, MessageSquare, Phone, Loader2, CheckCircle, Image } from 'lucide-react';
import { useDemos, Demo, DemoStatus } from '@/hooks/useDemos';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<DemoStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  viewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  engaged: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function DemoDetail() {
  const { id } = useParams<{ id: string }>();
  const { getDemoById, sendDemoEmail } = useDemos();
  
  const [demo, setDemo] = useState<Demo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Send email form state
  const [toEmail, setToEmail] = useState('');
  const [toName, setToName] = useState('');
  const [fromName, setFromName] = useState('');
  const [sending, setSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadDemo();
    }
  }, [id]);

  const loadDemo = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    const result = await getDemoById(id);
    
    if (result.error) {
      setError(result.error);
    } else {
      setDemo(result.data);
    }
    
    setLoading(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!demo || !toEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setSending(true);
    
    const result = await sendDemoEmail(demo.id, toEmail.trim(), {
      toName: toName.trim() || undefined,
      fromName: fromName.trim() || undefined,
      baseUrl: window.location.origin,
    });
    
    setSending(false);
    
    if (result.error) {
      toast({
        title: 'Failed to send email',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Demo email sent!',
        description: `Email sent to ${toEmail}`,
      });
      // Refresh demo data to show updated status
      loadDemo();
      // Clear form
      setToEmail('');
      setToName('');
      setFromName('');
    }
  };

  const handleCopyLink = async () => {
    if (!demo) return;
    
    const demoUrl = `${window.location.origin}/demo/${demo.id}`;
    
    try {
      await navigator.clipboard.writeText(demoUrl);
      setLinkCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Demo link copied to clipboard.',
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/demos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Demo Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{error || 'The requested demo could not be found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const demoUrl = `${window.location.origin}/demo/${demo.id}`;
  const alreadySent = demo.status !== 'draft';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/demos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{demo.business_name}</h1>
          <p className="text-muted-foreground mt-1">Demo Details</p>
        </div>
        <Badge className={statusColors[demo.status]}>
          {demo.status.charAt(0).toUpperCase() + demo.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Demo Info */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Information</CardTitle>
            <CardDescription>Details about this personalized demo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Business Name</Label>
              <p className="font-medium">{demo.business_name}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground text-sm">Website URL</Label>
              {demo.website_url ? (
                <a 
                  href={demo.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {demo.website_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-muted-foreground">Not set</p>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Voice Provider</Label>
              <p className="font-medium capitalize">{demo.voice_provider}</p>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Created</Label>
              <p>{new Date(demo.created_at).toLocaleDateString()}</p>
            </div>

            {demo.email_sent_at && (
              <div>
                <Label className="text-muted-foreground text-sm">Email Sent</Label>
                <p>{new Date(demo.email_sent_at).toLocaleString()}</p>
              </div>
            )}

            <Separator />

            {/* Metrics */}
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">Engagement Metrics</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{demo.view_count}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{demo.chat_interaction_count}</p>
                    <p className="text-xs text-muted-foreground">Chats</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{demo.voice_interaction_count}</p>
                    <p className="text-xs text-muted-foreground">Calls</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Website Screenshot Preview */}
            <Separator />
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">Website Preview</Label>
              {demo.screenshot_url ? (
                <a
                  href={demo.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={demo.screenshot_url}
                    alt={`Homepage preview for ${demo.business_name}`}
                    className="rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-full h-auto"
                  />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Screenshot not available for this demo.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Actions</CardTitle>
            <CardDescription>Send the demo or copy the link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Copy Link Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Demo Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={demoUrl} 
                  readOnly 
                  className="bg-muted text-sm"
                />
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Send Email Form */}
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Send Demo Email</Label>
                {alreadySent && (
                  <p className="text-xs text-muted-foreground">
                    This demo has already been sent; you can resend if needed.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toEmail" className="text-sm">
                  To Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="toEmail"
                  type="email"
                  placeholder="prospect@example.com"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toName" className="text-sm">
                  To Name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="toName"
                  type="text"
                  placeholder="John Smith"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName" className="text-sm">
                  From Name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="fromName"
                  type="text"
                  placeholder="Jane from EverLaunch"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={sending || !toEmail.trim()}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Demo Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
