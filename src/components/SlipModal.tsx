'use client';

import React from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface SlipModalProps {
  imageUrl: string | null;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  onClose: () => void;
}

export default function SlipModal({
  imageUrl,
  orderNumber,
  customerName,
  totalAmount,
  onClose,
}: SlipModalProps) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">หลักฐานการโอนเงิน (สลิป)</h3>
            {orderNumber && (
              <p className="text-xs text-gray-500">
                ออเดอร์: <span className="font-medium text-rose-600">{orderNumber}</span> • {customerName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Image View */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[300px]">
          <img
            src={imageUrl}
            alt="หลักฐานการโอนเงิน"
            className="max-h-[65vh] w-auto rounded-lg shadow-md object-contain border border-gray-200"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <div>
            {totalAmount !== undefined && (
              <span className="text-xs text-gray-500">
                ยอดที่ต้องชำระ:{' '}
                <strong className="text-sm font-bold text-rose-600">
                  ฿{totalAmount.toLocaleString()}
                </strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              เปิดรูปเต็ม
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
