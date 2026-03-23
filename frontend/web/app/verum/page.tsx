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
  const handleNavProfile = () => setActiveView("profile");

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
        {activeView === "profile" && <ProfileView />}
      </main>
    </>
  );
}
