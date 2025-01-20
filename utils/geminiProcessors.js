const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function processWithGemini(base64File, mimeType) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Please analyze the provided social media content and generate a comprehensive analysis with three main sections: Description, Information, and Recommendations.

ANALYSIS GUIDELINES:

1. STRUCTURE REQUIREMENTS:
   - Always include the three main sections: Description, Information, and Recommendations
   - Only include keys where data is actually present in the content
   - Use proper English words with first letter capitalized for all keys
   - Omit any keys or sections where no information is found

2. COMPREHENSIVE DATA EXTRACTION:
   - Extract EVERY piece of information present in the content
   - Analyze both visible content and metadata
   - Capture all available metrics and data points
   - Document relationships between different data elements
   - Include all technical and contextual information

3. OUTPUT FORMAT:
{
  "Description": {
    "Summary": "Comprehensive description",
    "Audience": "Identified audience",
    "Context": "Contextual information"
  },
  "Information": {
    "Message": {
      "Content": "Primary content text",
      "Discussions": [],
      "Responses": [],
      "Descriptions": []
    },
    "Multimedia": {
      "Categories": [],
      "Characteristics": {}
    },
    "Creator": {
      "Publishers": [],
      "References": [],
      "Engagements": []
    },
    "Timing": {
      "Published": "",
      "Modifications": [],
    },
    "Performance": {
      
    },
    "Specifications": {
      "Device": {}
    },
    "Attributes": {
      "Details": {}
    },
    "Connections": {
      "Websites": [],
      "Sources": [],
      "Related": []
    },
    "Additional": {
      // Any additional data not fitting above categories
    }
  },
  "Recommendations": {
    "Immediate": ["Immediate improvement opportunities"],
    "Strategic": ["Long-term suggestions"],
    "Schedule": {
      // Timing recommendations based on analyzed data
    },
    "Enhancements": ["Content enhancement suggestions"],
    "Targeting": ["Audience engagement tips"],
    "Optimization": ["Platform optimization tips"]
  }
}

4. EXTRACTION RULES:
   - Include ONLY keys where corresponding data exists
   - Remove empty objects and arrays
   - Remove sections with no meaningful data
   - Keep all three main sections even if some are minimal
   - Use proper grammatical pluralization for array keys
   - Create new appropriate keys if unique data is found
   - Maintain data relationships in the structure

5. ANALYSIS REQUIREMENTS:
   - Base recommendations on actual extracted data
   - Provide platform-specific insights when possible
   - Include comparative analysis if benchmarks are available
   - Consider audience behavior patterns
   - Analyze engagement trends
   - Evaluate content effectiveness
   - Assess timing patterns
   - Consider platform-specific features utilization

Remember:
1. The three main sections (Description, Information, Recommendations) are mandatory
2. Only include keys where actual data exists
3. Use proper English words with first letter capitalized
4. Base all recommendations on extracted data
5. Ensure all available data is captured and categorized appropriately`;
    
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
