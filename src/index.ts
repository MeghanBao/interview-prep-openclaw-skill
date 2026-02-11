import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'interviews.json');

// Interview session storage
interface InterviewSession {
  id: string;
  company: string;
  role: string;
  questions: string[];
  currentIndex: number;
  answers: string[];
  startedAt: string;
}

interface InterviewData {
  sessions: Record<string, InterviewSession>;
  history: Array<{
    date: string;
    company: string;
    role: string;
    questionsAnswered: number;
  }>;
}

// Question banks
const BEHAVIORAL_QUESTIONS = [
  "Tell me about yourself.",
  "What is your greatest strength?",
  "What is your greatest weakness?",
  "Describe a challenging situation and how you handled it.",
  "Why do you want to work at this company?",
  "Where do you see yourself in 5 years?",
  "Tell me about a time you failed.",
  "Describe a project you're proud of.",
  "How do you handle conflict with colleagues?",
  "Give an example of leadership.",
  "Why should we hire you?",
  "Describe your ideal work environment.",
  "Tell me about a time you had to learn something quickly.",
  "How do you prioritize tasks?",
  "Describe a time you went above and beyond."
];

const TECHNICAL_QUESTIONS: Record<string, string[]> = {
  'software engineer': [
    "Explain Big O notation.",
    "What's the difference between array and linked list?",
    "Describe REST vs GraphQL.",
    "How does HTTPS work?",
    "Explain dependency injection.",
    "What's your favorite data structure and why?",
    "Describe a system you designed.",
    "How would you scale a web application?",
    "Explain the MVC pattern.",
    "What is SQL injection and how to prevent it?"
  ],
  'data scientist': [
    "Explain the bias-variance tradeoff.",
    "What's the difference between supervised and unsupervised learning?",
    "How would you handle missing data?",
    "Describe a complex SQL query you wrote.",
    "What is cross-validation?",
    "Explain regularization techniques.",
    "How do you evaluate a classification model?",
    "What's your favorite ML algorithm and why?",
    "Describe a data project from start to finish.",
    "How would you design an A/B test?"
  ],
  'product manager': [
    "How would you prioritize these features?",
    "Describe a product you admire and why.",
    "How do you define success for a product?",
    "What metrics would you track for this feature?",
    "Tell me about a time you disagreed with engineering.",
    "How do you gather user feedback?",
    "Describe your product development process.",
    "What makes a great product manager?",
    "How would you launch this product?",
    "Tell me about a failed product and what you'd do differently."
  ],
  'designer': [
    "Walk me through your design process.",
    "How do you handle feedback on your designs?",
    "Describe a project where you improved the UX.",
    "What design tools do you use?",
    "How do you prioritize features in a design system?",
    "Tell me about a time you had to compromise on design.",
    "How do you validate design decisions?",
    "Describe your ideal design collaboration with engineering.",
    "What websites or apps do you draw inspiration from?",
    "How do you stay updated with design trends?"
  ],
  'general': [
    "What are your salary expectations?",
    "Why are you leaving your current job?",
    "What do you know about our company?",
    "What questions do you have for me?"
  ]
};

const COMPANY_TIPS: Record<string, string[]> = {
  'google': [
    "Focus on coding skills — expect algorithm questions.",
    "Prepare for 'god-mode' interviews (multiple rounds).",
    "Google values: 'Focus on the user and all else will follow.'",
    "System design is crucial for senior roles.",
    "Behavioral questions follow Google REPLY format."
  ],
  'amazon': [
    "Prepare thoroughly for Leadership Principles.",
    "Expect back-to-back 45-minute interviews.",
    "Bar raisers — they hire for future potential.",
    "Write code on paper/whiteboard.",
    "Amazon wants: Ownership, Bias for Action, Dive Deep."
  ],
  'meta': [
    "Fast-paced environment — be ready to move quickly.",
    "Focus on coding speed and accuracy.",
    "Expect 'metaprogramming' questions.",
    "Culture fit: 'Move fast and break things' legacy.",
    "Prepare for culture fit questions."
  ],
  'microsoft': [
    "Cooperative atmosphere — interviewers help each other.",
    "Problem-solving focus — think aloud.",
    "Growth mindset is valued.",
    "Expect questions about your learning ability.",
    "No 'gotcha' questions — they want to see how you think."
  ],
  'apple': [
    "Passion for Apple products is expected.",
    "Design and user experience are paramount.",
    "Expect deep technical questions.",
    "Behavioral: 'Why Apple?' is common.",
    "Secrecy is valued — don't ask about the role."
  ]
};

