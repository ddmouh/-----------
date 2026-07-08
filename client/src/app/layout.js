import { Cinzel, Outfit, Cairo } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
});

export const metadata = {
  title: "لعبة القضية | Deception: Murder in Hong Kong",
  description: "لعبة تحقيق وغموض جماعية على الإنترنت - Real-time multiplayer mystery deduction game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cinzel.variable} ${outfit.variable} ${cairo.variable}`} suppressHydrationWarning>

      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                      mutation.target.removeAttribute('bis_skin_checked');
                    }
                    if (mutation.addedNodes) {
                      for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                          if (node.hasAttribute('bis_skin_checked')) {
                            node.removeAttribute('bis_skin_checked');
                          }
                          const children = node.querySelectorAll('[bis_skin_checked]');
                          for (const child of children) {
                            child.removeAttribute('bis_skin_checked');
                          }
                        }
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}



