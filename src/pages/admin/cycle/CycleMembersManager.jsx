// src/pages/admin/cycle/CycleMembersManager.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCcw,
  Search,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import cycleService from "../../../services/cycleService";

const colors = {
  navy: "#0E2D4F",
  greenDark: "#0B3D2E",
  green: "#0F6B4F",
  gold: "#D6A841",
  goldSoft: "#FFF6D8",
  white: "#FFFFFF",
  text: "#132238",
  muted: "#667085",
  border: "rgba(14, 45, 79, 0.13)",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
  success: "#027A48",
  successSoft: "#D1FADF",
  warning: "#B54708",
  warningSoft: "#FEF0C7",
};

const getInitials = (name = "") => {
  const clean = String(name || "").trim();

  if (!clean) return "M";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Une erreur est survenue.";

  const errors = error?.response?.data?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    return `${message} ${errors.join(" ")}`;
  }

  return message;
};

export default function CycleMembersManager({
  cycleId,
  open,
  onClose,
  onUpdated,
}) {
  const [cycle, setCycle] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  const [searchInCycle, setSearchInCycle] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const fetchState = useCallback(async () => {
    if (!cycleId || !open) return;

    try {
      setLoading(true);

      const data = await cycleService.getCycleMembersState(cycleId);

      setCycle(data?.cycle || null);
      setMembers(data?.members || []);
      setAvailableMembers(data?.availableMembers || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [cycleId, open]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const filteredMembers = useMemo(() => {
    const search = searchInCycle.trim().toLowerCase();

    if (!search) return members;

    return members.filter((member) => {
      return (
        member.fullName?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.telephone?.toLowerCase().includes(search)
      );
    });
  }, [members, searchInCycle]);

  const filteredAvailableMembers = useMemo(() => {
    const search = searchAvailable.trim().toLowerCase();

    if (!search) return availableMembers;

    return availableMembers.filter((member) => {
      return (
        member.fullName?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.telephone?.toLowerCase().includes(search)
      );
    });
  }, [availableMembers, searchAvailable]);

  const handleAddMember = async (member) => {
    const memberId = member.id || member._id;

    if (!cycleId || !memberId) return;

    try {
      setActionLoading(`add-${memberId}`);

      await cycleService.addMemberToCycle(cycleId, memberId);

      toast.success(
        "Membre ajouté au cycle. Sa cotisation du mois courant a été synchronisée."
      );

      await fetchState();

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const handleRemoveMember = async (member) => {
    const memberId = member.id || member._id;

    if (!cycleId || !memberId) return;

    const confirmed = window.confirm(
      `Voulez-vous retirer ${member.fullName} de ce cycle ? Les cotisations non payées seront retirées, mais l’historique payé restera conservé.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`remove-${memberId}`);

      await cycleService.removeMemberFromCycle(cycleId, memberId);

      toast.success("Membre retiré du cycle avec succès.");

      await fetchState();

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  if (!open) return null;

  return (
    <Overlay>
      <Backdrop onClick={onClose} />

      <Modal>
        <ModalHeader>
          <div>
            <Kicker>
              <Users size={15} />
              Gestion des membres du cycle
            </Kicker>

            <h2>{cycle?.name || "Cycle"}</h2>

            <p>
              Ajoute ou retire des membres du cycle. Les cotisations,
              bénéficiaires et relances seront synchronisés automatiquement.
            </p>
          </div>

          <CloseButton type="button" onClick={onClose}>
            <X size={19} />
          </CloseButton>
        </ModalHeader>

        <AlertBox>
          <AlertTriangle size={19} />
          <div>
            <strong>Règle intelligente</strong>
            <span>
              Un membre ajouté reçoit automatiquement une cotisation pending
              pour le mois courant. Un membre retiré disparaît des cotisations
              non payées, des bénéficiaires restants et des relances.
            </span>
          </div>
        </AlertBox>

        <TopActions>
          <GhostButton type="button" onClick={fetchState}>
            {loading ? <Spinner /> : <RefreshCcw size={16} />}
            Actualiser
          </GhostButton>

          <CountBadge>
            <CheckCircle2 size={15} />
            {members.length} membre(s) dans le cycle
          </CountBadge>
        </TopActions>

        <Grid>
          <Panel>
            <PanelHeader>
              <h3>Membres dans le cycle</h3>
              <span>{filteredMembers.length} résultat(s)</span>
            </PanelHeader>

            <SearchBox>
              <Search size={16} />
              <input
                type="search"
                value={searchInCycle}
                onChange={(event) => setSearchInCycle(event.target.value)}
                placeholder="Rechercher dans le cycle..."
              />
            </SearchBox>

            <List>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} />
                ))
              ) : filteredMembers.length === 0 ? (
                <EmptyBox>Aucun membre dans ce cycle.</EmptyBox>
              ) : (
                filteredMembers.map((member) => {
                  const memberId = member.id || member._id;

                  return (
                    <MemberCard key={memberId}>
                      <Avatar>{getInitials(member.fullName)}</Avatar>

                      <MemberInfo>
                        <strong>{member.fullName}</strong>
                        <span>{member.telephone || member.email || "—"}</span>
                      </MemberInfo>

                      <DangerMiniButton
                        type="button"
                        disabled={actionLoading === `remove-${memberId}`}
                        onClick={() => handleRemoveMember(member)}
                      >
                        {actionLoading === `remove-${memberId}` ? (
                          <Spinner />
                        ) : (
                          <UserMinus size={15} />
                        )}
                        Retirer
                      </DangerMiniButton>
                    </MemberCard>
                  );
                })
              )}
            </List>
          </Panel>

          <Panel>
            <PanelHeader>
              <h3>Membres disponibles</h3>
              <span>{filteredAvailableMembers.length} résultat(s)</span>
            </PanelHeader>

            <SearchBox>
              <Search size={16} />
              <input
                type="search"
                value={searchAvailable}
                onChange={(event) => setSearchAvailable(event.target.value)}
                placeholder="Rechercher un membre à ajouter..."
              />
            </SearchBox>

            <List>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} />
                ))
              ) : filteredAvailableMembers.length === 0 ? (
                <EmptyBox>Aucun membre disponible à ajouter.</EmptyBox>
              ) : (
                filteredAvailableMembers.map((member) => {
                  const memberId = member.id || member._id;

                  return (
                    <MemberCard key={memberId}>
                      <Avatar>{getInitials(member.fullName)}</Avatar>

                      <MemberInfo>
                        <strong>{member.fullName}</strong>
                        <span>{member.telephone || member.email || "—"}</span>
                      </MemberInfo>

                      <PrimaryMiniButton
                        type="button"
                        disabled={actionLoading === `add-${memberId}`}
                        onClick={() => handleAddMember(member)}
                      >
                        {actionLoading === `add-${memberId}` ? (
                          <Spinner />
                        ) : (
                          <UserPlus size={15} />
                        )}
                        Ajouter
                      </PrimaryMiniButton>
                    </MemberCard>
                  );
                })
              )}
            </List>
          </Panel>
        </Grid>
      </Modal>
    </Overlay>
  );
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -500px 0; }
  100% { background-position: 500px 0; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(7, 17, 29, 0.62);
  backdrop-filter: blur(8px);
`;

const Modal = styled.section`
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 0 28px 0 28px;
  background: ${colors.white};
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.28);
`;

const ModalHeader = styled.div`
  padding: clamp(1rem, 2vw, 1.3rem);
  background: linear-gradient(
    135deg,
    rgba(14, 45, 79, 0.98),
    rgba(11, 61, 46, 0.95)
  );
  color: ${colors.white};
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0.35rem 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.3rem, 3vw, 2rem);
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
  }
`;

const Kicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${colors.goldSoft};
  font-weight: 900;
  font-size: 0.78rem;
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  border-radius: 0 12px 0 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: 0 0 auto;
`;

const AlertBox = styled.div`
  margin: 1rem;
  padding: 0.95rem;
  border-radius: 0 18px 0 18px;
  background: ${colors.warningSoft};
  color: ${colors.warning};
  display: flex;
  gap: 0.75rem;

  strong,
  span {
    display: block;
  }

  span {
    color: ${colors.text};
    line-height: 1.55;
    margin-top: 0.15rem;
  }
`;

const TopActions = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const Grid = styled.div`
  padding: 0 1rem 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 0 22px 0 22px;
  background: rgba(14, 45, 79, 0.025);
  padding: 1rem;
  min-width: 0;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;

  h3 {
    margin: 0;
    color: ${colors.navy};
  }

  span {
    color: ${colors.muted};
    font-size: 0.85rem;
    font-weight: 800;
  }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 0.8rem;

  svg {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.muted};
  }

  input {
    width: 100%;
    border: 1px solid ${colors.border};
    background: ${colors.white};
    color: ${colors.text};
    border-radius: 0 14px 0 14px;
    padding: 0.78rem 0.85rem 0.78rem 2.4rem;
    outline: none;
    font-family: inherit;
  }
`;

const List = styled.div`
  display: grid;
  gap: 0.65rem;
  max-height: 430px;
  overflow-y: auto;
  padding-right: 0.15rem;
`;

const MemberCard = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(14, 45, 79, 0.09);
  border-radius: 0 16px 0 16px;
  background: ${colors.white};

  @media (max-width: 520px) {
    grid-template-columns: auto minmax(0, 1fr);

    button {
      grid-column: 1 / -1;
      justify-content: center;
    }
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 0 14px 0 14px;
  display: grid;
  place-items: center;
  color: ${colors.goldSoft};
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  font-weight: 950;
`;

const MemberInfo = styled.div`
  min-width: 0;

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: ${colors.navy};
  }

  span {
    color: ${colors.muted};
    font-size: 0.84rem;
    margin-top: 0.12rem;
  }
`;

const PrimaryMiniButton = styled.button`
  border: none;
  min-height: 34px;
  padding: 0.48rem 0.7rem;
  border-radius: 0 10px 0 10px;
  background: linear-gradient(135deg, ${colors.green}, #16a34a);
  color: ${colors.white};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const DangerMiniButton = styled.button`
  border: none;
  min-height: 34px;
  padding: 0.48rem 0.7rem;
  border-radius: 0 10px 0 10px;
  background: ${colors.dangerSoft};
  color: ${colors.danger};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GhostButton = styled.button`
  border: 1px solid ${colors.border};
  min-height: 38px;
  border-radius: 0 12px 0 12px;
  padding: 0.65rem 0.85rem;
  background: ${colors.white};
  color: ${colors.navy};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.85rem;
  border-radius: 999px;
  background: ${colors.successSoft};
  color: ${colors.success};
  font-weight: 900;
`;

const EmptyBox = styled.div`
  padding: 1rem;
  border-radius: 0 16px 0 16px;
  background: ${colors.goldSoft};
  color: ${colors.warning};
  font-weight: 800;
  text-align: center;
`;

const Skeleton = styled.div`
  height: 58px;
  border-radius: 0 16px 0 16px;
  background: linear-gradient(
    90deg,
    rgba(14, 45, 79, 0.06) 25%,
    rgba(14, 45, 79, 0.12) 37%,
    rgba(14, 45, 79, 0.06) 63%
  );
  background-size: 900px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;