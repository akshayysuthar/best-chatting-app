import React from "react";
import { Sun, Moon, LogOut, Send, Image, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "./theme-toggle";
import { signOut } from "next-auth/react";

const Navbar = ({ user, toggleTheme, isDarkMode }) => (
  <nav className=" text-primary p-4 shadow-lg bg-transparent backdrop-blur">
    <div className="container mx-auto flex justify-between items-center">
      <span className="text-2xl font-bold">LiveChat</span>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="rounded-full"
              >
                <LogOut size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </nav>
);

export default Navbar;
