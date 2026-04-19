import React from "react";
import { customerChats, vendorThread } from "../../public/data";

function SellerInbox() {
	const activeChat = customerChats[0];

	return (
		<div className="flex-1 p-4 md:p-6 bg-gray-50">
			<div className="h-[85vh] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
				<div className="h-full grid grid-cols-1 lg:grid-cols-3">
					<aside className="border-r border-gray-200 lg:col-span-1">
						<div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
							<h2 className="text-lg font-semibold text-gray-800">Customer Inbox</h2>
							<p className="text-sm text-gray-500">Vendor support conversations</p>
						</div>

						<div className="overflow-y-auto h-[calc(85vh-73px)]">
							{customerChats.map((chat, index) => (
								<button
									key={chat.id}
									type="button"
									className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
										index === 0 ? "bg-primary/5" : ""
									}`}
								>
									<div className="flex gap-3 items-start">
										<img
											src={chat.avatar}
											alt={chat.customer}
											className="w-10 h-10 rounded-full object-cover"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<p className="font-medium text-gray-800 truncate">{chat.customer}</p>
												<span className="text-xs text-gray-400">{chat.time}</span>
											</div>
											<p className="text-xs text-primary font-medium">Order #{chat.orderNo}</p>
											<p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
										</div>
										{chat.unread > 0 && (
											<span className="mt-1 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
												{chat.unread}
											</span>
										)}
									</div>
								</button>
							))}
						</div>
					</aside>

					<section className="lg:col-span-2 flex flex-col">
						<div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
							<div className="flex items-center gap-3">
								<img
									src={activeChat.avatar}
									alt={activeChat.customer}
									className="w-10 h-10 rounded-full object-cover"
								/>
								<div>
									<h3 className="font-semibold text-gray-800">{activeChat.customer}</h3>
									<p className="text-xs text-gray-500">Order #{activeChat.orderNo}</p>
								</div>
							</div>
							<span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
								Active
							</span>
						</div>

						<div className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-white overflow-y-auto">
							{vendorThread.map((message) => (
								<div
									key={message.id}
									className={`mb-3 flex ${
										message.from === "seller" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
											message.from === "seller"
												? "bg-primary text-white rounded-br-md"
												: "bg-white border border-gray-100 text-gray-700 rounded-bl-md"
										}`}
									>
										<p className="text-sm">{message.text}</p>
										<p
											className={`text-[11px] mt-1 ${
												message.from === "seller" ? "text-white/90" : "text-gray-400"
											}`}
										>
											{message.time}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="p-3 border-t border-gray-200 bg-white">
							<div className="flex items-center gap-2">
								<input
									type="text"
									value="Your request has been updated."
									readOnly
									className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm bg-gray-50 text-gray-600"
								/>
								<button
									type="button"
									className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium"
								>
									Send
								</button>
							</div>
							<p className="text-[11px] text-gray-400 mt-2">Static demo vendor chat panel</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default SellerInbox;
