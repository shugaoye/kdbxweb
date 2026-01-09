# KdbxWeb Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Security-First Design
<!-- Example: I. Library-First -->
All data handling must prioritize security above performance considerations. Protected values are stored in memory XOR'ed, with WebCrypto used for encryption. Sensitive data is never exposed in plain text unnecessarily.
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### II. Cross-Platform Compatibility
<!-- Example: II. CLI Interface -->
The library must run consistently in all modern browsers and Node.js environments without native addons, ensuring broad accessibility and compatibility.
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### III. Strict TypeScript Implementation
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
All code must be written in strict TypeScript with proper typing, ensuring type safety and maintainability across the codebase.
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### IV. Conflict-Free Merge Capability
<!-- Example: IV. Integration Testing -->
Database merging must be implemented with robust CRDT algorithms to ensure conflict-free synchronization between replicas, supporting distributed workflows.
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### V. Full KDBX Feature Support
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
The library must provide complete support for Kdbx3 and Kdbx4 formats, maintaining compatibility with KeePass v2 databases and all their features.
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## Security Standards
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

All sensitive data (passwords, credentials) must be handled using ProtectedValue class which stores values XOR'ed in memory. Direct access to plaintext credentials must be avoided except when absolutely necessary for cryptographic operations.
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## Development Practices
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

Code must maintain high test coverage with comprehensive unit tests for all functionality. Changes to security-sensitive code require additional review. Performance optimizations must not compromise security guarantees.
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution governs all development decisions for the KdbxWeb library. All contributors must adhere to these principles when implementing features, fixing bugs, or making architectural decisions.
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
