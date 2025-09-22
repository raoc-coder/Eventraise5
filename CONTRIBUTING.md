# Contributing to EventraiseHUB

Thank you for your interest in contributing to EventraiseHUB! This document outlines our development process, coding standards, and how to submit contributions.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/EventraiseHUB.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests: `npm run validate`

## 📋 Development Process

### Branch Strategy
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Release preparation

### Commit Message Format
We use [Conventional Commits](https://www.conventionalcommits.org/) for semantic versioning:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes
- `build`: Build system changes
- `revert`: Revert previous commit
- `breaking`: Breaking changes

**Examples:**
```bash
feat(auth): add OAuth2 login
fix(payment): resolve Stripe webhook validation
docs(api): update endpoint documentation
chore(deps): update dependencies
breaking(api): remove deprecated endpoints
```

## 🔄 Pull Request Process

### Before Submitting
1. **Link an Issue**: Every PR must reference an issue (#123)
2. **Run Tests**: Ensure all tests pass locally
3. **Update Documentation**: Update relevant documentation
4. **Follow Style Guide**: Use ESLint and Prettier
5. **Write Tests**: Add tests for new functionality

### PR Requirements
- [ ] **Linked Issue**: PR references an issue
- [ ] **Semantic Commits**: All commits follow conventional format
- [ ] **Tests Pass**: All CI checks pass
- [ ] **Code Review**: At least 1 reviewer approval
- [ ] **Documentation**: Changes are documented
- [ ] **No Conflicts**: Branch is up-to-date with target

### PR Template
Use the provided PR template when creating pull requests. It includes:
- Issue linking
- Description of changes
- Testing information
- Checklist for reviewers

## 🧪 Testing

### Test Types
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and service integration
- **E2E Tests**: End-to-end user workflows
- **Security Tests**: Vulnerability scanning

### Running Tests
```bash
# All tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Test Requirements
- New features must include tests
- Bug fixes must include regression tests
- Test coverage should not decrease
- All tests must pass in CI

## 🔒 Security

### Vulnerability Reporting
For security vulnerabilities:
1. **Don't Create Public Issues**: Use the security vulnerability template
2. **Email Security Team**: Contact security@eventraisehub.com
3. **Follow Responsible Disclosure**: Wait for fix before public disclosure

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

## 📚 Code Standards

### TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Avoid `any` type
- Use proper error handling

### React
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use semantic HTML

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first design
- Ensure responsive layouts
- Maintain design system consistency

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Monitor Core Web Vitals

## 🚀 Release Process

### Automatic Releases
- **Semantic Versioning**: Based on commit types
- **Changelog Generation**: Automatic from commits
- **GitHub Releases**: Created automatically
- **Deployment**: Automatic to production

### Release Types
- **Patch** (`1.0.1`): Bug fixes
- **Minor** (`1.1.0`): New features
- **Major** (`2.0.0`): Breaking changes

### Manual Release
```bash
# Create release
npm run release

# Generate changelog
npm run changelog
```

## 🔍 Code Review

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Test changes thoroughly
- Keep PRs focused and small

### For Reviewers
- Check code quality and style
- Verify test coverage
- Ensure security best practices
- Validate performance impact
- Test functionality manually

### Review Checklist
- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Breaking changes documented

## 🐛 Issue Reporting

### Bug Reports
Use the bug report template with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
Use the feature request template with:
- Clear description
- Motivation and use case
- Detailed requirements
- Acceptance criteria
- Mockups if available

## 📞 Support

### Getting Help
- **Documentation**: Check existing docs first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: support@eventraisehub.com

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Follow the code of conduct
- Contribute constructively

## 📄 License

By contributing to EventraiseHUB, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to EventraiseHUB! 🎉
