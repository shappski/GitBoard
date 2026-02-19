"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
          <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </div>
        <CardTitle className="text-2xl">Welcome to GitBoard</CardTitle>
        <p className="mt-2 text-sm text-gray-500">
          Monitor your GitLab merge requests and detect stalled ones before they
          become a problem.
        </p>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => signIn("gitlab", { callbackUrl: "/dashboard" })}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.387 9.452.045 13.587a.924.924 0 00.331 1.023L12 23.054l11.624-8.443a.92.92 0 00.331-1.024" />
          </svg>
          Sign in with GitLab
        </Button>
      </CardContent>
    </Card>
  );
}
