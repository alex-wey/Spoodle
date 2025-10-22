import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../index.js';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Apply authentication to all routes
router.use(authenticateToken);

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
          id: petId,
          ownerId: req.user!.id
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

      res.json({
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
      res.status(500).json({
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
          id: petId,
          ownerId: req.user!.id
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
      res.json({
        success: true,
        data: {
          messages: [],
          petId: petId
        },
        message: 'Chat history retrieved successfully'
      });
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({
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

    return completion.choices[0]?.message?.content || "I'm sorry, I'm having trouble responding right now. Please try again later.";
  } catch (error) {
    console.error('OpenAI API error:', error);
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
