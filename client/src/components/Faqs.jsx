import React from "react";
import { faqs } from "../public/data";

const Faqs = () => {
  const [openId, setOpenId] = React.useState(null);

  const toggle = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">FAQs</h1>
        <div className="space-y-3">
          {faqs.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-4"
              >
                <span className="font-medium text-gray-800">{item.question}</span>
                <span className="text-xl text-gray-500">
                  {openId === item.id ? "−" : "+"}
                </span>
              </button>
              {openId === item.id && (
                <div className="px-4 pb-4 text-sm text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faqs;
