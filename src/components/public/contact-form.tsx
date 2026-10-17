"use client";

import { Send } from "lucide-react";
import { submitContactAction } from "@/features/public/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  return (
    <form action={submitContactAction} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input autoComplete="name" id="name" name="name" placeholder="Your name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" id="email" name="email" placeholder="name@company.com" required type="email" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company (optional)</Label>
          <Input autoComplete="organization" id="company" name="company" placeholder="Company name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="service">What do you need?</Label>
          <Select id="service" name="service" required>
            <option value="">Choose one</option>
            <option>Tax advice</option>
            <option>Accounts and reports</option>
            <option>Finance help for my business</option>
            <option>Something else</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Your message</Label>
        <Textarea id="message" name="message" placeholder="Tell us what you need and any deadline." required />
        <p className="text-sm leading-6 text-muted-foreground">Please do not include passwords or ID documents.</p>
      </div>
      <SubmitButton className="w-full sm:w-auto" pendingText="Sending...">
        Send message
        <Send aria-hidden="true" className="h-4 w-4" />
      </SubmitButton>
    </form>
  );
}
