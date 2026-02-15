'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  DollarSign,
  User,
  FileText,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  woreda: string;
  payment: {
    amount: number;
    currency: string;
    method: string;
    status: string;
    receipt?: {
      filename: string;
      originalName: string;
      path: string;
      mimetype: string;
    };
    transactionId?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    notes?: string;
  };
  membership: {
    status: string;
    type?: string;
  };
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await adminApi.getPayments(status);
      setPayments(data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      console.log('Admin verify payment:', { userId, status });
      await adminApi.verifyPayment(userId, status, verificationNotes);

      toast.success(`Payment ${status} successfully`);
      setShowModal(false);
      setSelectedPayment(null);
      setVerificationNotes('');
      fetchPayments();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
    }
  };

  const viewReceipt = (payment: PaymentUser) => {
    if (!payment.payment.receipt) {
      toast.error('No receipt available');
      return;
    }

    let filename = payment.payment.receipt.filename;
    if (!filename) {
      const receiptPath = payment.payment.receipt.path || '';
      if (receiptPath.includes('receipts')) {
        const parts = receiptPath.split('receipts');
        filename = parts[parts.length - 1].replace(/^[\\/]/, '');
      } else {
        filename = receiptPath.split(/[\\/]/).pop() || receiptPath;
      }
    }
    if (!filename) {
      toast.error('Receipt filename not found');
      return;
    }
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const receiptUrl = `${API_BASE.replace(/\/api\/?$/, '')}/api/receipts/${encodeURIComponent(filename)}`;
    window.open(receiptUrl, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.name.toLowerCase().includes(search) ||
        payment.email.toLowerCase().includes(search) ||
        payment.phone.includes(search) ||
        payment.payment.transactionId?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and verify payment receipts from users
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                            <div className="text-sm text-gray-500">{payment.email}</div>
                            <div className="text-xs text-gray-400">{payment.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{formatCurrency(payment.payment.amount)}</div>
                          <div className="text-gray-500 capitalize">{payment.payment.method || 'N/A'}</div>
                          {payment.payment.transactionId && (
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {payment.payment.transactionId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment.status)}`}>
                          {payment.payment.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {payment.membership.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {payment.payment.receipt && (
                            <button
                              onClick={() => viewReceipt(payment)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Receipt"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          {payment.payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Verify Payment"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setVerificationNotes('Payment rejected');
                                  handleVerify(payment._id, 'rejected');
                                }}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject Payment"
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

      {/* Verification Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify Payment</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                User: <span className="font-medium">{selectedPayment.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Amount: <span className="font-medium">{formatCurrency(selectedPayment.payment.amount)}</span>
              </p>
              {selectedPayment.payment.receipt && (
                <button
                  onClick={() => viewReceipt(selectedPayment)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  View Receipt
                </button>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes (Optional)
              </label>
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
                onClick={() => handleVerify(selectedPayment._id, 'verified')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Verify Payment
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                  setVerificationNotes('');
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

