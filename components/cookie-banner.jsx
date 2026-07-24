"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "atit-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "set");
  }, []);

  const handleChoice = () => {
    window.localStorage.setItem(STORAGE_KEY, "set");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <aside className="cookieBanner" aria-label="Cookie notice">
      <p className="cookieBanner__copy">
        We use cookies and tracking technologies to enhance your browsing experience, personalize
        content, and improve our site&apos;s performance. To learn more about how we use cookies or
        manage your cookie settings, click Manage Cookies. By clicking Accept, you consent to the
        use of these tools as outlined in our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>. If you choose Dismiss, only essential
        cookies necessary for the website&apos;s basic functionality will be enabled.
      </p>
      <div className="cookieBanner__actions">
        <button type="button" onClick={handleChoice}>
          Accept
        </button>
        <button type="button" onClick={handleChoice}>
          Dismiss
        </button>
      </div>
    </aside>
  );
}
