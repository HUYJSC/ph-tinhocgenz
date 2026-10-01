import React from 'react';
import { LoginMascotChatbot, LoginMascotChatbotProps } from './LoginMascotChatbot';

export interface ChatPanelProps extends LoginMascotChatbotProps {}

/**
 * ChatPanel — Dedicated modular chat panel for Trợ lý Gen Z.
 */
export const ChatPanel: React.FC<ChatPanelProps> = (props) => {
  return <LoginMascotChatbot {...props} />;
};
