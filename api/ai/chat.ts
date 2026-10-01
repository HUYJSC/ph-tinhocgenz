/**
 * POST /api/ai/chat — Gemini AI Chatbot Serverless Endpoint
 * Authenticates user, enforces RBAC, retrieves authorized context (RAG),
 * calls Google Gemini API securely on the server, and returns grounded answers.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { checkRateLimit } from '../_lib/rateLimiter';
import {
  RAGUserContext,
  retrieveScopedContext,
  buildGeminiSystemPrompt,
  generateGeminiChatResponse
} from '../_lib/geminiRAG';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Pre-flight Check
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST is supported.'
    });
  }

  // 2. Authentication & Session Extraction
  const session = getSessionFromRequest(req);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

  let userContext: RAGUserContext;
  if (session) {
    userContext = {
      userId: session.userId,
      role: session.role === 'academic_staff' ? 'academic' : (session.role as any),
      name: session.name || 'Người dùng',
      language: (req.body?.language as string) || 'vi',
      permissions: session.role === 'super_admin'
        ? ['*']
        : session.role === 'admin'
          ? ['admin.read', 'courses.read', 'students.read']
          : session.role === 'teacher'
            ? ['teacher.classes', 'assignments.grade']
            : ['student.own_courses', 'student.own_grades'],
      studentCode: session.studentCode,
      teacherCode: session.teacherCode,
      track: session.track
    };
  } else {
    // Unauthenticated / Guest Mode (Login Page Mascot Assistance)
    userContext = {
      userId: `guest_${clientIp.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
      role: 'guest',
      name: 'Khách',
      language: (req.body?.language as string) || 'vi',
      permissions: ['public.login_help', 'public.courses_catalog']
    };
  }

  // 3. Rate Limiting Check (Requirement 9)
  const rateLimitKey = `ai_chat_${userContext.userId}_${clientIp}`;
  const rateCheck = checkRateLimit(rateLimitKey, 15, 60 * 1000); // 15 calls per minute
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Bạn đã gửi câu hỏi quá nhanh. Vui lòng đợi trong giây lát.',
      retryAfterSec: rateCheck.resetInSec
    });
  }

  // 4. Request Payload Validation
  const { message, language, stream } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Nội dung câu hỏi không được để trống.'
    });
  }

  // Max Question Length check (1000 characters)
  if (message.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Câu hỏi quá dài (tối đa 1,000 ký tự). Vui lòng rút gọn câu hỏi.'
    });
  }

  if (language && typeof language === 'string') {
    userContext.language = language;
  }

  try {
    // 5. Scoped RAG Retrieval with RBAC Check
    const ragResult = await retrieveScopedContext(userContext, message.trim());

    // Prompt Injection Alert
    if (ragResult.isFlaggedInjection) {
      return res.status(200).json({
        success: true,
        response: ragResult.formattedContext,
        intent: 'security_violation',
        model: 'Security Shield Filter',
        sources: [],
        userContext: {
          userId: userContext.userId,
          role: userContext.role,
          language: userContext.language
        }
      });
    }

    // 6. Build Standard System Prompt
    const systemPrompt = buildGeminiSystemPrompt(userContext, ragResult.formattedContext, message.trim());

    // 7. Generate Gemini Chat Response
    const geminiResult = await generateGeminiChatResponse(
      systemPrompt,
      message.trim(),
      userContext,
      ragResult.sources
    );

    // 8. Stream vs Standard Response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send chunked words to simulate stream smoothly
      const words = geminiResult.text.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({
        done: true,
        model: geminiResult.modelUsed,
        sources: geminiResult.sourcesUsed
      })}\n\n`);

      res.end();
      return;
    }

    // Standard JSON Response
    return res.status(200).json({
      success: true,
      response: geminiResult.text,
      intent: ragResult.intent,
      model: geminiResult.modelUsed,
      sources: geminiResult.sourcesUsed,
      userContext: {
        userId: userContext.userId,
        role: userContext.role,
        language: userContext.language
      }
    });
  } catch (error: any) {
    console.error('Lỗi xử lý AI Chatbot:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau giây lát.'
    });
  }
}
