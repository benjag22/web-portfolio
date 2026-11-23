import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Roboto_Condensed } from "next/font/google";

const roboto = Roboto_Condensed({
    subsets: ["latin"],
    style: ["normal", "italic"],
    display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <style jsx global>{`
                :root {
                    --font-roboto: ${roboto.style.fontFamily};
                }
            `}</style>
            <Component {...pageProps} />
        </>
    );
}
