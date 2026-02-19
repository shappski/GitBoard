"use client";

import { UserMenu } from "./user-menu";

export function NavHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <UserMenu />
    </header>
  );
}
