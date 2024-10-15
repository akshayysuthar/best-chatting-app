"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase";

export default function InvitePage({ params }) {
  const router = useRouter();
  // const supabase = useSupabaseClient();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      handleInvite();
    }
  }, [session]);

  const handleInvite = async () => {
    const { data, error } = await supabase
      .from("chats")
      .update({ user2_email: session.user.email })
      .eq("invite_link", `${window.location.origin}/invite/${params.inviteId}`)
      .select();

    if (error) {
      console.error("Error accepting invite:", error);
    } else if (data && data.length > 0) {
      router.push(`/chat/${data[0].id}`);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Button size="lg">Sign in to accept the invite</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p>Processing invite...</p>
    </div>
  );
}
