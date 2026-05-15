'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSpreadsheet, Info, ShoppingCart } from 'lucide-react';

export default function CartUploadPage() {
  const { navigate } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Back link */}
      <button
        onClick={() => navigate('cart')}
        className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        data-testid="back-link"
      >
        <ArrowLeft className="size-4" /> Cart
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <FileSpreadsheet className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Generate cart from Excel
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a spreadsheet to bulk-add items
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-secondary border border-border rounded-xl p-5 flex gap-3">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            Bulk upload feature coming soon
          </p>
          <p className="text-sm text-muted-foreground">
            For now, add items individually from the marketplace. The Excel upload
            feature is under development and will be available in a future update.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-6">
        <Button
          onClick={() => navigate('marketplace')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-press gap-1.5"
          data-testid="browse-marketplace-btn"
        >
          <ShoppingCart className="size-4" />
          Browse marketplace
        </Button>
      </div>
    </div>
  );
}
