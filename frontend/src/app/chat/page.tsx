import { AppLayout } from "@/components/layout/AppLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata = { title: "Chat — MedGuard AI" };

export default function ChatPage() {
  return (
    <AppLayout title="Chat">
      <ChatWindow />
    </AppLayout>
  );
}
