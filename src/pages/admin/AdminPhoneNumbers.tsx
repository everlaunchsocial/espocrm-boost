import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Phone, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhoneRecord {
  id: string;
  customerId: string;
  phoneNumber: string;
  vapiPhoneId: string | null;
  vapiAssistantId: string | null;
  status: string;
  createdAt: string;
  customerName?: string;
}

export default function AdminPhoneNumbers() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const { data: phoneNumbers, isLoading, refetch } = useQuery<PhoneRecord[]>({
    queryKey: ['/api/admin/phone-numbers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/phone-numbers');
      if (!res.ok) throw new Error('Failed to fetch phone numbers');
      return res.json();
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await fetch('/api/release-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to release phone');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Phone Released",
        description: `Successfully released ${data.releasedNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/phone-numbers'] });
      setReleasingId(null);
    },
    onError: (error) => {
      toast({
        title: "Release Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setReleasingId(null);
    },
  });

  if (roleLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Access Denied</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          You must be an admin to access this page.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Phone className="h-8 w-8" />
            Phone Numbers
          </h1>
          <p className="text-muted-foreground">Manage provisioned Vapi phone numbers</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading}
          data-testid="button-refresh-phones"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provisioned Numbers</CardTitle>
          <CardDescription>
            Release phone numbers to free up your Vapi account capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !phoneNumbers || phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No phone numbers provisioned yet
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((phone) => (
                <div 
                  key={phone.id} 
                  className="flex items-center justify-between gap-4 p-4 border rounded-md flex-wrap"
                  data-testid={`phone-row-${phone.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-lg" data-testid={`text-phone-${phone.id}`}>
                      {phone.phoneNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {phone.customerId.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={phone.status === 'active' ? 'default' : 'secondary'}>
                      {phone.status}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={releaseMutation.isPending}
                          data-testid={`button-release-${phone.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Release
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Release Phone Number?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the phone number {phone.phoneNumber} from Vapi and remove the associated AI assistant. The customer will need to provision a new number.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setReleasingId(phone.customerId);
                              releaseMutation.mutate(phone.customerId);
                            }}
                            data-testid={`button-confirm-release-${phone.id}`}
                          >
                            {releaseMutation.isPending && releasingId === phone.customerId 
                              ? 'Releasing...' 
                              : 'Yes, Release'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
