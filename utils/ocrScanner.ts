/**
 * OCR Scanner for food labels using Tesseract.js
 */
import Tesseract from 'tesseract.js';

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  rawText: string;
}

/**
 * Extract nutrition information from image
 */
export const scanFoodLabel = async (
  imageFile: File | string,
  onProgress?: (progress: number) => void
): Promise<NutritionInfo> => {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress * 100);
        }
      },
    });

    const text = result.data.text;
    return parseNutritionText(text);
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to scan food label');
  }
};

/**
 * Parse nutrition information from OCR text
 */
const parseNutritionText = (text: string): NutritionInfo => {
  const lowerText = text.toLowerCase();
  const lines = text.split('\n');

  const extractNumber = (pattern: RegExp): number | undefined => {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(/[^\d.]/g, ''));
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  };

  return {
    calories: extractNumber(/calories?[:\s]+(\d+)/i) || extractNumber(/(\d+)\s*cal/i),
    protein: extractNumber(/protein[:\s]+(\d+\.?\d*)/i) || extractNumber(/(\d+\.?\d*)\s*g?\s*protein/i),
    carbs: extractNumber(/carbohydrate[s]?[:\s]+(\d+\.?\d*)/i) || extractNumber(/(\d+\.?\d*)\s*g?\s*carb/i),
    fat: extractNumber(/total\s*fat[:\s]+(\d+\.?\d*)/i) || extractNumber(/fat[:\s]+(\d+\.?\d*)/i),
    fiber: extractNumber(/fiber[:\s]+(\d+\.?\d*)/i) || extractNumber(/(\d+\.?\d*)\s*g?\s*fiber/i),
    sugar: extractNumber(/sugar[s]?[:\s]+(\d+\.?\d*)/i) || extractNumber(/(\d+\.?\d*)\s*g?\s*sugar/i),
    sodium: extractNumber(/sodium[:\s]+(\d+)/i) || extractNumber(/(\d+)\s*mg?\s*sodium/i),
    servingSize: extractServingSize(lines),
    rawText: text,
  };
};

const extractServingSize = (lines: string[]): string | undefined => {
  for (const line of lines) {
    if (line.toLowerCase().includes('serving')) {
      return line.trim();
    }
  }
  return undefined;
};

/**
 * Evaluate if food fits user's dietary goals
 */
export interface DietaryGoals {
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  maxFat?: number;
  maxSugar?: number;
  maxSodium?: number;
  dietType?: 'keto' | 'low-carb' | 'high-protein' | 'balanced' | 'vegan';
  restrictions?: string[]; // e.g., ['gluten', 'dairy', 'nuts']
}

export interface DietSuitability {
  suitable: boolean;
  score: number; // 0-100
  warnings: string[];
  recommendations: string[];
}

export const evaluateFoodSuitability = (
  nutrition: NutritionInfo,
  goals: DietaryGoals
): DietSuitability => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check calories
  if (goals.maxCalories && nutrition.calories && nutrition.calories > goals.maxCalories) {
    warnings.push(`High in calories (${nutrition.calories} cal). Exceeds your daily goal.`);
    score -= 20;
  }

  // Check protein
  if (goals.minProtein && nutrition.protein && nutrition.protein < goals.minProtein) {
    warnings.push(`Low in protein (${nutrition.protein}g). Consider adding protein sources.`);
    score -= 10;
  } else if (nutrition.protein && nutrition.protein > 20) {
    recommendations.push('Good protein content!');
  }

  // Check carbs
  if (goals.maxCarbs && nutrition.carbs && nutrition.carbs > goals.maxCarbs) {
    warnings.push(`High in carbs (${nutrition.carbs}g). May not fit your low-carb goal.`);
    score -= 15;
  }

  // Check fat
  if (goals.maxFat && nutrition.fat && nutrition.fat > goals.maxFat) {
    warnings.push(`High in fat (${nutrition.fat}g).`);
    score -= 10;
  }

  // Check sugar
  if (goals.maxSugar && nutrition.sugar && nutrition.sugar > goals.maxSugar) {
    warnings.push(`High in sugar (${nutrition.sugar}g). Consider alternatives.`);
    score -= 15;
  }

  // Check sodium
  if (goals.maxSodium && nutrition.sodium && nutrition.sodium > goals.maxSodium) {
    warnings.push(`High in sodium (${nutrition.sodium}mg). Watch your salt intake.`);
    score -= 10;
  }

  // Diet-specific checks
  if (goals.dietType === 'keto' && nutrition.carbs && nutrition.carbs > 10) {
    warnings.push('Not keto-friendly due to high carb content.');
    score -= 25;
  }

  if (goals.dietType === 'high-protein' && nutrition.protein && nutrition.protein < 15) {
    warnings.push('Low protein content for high-protein diet.');
    score -= 20;
  }

  // General recommendations
  if (warnings.length === 0) {
    recommendations.push('This food fits well with your dietary goals!');
  }

  if (nutrition.fiber && nutrition.fiber > 5) {
    recommendations.push('Good source of fiber!');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    suitable: score >= 60,
    score,
    warnings,
    recommendations,
  };
};
