export function convertToTitleCase(text: string): string {
  // Split the text by underscores and spaces
  const words = text.split(/[_\s]+/);

  // Capitalize the first letter of each word and join them with a space
  const titleCaseText = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return titleCaseText;
}

export function roundStringToDecimalPlaces(
  inputString: string,
  decimalPlaces: number
): number {
  // Parse the input string to a float and round it to the specified decimal places
  const roundedNumber = parseFloat(inputString).toFixed(decimalPlaces);

  // Convert the rounded number back to a string
  const roundedString = roundedNumber.toString();
  const trimmedNum = parseFloat(roundedString);

  return trimmedNum;
}

export const calculateSeo = (checks: Record<string, boolean>): string => {
  // Calculate an SEO score based on specific checks
  let score = 0;
  if (checks.seo_friendly_url) score += 0;
  if (checks.seo_friendly_url_characters_check) score += 20;
  if (checks.seo_friendly_url_dynamic_check) score += 20;
  if (checks.seo_friendly_url_keywords_check) score += 20;
  if (checks.seo_friendly_url_relative_length_check) score += 20;
  return score.toString();
};

export const calculatePerformace = (pageData: Record<string, any>): string => {
  // Define weights for each performance metric
  const weightTimeToInteractive = 0.2;
  const weightLargestContentfulPaint = 0.2;
  const weightFirstInputDelay = 0.3;
  const weightDurationTime = 0.3;

  // Extract relevant metrics from the pageData object
  const {
    time_to_interactive,
    largest_contentful_paint,
    first_input_delay,
    duration_time,
  } = pageData;

  // Calculate the performance score for each metric (normalized between 0 and 1)
  const scoreTimeToInteractive = 1 - time_to_interactive / 5000; // Adjust the denominator as needed
  const scoreLargestContentfulPaint = 1 - largest_contentful_paint / 5000; // Adjust the denominator as needed
  const scoreFirstInputDelay = 1 - first_input_delay / 1000; // Adjust the denominator as needed
  const scoreDurationTime = 1 - duration_time / 10000; // Adjust the denominator as needed

  // Calculate the weighted sum of scores
  const weightedSum =
    weightTimeToInteractive * scoreTimeToInteractive +
    weightLargestContentfulPaint * scoreLargestContentfulPaint +
    weightFirstInputDelay * scoreFirstInputDelay +
    weightDurationTime * scoreDurationTime;

  // Calculate the performance percentage (scaled to 100)
  const performancePercentage =
    (weightedSum /
      (weightTimeToInteractive +
        weightLargestContentfulPaint +
        weightFirstInputDelay +
        weightDurationTime)) *
    100;

  return performancePercentage.toFixed(2);
};

export const calculateBestPracticesPercentage = (
  checks: Record<string, boolean>
): string => {
  // Define weights for each best practice check
  const weights: Record<string, number> = {
    high_loading_time: 10,
    is_https: 10,
    has_html_doctype: 5,
    canonical: 5,
    meta_charset_consistency: 5,
    has_render_blocking_resources: 10,
    low_content_rate: -5,
    seo_friendly_url: 10,
    seo_friendly_url_characters_check: 5,
    seo_friendly_url_dynamic_check: 5,
    seo_friendly_url_keywords_check: 5,
    seo_friendly_url_relative_length_check: 5,
    no_image_alt: -5,
    no_image_title: -5,
  };

  let totalScore = 0;
  let totalWeight = 0;

  // Calculate a percentage based on best practice checks and weights
  for (const key in weights) {
    if (checks[key]) {
      totalScore += weights[key];
      totalWeight += Math.abs(weights[key]);
    }
  }

  const bestPracticesPercentage = (totalScore / totalWeight) * 100;

  if (bestPracticesPercentage < 0) {
    return "0";
  } else if (bestPracticesPercentage > 100) {
    return "100";
  }

  return bestPracticesPercentage.toFixed(2);
};
