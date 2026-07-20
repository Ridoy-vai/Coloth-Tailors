"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send message. Please try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Get in Touch</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          Have a question about an order, sizing, or anything else? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Email</p>
              <p className="text-sm text-gray-500 mt-0.5">support@shopifystore.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Phone</p>
              <p className="text-sm text-gray-500 mt-0.5">+880 1XXX-XXXXXX</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Address</p>
              <p className="text-sm text-gray-500 mt-0.5">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          {success ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
              <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-600">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Message sent!</h2>
              <p className="text-sm text-gray-500 mt-2">
                Thanks for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-5 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
              >
                <Send size={15} />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}