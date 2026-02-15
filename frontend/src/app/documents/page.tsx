'use client';

import React, { useEffect, useState } from 'react';
import { FileText, IdCard } from 'lucide-react';
import { authService } from '@/services/authService';
import api from '@/services/api';

type DocumentInfo = {
  label: string;
  description: string;
  filename?: string;
  filePath?: string;
  folder: 'registration' | 'receipts' | 'donation-receipts';
  status: 'uploaded' | 'missing';
  uploadedAt?: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  useEffect(() => {
    const load = async () => {
      let user = authService.getCurrentUser() as any;

      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          user = res.data.user;
        }
      } catch (error) {
        // Fallback to local storage if /auth/me fails
      }

      const nationalId = user?.nationalId;
      const receipt = user?.payment?.receipt;

      const docs: DocumentInfo[] = [
        {
          label: 'National ID / Identification Document',
          description: 'Uploaded during registration for identity verification.',
          filename: nationalId?.originalName || nationalId?.filename,
          filePath: nationalId?.path,
          folder: 'registration',
          status: nationalId ? 'uploaded' : 'missing'
        },
        {
          label: 'Payment Receipt',
          description: 'Uploaded during registration for membership payment.',
          filename: receipt?.originalName || receipt?.filename,
          filePath: receipt?.path,
          folder: 'receipts',
          status: receipt ? 'uploaded' : 'missing'
        }
      ];

      try {
        const donationRes = await api.get('/donations/my');
        const donationDocs = (donationRes.data?.donations || [])
          .filter((donation: any) => donation?.receipt?.uploaded)
          .map((donation: any) => ({
            label: `Donation Receipt (${donation.transactionId})`,
            description: `Donation to ${donation.project || 'General Fund'} • ETB ${donation.amount}`,
            filename: donation.receipt?.originalName || donation.receipt?.filename,
            filePath: donation.receipt?.path,
            folder: 'donation-receipts' as const,
            status: 'uploaded' as const,
            uploadedAt: donation.receipt?.uploadedAt || donation.createdAt
          }));

        docs.push(...donationDocs);
      } catch (error) {
        // Ignore donation load errors to keep registration docs visible
      }

      setDocuments(docs);
    };

    load();
  }, []);

  const getFileName = (value?: string) => {
    if (!value) return undefined;
    const parts = value.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  const getDownloadUrl = (doc: DocumentInfo) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const base = API_BASE.replace(/\/api\/?$/, '');
    const file = getFileName(doc.filePath) || getFileName(doc.filename);
    if (!file) return undefined;
    return `${base}/uploads/${doc.folder}/${encodeURIComponent(file)}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString();
  };

  const registrationDocs = documents.filter(doc => doc.folder !== 'donation-receipts');
  const donationDocs = documents.filter(doc => doc.folder === 'donation-receipts');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-600">Placeholders for files submitted during registration.</p>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Registration Documents</h2>
                <span className="text-sm text-gray-500">{registrationDocs.length} files</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrationDocs.map((doc) => (
                  <div key={doc.label} className="border rounded-lg p-5 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center">
                        <IdCard className="w-4 h-4 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doc.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        <div className="mt-3 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'uploaded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {doc.status === 'uploaded' ? 'Uploaded' : 'Missing'}
                          </span>
                          <div className="mt-2 text-gray-500">
                            {doc.filename ? `File: ${doc.filename}` : 'No file on record.'}
                          </div>
                          {doc.uploadedAt && (
                            <div className="mt-1 text-xs text-gray-500">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </div>
                          )}
                          {doc.status === 'uploaded' && getDownloadUrl(doc) && (
                            <a
                              href={getDownloadUrl(doc)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Donation Receipts</h2>
                <span className="text-sm text-gray-500">{donationDocs.length} files</span>
              </div>
              {donationDocs.length === 0 ? (
                <div className="border border-dashed rounded-lg p-6 text-sm text-gray-500 bg-gray-50">
                  No donation receipts uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {donationDocs.map((doc) => (
                    <div key={doc.label} className="border rounded-lg p-5 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center">
                          <IdCard className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{doc.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          <div className="mt-3 text-sm">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Uploaded
                            </span>
                            <div className="mt-2 text-gray-500">
                              {doc.filename ? `File: ${doc.filename}` : 'No file on record.'}
                            </div>
                            {doc.uploadedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                Uploaded: {formatDate(doc.uploadedAt)}
                              </div>
                            )}
                            {getDownloadUrl(doc) && (
                              <a
                                href={getDownloadUrl(doc)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
