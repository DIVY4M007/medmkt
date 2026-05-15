'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSpreadsheet, Info, ShoppingCart } from 'lucide-react';

export default function CartUploadPage() {
  const { navigate } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        onClick={() => navigate('cart')}
        className="text-[#4A675B] hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        data-testid="back-link"
      >
        <ArrowLeft className="size-4" /> Cart
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-md bg-[#F4F1EA] flex items-center justify-center">
          <FileSpreadsheet className="size-5 text-[#4A675B]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
            Generate cart from Excel
          </h1>
          <p className="text-sm text-[#5C635F]">
            Upload a spreadsheet to bulk-add items
          </p>
        </div>
      </div>

      {/* Info message */}
      <div className="bg-[#F4F1EA] border border-[#D5CEBD] rounded-md p-5 flex gap-3">
        <Info className="size-5 text-[#4A675B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[#1F2321] font-medium mb-1">
            Bulk upload feature coming soon
          </p>
          <p className="text-sm text-[#5C635F]">
            For now, add items individually from the marketplace. The Excel upload
            feature is under development and will be available in a future update.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-6">
        <Button
          onClick={() => navigate('marketplace')}
          className="bg-[#4A675B] hover:bg-[#3D564C] text-white gap-1.5"
          data-testid="browse-marketplace-btn"
        >
          <ShoppingCart className="size-4" />
          Browse marketplace
        </Button>
      </div>
    </div>
  );
}
