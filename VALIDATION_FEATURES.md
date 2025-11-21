# Form Validation Features

## Overview
This document describes the email and phone number validation features added to the Aurora N&N Business Solutions onboarding form.

## Email Validation

### Features
- **RFC 5322 Compliant**: Uses a comprehensive regex pattern that validates email addresses according to internet standards
- **Real-time Validation**: Validates when user attempts to proceed to the next question
- **User-friendly Error Messages**: Shows clear error messages like "Please enter a valid email address (e.g., name@example.com)"

### Validation Rules
- Must contain @ symbol
- Must have valid characters before and after @
- Must have valid domain structure
- Examples of valid emails: `john@example.com`, `user.name+tag@example.co.uk`

## Phone Number Validation

### Features
1. **Country Code Selector**: Dropdown with 50+ countries
2. **Manual Entry Option**: For countries not in the list
3. **10-Digit Validation**: For standard country code entries
4. **Flexible Manual Validation**: For full international numbers

### Country Codes Included
The form now includes country codes for:
- **North America**: USA/Canada (+1)
- **Europe**: UK, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria, Denmark, Sweden, Norway, Finland, Poland, Portugal, Greece, Ireland
- **Asia**: India, China, Japan, South Korea, Singapore, Malaysia, Indonesia, Philippines, Thailand, Vietnam, Pakistan, Bangladesh, Sri Lanka, Nepal, Iran, Turkey, Israel
- **Middle East**: UAE, Saudi Arabia
- **Africa**: Egypt, Nigeria, Kenya, South Africa
- **Oceania**: Australia, New Zealand
- **Latin America**: Brazil, Mexico, Argentina, Chile, Colombia, Peru, Venezuela

### Validation Rules

#### Standard Country Code Mode
- User selects a country code from dropdown
- Enters 10-digit phone number
- System validates exactly 10 digits (removes spaces, dashes, etc.)
- Error shown if not exactly 10 digits: "Please enter exactly 10 digits (you entered X)"

#### Manual Entry Mode
- User selects "✍️ Enter Full Number" from dropdown
- Input placeholder changes to "e.g., +1 234 567 8900"
- Must start with + symbol
- Must be at least 10 characters long
- Allows full international format with country code

### User Experience
- **Smart Placeholder**: Changes based on selected mode
- **Auto-clear on Switch**: Input clears when switching between modes
- **Error Messages**: Specific, helpful messages for each validation failure
- **Visual Feedback**: Shake animation on validation error
- **Error Display**: Red text below input showing what went wrong

## Implementation Details

### Files Modified
- `src/main.js`: Added validation logic and expanded country codes

### Key Functions
1. **validateCurrent()**: Main validation function with email and phone validation
2. **saveCurrentAnswer()**: Handles manual phone entry prefix
3. **renderQuestion()**: Updated to handle manual phone mode
4. **Form Submission**: Cleans up internal prefixes before sending

### Data Storage
- Phone numbers with country codes stored as: `+1 2345678900`
- Manual entries stored internally as: `manual:+1 234 567 8900`
- Prefix removed before display and submission

## Testing Recommendations

### Email Testing
- Test valid formats: `user@domain.com`, `first.last@company.co.uk`
- Test invalid formats: `notanemail`, `@domain.com`, `user@`
- Test special characters: `user+tag@domain.com`

### Phone Testing
- Test 10-digit validation with different country codes
- Test manual entry with various international formats
- Test switching between modes
- Test validation error messages
- Test form submission with both modes

## Future Enhancements
- Add phone number formatting (auto-add dashes/spaces)
- Add more country codes as needed
- Consider phone number lookup/verification API
- Add email verification (send confirmation code)
