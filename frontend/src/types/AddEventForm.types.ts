import { Exercise } from './index';

export interface AddEventFormUser {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface AddEventFormProps {
  user: AddEventFormUser;
  onSubmit?: (title: string, exerciseType: string, exercises: Exercise[]) => void;
  onClose?: () => void;
}
