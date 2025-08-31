export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <strong>Righteous Slice</strong>
        </header>
        <main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  );
}
