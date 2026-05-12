// src/components/common/ErrorBoundary.jsx
import React from "react";
import styled from "styled-components";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error("Erreur React capturée :", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorShell>
          <ErrorCard>
            <IconBox>
              <AlertTriangle size={34} />
            </IconBox>

            <h1>Une erreur est survenue</h1>

            <p>
              L’interface a rencontré un problème inattendu. Recharge la page ou
              vérifie la console pour plus de détails.
            </p>

            {this.state.error?.message && (
              <CodeBox>{this.state.error.message}</CodeBox>
            )}

            <button type="button" onClick={this.handleReload}>
              <RefreshCcw size={17} />
              Recharger la page
            </button>
          </ErrorCard>
        </ErrorShell>
      );
    }

    return this.props.children;
  }
}

const ErrorShell = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(180, 35, 24, 0.13), transparent 32rem),
    linear-gradient(135deg, #f4f7f6, #eaf0ee);
`;

const ErrorCard = styled.section`
  width: min(620px, 100%);
  padding: clamp(1.2rem, 3vw, 2rem);
  border-radius: 0 28px 0 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(180, 35, 24, 0.18);
  box-shadow: 0 22px 70px rgba(14, 45, 79, 0.14);
  text-align: center;

  h1 {
    margin: 1rem 0 0.5rem;
    color: #0e2d4f;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
  }

  p {
    margin: 0 auto 1rem;
    max-width: 480px;
    color: #667085;
    line-height: 1.7;
  }

  button {
    border: none;
    min-height: 42px;
    border-radius: 0 14px 0 14px;
    padding: 0.78rem 1rem;
    background: linear-gradient(135deg, #d6a841, #f6d77b);
    color: #0e2d4f;
    font-weight: 950;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.48rem;
    cursor: pointer;
  }
`;

const IconBox = styled.div`
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 0 22px 0 22px;
  display: grid;
  place-items: center;
  color: #b42318;
  background: #fee4e2;
`;

const CodeBox = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
  padding: 1rem;
  border-radius: 0 14px 0 14px;
  background: #101828;
  color: #e7f0ff;
  font-size: 0.85rem;
  margin: 1rem 0;
`;