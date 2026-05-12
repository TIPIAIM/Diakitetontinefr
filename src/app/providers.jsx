import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SessionBootstrap from "../components/auth/SessionBootstrap";
import GlobalStyle from "../styles/GlobalStyles";

export default function Providers({ children }) {
  return (
    <SessionBootstrap>
      <GlobalStyle />
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </SessionBootstrap>
  );
}