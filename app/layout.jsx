import './globals.css';
import { AppProvider } from '../store/AppContext';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'Relay — Webhook Delivery',
  description: 'Reliable webhook delivery with retries, HMAC signing, and live status.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-base text-ink min-h-screen">
        <AppProvider>
          <Navbar />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
