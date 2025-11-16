import { useState, useEffect } from 'react';
import { useOrganization, useUpdateOrganization } from '../../hooks/useOrganization';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Building2, Save } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminOrganizationPage = () => {
  const { data: organization, isLoading } = useOrganization();
  const updateOrganization = useUpdateOrganization();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setLogoUrl(organization.logoUrl || '');
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateOrganization.mutateAsync({
        name,
        logoUrl: logoUrl || null,
      });
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update organization',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    if (organization) {
      setName(organization.name);
      setLogoUrl(organization.logoUrl || '');
    }
  };

  const hasChanges =
    organization &&
    (name !== organization.name || logoUrl !== (organization.logoUrl || ''));

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">Manage your organization details</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">Failed to load organization details</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details</p>
      </div>

      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>
            Update your organization name and logo. These will be displayed throughout the
            application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aizu"
                required
              />
              <p className="text-xs text-muted-foreground">
                This name will appear in the sidebar and throughout the app
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                URL to your organization's logo image (optional)
              </p>
            </div>

            {logoUrl && (
              <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={logoUrl}
                    alt="Organization logo"
                    className="h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updateOrganization.isPending || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateOrganization.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
              <p className="text-sm font-mono mt-1">{organization.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm mt-1">
                {new Date(organization.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm mt-1">
                {new Date(organization.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrganizationPage;

