'use client';

import { useState } from "react";
import { VerumSidebar, type VerumView } from "./components/VerumSidebar";
import { VerumChat } from "./components/VerumChat";
import { HistoryView } from "./views/HistoryView";
import { ProfileView } from "./views/ProfileView";

export default function VerumPage() {
  const [activeView, setActiveView] = useState<VerumView>("home");
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [chatEntryId, setChatEntryId] = useState<string | null>(null);

  const handleNavHome = () => {
    setChatEntryId(null);
    setActiveView("home");
  };
  const handleNavHistory = () => {
    setScrollToId(null);
    setChatEntryId(null);
    setActiveView("history");
  };
  const handleNavProfile = () => setActiveView("profile");

  const handleNavigateToQuestion = (id: string) => {
    setScrollToId(id);
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
        onNavProfile={handleNavProfile}
      />
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {activeView === "home" && (
          <VerumChat
            onNavigateToQuestion={handleNavigateToQuestion}
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
        {activeView === "profile" && <ProfileView />}
      </main>
    </>
  );
}
