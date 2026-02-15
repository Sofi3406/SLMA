'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Search, CheckCircle, XCircle, Eye, Clock, DollarSign } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface DonationItem {
  _id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'verified' | 'failed' | 'refunded' | 'rejected';
  donor: {
    fullName: string;
    email: string;
    phone: string;
  };
  receipt?: {
    filename?: string;
    originalName?: string;
    path?: string;
    mimetype?: string;
  };
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  useEffect(() => {
    fetchDonations();
  }, [filterStatus]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === 'all' ? undefined : (filterStatus === 'pending' ? 'paid' : filterStatus);
      const res = await api.get('/donations', { params: { status: statusParam, limit: 100 } });
      setDonations(res.data?.donations || []);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const getReceiptUrl = (donation: DonationItem) => {
    if (!donation.receipt?.filename) return null;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${baseUrl}/uploads/donation-receipts/${donation.receipt.filename}`;
  };

  const viewReceipt = (donation: DonationItem) => {
    const url = getReceiptUrl(donation);
    if (!url) {
      toast.error('Receipt not available');
      return;
    }
    window.open(url, '_blank');
  };

  const handleVerify = async (donationId: string, status: 'verified' | 'rejected') => {
    try {
      await api.put(`/donations/${donationId}/verify`, {
        status,
        referenceNumber: referenceNumber || undefined,
        verificationNotes: verificationNotes || undefined
      });
      toast.success(`Donation ${status} successfully`);
      setShowModal(false);
      setSelectedDonation(null);
      setVerificationNotes('');
      setReferenceNumber('');
      fetchDonations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify donation');
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      donation.transactionId?.toLowerCase().includes(search) ||
      donation.donor.fullName.toLowerCase().includes(search) ||
      donation.donor.email.toLowerCase().includes(search) ||
      donation.donor.phone.includes(search)
    );
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'paid':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation Verification</h1>
              <p className="mt-1 text-sm text-gray-600">Review and verify donation payment receipts</p>
            </div>
            <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Back to Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading donations...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No donations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{donation.donor.fullName}</div>
                        <div className="text-sm text-gray-500">{donation.donor.email}</div>
                        <div className="text-xs text-gray-400">{donation.donor.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">ETB {donation.amount}</div>
                          <div className="text-gray-500 capitalize">{donation.paymentMethod}</div>
                          <div className="text-xs text-gray-400 mt-1">ID: {donation.transactionId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge(donation.paymentStatus)}`}>
                          {donation.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {donation.receipt?.filename && (
                            <button
                              onClick={() => viewReceipt(donation)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Receipt"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          {donation.paymentStatus === 'paid' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedDonation(donation);
                                  setShowModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Verify Donation"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDonation(donation);
                                  setVerificationNotes('Donation rejected');
                                  handleVerify(donation._id, 'rejected');
                                }}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject Donation"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify Donation</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Donor: <span className="font-medium">{selectedDonation.donor.fullName}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Amount: <span className="font-medium">ETB {selectedDonation.amount}</span>
              </p>
              {selectedDonation.receipt?.filename && (
                <button
                  onClick={() => viewReceipt(selectedDonation)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  View Receipt
                </button>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number (Optional)</label>
              <input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Bank/TeleBirr reference"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Notes (Optional)</label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Add any notes about this verification..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleVerify(selectedDonation._id, 'verified')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Verify Donation
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDonation(null);
                  setVerificationNotes('');
                  setReferenceNumber('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
