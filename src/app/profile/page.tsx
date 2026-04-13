"use client";

import React, { Component } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MOCK_USER } from "@/lib/user-mock";
import { ProfileView } from "@/components/profile/profile-view";

class PrivyBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Wallet provider is unavailable. Check your configuration.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProfileContent() {
  const { authenticated } = usePrivy();

  // TODO: Replace with Supabase query to load the connected user's profile
  const user = MOCK_USER;

  // Check if the connected wallet matches this profile
  const isOwnProfile = authenticated;

  return <ProfileView user={user} isOwnProfile={!!isOwnProfile} />;
}

export default function ProfilePage() {
  return (
    <PrivyBoundary>
      <ProfileContent />
    </PrivyBoundary>
  );
}
