# Requirements Document

## Introduction

This document specifies the requirements for implementing a User class in a KeePass/PassXYZ library that can handle both PassXYZ and KeePass data files with automatic detection and configuration based on file format.

## Glossary

- **User_Class**: The main class that represents a user with credentials and file paths
- **PassXYZ_File**: A data file with filename format `pass_[d|e]_{base58 string}.xyz`
- **KeePass_File**: A standard KeePass database file with `.kdbx` extension
- **Key_File**: An additional file used for enhanced security in database encryption
- **File_Header**: The initial bytes of a file that identify its format and properties
- **Base58_String**: A base58-encoded string used in PassXYZ filenames
- **ProtectedValue**: A secure container for sensitive data that stores values XOR'ed in memory
- **DataFilePath**: The file system path to the main database file
- **KeyFilePath**: The file system path to the key file (if enabled)

## Requirements

### Requirement 1: User Class Properties

**User Story:** As a developer, I want a User class with essential properties, so that I can manage user credentials and file paths consistently.

#### Acceptance Criteria

1. THE User_Class SHALL have a Username property of type string
2. THE User_Class SHALL have a Password property of type ProtectedValue
3. THE User_Class SHALL have an IsKeyFileEnabled property of type boolean
4. THE User_Class SHALL have a DataFilePath property of type string
5. THE User_Class SHALL have a KeyFilePath property that is readonly

### Requirement 2: File Format Detection

**User Story:** As a developer, I want automatic file format detection, so that the User class can configure itself appropriately for different database types.

#### Acceptance Criteria

1. WHEN a PassXYZ data file is provided, THE User_Class SHALL detect the PassXYZ format from the filename pattern
2. WHEN a KeePass data file is provided, THE User_Class SHALL detect the KeePass format as the default for non-PassXYZ files
3. WHEN the filename matches `pass_d_{base58 string}.xyz`, THE User_Class SHALL identify it as PassXYZ data without key file
4. WHEN the filename matches `pass_e_{base58 string}.xyz`, THE User_Class SHALL identify it as PassXYZ data with key file
5. THE User_Class SHALL analyze the file header to determine if a key file is used

### Requirement 3: Username Configuration

**User Story:** As a developer, I want automatic username configuration based on file format, so that usernames are set appropriately for different database types.

#### Acceptance Criteria

1. WHEN a KeePass file is provided, THE User_Class SHALL set Username to the filename without extension
2. WHEN a PassXYZ file is provided, THE User_Class SHALL decode the base58 string from the filename and set it as Username
3. THE User_Class SHALL extract the base58 string from PassXYZ filenames using the pattern `pass_[d|e]_{base58 string}.xyz`
4. THE User_Class SHALL decode the extracted base58 string to create the Username

### Requirement 4: Key File Management

**User Story:** As a developer, I want automatic key file path generation, so that key files are properly configured when needed.

#### Acceptance Criteria

1. WHEN IsKeyFileEnabled is true, THE User_Class SHALL generate the KeyFilePath using FileExt.KeyV2 extension
2. WHEN IsKeyFileEnabled is false, THE User_Class SHALL set KeyFilePath to empty string
3. WHEN a PassXYZ file with `pass_e_` prefix is detected, THE User_Class SHALL set IsKeyFileEnabled to true
4. WHEN a PassXYZ file with `pass_d_` prefix is detected, THE User_Class SHALL set IsKeyFileEnabled to false
5. THE User_Class SHALL determine KeyFilePath by replacing the data file extension with the appropriate key file extension
6. THE key file name uses the pattern `pass_k_{base58 string}.keyx` for PassXYZ key file and `filename.keyx` for KeePass key file.

### Requirement 5: Constructor Behavior

**User Story:** As a developer, I want a constructor that takes a DataFilePath parameter, so that the User class can initialize itself automatically.

#### Acceptance Criteria

1. WHEN the User_Class constructor is called with a DataFilePath, THE User_Class SHALL store the DataFilePath property
2. WHEN the constructor is called, THE User_Class SHALL analyze the file header to determine file type
3. WHEN the constructor is called, THE User_Class SHALL set Username based on the detected file format
4. WHEN the constructor is called, THE User_Class SHALL determine IsKeyFileEnabled based on file format and header analysis
5. WHEN the constructor is called, THE User_Class SHALL generate the appropriate KeyFilePath if key file is enabled

### Requirement 6: File Header Analysis

**User Story:** As a developer, I want file header analysis capabilities, so that the system can determine file properties beyond filename patterns.

#### Acceptance Criteria

1. THE User_Class SHALL read the file header to validate file format detection
2. WHEN analyzing file headers, THE User_Class SHALL handle file read errors gracefully
3. THE User_Class SHALL use existing file header analysis capabilities from the codebase
4. WHEN file header analysis fails, THE User_Class SHALL fall back to filename-based detection
5. THE User_Class SHALL validate that the file header matches the expected format for the detected file type

### Requirement 7: Integration with Existing Codebase

**User Story:** As a developer, I want the User class to integrate seamlessly with existing code, so that it works with current utilities and patterns.

#### Acceptance Criteria

1. THE User_Class SHALL use the existing ProtectedValue class for password storage
2. THE User_Class SHALL use the existing FileExt constants for file extensions
3. THE User_Class SHALL use existing base58 decoding utilities if available
4. THE User_Class SHALL follow existing TypeScript patterns and conventions in the codebase
5. THE User_Class SHALL handle errors using existing error handling patterns