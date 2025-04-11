/**
 * Calculates the Levenshtein distance between two strings.
 * (Implementation remains the same)
 */
function levenshteinDistance(a, b) {
    if (!a || !b) return (a || b).length;
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }
  
  /**
   * Checks if a text segment likely matches any of the target keywords.
   * (Implementation remains the same)
   */
  function isKeywordMatch(text, keywords, maxDistance = 2) {
      const normalizedText = text.toUpperCase().trim();
      if (!normalizedText) return false;
      for (const keyword of keywords) {
          if (normalizedText.includes(keyword)) return true;
          if (levenshteinDistance(normalizedText, keyword) <= maxDistance) return true;
          const words = normalizedText.split(/[\s-]+/);
          for (const word of words) {
              const wordMaxDist = Math.min(maxDistance, Math.floor(keyword.length / 3)) || 1;
              if (word === keyword || levenshteinDistance(word, keyword) <= wordMaxDist) return true;
          }
      }
      return false;
  }
  
  
  /**
   * Finds all occurrences of a regex pattern in a string, returning matches with indices.
   * (Implementation remains the same)
   */
  function findAllMatches(regex, str) {
      const matches = [];
      let match;
      if (!regex.global) {
          console.warn("Regex needs global flag to find all matches.");
          regex = new RegExp(regex.source, regex.flags + 'g');
      }
      while ((match = regex.exec(str)) !== null) {
          matches.push({
              text: match[0],
              value: match[1] || match[0],
              index: match.index,
              endIndex: match.index + match[0].length
          });
      }
      return matches;
  }
  
  /**
   * Extracts potential currency amounts with their start/end indices.
   * (Implementation remains the same as v3)
   */
  function extractPotentialAmounts(text) {
      const amounts = [];
      const foundIndices = new Set();
      const regex1 = /(?:[$£€]|S(?=\s*\d))\s*(-?(?:\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\d+\.\d{2}))/gi;
      const regex1b = /(?:[$£€]|S(?=\s*\d))\s*(-?\d{1,3}(?:[,\s]\d{3})*|\d+)\b(?![\.,\d])/gi;
      const regex2 = /(?<!\d[:\/\.])\b(-?\d+\.\d{2})\b(?!\s*(?:AM|PM|BY|EXP|%|\.\d)|:\d)/gi;
      const regex3 = /(?<!\d[:\/\.])\b(-?\d+,\d{2})\b(?!\s*(?:AM|PM|BY|EXP|%)|\.?\d|:\d)/gi;
      const regexes = [regex1, regex1b, regex2, regex3];
      let regexIndex = 0;
  
      for (const regex of regexes) {
          let match;
          while ((match = regex.exec(text)) !== null) {
              if (foundIndices.has(match.index)) continue;
              let amountString = match[1] || match[0];
              let isCommaDecimal = regexIndex === 3;
              if (isCommaDecimal) {
                  amountString = amountString.replace(/\./g, '').replace(',', '.');
              } else {
                  amountString = amountString.replace(/[,\s]/g, '');
              }
              if (/^-?\d+(\.\d+)?$/.test(amountString)) {
                  const amount = parseFloat(amountString);
                  if (!isNaN(amount)) {
                      amounts.push({ amount, index: match.index, endIndex: match.index + match[0].length });
                      foundIndices.add(match.index);
                  }
              }
          }
          regexIndex++;
      }
  
      const currentYear = new Date().getFullYear();
      const filteredAmounts = amounts.filter(item => {
           const amount = item.amount;
           if (amount > 1900 && amount < currentYear + 5 && Math.floor(amount) === amount) {
               const yearRegex = new RegExp(`\\b${amount}\\b`);
               const contextWindow = text.substring(Math.max(0, item.index - 15), Math.min(text.length, item.endIndex + 15));
               const contextRegex = new RegExp(`(?:[$£€S]|TOTAL|TAX|SUBTOTAL)\\s*${amount}|${amount}\\s*(?:%|TAX|TOTAL|SUBTOTAL)`, 'i');
               if (yearRegex.test(text.substring(item.index, item.endIndex)) && !contextRegex.test(contextWindow)) {
                    console.log(`Filtering out potential year: ${amount} at index ${item.index}`);
                    return false;
               }
           }
           return true;
       });
  
      filteredAmounts.sort((a, b) => a.index - b.index);
      return filteredAmounts;
  }
  
  /**
   * Checks if two ranges overlap.
   * @param {{index: number, endIndex: number}} range1
   * @param {{index: number, endIndex: number}} range2
   * @returns {boolean} True if they overlap.
   */
  function checkOverlap(range1, range2) {
      return range1.index < range2.endIndex && range1.endIndex > range2.index;
  }
  
  
  /**
   * Extracts the total amount from OCR'd receipt text using index-based analysis,
   * overlap checks, and heuristics.
   * @param {string} ocr_text - The potentially multi-line string from OCR.
   * @returns {number | null} The extracted total amount, or null if not reliably found.
   */
  function extractTotal(ocr_text) {
      if (!ocr_text || typeof ocr_text !== 'string') {
          console.error("Input error: ocr_text must be a non-empty string.");
          return null;
      }
      const textLength = ocr_text.length;
  
      // --- Define Keywords & Build Regex ---
      // Added more specific total keywords and exclusions
      const strongTotalKeywords = ["GRAND TOTAL", "BALANCE DUE", "AMOUNT PAYABLE", "TOTAL DUE", "TOTAL CHARGE"];
      const normalTotalKeywords = ["TOTAL", "AMOUNT DUE", "BALANCE", "TO PAY", "CHARGE", "TOTAI", "TO TAL", "T0TAL", "TUTAL", "TOTL", "AM0UNT", "BAL ANCE", "T0TAL DUE", "TDTAL", "TOTAL:", "TOTALS"];
      const subtotalKeywords = ["SUBTOTAL", "SUB TOTAL", "SUB-TOTAL", "ITEM TOTAL", "NET TOTAL", "TOTAL ITEMS", "SUETOTAL", "SUBTOTAI", "SUBT0TAL", "SU B TOTAL", "SUBTOTAL:", "SUBTOT."];
      // Added more exclusion keywords
      const exclusionKeywords = ["TAX", "VAT", "TIP", "GRATUITY", "SVC CHG", "SERVICE CHARGE", "DISCOUNT", "SAVINGS", "CHANGE", "CHANGE DUE", "CASH TEND", "CASH", "CREDIT CARD", "VISA", "MC", "MASTERCARD", "AMEX", "AMERICAN EXPRESS", "PAID", "PAYMENT", "AUTH", "REFERENCE", "CHECK", "CHEQUE", "POINTS", "REWARD", "TAXABLE", "NON TAXABLE", "GST", "PST", "HST", "QTY", "QUANTITY", "ITEM", "#", "INVOICE NO", "ORDER NO", "TABLE NO", "EXP", "VALID", "CARD NO", "ACCOUNT NO", "MEMBER NO", "TA X", "T1P", "OISCOUNT", "CHANOE", "PAIO", "PAYMEHT", "CR CARD", "CREDITCARD", "ITEM#"];
      const ambiguousKeywords = ["AMT"]; // Keywords like AMT handled via scoring penalty
  
      const createKeywordRegex = (keywords) => new RegExp(`(?<!\\w)(${keywords.join('|')})(?!\\w)`, 'gi');
  
      const strongTotalRegex = createKeywordRegex(strongTotalKeywords);
      const normalTotalRegex = createKeywordRegex(normalTotalKeywords);
      const subtotalRegex = createKeywordRegex(subtotalKeywords);
      const exclusionRegex = createKeywordRegex(exclusionKeywords);
      const ambiguousRegex = createKeywordRegex(ambiguousKeywords);
  
      // --- Find All Amounts and Keywords with Indices ---
      const potentialAmountInfos = extractPotentialAmounts(ocr_text);
      const strongTotalMatches = findAllMatches(strongTotalRegex, ocr_text);
      const normalTotalMatches = findAllMatches(normalTotalRegex, ocr_text);
      const allTotalMatches = [...strongTotalMatches, ...normalTotalMatches].sort((a,b) => a.index - b.index); // Combine and sort
      const subtotalMatches = findAllMatches(subtotalRegex, ocr_text);
      const exclusionMatches = findAllMatches(exclusionRegex, ocr_text);
      const ambiguousMatches = findAllMatches(ambiguousRegex, ocr_text);
  
      // --- Determine Contextual Indices ---
      let lastSubtotalKeywordEndIndex = -1;
      if (subtotalMatches.length > 0) {
          lastSubtotalKeywordEndIndex = subtotalMatches[subtotalMatches.length - 1].endIndex;
      }
      let lastTotalKeywordIndex = -1;
      let lastTotalKeywordEndIndex = -1;
      if (allTotalMatches.length > 0) {
          lastTotalKeywordIndex = allTotalMatches[allTotalMatches.length - 1].index;
          lastTotalKeywordEndIndex = allTotalMatches[allTotalMatches.length - 1].endIndex;
      }
  
      const proximityThreshold = 15; // Max distance for "close"
      const adjacencyThreshold = 5;  // Max distance for "adjacent"
  
      // --- Create Candidates with Context ---
      const candidates = potentialAmountInfos.map(amtInfo => {
          const amountRange = { index: amtInfo.index, endIndex: amtInfo.endIndex };
  
          // Check proximity and adjacency to different keyword types
          const isAdjacentTo = (keywordMatches) => keywordMatches.some(kw => {
              const distance = Math.max(0, amtInfo.index - kw.endIndex, kw.index - amtInfo.endIndex);
              return distance < adjacencyThreshold;
          });
          const isCloseTo = (keywordMatches) => keywordMatches.some(kw => {
              const distance = Math.max(0, amtInfo.index - kw.endIndex, kw.index - amtInfo.endIndex);
              return distance < proximityThreshold;
          });
          const overlapsWith = (keywordMatches) => keywordMatches.some(kw => checkOverlap(amountRange, kw));
  
          const isAdjacentStrongTotal = isAdjacentTo(strongTotalMatches);
          const isCloseStrongTotal = isCloseTo(strongTotalMatches);
          const isCloseNormalTotal = isCloseTo(normalTotalMatches);
          const isCloseToAnyTotal = isCloseStrongTotal || isCloseNormalTotal;
  
          const isCloseToSubtotal = isCloseTo(subtotalMatches);
          const overlapsExclusion = overlapsWith(exclusionMatches);
          // Strict exclusion: overlaps or is close to exclusion AND NOT close to any total
          const isCloseToExclusionStrict = (overlapsExclusion || isCloseTo(exclusionMatches)) && !isCloseToAnyTotal;
          const isCloseToAmbiguous = isCloseTo(ambiguousMatches);
  
          return {
              amount: amtInfo.amount,
              startIndex: amtInfo.index,
              endIndex: amtInfo.endIndex,
              isAdjacentStrongTotal: isAdjacentStrongTotal, // New flag
              isCloseToAnyTotal: isCloseToAnyTotal,
              isCloseToSubtotal: isCloseToSubtotal,
              isCloseToExclusionStrict: isCloseToExclusionStrict,
              overlapsExclusion: overlapsExclusion, // Keep for scoring penalty
              isCloseToAmbiguous: isCloseToAmbiguous
          };
      });
  
      // --- Filtering and Scoring ---
      if (candidates.length === 0) { console.log("No potential numerical amounts found."); return null; }
      console.log("Initial candidates (v4):", JSON.stringify(candidates.map(c => ({amt: c.amount, idx: c.startIndex, adjStrTotal: c.isAdjacentStrongTotal, nearTotal: c.isCloseToAnyTotal, nearSub: c.isCloseToSubtotal, nearExcl: c.isCloseToExclusionStrict, overlapsExcl: c.overlapsExclusion})), null, 2));
      console.log("Last Subtotal End Index:", lastSubtotalKeywordEndIndex);
      console.log("Last Total Start Index:", lastTotalKeywordIndex);
  
      const scoredCandidates = candidates
          // Apply filters
          .filter(c => !c.isCloseToExclusionStrict)
          .filter(c => !(c.isCloseToSubtotal && !c.isCloseToAnyTotal))
          .filter(c => !(lastSubtotalKeywordEndIndex !== -1 && c.startIndex <= lastSubtotalKeywordEndIndex && !c.isCloseToAnyTotal))
  
          .map(c => {
              let score = 0;
              score += 1; // Base
  
              // --- Positive Scores ---
              if (c.isAdjacentStrongTotal) score += 120; // Highest bonus for adjacency to strong total
              else if (c.isCloseToAnyTotal) score += 80; // General bonus for being close to any total
  
              // Appears *after* the last subtotal keyword's end position
              if (lastSubtotalKeywordEndIndex !== -1 && c.startIndex > lastSubtotalKeywordEndIndex) score += 50;
  
              // Proximity to the *last seen* total keyword instance specifically (refined)
              if (lastTotalKeywordIndex !== -1) {
                   const distanceToLastTotal = Math.max(0, c.startIndex - lastTotalKeywordEndIndex, lastTotalKeywordIndex - c.endIndex);
                   if (distanceToLastTotal < adjacencyThreshold) score += 60; // Adjacent to *last* total keyword
                   else if (distanceToLastTotal < proximityThreshold) score += 40; // Close to *last* total keyword
                   else if (distanceToLastTotal < proximityThreshold * 3) score += 20; // Moderately close
               }
  
              // Position bias (using start index relative to text length)
              const relativePosition = c.startIndex / textLength;
              if (relativePosition > 0.6) score += 25;
              else if (relativePosition > 0.4) score += 10;
  
              // --- Negative Scores ---
              // Stronger penalty for overlapping an exclusion keyword
              if (c.overlapsExclusion) score -= 60;
              // Penalty if close to ambiguous keyword AND not close to total keyword
              if (c.isCloseToAmbiguous && !c.isCloseToAnyTotal) score -= 20;
              // Minor penalty for small amounts unless close to total
              if (Math.abs(c.amount) < 1.00 && !c.isCloseToAnyTotal) score -= 5;
  
              // --- Tie-breaker --- (Position is primary, amount magnitude minimal)
              score += relativePosition * 10; // Positional tie-breaker (0-10 points)
              score += Math.min(Math.abs(c.amount) / 1000, 0.5); // Amount magnitude tie-breaker (0-0.5 points)
  
              return { ...c, score };
          })
          .sort((a, b) => {
               // Primary sort: score descending
               if (Math.abs(a.score - b.score) > 0.1) {
                   return b.score - a.score;
               }
               // Secondary sort: startIndex descending (prefer later items if score is tied)
               return b.startIndex - a.startIndex;
           });
  
      console.log("\nScored & Filtered Candidates (v4):", JSON.stringify(scoredCandidates.map(c => ({amt: c.amount, idx: c.startIndex, score: c.score.toFixed(2), adjStrTotal: c.isAdjacentStrongTotal, nearTotal: c.isCloseToAnyTotal})), null, 2));
  
      // --- Final Selection ---
      if (scoredCandidates.length > 0) {
          let bestCandidate = scoredCandidates[0];
          let reason = "Highest Score"; // Default reason
  
          // --- Heuristic Check: Largest Amount After Subtotal ---
          // Apply only if subtotal exists and best candidate isn't super high score or adjacent to strong total
          if (lastSubtotalKeywordEndIndex !== -1 && bestCandidate.amount >= 0 && !bestCandidate.isAdjacentStrongTotal && bestCandidate.score < 150) {
              const candidatesAfterSubtotal = scoredCandidates.filter(c => c.startIndex > lastSubtotalKeywordEndIndex && c.amount > 0);
              if (candidatesAfterSubtotal.length > 0) {
                   candidatesAfterSubtotal.sort((a, b) => b.amount - a.amount); // Find largest amount after subtotal among scored candidates
                   const largestAfterSubtotal = candidatesAfterSubtotal[0];
  
                   // Condition: If the current best is significantly smaller than the largest after subtotal,
                   // AND the largest after subtotal has a decent score itself.
                   const largestAfterSubtotalHasDecentScore = largestAfterSubtotal.score > 50; // Threshold for decent score
  
                   if (largestAfterSubtotal.amount > bestCandidate.amount && // Must be strictly larger
                       bestCandidate.amount < largestAfterSubtotal.amount * 0.85 && // Best is < 85% of largest after sub
                       largestAfterSubtotal.score > bestCandidate.score * 0.5 && // Largest score isn't drastically lower
                       largestAfterSubtotalHasDecentScore)
                   {
                       console.warn(`Applying heuristic: Best candidate (${bestCandidate.amount}, score ${bestCandidate.score.toFixed(2)}) seems small compared to largest after subtotal (${largestAfterSubtotal.amount}, score ${largestAfterSubtotal.score.toFixed(2)}). Switching.`);
                       bestCandidate = largestAfterSubtotal;
                       reason = "Largest After Subtotal Heuristic";
                   }
              }
          }
          // --- End Heuristic Check ---
  
          console.log(`Selected total: ${bestCandidate.amount} from index ${bestCandidate.startIndex} (Score: ${bestCandidate.score.toFixed(2)}, Reason: ${reason})`);
          return bestCandidate.amount;
  
      } else {
          console.log("No suitable candidates found after filtering and scoring.");
           // Last Resort Logic
           if (potentialAmountInfos.length > 0) {
               const plausibleCandidates = potentialAmountInfos
                   .filter(c => c.amount > 0)
                   .filter(c => !exclusionMatches.some(kw => checkOverlap({index: c.startIndex, endIndex: c.endIndex}, kw)));
  
               if (plausibleCandidates.length > 0) {
                   plausibleCandidates.sort((a, b) => {
                       if (b.startIndex !== a.startIndex) return b.startIndex - a.startIndex;
                       return b.amount - a.amount;
                   });
                   console.warn(`LAST RESORT: No candidate survived scoring. Returning largest positive amount found late: ${plausibleCandidates[0].amount}`);
                   return plausibleCandidates[0].amount;
               }
           }
          return null;
      }
  }
    
    
    // --- Example Usage (Including previous and new test cases) ---
    
    const ocr_text_1 = `RESTUARANT
    Blvd
    Suita Monica. CA
    oe;2ö PM
    sene. MIGUEL TAB
    Americano
    3819 exp. 09/22
    SUETOTAL
    $3.19
    TO TAL
    SOG9
    S8.86
    THANK you`;
    
    const ocr_text_2 = `Store Name
    123 Main St
    Anytown, USA
    
    Date: 04/07/2025 Time: 14:50
    
    Item 1 ................. $10.00
    Item 2 ................. $5.50
    Item 3 ................. $2.25
    
    SUB TOTAL ............. $17.75
    TAX (8%) .............. $1.42
    TIP SUGGESTION ........ $3.00
    
    TOTAL AMOUNT ......... $19.17
    
    Payment Method: VISA **** 1234
    THANK YOU!`;
    
    const ocr_text_3 = `CAFE XYZ
    Order #123
    CASHIER: Bob
    
    Latte             4.50
    Muffin            3.00
    Subtotai          7.50
    Sales Tax         0.60
    TOTAL             8.10
    
    Cash Tendered    10.00
    Change Due        1.90`;
    
    const ocr_text_4 = `INVOICE
    Customer: ACME Corp
    
    Service A    150.00
    Service B    200.00
    
    Sub-Total    350.00
    Discount 10% -35.00
    Tax (5%)      15.75
    
    BALANCE DUE  330.75
    
    Paid by Check #5678`;
    
    const ocr_text_5 = `GARAGE SALE
    ITEM      PRICE
    Lamp      15.00
    Chair     S25.OO
    Book       S 2.00
    TOTAL     42.00`;
    
    const ocr_text_6 = `RECEIPT
    Item A   1000,00
    Item B    500.50
    SUBTOTAL 1500.50
    VAT 20%   300.10
    T0TAL    1800.60`;
    
    const ocr_text_7 = `Grocery Mart
    Apple       1.00
    Banana      0.50
    Orange      0.75
    SUBTOTAL    2.25
    TAX         0.18
    TOTAL       2.43
    PAID        S2.43`;
    
    const ocr_text_8 = `Hardware Store
    Hammer   12.99
    Nails     3.49
    SUBTOT   16.48
    TAX       1.32
    TOTAL    17.80
    CREDIT CARD PAYMENT 17.8O`;
    
    const ocr_text_no_total = `Items List
    Apples - 2
    Oranges - 3
    Thank you`;
    
    const ocr_text_only_sub = `My Store
    Item 1   5.00
    Item 2   6.00
    SUBTOTAL 11.00`;
    
    const ocr_text_negative = `RETURN RECEIPT
    Item X   -20.00
    TAX      -1.60
    TOTAL    -21.60`;
    
    const ocr_text_ambiguous = `SERVICE
    Charge A  50.00
    Charge B  50.00
    TOTAL     100.00
    CREDIT    100.00`;
    
    // --- Failing Cases ---
    const ocr_text_fail_1 = `AROMA CAFE 1211 Green Street New York, NY 10005 12/27/2019 00:26 PM TAB a AMEX HOST MAGGIE 53.19 Atmond S cone Bottle Water AMT S8.70 SUBTOTAL SS. BALANCE I I I II I I II I I I I I I I I I I I I I I I I I I I I Ill`;
    const ocr_text_fail_2 = `RECEIPT COMPANY NAME Address: pate: Manager: Description Orange Juice Apples Tomato Fish Beef Onion Cheese Tax TOTAL Lorem ipsum 8/24 MM,'DD'YYYY Lorem Ipsum Price $215 $3.50 $689 $10 no $125 $340 $29.69 THANK YOU 123456778963578021`;
    
    
  //   console.log("--- Receipt 1 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_1)); // Expected: 8.86
  //   console.log("\n--- Receipt 2 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_2)); // Expected: 19.17
  //   console.log("\n--- Receipt 3 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_3)); // Expected: 8.10
  //   console.log("\n--- Receipt 4 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_4)); // Expected: 330.75
  //   console.log("\n--- Receipt 5 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_5)); // Expected: 42.00
  //   console.log("\n--- Receipt 6 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_6)); // Expected: 1800.60
  //   console.log("\n--- Receipt 7 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_7)); // Expected: 2.43
  //   console.log("\n--- Receipt 8 ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_8)); // Expected: 17.80
  //   console.log("\n--- Receipt No Total ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_no_total)); // Expected: null
  //   console.log("\n--- Receipt Only Subtotal ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_only_sub)); // Expected: null
  //   console.log("\n--- Receipt Negative Total ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_negative)); // Expected: -21.60
  //   console.log("\n--- Receipt Ambiguous ---");
  //   console.log("Extracted Total:", extractTotal(ocr_text_ambiguous)); // Expected: 100.00
    
  //   console.log("\n--- Failed Case 1 (AROMA) ---");
  //   console.log("Input:\n" + ocr_text_fail_1);
  //   console.log("Extracted Total:", extractTotal(ocr_text_fail_1)); // Expected: 8.70
    
  //   console.log("\n--- Failed Case 2 (COMPANY NAME) ---");
  //   console.log("Input:\n" + ocr_text_fail_2);
  //   console.log("Extracted Total:", extractTotal(ocr_text_fail_2)); // Expected: 29.69  
    
  /**
   * Asynchronously performs Optical Character Recognition (OCR) on an image input.
   *
   * @param {HTMLInputElement} imageInput - The input element containing the image file.
   * @returns {Promise<string|Error>} - A promise that resolves to the parsed text from the image, or an error if the operation fails.
   *
   * @throws {Error} If no file is selected or if the file size exceeds 10MB.
   */
  async function OCR(imageInput) {
      function toBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
  
      async function resizeImage(file, maxSizeKB = 1024) {
          const maxSizeBytes = maxSizeKB * 1024;
          const img = new Image();
          const reader = new FileReader();
        
          // Step 1: Read file to base64
          const base64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        
          img.src = base64;
        
          return new Promise((resolve, reject) => {
            img.onload = function() {
              let width = img.width;
              let height = img.height;
              
              // Step 2: Resize only once to fit within size limit
              const scaleFactor = Math.sqrt(file.size / maxSizeBytes);  // Adjust scale to fit under limit
              width = width / scaleFactor;
              height = height / scaleFactor;
        
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = width;
              canvas.height = height;
              
              ctx.drawImage(img, 0, 0, width, height);
              
              // Step 3: Convert resized image back to base64
              canvas.toBlob((blob) => {
                if (blob.size <= maxSizeBytes) {
                  resolve(blob); // Return the resized image blob
                } else {
                  reject(new Error('Resized image still too large'));
                }
              }, 'image/jpeg', 0.8); // Compress as JPEG (optional)
            };
            img.onerror = reject;
          });
      }
      
      let b64 = '';  
      if (imageInput.files.length > 0) {
        let f = imageInput.files[0];
        if (f.size > 1024 * 1024) { // Over 1 MB
            console.log('File too large, resizing...');
        
            try {
                // Resize the image until it's under the 1 MB limit
                f = await resizeImage(f);
                console.log('Image resized successfully!');
            } catch (error) {
                return new Error('Failed to resize image');
            }
        }
        const file = f;
        if (file.size > 10 * 1024 * 1024) {
          return new Error('File too large');
        }
        try {
          // Convert the file to a base64 string
          const base64Image = await toBase64(file);
          b64 = base64Image;
        } catch (error) {
          // Return the error if the conversion fails
          return error;
        }
      } else {
        return new Error('No file selected');
      }
      
      const url = 'https://api.ocr.space/parse/image';
      let data = new FormData()
      data.set("base64Image", b64)
      data.set("apikey", 'K84105813588957')
      data.set("OCREngine", "2");
    
      try {
        const response = await fetch(url, {method: 'POST', body: data});
        const json = await response.json();
        if (json?.OCRExitCode !== 1 || !json?.ParsedResults?.[0]) {console.error(json); return new Error('OCR failed or no text found')}
        return json['ParsedResults'][0]['ParsedText'].replaceAll('\r\n', ' ');
      } catch (error) {
        return error;
      }
    }
  
  let progress = null;
  /**
   * CODES:
   * 
   * 0: No progress
   * 1: Started
   * 100: Running OCR
   * 200: OCR Done
   * 300: OCR Success
   * 400: Extracting total
   * 500: Total extracted
   * 600: Done
   * 
   * ERROR CODES:
   * 900: OCR Error detected
   * 901: Unknown Error Detected
   */
  let progressCode = 0;
  
    function resetProgress() {
      progress = null;
      progressCode = 0;
    }

    function getProgressCode() {
        return progressCode;
    }
  
    async function OCRIMAGE(imageInput) {
      progressCode = 1;
      progress = "Started";
      let start = Date.now();
    
      try {
        progressCode = 100;
        progress = "Running OCR";
        const result = await OCR(imageInput); // ^ await the promise
        progressCode = 200;
        progress = "OCR Done";
        console.log("RESULT", result);
        console.log("OCRIMAGE Time:", Date.now() - start, "ms");
    
        if (result?.message && result?.name === 'Error') {
          progressCode = 900;
          progress = "OCR Error detected";
          console.error('Error:', result);
          throw new Error('OCR failed'); // & throw instead of returning Error object
        } else {
          progressCode = 300;
          progress = "OCR Success";
          console.log('OCR Result:', result);
          progressCode = 400;
          progress = "Extracting total";
          const total = extractTotal(result);
          progressCode = 500;
          progress = "Total extracted";
          console.log('Extracted Total:', total);
          progressCode = 600;
          progress = "Done";
          return total;
        }
      } catch (err) {
        progressCode = 901;
        progress = "Unknown Error Detected";
        console.error("OCRIMAGE error:", err);
        throw err;
      }
    } 
  
  console.log("OCRIMAGE READY!");
  window.OCRIMAGE = OCRIMAGE;
  window.resetProgress = resetProgress;
  window.getProgressCode = getProgressCode;
  // ^ THIS VERSION PASSED 5 of 6 TESTS