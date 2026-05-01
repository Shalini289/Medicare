import "./globals.css";
import "../styles/navbar.css";
import "../styles/footer.css";
import "../styles/card.css";
import "../styles/booking.css";
import "../styles/notification.css";
import "../styles/health.css";
import "../styles/hospital.css";
import "../styles/family.css";
import "../styles/admin.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: {
    default: "MediCare - Healthcare that cares for you",
    template: "%s | MediCare",
  },
  description:
    "Book appointments with top-rated doctors, manage your family's health, and get expert care.",
  keywords: ["healthcare", "doctors", "appointments", "pharmacy", "India"],
  authors: [{ name: "MediCare" }],
};

export const viewport = {
  themeColor: "#D4708F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-body">
        <Navbar />

        <main className="main-content">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
