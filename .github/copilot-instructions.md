<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Authentication System - Copilot Instructions

This is a full-stack authentication system built with Angular, Python Flask, and MySQL. Here are the project-specific guidelines for code generation:

## Project Structure
- **Frontend**: Angular 20+ with TypeScript, standalone components, reactive forms
- **Backend**: Python Flask with SQLAlchemy ORM, JWT authentication, bcrypt password hashing
- **Database**: MySQL with proper indexing and foreign key constraints

## Code Style Guidelines

### Angular Frontend
- Use standalone components with explicit imports
- Implement reactive forms with proper validation
- Use Angular services for HTTP communication
- Apply proper TypeScript typing for all variables and functions
- Use SCSS for styling with BEM methodology when applicable
- Implement proper error handling with user-friendly messages

### Python Backend
- Follow PEP 8 style guidelines
- Use proper error handling with try-catch blocks
- Implement input validation for all API endpoints
- Use environment variables for configuration
- Apply proper HTTP status codes in responses
- Use descriptive function and variable names

### Database
- Use proper indexing for performance
- Implement foreign key constraints
- Use appropriate data types for columns
- Apply proper naming conventions for tables and columns

## Security Best Practices
- Always hash passwords using bcrypt
- Use JWT tokens for stateless authentication
- Implement proper input validation and sanitization
- Use CORS properly for cross-origin requests
- Store sensitive data in environment variables
- Implement proper authentication guards on protected routes

## API Response Format
All API responses should follow this structure:
```json
{
  "message": "Success/Error message",
  "data": {}, // Optional data
  "error": "Error details" // Only for error responses
}
```

## Component Guidelines
- Components should be focused and single-purpose
- Use OnPush change detection strategy when appropriate
- Implement proper lifecycle hooks
- Use proper unsubscribe patterns for observables
- Apply consistent naming conventions

## Testing Considerations
- Write unit tests for services and components
- Mock HTTP requests in tests
- Test error handling scenarios
- Validate form inputs and edge cases

Remember to maintain consistency with the existing codebase and follow the established patterns when adding new features.
