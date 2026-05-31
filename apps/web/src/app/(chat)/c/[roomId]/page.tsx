import ChatRoom from "@/components/chat/ChatRoom";

export default async function ChatPage(props: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await props.params;
  
  return (
    <main className="min-h-screen flex-center">
      <ChatRoom roomId={roomId} />
    </main>
  );
}
