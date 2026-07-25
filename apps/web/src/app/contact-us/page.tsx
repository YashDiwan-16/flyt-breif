import { PublicContactForm } from "@/components/public-contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact FlytBase | FlytBDR Copilot",
  description: "Submit an inbound FlytBase automation inquiry.",
};

export default function ContactUsPage() {
  return <PublicContactForm />;
}
