# Branch Protection Rules

## Main Branch Protection
- **Branch**: `main`
- **Required Status Checks**: All CI checks must pass
- **Required Reviews**: 1 reviewer approval
- **Dismiss Stale Reviews**: Yes
- **Require Up-to-Date Branches**: Yes
- **Restrict Pushes**: Yes (only via PR)
- **Allow Force Pushes**: No
- **Allow Deletions**: No

## Develop Branch Protection
- **Branch**: `develop`
- **Required Status Checks**: All CI checks must pass
- **Required Reviews**: 1 reviewer approval
- **Dismiss Stale Reviews**: Yes
- **Require Up-to-Date Branches**: Yes
- **Restrict Pushes**: Yes (only via PR)
- **Allow Force Pushes**: No
- **Allow Deletions**: No

## Required Status Checks
1. **Lint & Type Check** - Code quality and type safety
2. **Unit Tests** - Test coverage and functionality
3. **Integration Tests** - API and service integration
4. **Build Check** - Application builds successfully
5. **Security Audit** - No high-severity vulnerabilities
6. **PR Validation** - Linked issue and semantic commits
7. **Dependency Review** - Security and license compliance
8. **CodeQL Analysis** - Security vulnerability scanning

## PR Requirements
- **Linked Issue**: PR must reference an issue (#123)
- **Semantic Commits**: All commits must follow conventional format
- **Test Coverage**: New features must include tests
- **Documentation**: Changes must be documented
- **Review Approval**: At least 1 reviewer approval required

## Commit Message Format
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
- `feat(auth): add OAuth2 login`
- `fix(payment): resolve Stripe webhook validation`
- `docs(api): update endpoint documentation`
- `chore(deps): update dependencies`
- `breaking(api): remove deprecated endpoints`
