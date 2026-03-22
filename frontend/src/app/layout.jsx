import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { RoomProvider } from '../contexts/RoomContext';
import { LanguageProvider } from '../contexts/LanguageContext';

export const metadata = {
  title: 'PlayHall - Play Together',
  description: 'A worldwide platform for playing games with friends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <RoomProvider>
              {children}
            </RoomProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
