// This file only mocks AI API responses to avoid requiring actual AI API integration
// In a real implementation, this would be replaced with actual calls to an AI service like OpenAI

export async function generateAiContent(
  prompt: string,
  contentType: string,
  options: {
    tone: string;
    targetAudience: string;
    brandStyle: string;
  }
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { tone, targetAudience, brandStyle } = options;
  
  // Response templates based on content type
  const templates = {
    email: {
      subject: `Engaging ${tone} email subject for ${targetAudience}`,
      body: `This is an AI-generated email body in a ${tone} tone targeting ${targetAudience}. The content follows your ${brandStyle} brand style guidelines and includes key messaging about your product or service. The email is structured with a captivating opening, informative middle section, and compelling call to action.`,
      cta: `Click here to learn more about our offering.`
    },
    "landing-page": {
      headline: `Compelling ${tone} headline for ${targetAudience}`,
      subheadline: `Supporting statement that reinforces the headline and explains the value proposition.`,
      features: `• Feature one with benefit statement\n• Feature two with benefit statement\n• Feature three with benefit statement`,
      testimonial: `"This product completely transformed our approach to marketing. The results speak for themselves." - Satisfied Customer`,
      closing: `Final call to action encouraging visitors to take the next step.`
    },
    "ad-copy": {
      headline: `Attention-grabbing ${tone} headline for ${targetAudience}`,
      mainText: `Primary ad text that speaks directly to ${targetAudience} about their pain points and how your solution addresses them.`,
      supportingText: `Additional details about features, benefits, or special offers.`,
      cta: `Sign up today`
    },
    "product-brochure": {
      cover: `${brandStyle} product brochure titled for ${targetAudience}`,
      introduction: `Introduction highlighting the key benefits of your product/service for ${targetAudience}.`,
      features: `Detailed explanation of product features with supporting images and specifications.`,
      pricing: `Pricing options presented in a clear, easy-to-understand format.`,
      conclusion: `Closing statement reinforcing your unique value proposition.`
    }
  };
  
  // Return content based on the requested type
  const contentTypeKey = contentType as keyof typeof templates;
  if (templates[contentTypeKey]) {
    return {
      success: true,
      content: templates[contentTypeKey],
      metadata: {
        prompt,
        contentType,
        tone,
        targetAudience,
        brandStyle,
        generatedAt: new Date().toISOString()
      }
    };
  } else {
    // Default generic response
    return {
      success: true,
      content: {
        title: `${tone} content for ${targetAudience}`,
        body: `AI-generated content following ${brandStyle} brand guidelines. This content is targeting ${targetAudience} with a ${tone} tone.`
      },
      metadata: {
        prompt,
        contentType,
        tone,
        targetAudience,
        brandStyle,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

// Generate variations of content
export async function generateVariations(
  originalContent: string,
  count: number = 3,
  options: {
    tone: string;
    targetAudience: string;
    brandStyle: string;
  }
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const { tone, targetAudience, brandStyle } = options;
  const variations = [];
  
  for (let i = 1; i <= count; i++) {
    variations.push({
      id: i,
      content: `Variation ${i}: An alternative version of the content with a ${i === 1 ? 'stronger' : i === 2 ? 'more casual' : 'more formal'} approach. This variation emphasizes different aspects while maintaining the ${tone} tone and appealing to ${targetAudience}.`,
      metadata: {
        variation: i,
        emphasis: i === 1 ? 'emotional appeal' : i === 2 ? 'logical arguments' : 'social proof',
        generatedAt: new Date().toISOString()
      }
    });
  }
  
  return {
    success: true,
    variations,
    metadata: {
      originalContent: originalContent.substring(0, 50) + '...',
      count,
      tone,
      targetAudience,
      brandStyle,
      generatedAt: new Date().toISOString()
    }
  };
}

// Analyze content for improvement suggestions
export async function analyzeContent(content: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  return {
    success: true,
    analysis: {
      readabilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
      tone: {
        formal: Math.floor(Math.random() * 40) + 30, // 30-70%
        friendly: Math.floor(Math.random() * 30) + 20, // 20-50%
        persuasive: Math.floor(Math.random() * 40) + 60 // 60-100%
      },
      suggestions: [
        "Consider using more action verbs to increase engagement",
        "The second paragraph could be more concise",
        "Add more specific benefits to strengthen your value proposition"
      ],
      strengths: [
        "Clear call to action",
        "Good use of emotional appeals",
        "Well-structured content flow"
      ]
    },
    metadata: {
      contentLength: content.length,
      analyzedAt: new Date().toISOString()
    }
  };
}
