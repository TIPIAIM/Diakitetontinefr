// src/components/common/PageLoader.jsx
import styled, { keyframes } from "styled-components";
import { ShieldCheck } from "lucide-react";

export default function PageLoader({ label = "Chargement..." }) {
  return (
    <LoaderShell>
      <LoaderCard>
        <LogoBox>
          <ShieldCheck size={30} />
        </LogoBox>

        <LoaderText>
          <strong>DIAKITE-TONTINE</strong>
          <span>{label}</span>
        </LoaderText>

        <LoaderBar>
          <span />
        </LoaderBar>
      </LoaderCard>
    </LoaderShell>
  );
}

const move = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(320%); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.04); opacity: 1; }
`;

const LoaderShell = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(214, 168, 65, 0.18), transparent 34rem),
    linear-gradient(135deg, #f4f7f6, #eaf0ee);
`;

const LoaderCard = styled.div`
  width: min(420px, 100%);
  padding: 1.4rem;
  border-radius: 0 28px 0 28px;
  border: 1px solid rgba(14, 45, 79, 0.12);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 22px 70px rgba(14, 45, 79, 0.14);
  backdrop-filter: blur(18px);
  display: grid;
  justify-items: center;
  gap: 1rem;
`;

const LogoBox = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 0 22px 0 22px;
  display: grid;
  place-items: center;
  color: #fff6d8;
  background: linear-gradient(135deg, #0e2d4f, #0b3d2e);
  box-shadow: 0 18px 42px rgba(14, 45, 79, 0.22);
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

const LoaderText = styled.div`
  text-align: center;

  strong {
    display: block;
    color: #0e2d4f;
    font-size: 1.05rem;
    letter-spacing: 0.06em;
  }

  span {
    display: block;
    margin-top: 0.25rem;
    color: #667085;
    font-weight: 700;
  }
`;

const LoaderBar = styled.div`
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(14, 45, 79, 0.08);

  span {
    display: block;
    width: 34%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0e2d4f, #d6a841);
    animation: ${move} 1.2s ease-in-out infinite;
  }
`;