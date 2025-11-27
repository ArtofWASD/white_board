export interface EditTeamModalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastName?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: EditTeamModalUser;
}

export interface EditTeamModalProps {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated: () => void;
}