function loadData(): InterviewData {
  if (!fs.existsSync(DATA_FILE)) {
    return { sessions: {}, history: [] };
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { sessions: {}, history: [] };
  }
}

function saveData(data: InterviewData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getRandomQuestions(count: number, questions: string[]): string[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function handleStartMockInterview(
  company?: string,
  role?: string
): Promise<string> {
  const data = loadData();
  
  // Determine role questions
  const roleKey = (role?.toLowerCase() || 'software engineer') as keyof typeof TECHNICAL_QUESTIONS;
  let roleQuestions = TECHNICAL_QUESTIONS[roleKey] || TECHNICAL_QUESTIONS['general'];
  
  // Mix behavioral and technical
  const behavioral = getRandomQuestions(3, BEHAVIORAL_QUESTIONS);
  const technical = getRandomQuestions(2, roleQuestions);
  const allQuestions = [...behavioral, ...technical];
  
  const session: InterviewSession = {
    id: generateId(),
    company: company || 'General',
    role: role || 'Software Engineer',
    questions: allQuestions,
    currentIndex: 0,
    answers: [],
    startedAt: new Date().toISOString()
  };
  
  data.sessions[session.id] = session;
  saveData(data);
  
  return `🎯 **Mock Interview Started!**\n\n` +
         `🏢 **Company:** ${session.company}\n` +
         `💼 **Role:** ${session.role}\n` +
         `📝 **Questions:** ${session.questions.length}\n\n` +
         `**Question 1 of ${session.questions.length}:**\n\n` +
         `"${session.questions[0]}"\n\n` +
         `_Reply with your answer, or type "skip" to move to the next question._`;
}

export async function handleNextQuestion(sessionId: string): Promise<string> {
  const data = loadData();
  const session = data.sessions[sessionId];
  
  if (!session) {
    return `⚠️ **Session not found.**\n\n` +
           `*Start a new mock interview with "Start mock interview".*`;
  }
  
  session.currentIndex++;
  
  if (session.currentIndex >= session.questions.length) {
    // Interview complete
    delete data.sessions[sessionId];
    
    // Save to history
    data.history.push({
      date: new Date().toISOString().split('T')[0],
      company: session.company,
      role: session.role,
      questionsAnswered: session.answers.length
    });
    saveData(data);
    
    return `🎉 **Interview Complete!**\n\n` +
           `📊 You answered ${session.answers.length} questions.\n\n` +
           `_Want feedback on your answers? Type "Review my answers" or practice more with "Start mock interview"._`;
  }
  
  saveData(data);
  
  const qNum = session.currentIndex + 1;
  return `**Question ${qNum} of ${session.questions.length}:**\n\n` +
         `"${session.questions[session.currentIndex]}"\n\n` +
         `_Reply with your answer, or type "skip"._`;
}

export async function handleSubmitAnswer(
  sessionId: string,
  answer: string
): Promise<string> {
  const data = loadData();
  const session = data.sessions[sessionId];
  
  if (!session) {
    return `⚠️ **Session not found.**\n\n` +
           `*Start a new mock interview with "Start mock interview".*`;
  }
  
  session.answers.push(answer);
  saveData(data);
  
  return `✅ **Answer recorded!**\n\n` +
         `_Preparing next question..._\n\n` +
         `---`;
}

export async function handleStarMethod(): Promise<string> {
  return `📖 **STAR Method Framework**\n\n` +
         `**S — Situation**\n` +
         `Set the context. What was the situation? When and where?\n\n` +
         `**T — Task**\n` +
         `What was your responsibility? What needed to be done?\n\n` +
         `**A — Action**\n` +
         `What did you specifically do? Use "I" not "we".\n\n` +
         `**R — Result**\n` +
         `What was the outcome? Quantify if possible.\n\n` +
         `---` +
         `\n\n**💡 Tips:**\n` +
         `• Keep answers under 2 minutes\n` +
         `• Choose examples from the last 2-3 years\n` +
         `• Pick situations with clear positive outcomes\n` +
         `• Practice saying each part aloud`;
}

export async function handleBehavioralQuestions(): Promise<string> {
  const questions = getRandomQuestions(5, BEHAVIORAL_QUESTIONS);
  
  let message = `📋 **5 Common Behavioral Questions**\n\n`;
  
  questions.forEach((q, i) => {
    message += `${i + 1}. ${q}\n\n`;
  });
  
  message += `_\n\n💡 **Pro tip:** Use the STAR method to structure your answers!\n` +
             `Type "STAR method explain" for details._`;
  
  return message;
}

export async function handleTechnicalQuestions(role?: string): Promise<string> {
  const roleKey = (role?.toLowerCase() || 'software engineer') as keyof typeof TECHNICAL_QUESTIONS;
  const questions = TECHNICAL_QUESTIONS[roleKey] || TECHNICAL_QUESTIONS['general'];
  const selected = getRandomQuestions(5, questions);
  
  let message = `🖥️ **5 Technical Questions** for ${role || 'Software Engineer'}\n\n`;
  
  selected.forEach((q, i) => {
    message += `${i + 1}. ${q}\n\n`;
  });
  
  return message;
}

export async function handleReviewAnswer(answer: string): Promise<string> {
  const wordCount = answer.split(/\s+/).length;
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim());
  
  let feedback = `📝 **Answer Review**\n\n`;
  feedback += `**Length:** ${wordCount} words (target: 100-200 words)\n`;
  feedback += `**Structure:** ${sentences.length} sentences\n\n`;
  
  // Basic analysis
  if (wordCount < 50) {
    feedback += `⚠️ **Tip:** Your answer is quite short. Try to provide more specific examples.\n\n`;
  } else if (wordCount > 250) {
    feedback += `⚠️ **Tip:** Your answer might be too long. Try to be more concise.\n\n`;
  } else {
    feedback += `✅ **Good length!** Clear and focused.\n\n`;
  }
  
  // Check for STAR elements
  const hasSituation = /situation|context|when|where/i.test(answer);
  const hasTask = /my responsibility|needed to|I had to/i.test(answer);
  const hasAction = /I |my action|what I did/i.test(answer);
  const hasResult = /result|outcome|so we|because/i.test(answer);
  
  feedback += `**STAR Framework Check:**\n`;
  feedback += `${hasSituation ? '✅' : '❌'} Situation/Context\n`;
  feedback += `${hasTask ? '✅' : '❌'} Task/Responsibility\n`;
  feedback += `${hasAction ? '✅' : '❌'} Action Taken\n`;
  feedback += `${hasResult ? '✅' : '❌'} Result/Outcome\n\n`;
  
  if (!hasSituation || !hasTask || !hasAction || !hasResult) {
    feedback += `💡 **Improve:** Try to include all four STAR elements for a complete answer.`;
  } else {
    feedback += `🎉 **Great job!** You covered all STAR elements.`;
  }
  
  return feedback;
}

export async function handleCompanyTips(company?: string): Promise<string> {
  if (!company) {
    let message = `🎯 **Company Tips Available for:**\n\n`;
    Object.keys(COMPANY_TIPS).forEach(c => {
      message += `• ${c.charAt(0).toUpperCase() + c.slice(1)}\n`;
    });
    message += `\n_Type "Company tips: [Company]" for specific advice._`;
    return message;
  }
  
  const companyKey = company.toLowerCase() as keyof typeof COMPANY_TIPS;
  const tips = COMPANY_TIPS[companyKey];
  
  if (!tips) {
    return `⚠️ **No specific tips for "${company}" yet.**\n\n` +
           `Here are general tips:\n\n` +
           `• Research the company's products and mission\n` +
           `• Prepare questions about the team and culture\n` +
           `• Practice the company's core values\n` +
           `• Review recent news about the company\n` +
           `• Prepare your own questions for the interviewer`;
  }
  
  let message = `🎯 **Tips for ${company.charAt(0).toUpperCase() + company.slice(1)}**\n\n`;
  
  tips.forEach((tip, i) => {
    message += `${i + 1}. ${tip}\n\n`;
  });
  
  return message;
}

export async function handleInterviewHistory(): Promise<string> {
  const data = loadData();
  
  if (data.history.length === 0) {
    return `📊 **No Interview History**\n\n` +
           `*Start a mock interview with "Start mock interview".*`;
  }
  
  let message = `📊 **Interview History** (${data.history.length} sessions)\n\n`;
  
  data.history.forEach((h, i) => {
    message += `${i + 1}. **${h.company}** - ${h.role}\n`;
    message += `   📅 ${h.date} | ${h.questionsAnswered} questions\n\n`;
  });
  
  return message;
}

// Main handler
export async function handler(message: string): Promise<string> {
  const lowerMsg = message.toLowerCase();
  
  // Start mock interview
  if (lowerMsg.includes('start mock interview') || 
      lowerMsg.includes('start interview') ||
      lowerMsg.includes('begin interview')) {
    
    const companyMatch = message.match(/(?:for|at|with)\s+(.+?)(?:\s+as|\s*$)/i);
    const roleMatch = message.match(/as\s+(.+?)$/i);
    
    const company = companyMatch?.[1];
    const role = roleMatch?.[1];
    
    return handleStartMockInterview(company, role);
  }
  
  // STAR method
  if (lowerMsg.includes('star method')) {
    return handleStarMethod();
  }
  
  // Behavioral questions
  if (lowerMsg.includes('behavioral') || lowerMsg.includes('common questions')) {
    return handleBehavioralQuestions();
  }
  
  // Technical questions
  if (lowerMsg.includes('technical') || lowerMsg.includes('coding questions')) {
    const roleMatch = message.match(/for\s+(.+?)$/i);
    return handleTechnicalQuestions(roleMatch?.[1]);
  }
  
  // Answer review
  if (lowerMsg.includes('review') && (lowerMsg.includes('answer') || lowerMsg.includes('my'))) {
    const answerMatch = message.replace(/review\s+(?:my\s+)?answer:?\s*/i, '');
    if (answerMatch && answerMatch.trim().length > 0) {
      return handleReviewAnswer(answerMatch.trim());
    }
    return `📝 **Review Your Answer**\n\n` +
           `Type your answer after "Review my answer:" and I'll give you feedback.`;
  }
  
  // Company tips
  if (lowerMsg.includes('company tips') || lowerMsg.includes('tips for')) {
    const companyMatch = message.match(/(?:tips for|company tips?)\s*:?\s*(.+)$/i);
    return handleCompanyTips(companyMatch?.[1]);
  }
  
  // History
  if (lowerMsg.includes('history') || lowerMsg.includes('past interviews')) {
    return handleInterviewHistory();
  }
  
  // Answer submission
  if (lowerMsg.includes('session') && lowerMsg.includes('answer')) {
    // Handle session-based answer
    return `💬 **Submit Your Answer**\n\n` +
           `Just reply to the current question with your answer!\n` +
           `_I'll record it and move to the next question._`;
  }
  
  // Help
  return `🎯 **Interview-Prep Commands**\n\n` +
         `• "Start mock interview [for Company] as [Role]"\n` +
         `• "STAR method explain"\n` +
         `• "Behavioral questions"\n` +
         `• "Technical questions for [Role]"\n` +
         `• "Review my answer: [Your answer]"\n` +
         `• "Company tips: [Company]"\n` +
         `• "Interview history"`;
}
