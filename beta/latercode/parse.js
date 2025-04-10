// Function to extract the total from receipt text
function extractTotal(receiptText) {
    // Define multiple regex patterns to handle different variations
    const patterns = [
        /\b(?:TOTAL|total|Total|PRICE|price|Price|AMOUNT|amount|Amount|BALANCE DUE|balance due|Balance Due)\s*[:\-]?\s*[\$\u20AC\u00A3]?\s*([\d,]+\.?\d{0,2})/i,  // Matches TOTAL, PRICE, AMOUNT, BALANCE DUE with optional currency symbol
        /\b(?:TAX\s*AND\s*TOTAL|tax\s*and\s*total|Grand\s*Total|grand\s*total|TOTAL DUE|total due|Total Due)\s*[:\-]?\s*[\$\u20AC\u00A3]?\s*([\d,]+\.?\d{0,2})/i,  // Matches variations of tax and total, grand total, total due
        /\b(?:TOTAL\s*AMOUNT|total\s*amount|Total\s*Amount|AMOUNT\s*DUE|amount\s*due|Amount\s*Due)\s*[:\-]?\s*[\$\u20AC\u00A3]?\s*([\d,]+\.?\d{0,2})/i  // Matches variations of total amount, amount due
    ];

    for (const pattern of patterns) {
        const match = receiptText.match(pattern);
        if (match) {
            // Remove commas and convert to float
            return parseFloat(match[1].replace(/,/g, ''));
        }
    }

    return null; // No total found
}