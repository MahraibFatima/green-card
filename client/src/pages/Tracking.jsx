import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { IoCheckmarkDone } from 'react-icons/io5'
import { MdLocalShipping } from 'react-icons/md'

const Tracking = () => {
  const { orderId } = useParams()
  const { axios, user, currency } = useAppContext()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrderDetails = async () => {
    if (!user?._id || !orderId) {
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get(`http://localhost:5000/api/orders/${user._id}/${orderId}`)
      if (data.success) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [user, orderId])

  const getTrackingSteps = (status) => {
    const steps = [
      { label: 'Order Placed', key: 'placed' },
      { label: 'Processing', key: 'processing' },
      { label: 'Shipped', key: 'shipped' },
      { label: 'Out for Delivery', key: 'out_for_delivery' },
      { label: 'Delivered', key: 'delivered' }
    ]

    const statusOrder = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status?.toLowerCase())

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="w-full p-6 mt-16 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full p-6 mt-16 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-xl font-medium mb-2">Order Not Found</p>
        <p className="text-gray-400">The order you're looking for doesn't exist.</p>
      </div>
    )
  }

  const trackingSteps = getTrackingSteps(order.status)

  return (
    <div className="w-full p-6 mt-16">
      <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>

      {/* Order Info */}
      <div className="bg-primary/5 rounded-lg p-6 mb-8 border border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-semibold text-gray-900">{order._id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="font-semibold text-gray-900">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
            <p className="font-semibold text-gray-900">
              {order.createdAt ? new Date(new Date(order.createdAt).getTime() + 7*24*60*60*1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
              <div className="bg-primary/10 p-3 rounded-lg">
                <img
                  src={item.product?.image?.[0] || ''}
                  alt={item.product?.name || 'Product'}
                  className="w-16 h-16 object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.product?.name}</h4>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium text-primary">
                {currency}{item.product?.offerPrice * item.quantity}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total Amount:</span>
          <span className="text-xl font-bold text-primary">{currency}{order.amount}</span>
        </div>
      </div>

      {/* Tracking Steps */}
      <div className="bg-white rounded-lg border border-gray-300 p-8 mb-8">
        <h3 className="text-lg font-bold mb-8">Delivery Status</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-12 bottom-0 w-1 bg-gray-200" />
          
          <div className="space-y-8">
            {trackingSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-6 relative z-10">
                {/* Step Circle */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                  step.completed 
                    ? 'bg-primary text-white' 
                    : index === trackingSteps.findIndex(s => !s.completed)
                    ? 'bg-primary/50 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <IoCheckmarkDone className="w-6 h-6" />
                  ) : index === trackingSteps.findIndex(s => !s.completed) ? (
                    <MdLocalShipping className="w-6 h-6" />
                  ) : null}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <h4 className={`font-semibold text-lg ${step.completed ? 'text-primary' : 'text-gray-700'}`}>
                    {step.label}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.completed 
                      ? `Completed`
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
      <div className="bg-primary/5 border border-gray-300 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
        <p className="text-gray-700 leading-relaxed">
          {order.address?.street}<br />
          {order.address?.city}, {order.address?.state} {order.address?.zipCode}<br />
          {order.address?.country}
        </p>
      </div>
    </div>
  )
}

export default Tracking
