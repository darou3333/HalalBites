import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader, Trash2 } from 'lucide-react';
import { Report } from '@/types';
import { reportService, recipeService } from '@/services/api';

interface ReportManagementProps {
  onRefresh?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  dismissed: 'bg-gray-100 text-gray-800',
  action_taken: 'bg-red-100 text-red-800',
};

export default function ReportManagement({ onRefresh }: ReportManagementProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError('');
      const statusFilter = filterStatus === 'all' ? '' : filterStatus;
      const data = await reportService.getAll(statusFilter || undefined);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipe = async (reportId: number, recipeId: number) => {
    setProcessingId(reportId);
    try {
      // Delete the recipe (this cascades and deletes the report too)
      await recipeService.delete(recipeId);
      
      // Remove from the list immediately (don't wait for refetch)
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      onRefresh?.();
    } catch (err) {
      console.error('Remove recipe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove recipe');
      setProcessingId(null);
    }
  };

  const handleDismissReport = async (reportId: number) => {
    setProcessingId(reportId);
    try {
      // Delete the report
      await reportService.delete(reportId);
      
      // Remove from the list immediately
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      onRefresh?.();
    } catch (err) {
      console.error('Dismiss error:', err);
      setError(err instanceof Error ? err.message : 'Failed to dismiss report');
      setProcessingId(null);
    }
  };

  const filteredReports = filterStatus === 'all' || !filterStatus
    ? reports
    : reports.filter(r => r.status === filterStatus);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Management</CardTitle>
          <CardDescription>View and manage recipe reports</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Report Management
          </CardTitle>
          <CardDescription>
            Total: {reports.length} | Pending: {reports.filter(r => r.status === 'pending').length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="action_taken">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-neutral-500">
            No reports found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Report Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          Report #{report.id}
                        </h3>
                        <Badge className={STATUS_COLORS[report.status]}>
                          {report.status === 'action_taken' ? 'Removed' : report.status === 'dismissed' ? 'Dismissed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        Recipe: <span className="font-medium">{report.recipe_title}</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Reported by {report.reporter_username} on{' '}
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium">Reason</p>
                      <p className="text-sm text-neutral-600">{report.reason}</p>
                    </div>

                    {report.description && (
                      <div>
                        <p className="text-sm font-medium">Details</p>
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {report.admin_notes && (
                      <div>
                        <p className="text-sm font-medium">Admin Notes</p>
                        <p className="text-sm text-neutral-600">{report.admin_notes}</p>
                      </div>
                    )}

                    {report.admin_username && (
                      <div className="text-xs text-neutral-500">
                        Handled by: {report.admin_username}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t pt-4 flex gap-2 justify-end flex-wrap">
                    <Button
                      variant="ghost"
                      onClick={() => handleDismissReport(report.id)}
                      disabled={processingId === report.id}
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                    >
                      {processingId === report.id ? (
                        <>
                          <Loader className="w-3 h-3 mr-1 animate-spin" />
                          Dismiss
                        </>
                      ) : (
                        'Dismiss'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveRecipe(report.id, report.recipe_id)}
                      disabled={processingId === report.id}
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {processingId === report.id ? (
                        <>
                          <Loader className="w-3 h-3 mr-1 animate-spin" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
