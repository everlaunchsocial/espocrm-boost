import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, CreditCard, Link, Copy, ExternalLink } from 'lucide-react';
import { useCurrentAffiliate } from '@/hooks/useCurrentAffiliate';
import { getReplicatedUrl } from '@/utils/subdomainRouting';
import { toast } from 'sonner';

export default function AffiliateSettings() {
  const { affiliate } = useCurrentAffiliate();
  const replicatedUrl = affiliate?.username ? getReplicatedUrl(affiliate.username) : null;

  const copyReplicatedUrl = () => {
    if (replicatedUrl) {
      navigator.clipboard.writeText(replicatedUrl);
      toast.success('Replicated URL copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Replicated Website URL Card */}
        {replicatedUrl && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Your Replicated Website
              </CardTitle>
              <CardDescription>Share this link with prospects - it's your personal branded site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={replicatedUrl} 
                  readOnly 
                  className="font-mono text-sm bg-background"
                />
                <Button variant="outline" size="icon" onClick={copyReplicatedUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={replicatedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Username: <span className="font-medium text-foreground">{affiliate?.username}</span>
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">Receive emails for new leads and conversions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Demo engagement alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when prospects interact with demos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Commission alerts</p>
                <p className="text-sm text-muted-foreground">Receive notifications for new commissions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly summary</p>
                <p className="text-sm text-muted-foreground">Get a weekly digest of your performance</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payout Settings
            </CardTitle>
            <CardDescription>Configure how you receive your commissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Payout method coming soon</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Connect your preferred payment method to receive commission payouts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
