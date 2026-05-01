import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>MediCare</h2>
          <p>Your trusted healthcare companion</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Services</h4>
            <Link href="/doctors">Doctors</Link>
            <Link href="/pharmacy">Pharmacy</Link>
            <Link href="/reports">Reports</Link>
          </div>

          <div>
            <h4>Account</h4>
            <Link href="/profile">Profile</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/family">Family</Link>
          </div>

          <div>
            <h4>Support</h4>
            <Link href="/chat">Chat</Link>
            <Link href="/notifications">Notifications</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        2026 MediCare. All rights reserved.
      </div>
    </footer>
  );
}
