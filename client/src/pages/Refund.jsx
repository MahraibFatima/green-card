import React from 'react'
import { dummyRefunds } from '../assets/assets'
import { MdVerified } from 'react-icons/md'
import { PiWarningCircle } from 'react-icons/pi'
import { AiOutlineClockCircle } from 'react-icons/ai'

const Refund = () => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Refunded':
        return <MdVerified className="w-5 h-5 text-green-600" />
      case 'Processing':
        return <AiOutlineClockCircle className="w-5 h-5 text-yellow-600" />
      case 'Rejected':
        return <PiWarningCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Refunded':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-6">Refunds</h2>
      
      {dummyRefunds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <PiWarningCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">No refunds yet</p>
          <p className="text-gray-500 text-sm mt-1">You haven't made any refund requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dummyRefunds.map((refund) => (
            <div key={refund._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Refund Header */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Refund ID</p>
                  <p className="font-medium text-gray-900">{refund._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">{refund.orderId.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Refund Amount</p>
                  <p className="font-bold text-lg text-primary">${refund.amount}</p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(refund.status)}`}>
                    {getStatusIcon(refund.status)}
                    {refund.status}
                  </span>
                </div>
              </div>

              {/* Refund Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Reason for Refund</p>
                  <p className="text-gray-900 font-medium">{refund.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dates</p>
                  <p className="text-sm text-gray-900">
                    Requested: {new Date(refund.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}<br />
                    Updated: {new Date(refund.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Refund Status Info */}
              {refund.status === 'Refunded' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✓ Your refund of <span className="font-bold">${refund.amount}</span> has been successfully processed to your original payment method
                    </p>
                  </div>
                </div>
              )}
              {refund.status === 'Processing' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⏱ Your refund is being processed. You should receive it within 5-7 business days
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Refund
