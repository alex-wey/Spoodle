import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import { authenticateClerk } from '../middleware/auth';
import { prisma } from '../index.js';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-your-openai-api-key-here') {
  console.error('❌ OPENAI_API_KEY not configured in environment variables');
  console.error('📝 Please set OPENAI_API_KEY in your .env file');
}

// Test endpoint without authentication
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message required',
        message: 'Please provide a message'
      });
    }

    // Create a mock pet for testing
    const mockPet = {
      name: 'Test Pet',
      species: 'Dog',
      breed: 'Golden Retriever',
      weight: 50,
      dateOfBirth: '2020-01-01',
      spayedNeutered: true,
      allergies: [],
      dietaryRestrictions: []
    };

    // Get AI response from OpenAI
    const aiResponse = await getOpenAIResponse(message, mockPet);

    return res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString()
      },
      message: 'Test message processed successfully'
    });
  } catch (error) {
    console.error('Chatbot test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to process test message'
    });
  }
});

// Apply authentication to all routes
router.use(authenticateClerk);

// Chat message schema
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  petId: z.string().uuid('Invalid pet ID'),
});

// Send a message to the chatbot
router.post('/chat', 
  validateRequest({ body: chatMessageSchema }),
  async (req: Request, res: Response) => {
    try {
      const { message, petId } = req.body;
      
      // Verify the pet belongs to the user
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId as string,
          ownerId: req.auth!.userId
        }
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The specified pet does not exist or you do not have permission to access it'
        });
      }

      // Get AI response from OpenAI
      const aiResponse = await getOpenAIResponse(message, pet);

      // Save the conversation to database (optional)
      // await prisma.chatMessage.create({
      //   data: {
      //     userId: req.user!.id,
      //     petId: petId,
      //     userMessage: message,
      //     aiResponse: aiResponse,
      //     timestamp: new Date()
      //   }
      // });

      return res.json({
        success: true,
        data: {
          response: aiResponse,
          petId: petId,
          timestamp: new Date().toISOString()
        },
        message: 'Message processed successfully'
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to process your message'
      });
    }
  }
);

// Get chat history for a pet (optional feature)
router.get('/history/:petId',
  validateRequest({ 
    params: z.object({ petId: z.string().uuid('Invalid pet ID') })
  }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify the pet belongs to the user
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId as string,
          ownerId: req.auth!.userId
        }
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The specified pet does not exist or you do not have permission to access it'
        });
      }

      // For now, return empty history since we're not storing messages yet
      // In a real implementation, this would fetch from the chatMessage table
      return res.json({
        success: true,
        data: {
          messages: [],
          petId: petId
        },
        message: 'Chat history retrieved successfully'
      });
    } catch (error) {
      console.error('Chat history error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve chat history'
      });
    }
  }
);

// OpenAI response generator
async function getOpenAIResponse(message: string, pet: any): Promise<string> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-your-openai-api-key-here') {
      console.error('❌ OpenAI API key not configured - using fallback response');
      return generateFallbackResponse(message, pet);
    }

    const systemPrompt = `You are Spoodle, an AI pet care assistant specializing in ${pet.species.toLowerCase()} care. You are helping the owner of ${pet.name}, a ${pet.species.toLowerCase()}${pet.breed ? ` (${pet.breed} breed)` : ''}.

Key information about ${pet.name}:
- Species: ${pet.species}
- Breed: ${pet.breed || 'Mixed breed'}
- Weight: ${pet.weight ? `${pet.weight} lbs` : 'Not specified'}
- Age: ${pet.dateOfBirth ? `Born ${new Date(pet.dateOfBirth).toLocaleDateString()}` : 'Age not specified'}
- Spayed/Neutered: ${pet.spayedNeutered ? 'Yes' : 'No'}
- Allergies: ${pet.allergies && pet.allergies.length > 0 ? pet.allergies.join(', ') : 'None reported'}
- Dietary Restrictions: ${pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 ? pet.dietaryRestrictions.join(', ') : 'None reported'}

Guidelines for responses:
1. Always be helpful, friendly, and professional
2. Provide practical, evidence-based advice
3. For serious health concerns, always recommend consulting a veterinarian
4. Use the pet's name and specific details when relevant
5. Keep responses concise but informative (2-3 sentences typically)
6. If you don't know something, say so and suggest consulting a vet
7. Focus on general pet care, behavior, nutrition, and wellness topics

Remember: You are not a substitute for veterinary care, but you can provide helpful general guidance.`;

    console.log('🤖 Sending request to OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I'm having trouble responding right now. Please try again later.";
    console.log('✅ OpenAI API response received');
    return response;
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.message || error);
    // Fallback to simple response if OpenAI fails
    return generateFallbackResponse(message, pet);
  }
}

// Fallback response generator for when OpenAI is unavailable
function generateFallbackResponse(message: string, pet: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Health-related responses
  if (lowerMessage.includes('sick') || lowerMessage.includes('ill') || lowerMessage.includes('not feeling well')) {
    return `I understand you're concerned about ${pet.name}'s health. While I can provide general guidance, it's always best to consult with a veterinarian for any health concerns. Can you tell me more about the specific symptoms you're noticing?`;
  }
  
  if (lowerMessage.includes('eating') || lowerMessage.includes('food') || lowerMessage.includes('diet')) {
    return `Great question about ${pet.name}'s nutrition! A balanced diet is crucial for ${pet.species.toLowerCase()}s. I'd be happy to help with feeding recommendations. What specific aspect of their diet would you like to discuss?`;
  }
  
  if (lowerMessage.includes('behavior') || lowerMessage.includes('training') || lowerMessage.includes('acting')) {
    return `Behavioral questions are important for ${pet.name}'s well-being! Each ${pet.species.toLowerCase()} is unique. Can you describe what specific behavior you're concerned about?`;
  }
  
  // Default response
  return `Thank you for asking about ${pet.name}! I'm here to help with any questions about your ${pet.species.toLowerCase()}'s care, health, behavior, or general well-being. Could you provide more details about what you'd like to know?`;
}

export default router;
