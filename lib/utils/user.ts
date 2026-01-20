import * as path from 'path';
import * as fs from 'fs';
import { ProtectedValue } from '../crypto/protected-value';
import { FileHeader, FileExt, ErrorCodes } from '../defs/consts';
import { KdbxError } from '../errors/kdbx-error';

/**
 * File format enumeration for different database types
 */
enum FileFormat {
    PassXYZ_Data = 'passxyz_data',
    PassXYZ_DataWithKey = 'passxyz_data_with_key',
    KeePass = 'keepass'
}

/**
 * File format information interface
 */
interface FileFormatInfo {
    format: FileFormat;
    hasKeyFile: boolean;
    base58String?: string;
}

/**
 * Base58 decoder utility for PassXYZ filenames
 */
class Base58Decoder {
    private static readonly ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    private static readonly BASE = 58;

    /**
     * Decode a base58 string to plain text
     */
    static decode(encoded: string): string {
        if (!encoded || encoded.length === 0) {
            return '';
        }

        if (!this.isValidBase58(encoded)) {
            throw new KdbxError(ErrorCodes.InvalidArg, `Invalid base58 string: ${encoded}`);
        }

        // Use array to handle large numbers
        const digits: number[] = [0];
        
        for (let i = 0; i < encoded.length; i++) {
            const char = encoded[i];
            const index = this.ALPHABET.indexOf(char);
            
            // Multiply digits by base and add new digit
            let carry = index;
            for (let j = 0; j < digits.length; j++) {
                carry += digits[j] * this.BASE;
                digits[j] = carry % 256;
                carry = Math.floor(carry / 256);
            }
            
            while (carry > 0) {
                digits.push(carry % 256);
                carry = Math.floor(carry / 256);
            }
        }

        // Convert to string (reverse order since we built it backwards)
        const bytes = digits.reverse();
        return String.fromCharCode(...bytes);
    }

    /**
     * Check if a string is valid base58
     */
    static isValidBase58(str: string): boolean {
        if (!str || str.length === 0) {
            return false;
        }
        
        for (const char of str) {
            if (this.ALPHABET.indexOf(char) === -1) {
                return false;
            }
        }
        return true;
    }
}

/**
 * User class providing unified interface for PassXYZ and KeePass database files
 */
export class User {
    readonly Username: string;
    readonly Password: ProtectedValue;
    readonly IsKeyFileEnabled: boolean;
    readonly DataFilePath: string;
    readonly KeyFilePath: string;
    readonly fileSize: number;
    readonly lastModified: Date;
    readonly icon: string;

    constructor(dataFilePath: string) {
        // Validate file exists
        if (!fs.existsSync(dataFilePath)) {
            throw new KdbxError(ErrorCodes.InvalidArg, `File not found: ${dataFilePath}`);
        }

        // Store data file path
        this.DataFilePath = dataFilePath;

        // Get file stats for additional properties
        const stats = fs.statSync(dataFilePath);
        this.fileSize = stats.size;
        this.lastModified = stats.mtime;

        // Analyze file format
        const formatInfo = this.analyzeFileFormat(dataFilePath);

        // Set icon based on file format
        this.icon = this.getIconForFormat(formatInfo.format);

        // Extract username based on format
        this.Username = this.extractUsername(dataFilePath, formatInfo);

        // Determine key file settings
        this.IsKeyFileEnabled = formatInfo.hasKeyFile;

        // Generate key file path if needed
        this.KeyFilePath = this.generateKeyFilePath(dataFilePath, formatInfo);

        // Initialize empty password
        this.Password = ProtectedValue.fromString('');
    }

    /**
     * Analyze file format based on filename patterns
     */
    private analyzeFileFormat(filePath: string): FileFormatInfo {
        const filename = path.basename(filePath);
        
        // Check for PassXYZ patterns using FileHeader and FileExt constants
        if (filename.startsWith(FileHeader.Data) && filename.endsWith(FileExt.Data)) {
            const base58String = filename.slice(FileHeader.Data.length, -FileExt.Data.length);
            return {
                format: FileFormat.PassXYZ_Data,
                hasKeyFile: false,
                base58String
            };
        }
        
        if (filename.startsWith(FileHeader.Datax) && filename.endsWith(FileExt.Data)) {
            const base58String = filename.slice(FileHeader.Datax.length, -FileExt.Data.length);
            return {
                format: FileFormat.PassXYZ_DataWithKey,
                hasKeyFile: true,
                base58String
            };
        }
        
        // Default to KeePass format
        return {
            format: FileFormat.KeePass,
            hasKeyFile: false // Will be determined by header analysis if needed
        };
    }

    /**
     * Extract username based on file format
     */
    private extractUsername(filePath: string, formatInfo: FileFormatInfo): string {
        if (formatInfo.format === FileFormat.KeePass) {
            return this.extractKeePassUsername(filePath);
        } else {
            return this.extractPassXYZUsername(formatInfo.base58String!);
        }
    }

    /**
     * Extract username from KeePass filename
     */
    private extractKeePassUsername(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * Extract username from PassXYZ base58 string
     */
    private extractPassXYZUsername(base58String: string): string {
        try {
            return Base58Decoder.decode(base58String);
        } catch (error) {
            // Fallback to base58 string if decoding fails
            return base58String;
        }
    }

    /**
     * Generate key file path based on format
     */
    private generateKeyFilePath(dataFilePath: string, formatInfo: FileFormatInfo): string {
        if (!formatInfo.hasKeyFile) {
            return '';
        }
        
        const dir = path.dirname(dataFilePath);
        const basename = path.basename(dataFilePath, path.extname(dataFilePath));
        
        if (formatInfo.format === FileFormat.PassXYZ_DataWithKey) {
            // Replace FileHeader.Datax with FileHeader.Key and use FileExt.KeyV2
            const keyFilename = basename.replace(FileHeader.Datax, FileHeader.Key) + FileExt.KeyV2;
            return path.join(dir, keyFilename);
        } else {
            // KeePass key file
            return path.join(dir, basename + FileExt.KeyV2);
        }
    }

    /**
     * Get icon name based on file format
     */
    private getIconForFormat(format: FileFormat): string {
        switch (format) {
            case FileFormat.PassXYZ_Data:
            case FileFormat.PassXYZ_DataWithKey:
                return 'passxyz';
            case FileFormat.KeePass:
                return 'keepass';
            default:
                return 'database';
        }
    }
}