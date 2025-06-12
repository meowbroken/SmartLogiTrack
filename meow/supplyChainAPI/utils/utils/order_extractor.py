# supplyChainAPI/utils/order_extractor.py
import re

def extract_order_details_unstructured(email_text: str) -> dict:
    """
    Attempts to extract order details (inventory and quantity) from unstructured text.

    This function now supports multiple trigger keywords such as 'order', 'buy', or 'purchase',
    accommodates quantities with commas and decimal points (e.g., "1,000" or "2.5"),
    and allows inventory names to include multiple words with hyphens or dots.
    
    For example, the text:
       "buy 1,000 glue for our upcoming corporate event"
    will capture:
       quantity: 1000     # After conversion, the output number is 1000
       inventory: "Glue"
       
    Returns a dictionary with keys:
        - inventory
        - quantity
    """
    details = {}
    
    # Define a set of stop words that should not be included in the product name.
    stop_words = r'(?:for|of|with|to|best|regards)'
    
    # Create a trigger pattern that supports multiple keywords.
    trigger_pattern = r'(?:order|buy|purchase)\s+'
    
    # ---------- CHANGED: Modified quantity pattern ----------
    # This pattern supports numbers with commas (e.g., "1,000") and decimals (e.g., "2.5")
    quantity_pattern = r'(\d+(?:,\d+)?(?:\.\d+)?)'
    
    # ---------- CHANGED: Modified inventory pattern ----------
    # This pattern supports product names with multiple words, including hyphens and dots.
    # It uses a negative lookahead to avoid capturing stop words.
    inventory_pattern = r'([\w\-.]+(?:\s+(?!' + stop_words + r'\b)[\w\-.]+)*)'
    
    # ---------- CHANGED: Updated primary regex ----------
    # Combines the trigger, updated quantity, and inventory patterns.
    primary_pattern = re.compile(
        trigger_pattern + quantity_pattern + r'\s+' + inventory_pattern,
        re.IGNORECASE
    )
    
    match = primary_pattern.search(email_text)
    if match:
        # ---------- CHANGED: Remove commas and convert to numerical type ----------
        raw_quantity = match.group(1).strip()      # e.g., "1,000"
        cleaned_quantity = raw_quantity.replace(",", "")  # "1000"
        try:
            # Convert to an integer if there is no decimal point, else to a float
            details["quantity"] = int(cleaned_quantity) if "." not in cleaned_quantity else float(cleaned_quantity)
        except ValueError:
            details["quantity"] = 0  # Fallback in case conversion fails
        
        inventory_candidate = match.group(2).strip()
        details["inventory"] = inventory_candidate.capitalize()
    else:
        # Fallback regex: in case no trigger keyword is found, still look for a quantity followed by product.
        fallback_pattern = re.compile(
            quantity_pattern + r'\s+' + inventory_pattern,
            re.IGNORECASE
        )
        fallback_match = fallback_pattern.search(email_text)
        if fallback_match:
            raw_quantity = fallback_match.group(1).strip()
            cleaned_quantity = raw_quantity.replace(",", "")
            try:
                details["quantity"] = int(cleaned_quantity) if "." not in cleaned_quantity else float(cleaned_quantity)
            except ValueError:
                details["quantity"] = 0
            inventory_candidate = fallback_match.group(2).strip()
            details["inventory"] = inventory_candidate.capitalize()
    
    return details