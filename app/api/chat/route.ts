import { NextRequest, NextResponse } from 'next/server';

// Custom chatbot logic with knowledge about Amol
const amolKnowledge = {
  name: 'Amol Jadhav',
  title: 'Sr. Engineering Program Manager | Bar Raiser | Amazon',
  linkedin: 'https://www.linkedin.com/in/amojadha',
  twitter: 'https://twitter.com/amoljadhav00',
  medium: 'https://medium.com/@amoljadhav_48655',
  skills: ['Engineering Management', 'Program Delivery', 'Technical Leadership', 'Bar Raiser', 'Agile', 'AWS'],
  experience: 'Amazon (Current), Previous experience in program management and software engineering',
  interests: ['Technology', 'Management', 'Career Development', 'Engineering Best Practices']
};

function generateResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Greeting
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    return `Hello! I'm Amol's AI assistant. I can tell you about Amol's work, experience, articles, and more. What would you like to know?`;
  }

  // About Amol
  if (lowerMessage.includes('who') && (lowerMessage.includes('amol') || lowerMessage.includes('you'))) {
    return `${amolKnowledge.name} is a ${amolKnowledge.title}. He's an experienced engineering leader with expertise in program management, technical leadership, and agile methodologies. He's also a Bar Raiser at Amazon, which means he helps maintain high hiring standards.`;
  }

  // Work/Job
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('amazon')) {
    return `Amol currently works at Amazon as a Sr. Engineering Program Manager and Bar Raiser. As a Bar Raiser, he plays a crucial role in maintaining Amazon's high hiring standards and ensuring quality candidates join the company.`;
  }

  // Skills
  if (lowerMessage.includes('skill') || lowerMessage.includes('experience') || lowerMessage.includes('expertise')) {
    return `Amol's key skills include: ${amolKnowledge.skills.join(', ')}. He has extensive experience in engineering management, program delivery, and technical leadership.`;
  }

  // Contact
  if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('connect')) {
    return `You can connect with Amol on:\n- LinkedIn: ${amolKnowledge.linkedin}\n- Twitter/X: ${amolKnowledge.twitter}\n- Medium Blog: ${amolKnowledge.medium}`;
  }

  // Articles/Blog
  if (lowerMessage.includes('article') || lowerMessage.includes('blog') || lowerMessage.includes('write') || lowerMessage.includes('post')) {
    return `Amol writes regularly on Medium about technology, management, and career development. You can find his articles at ${amolKnowledge.medium}. Check out the "Amol's Articles" section on this page to see his latest posts!`;
  }

  // Bar Raiser
  if (lowerMessage.includes('bar raiser')) {
    return `As a Bar Raiser at Amazon, Amol plays a critical role in the hiring process. Bar Raisers are trained interviewers who ensure that every new hire raises the bar - meaning they're better than at least 50% of current employees in the same role. They have veto power in hiring decisions to maintain Amazon's high standards.`;
  }

  // Social media
  if (lowerMessage.includes('linkedin') || lowerMessage.includes('twitter') || lowerMessage.includes('social')) {
    return `You can find Amol on:\n- LinkedIn: ${amolKnowledge.linkedin}\n- Twitter/X: ${amolKnowledge.twitter}\n- Medium: ${amolKnowledge.medium}`;
  }

  // Game
  if (lowerMessage.includes('game') || lowerMessage.includes('terminal runner')) {
    return `The Terminal Runner game on this page is a fun obstacle-dodging game! Press SPACEBAR to jump over obstacles. The game gets progressively harder as your score increases. Can you beat the high score?`;
  }

  // Default response
  return `I'm Amol's AI assistant. I can help you learn about Amol's work at Amazon, his skills in engineering management and technical leadership, his articles, or how to connect with him. What would you like to know?`;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = generateResponse(message.trim());

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
