// Function to extract the total from receipt text
function extractTotal(receiptText) {
    // Define multiple regex patterns to handle different variations
    const patterns = [
        /\b(?:TOTAL|total|Total|PRICE|price|Price|AMOUNT|amount|Amount)\s*[:\-]?\s*[\$\u20AC\u00A3]?\s*([\d,]+\.?\d{0,2})/i,  // Matches TOTAL, PRICE, AMOUNT with optional currency symbol
        /\b(?:TAX\s*AND\s*TOTAL|tax\s*and\s*total|Grand\s*Total|grand\s*total)\s*[\$\u20AC\u00A3]?\s*([\d,]+\.?\d{0,2})/i  // Matches variations of tax and total, grand total
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
