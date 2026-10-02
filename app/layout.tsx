import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyHub",
  description: "A productivity platform for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const darkMode =
                    localStorage.getItem("studyhubDarkMode");

                  if (darkMode === "true") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (error) {
                  console.error(error);
                }
              })();
            `,
          }}
        />
      </head>

      <body className="bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        {children}
      </body>
    </html>
  );
}