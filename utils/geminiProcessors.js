const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function processWithGemini(base64File, mimeType) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Please perform a comprehensive extraction of ALL information present in this document and include a detailed summary.

EXTRACTION GUIDELINES:

1. DOCUMENT SUMMARY:
   - Provide a comprehensive overview of the document
   - Include document type and main purpose
   - Summarize key points and findings
   - Identify primary topics or themes
   - Note significant patterns or trends
   - Highlight critical information
   - Describe document structure and organization

2. SCOPE:
   - Extract ALL information found in the document
   - Do not limit to predefined categories
   - Capture every detail, no matter how minor
   - Include both explicit and implicit information
   - Document any contextual relationships

3. DATA TYPES TO CAPTURE:
   - Any names, titles, or identifiers
   - All dates in any format
   - Every numerical value encountered
   - Any locations or geographical references
   - All contact information
   - Any categorical or descriptive information
   - Technical specifications or measurements
   - Status indicators or flags
   - References to documents or external sources
   - Time-related information
   - Any relationships or connections mentioned
   - System-specific identifiers or codes
   - Any metadata present in the document

4. OUTPUT FORMAT:
   Format as a clean JSON with these rules:
   {
     "document_summary": {
       "type": "Document type/category",
       "overview": "Comprehensive document description",
       "key_points": ["Array of main findings/points"],
       "main_topics": ["Primary themes/subjects"],
       "structure": "Document organization description",
       "critical_elements": ["Important highlights"]
     },
     "extracted_data": {
       // All extracted information organized by logical categories
     },
     "metadata": {
       // Document metadata and extraction details
     }
   }

5. FORMATTING RULES:
   - Create logical groupings based on the actual content
   - Use descriptive key names (lowercase_with_underscores)
   - Preserve all numerical values without spaces or separators
   - Format dates consistently as YYYY-MM-DD where possible
   - Use arrays for multiple related items
   - Nest related information in logical sub-objects
   - Include null for explicitly mentioned but empty values
   - Omit fields that are not present in the document
   - Preserve exact original values for codes and identifiers

6. SPECIAL HANDLING:
   - If a piece of information could belong to multiple categories, include it in all relevant places
   - For ambiguous information, include a confidence indicator
   - For repeated information, capture all instances
   - For structured tables, preserve the relationships between data
   - For lists, maintain the original ordering

Remember: The goal is to provide both a comprehensive summary and capture EVERYTHING present in the document, creating a complete picture of the content and its context.`;
    
    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: base64File,
                },
            },
        ]);

        const response = await result.response;
        const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
        console.dir(candidateText, { depth: null });
        
        // Extract JSON block using regex
        const jsonMatch = candidateText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) throw new Error('JSON block not found in the response.');

        return JSON.parse(jsonMatch[1]); // Return parsed JSON
    } catch (error) {
        console.error('Error in processWithGemini:', error.message);
        throw new Error('Failed to process file with Gemini AI');
    }
}

module.exports = { processWithGemini };
