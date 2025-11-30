import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/api';
import { AlertCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  recipeId: number;
  recipeName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Not halal compliant',
  'Misleading information',
  'Offensive language',
  'Spam or promotion',
  'Copyright violation',
  'Other',
];

export default function ReportModal({
  isOpen,
  recipeId,
  recipeName,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!selectedReason.trim()) {
      setError('Please select a reason');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reportService.create(recipeId, {
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      // Success - reset form and close
      setSelectedReason('');
      setDescription('');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReason('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Report Recipe
          </DialogTitle>
          <DialogDescription>
            Report "{recipeName}" for review by administrators
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for report *</label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Details (optional)</label>
            <Textarea
              placeholder="Provide more details about why you're reporting this recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-neutral-500">{description.length}/500</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
