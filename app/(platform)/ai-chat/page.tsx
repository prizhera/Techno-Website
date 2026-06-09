"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiBaseUrl } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I have access to your TRACE analytics data. Ask me about weak topics, student mistakes, or teaching strategies." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);
  const contextRef = useRef<Record<string, unknown> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadContext() {
      try {
        const [analyticsRes, classesRes, assessmentsRes] = await Promise.all([
          fetch(`${getApiBaseUrl()}/api/analytics`).then((r) => r.json()).catch(() => ({ data: null })),
          fetch(`${getApiBaseUrl()}/api/classes`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`${getApiBaseUrl()}/api/assessments`).then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        const analyticsData = analyticsRes?.data ?? null;
        const classes = Array.isArray(classesRes?.data) ? classesRes.data : [];
        const assessments = Array.isArray(assessmentsRes?.data) ? assessmentsRes.data : [];

        const labelCounts = analyticsData?.labelCounts ?? [];
        const mistakeCounts = analyticsData?.questionMistakeCounts ?? [];
        const topTopics = [...mistakeCounts]
          .sort((a: any, b: any) => (b.incorrect_count ?? 0) - (a.incorrect_count ?? 0))
          .slice(0, 5)
          .map((q: any) => ({ topic: q.topic, incorrect_count: q.incorrect_count }));
        const topLabels = [...labelCounts]
          .sort((a: any, b: any) => (b.count ?? 0) - (a.count ?? 0))
          .slice(0, 5);

        contextRef.current = {
          total_classes: classes.length,
          total_assessments: assessments.length,
          class_names: classes.map((c: any) => c.class_name),
          weak_topics: topTopics,
          common_mistakes: topLabels,
        };
        setContextLoaded(true);
      } catch {
        // context stays null — AI works generically
      }
    }
    loadContext();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: contextRef.current,
        }),
      });
      const data = await res.json();
      if (data.response && !data.response.startsWith("Unable to get")) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "The AI service didn't return a response. Check that your API key is set and working." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the AI service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-600" />
            AI Teaching Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] flex-col rounded-xl border border-slate-200 bg-white">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100">
                      <Bot className="h-4 w-4 text-sky-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100">
                    <Bot className="h-4 w-4 text-sky-600" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a student, topic, or strategy..."
                disabled={loading}
              />
              <Button type="submit" size="sm" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
