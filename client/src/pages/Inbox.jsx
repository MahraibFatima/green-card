import React from "react";
import { userConversations, thread } from "../public/data";

function Inbox() {
	const activeConversation = userConversations[0];

	return (
		<div className="w-full h-[85vh] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
			<div className="h-full grid grid-cols-1 md:grid-cols-3">
				<aside className="border-r border-gray-200 bg-gray-50/70 md:col-span-1">
					<div className="p-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-800">Inbox -- static</h2>
						<p className="text-sm text-gray-500">Chats with vendors</p>
					</div>

					<div className="overflow-y-auto h-[calc(85vh-73px)]">
						{userConversations.map((chat, index) => (
							<button
								type="button"
								key={chat.id}
								className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white transition ${
									index === 0 ? "bg-white" : ""
								}`}
							>
								<div className="flex items-start gap-3">
									<img
										src={chat.avatar}
										alt={chat.vendor}
										className="w-10 h-10 rounded-full object-cover"
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="font-medium text-gray-800 truncate">{chat.vendor}</p>
											<span className="text-xs text-gray-400">{chat.time}</span>
										</div>
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

				<section className="md:col-span-2 flex flex-col">
					<div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-white">
						<img
							src={activeConversation.avatar}
							alt={activeConversation.vendor}
							className="w-10 h-10 rounded-full object-cover"
						/>
						<div>
							<h3 className="font-semibold text-gray-800">{activeConversation.vendor}</h3>
							<p className="text-xs text-green-600">Online</p>
						</div>
					</div>

					<div className="flex-1 p-4 bg-gradient-to-b from-white to-gray-50 overflow-y-auto">
						{thread.map((message) => (
							<div
								key={message.id}
								className={`mb-3 flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
										message.from === "user"
											? "bg-primary text-white rounded-br-md"
											: "bg-white text-gray-700 rounded-bl-md border border-gray-100"
									}`}
								>
									<p className="text-sm">{message.text}</p>
									<p
										className={`text-[11px] mt-1 ${
											message.from === "user" ? "text-white/90" : "text-gray-400"
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
								value="Sure, thank you!"
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
						<p className="text-[11px] text-gray-400 mt-2">Static demo chat UI</p>
					</div>
				</section>
			</div>
		</div>
	);
}

export default Inbox;
