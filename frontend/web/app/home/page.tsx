"use client";

import { useState } from "react";
import { VerumSidebar, type VerumView } from "../../components/VerumSidebar";
import { VerumChat } from "./components/VerumChat";
import { HistoryView } from "./views/HistoryView";
import UserButton from "../../components/UserButton";

export default function HomePage() {
  const [activeView, setActiveView] = useState<VerumView>("home");
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [chatEntryId, setChatEntryId] = useState<string | null>(null);
  /** Bumps when user chooses Home so VerumChat remounts and clears an in-progress conversation */
  const [chatShellKey, setChatShellKey] = useState(0);

  const handleNavHome = () => {
    setChatEntryId(null);
    setChatShellKey((k) => k + 1);
    setActiveView("home");
  };
  const handleNavHistory = () => {
    setScrollToId(null);
    setChatEntryId(null);
    setActiveView("history");
  };

  const handleOpenChat = (id: string) => {
    setChatEntryId(id);
    setActiveView("home");
  };

  return (
    <>
      <VerumSidebar
        activeView={activeView}
        onNavHome={handleNavHome}
        onNavHistory={handleNavHistory}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="absolute right-4 top-4 z-50 md:right-3 md:top-3">
          <UserButton />
        </div>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {activeView === "home" && (
            <VerumChat
              key={chatShellKey}
              onOpenChat={handleOpenChat}
              loadedEntryId={chatEntryId}
              onLoadedEntryCleared={() => setChatEntryId(null)}
            />
          )}
          {activeView === "history" && (
            <HistoryView
              scrollToId={scrollToId}
              onScrollToHandled={() => setScrollToId(null)}
              onOpenChat={handleOpenChat}
            />
          )}
        </main>
      </div>
    </>
  );
}
