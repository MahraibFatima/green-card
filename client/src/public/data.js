export const faqs = [
	{
		id: "order-tracking",
		question: "How can I track my order?",
		answer:
			"After placing an order, go to My Orders to view its current status and tracking details. You will also receive email updates when the order ships.",
	},
	{
		id: "delivery-time",
		question: "How long does delivery take?",
		answer:
			"Standard delivery usually takes 3–5 business days. Delivery times may vary by location and product availability.",
	},
	{
		id: "return-policy",
		question: "What is your return policy?",
		answer:
			"You can return eligible items within 7 days of delivery. Items must be unused and in original packaging.",
	},
	{
		id: "cancel-order",
		question: "Can I cancel my order?",
		answer:
			"Yes, you can cancel an order before it is shipped. Go to My Orders and choose Cancel for the order you want to stop.",
	},
	{
		id: "payment-methods",
		question: "Which payment methods are accepted?",
		answer:
			"We accept major credit/debit cards, UPI, net banking, and cash on delivery where available.",
	},
	{
		id: "account-security",
		question: "How do I keep my account secure?",
		answer:
			"Use a strong password, avoid sharing your login details, and sign out from shared devices.",
	},
];

export const customerChats = [
	{
		id: 1,
		customer: "Aisha Khan",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
		orderNo: "GC-3912",
		lastMessage: "Please add one extra kilo if available.",
		time: "10:20 AM",
		unread: 1,
	},
	{
		id: 2,
		customer: "Rahul Sharma",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
		orderNo: "GC-3874",
		lastMessage: "Thanks, delivered on time.",
		time: "Yesterday",
		unread: 0,
	},
	{
		id: 3,
		customer: "Nora Ali",
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
		orderNo: "GC-3821",
		lastMessage: "Can I reschedule for evening?",
		time: "Sat",
		unread: 3,
	},
];


export const vendorThread = [
	{
		id: 1,
		from: "customer",
		text: "Thank you. Can you confirm if mangoes are ripe?",
		time: "10:15 AM",
	},
	{
		id: 2,
		from: "seller",
		text: "Yes, this batch is ripe and fresh. Great for direct use.",
		time: "10:17 AM",
	},
	{
		id: 3,
		from: "customer",
		text: "Perfect. Please add one extra kilo if available.",
		time: "10:20 AM",
	},
	{
		id: 4,
		from: "seller",
		text: "Added successfully. Updated total is shown in your order.",
		time: "10:21 AM",
	},
];

export const userConversations = [
	{
		id: 1,
		vendor: "Green Mart",
		avatar:
			"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80",
		lastMessage: "Your order is packed and ready for dispatch.",
		time: "10:22 AM",
		unread: 2,
	},
	{
		id: 2,
		vendor: "Fresh Basket",
		avatar:
			"https://images.unsplash.com/photo-1518164147695-36c13dd568f2?auto=format&fit=crop&w=80&q=80",
		lastMessage: "We added your missing item refund.",
		time: "Yesterday",
		unread: 0,
	},
	{
		id: 3,
		vendor: "Organic Hub",
		avatar:
			"https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=80&q=80",
		lastMessage: "Can you confirm delivery slot for tomorrow?",
		time: "Sun",
		unread: 1,
	},
];

export const thread = [
	{
		id: 1,
		from: "vendor",
		text: "Hi Aisha, thanks for your order #GC-3912.",
		time: "10:12 AM",
	},
	{
		id: 2,
		from: "user",
		text: "Thank you. Can you confirm if mangoes are ripe?",
		time: "10:15 AM",
	},
	{
		id: 3,
		from: "vendor",
		text: "Yes, this batch is ready to eat in 1-2 days.",
		time: "10:17 AM",
	},
	{
		id: 4,
		from: "user",
		text: "Perfect. Please add one extra kilo if available.",
		time: "10:20 AM",
	},
	{
		id: 5,
		from: "vendor",
		text: "Done. Your order is packed and ready for dispatch.",
		time: "10:22 AM",
	},
];