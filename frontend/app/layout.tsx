import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "test_aws_cognito",
  description: "A simple NextJS frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
