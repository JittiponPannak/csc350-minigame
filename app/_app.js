import { stateProvider } from "./context";

export default function App({ Component, pageProps }) {
  return (
    <stateProvider>
      <Component {...pageProps} />
    </stateProvider>
  );
}
