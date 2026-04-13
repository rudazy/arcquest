"use client";

import React, { Component } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

function AddressProfileContent() {
  const params = useParams<{ address: string }>();
  const { user: privyUser } = usePrivy();

  // TODO: Replace with Supabase query — look up user by wallet address (params.address)
  const user = MOCK_USER;

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Profile not found</p>
          <Link
            href="/leaderboard"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#7B5EA7] hover:text-[#9b7ec8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
        </div>
      </main>
    );
  }

  // Check if the connected wallet matches the viewed profile address
  const connectedAddress = privyUser?.wallet?.address?.toLowerCase();
  const isOwnProfile =
    !!connectedAddress && connectedAddress === params.address.toLowerCase();

  return <ProfileView user={user} isOwnProfile={isOwnProfile} />;
}

export default function UserProfilePage() {
  return (
    <PrivyBoundary>
      <AddressProfileContent />
    </PrivyBoundary>
  );
}
