import React from 'react'
import { dummyTrackingSteps, dummyOrders } from '../assets/assets'
import { IoCheckmarkDone } from 'react-icons/io5'
import { MdLocalShipping } from 'react-icons/md'

const Tracking = () => {
  const currentOrder = dummyOrders[0]

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>

      {/* Order Info */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-semibold text-gray-900">{currentOrder._id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
            <p className="font-semibold text-gray-900">
              {new Date(new Date(currentOrder.createdAt).getTime() + 7*24*60*60*1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h3 className="text-lg font-bold mb-8">Delivery Status</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-12 bottom-0 w-1 bg-gray-200" />
          
          <div className="space-y-8">
            {dummyTrackingSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-6 relative z-10">
                {/* Step Circle */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : index === dummyTrackingSteps.findIndex(s => !s.completed)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <IoCheckmarkDone className="w-6 h-6" />
                  ) : index === dummyTrackingSteps.findIndex(s => !s.completed) ? (
                    <MdLocalShipping className="w-6 h-6" />
                  ) : null}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <h4 className={`font-semibold text-lg ${step.completed ? 'text-green-600' : 'text-gray-700'}`}>
                    {step.label}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.completed 
                      ? `${step.label} on ${new Date().toLocaleDateString()}`
                      : 'Pending'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
        <p className="text-gray-700 leading-relaxed">
          {currentOrder.address.street}<br />
          {currentOrder.address.city}, {currentOrder.address.state} {currentOrder.address.zipCode}<br />
          {currentOrder.address.country}
        </p>
      </div>
    </div>
  )
}

export default Tracking
