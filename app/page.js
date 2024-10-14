"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, LogOut, Send, Image, Smile } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { signIn, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Navbar from "@/components/Navbar";
import Message from "@/components/Message";


// Skeleton loading component
const SkeletonLoading = () => (
  <div className="animate-pulse flex flex-col space-y-4 mt-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <div className="rounded-full bg-muted h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ChatApp() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [imageFile, setImageFile] = useState(null); // New state for image file
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (session) {
      fetchMessages();
      const channel = supabase.channel("public:messages");
      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            setMessages((currentMessages) => [...currentMessages, payload.new]);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to real-time messages");
          }
        });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [session, fetchMessages, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("chat-images") // Ensure you have a bucket named "chat-images"
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: publicData, error: publicURLError } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName);

    if (publicURLError) {
      console.error("Error getting public URL:", publicURLError);
      return null;
    }

    console.log("Public URL:", publicData.publicUrl); // Log the URL for debugging
    return publicData.publicUrl;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    // Ensure there’s either a message or an image to send
    if (!newMessage.trim() && !imageFile) return;
    if (!session?.user) return;

    let imageUrl = null;

    // If there’s an image file, upload it and get the public URL
    if (imageFile) {
      imageUrl = await handleImageUpload(imageFile);
      setImageFile(null); // Reset imageFile after uploading

      if (!imageUrl) {
        console.error("Failed to upload image or retrieve public URL.");
        return; // Prevent sending the message if image upload failed
      }
    }

    try {
      const { data, error } = await supabase.from("messages").insert([
        {
          content: newMessage, // Save text content if available
          user_id: session.user.id,
          user_name: session.user.name,
          user_email: session.user.email,
          user_avatar: session.user.image,
          image_url: imageUrl, // Save image URL to the database
        },
      ]);

      if (error) throw error;

      // Clear the message input and image file after sending
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setImageFile(file); // Store the file in state
      setNewMessage(""); // Clear the text input (optional)

      // Automatically send the message with the selected image
      sendMessage(e);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Button onClick={() => signIn()} size="lg">
          Sign in to join the chat
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? "dark" : ""}`}>
      <Navbar
        user={session.user}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />

      <div
        className="flex-1 overflow-y-auto p-4 bg-background text-foreground"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {loading ? (
          <SkeletonLoading />
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isOwnMessage={message.user_id === session.user.id}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="bg-background border-t border-border p-4"
      >
        <div className="flex space-x-4 items-center">
          {/* Text Input */}
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="rounded-lg flex-1"
          />

          {/* File Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="bg-secondary rounded-lg px-4 py-2 flex items-center justify-center cursor-pointer">
              <Image className="w-5 h-5 text-foreground mr-2" />
              <span className="text-foreground">Send Image</span>
            </div>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            className="rounded-full text-primary bg-secondary"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}
