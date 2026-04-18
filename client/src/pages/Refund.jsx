import React, { useEffect, useMemo, useState } from 'react';
import { MdVerified } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';
import { AiOutlineClockCircle, AiOutlineReload } from 'react-icons/ai';
import { useAppContext } from '../context/AppContext';

const statusMetaMap = {
  Refunded: {
    label: 'Refunded',
    icon: <MdVerified className="w-5 h-5 text-green-600" />,
    containerClass: 'bg-green-100 text-green-800 border-green-200',
    noteClass: 'bg-green-50 border-green-200 text-green-800',
    note:
      'Your refund has been successfully processed to your original payment method.',
  },
  Processing: {
    label: 'Processing',
    icon: <AiOutlineClockCircle className="w-5 h-5 text-yellow-600" />,
    containerClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    noteClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    note: 'Your refund is being processed. It usually takes 5-7 business days.',
  },
  Rejected: {
    label: 'Rejected',
    icon: <PiWarningCircle className="w-5 h-5 text-red-600" />,
    containerClass: 'bg-red-100 text-red-800 border-red-200',
    noteClass: 'bg-red-50 border-red-200 text-red-800',
    note: 'Your refund request was rejected. Please contact support for details.',
  },
};

const formatDate = (value) => {
  if (!value) return 'N/A';

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const RefundCard = ({ refund }) => {
  const statusMeta = statusMetaMap[refund.status] || {
    label: refund.status || 'Unknown',
    icon: null,
    containerClass: 'bg-gray-100 text-gray-800 border-gray-200',
    noteClass: 'bg-gray-50 border-gray-200 text-gray-800',
    note: 'This refund status is not recognized yet.',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-500">Refund ID</p>
          <p className="font-medium text-gray-900">{refund._id?.slice(-8) || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-medium text-gray-900">{refund.orderId?.slice(-8) || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Refund Amount</p>
          <p className="font-bold text-lg text-primary">${refund.amount ?? 0}</p>
        </div>
        <div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${statusMeta.containerClass}`}
          >
            {statusMeta.icon}
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">Reason for Refund</p>
          <p className="text-gray-900 font-medium">{refund.reason || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Dates</p>
          <p className="text-sm text-gray-900">
            Requested: {formatDate(refund.createdAt)}<br />
            Updated: {formatDate(refund.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className={`border rounded-lg p-3 ${statusMeta.noteClass}`}>
          <p className="text-sm">{statusMeta.note}</p>
        </div>
      </div>
    </div>
  );
};

const Refund = () => {
  const { user, axios, API_URL, navigate } = useAppContext();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRefunds = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError('');

      const { data } = await axios.get(`${API_URL}/refunds/${user._id}`);
      if (data.success) {
        const sortedRefunds = [...(data.refunds || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRefunds(sortedRefunds);
      } else {
        setRefunds([]);
        setError(data.message || 'Failed to load refunds');
      }
    } catch (fetchError) {
      setRefunds([]);
      setError(
        fetchError.response?.data?.message || 'Failed to load refunds. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchRefunds();
  }, [user]);

  const emptyState = useMemo(
    () => (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <PiWarningCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-lg">No refunds yet</p>
        <p className="text-gray-500 text-sm mt-1">You haven't made any refund requests</p>
      </div>
    ),
    []
  );

  if (loading) {
    return (
      <div className="w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Refunds</h2>
        <div className="space-y-4">
          <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 className="text-2xl font-bold">Refunds</h2>
        <button
          onClick={fetchRefunds}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition"
        >
          <AiOutlineReload className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <PiWarningCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 text-lg font-medium">Unable to load refunds</p>
          <p className="text-red-600 text-sm mt-1 mb-4">{error}</p>
          <button
            onClick={fetchRefunds}
            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dull transition"
          >
            Try again
          </button>
        </div>
      ) : refunds.length === 0 ? (
        emptyState
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <RefundCard key={refund._id} refund={refund} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Refund
