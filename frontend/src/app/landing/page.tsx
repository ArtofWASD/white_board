import { redirect } from "next/navigation"

/**
 * Legacy /landing route — redirects to the root landing page.
 */
export default function LandingRedirect() {
  redirect("/")
}
