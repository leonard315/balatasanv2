'use server';
/**
 * @fileOverview A review moderation and suggestion AI agent.
 *
 * - moderateReview - A function that handles the review moderation and suggestion process.
 * - ModerateReviewInput - The input type for the moderateReview function.
 * - ModerateReviewOutput - The return type for the moderateReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateReviewInputSchema = z.object({
  reviewText: z.string().describe('The text content of the review.'),
  rating: z.number().min(1).max(5).describe('The rating given in the review (1-5).'),
  itemType: z.enum(['accommodation', 'tour']).describe('The type of item being reviewed.'),
  itemId: z.string().describe('The ID of the item being reviewed.'),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

const ModerateReviewOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the review is appropriate and does not contain inappropriate content.'),
  suggestedChanges: z.string().describe('Suggested changes to the review for brevity, clarity, or to remove inappropriate content.'),
  revisedReviewText: z.string().describe('The revised review text after applying the suggested changes.'),
});
export type ModerateReviewOutput = z.infer<typeof ModerateReviewOutputSchema>;

export async function moderateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
  return moderateReviewFlow(input);
}

const reviewModerationPrompt = ai.definePrompt({
  name: 'reviewModerationPrompt',
  input: {schema: ModerateReviewInputSchema},
  output: {schema: ModerateReviewOutputSchema},
  prompt: `You are an AI assistant specializing in moderating user reviews for a resort booking system.

  Your task is to:
  1. Determine if the provided review is appropriate, meaning it does not contain offensive language, personal information, or irrelevant content.
  2. Suggest changes to the review for brevity, clarity, and to remove any inappropriate content.
  3. Provide a revised version of the review incorporating your suggested changes.

  Here's the review:
  ---\nRating: {{rating}}/5
Item Type: {{itemType}}
Item ID: {{itemId}}
Review: {{{reviewText}}}
---\n
  Respond with JSON:
  {
  "isAppropriate": true/false,
  "suggestedChanges": "Explanation of changes made or suggested.",
  "revisedReviewText": "The revised review text."
  }
  `,
});

const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerateReviewInputSchema,
    outputSchema: ModerateReviewOutputSchema,
  },
  async input => {
    const {output} = await reviewModerationPrompt(input);
    return output!;
  }
);
