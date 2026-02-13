import React from 'react'

const PaymentMethods = () => {
  return (
    <div className='py-8 w-full max-w-4xl'>
      <div>
        <h1 className="text-2xl font-bold mb-6">Payment method</h1>
      <button className='px-4 py-2 bg-primary text-white rounded-lg'>Add Payment Method</button>
      </div>
        <div className='mt-6 space-y-4'>    
            <div className='border border-gray-200 rounded-lg p-4 flex items-center justify-between'>
                <div>
                    <img src="https://imgs.search.brave.com/4FXHu4DmRUEmmq5VaAbmPaAIn9PRDla-8cYTohgJ6as/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9icmFu/ZGxvZ29zLm5ldC93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxMy8w/Ni92aXNhLWluYy12/ZWN0b3ItbG9nby5w/bmc" alt="Visa" className='w-12 h-8 object-contain' />
                    <p className='font-medium text-gray-900'>Visa **** 1234</p>
                    <p className='text-sm text-gray-500'>Expires 12/26</p>
                </div>
                <button className='text-red-600 hover:text-red-800'>Remove</button>
            </div>
            <div className='border border-gray-200 rounded-lg p-4 flex items-center justify-between'>
                <div>
                    <img src="https://imgs.search.brave.com/1-dQWMOA-NZ4HyYdf33LrQwjmntj1I4FsOZ5Pexi6_g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZnJlZXBuZ2xvZ29z/LmNvbS91cGxvYWRz/L21hc3RlcmNhcmQt/cG5nL21hc3RlcmNh/cmQtbWFyY3VzLXNh/bXVlbHNzb24tZ3Jv/dXAtMi5wbmc" alt="Mastercard" className='w-12 h-8 object-contain' />
                    <p className='font-medium text-gray-900'>Mastercard **** 5678</p>
                    <p className='text-sm text-gray-500'>Expires 08/27</p>
                </div>
                <button className='text-red-600 hover:text-red-800'>Remove</button>
            </div>
        </div>
    </div>
  )
}

export default PaymentMethods
