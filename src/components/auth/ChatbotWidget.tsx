import React from 'react';
import { LoginMascotChatbot, LoginMascotChatbotProps } from './LoginMascotChatbot';

export interface ChatbotWidgetProps extends LoginMascotChatbotProps {}

/**
 * ChatbotWidget — Modular container for the LMS Mascot AI Chatbot.
 */
export const ChatbotWidget: React.FC<ChatbotWidgetProps> = (props) => {
  return <LoginMascotChatbot {...props} />;
};

export { LoginMascotChatbot };
