"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Button } from "@/components/ui/Button";
import {
  Sparkles,
  Send,
  Trash2,
  BookOpen,
  Calendar,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Bot,
  User,
} from "lucide-react";

interface ChatItem {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export default function AiAssistantPage() {
  const { t, isRtl, user } = useApp();
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/ai");
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Default initial greeting message
          setMessages([
            {
              role: "assistant",
              content: t("aiGreeting"),
            },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, category: string = "general") => {
    const prompt = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatItem = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.assistantMessage.content },
        ]);
        if (data.suggestedFollowUps) {
          setSuggestedFollowUps(data.suggestedFollowUps);
        }
      }
    } catch (e) {
      console.error("AI chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "عذراً، حدث خطأ مؤقت أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("هل تريد مسح سجل المحادثة؟")) return;
    try {
      await fetch("/api/ai", { method: "DELETE" });
      setMessages([
        {
          role: "assistant",
          content: t("aiGreeting"),
        },
      ]);
      setSuggestedFollowUps([]);
    } catch (e) {
      console.error(e);
    }
  };

  const quickPrompts = [
    {
      title: t("promptStudyPlan"),
      query: "صمم لي خطة مذاكرة للأسبوع القادم للتحضير للاختبارات ورفع معدلي التراكمي",
      category: "study_plan",
      icon: Calendar,
    },
    {
      title: t("promptSummarize"),
      query: "لخص لي أهم المفاهيم المحورية والفروقات الشائعة في اختبارات هياكل البيانات وهندسة البرمجيات",
      category: "summary",
      icon: BookOpen,
    },
    {
      title: t("promptQuiz"),
      query: "اختبرني بـ 3 أسئلة تدريبية سريعة مع شرح الإجابة النموذجية",
      category: "quiz",
      icon: CheckCircle,
    },
    {
      title: t("promptExplain"),
      query: "اشرح لي خوارزميات البحث الذكي A* Search وكيفية حساب التعقيد الزمني بأسلوب مبسط",
      category: "general",
      icon: Lightbulb,
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-130px)] max-w-5xl mx-auto animate-fade-in">
        {/* AI Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t("aiTitle")}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Online
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("aiSubtitle")}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            icon={<Trash2 className="w-4 h-4 text-slate-400" />}
          >
            {t("clearChat")}
          </Button>
        </div>

        {/* Quick Prompts Carousel / Pills */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(item.query, item.category)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:shadow-xs transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isUser
                      ? "bg-brand-600 text-white"
                      : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-brand-600 text-white shadow-xs rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-100" />
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-200" />
                  <span className="ms-2">{t("thinkingAi")}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-ups (if any) */}
        {suggestedFollowUps.length > 0 && !isLoading && (
          <div className="pt-2 pb-1 flex items-center gap-2 overflow-x-auto shrink-0">
            {suggestedFollowUps.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip)}
                className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 hover:bg-brand-100 transition-colors whitespace-nowrap"
              >
                💡 {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Form Bar */}
        <div className="pt-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("askAnything")}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-xs"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-11 px-5 rounded-2xl font-bold shadow-md"
              icon={<Send className="w-4 h-4" />}
            >
              {t("send")}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
