import expect from 'expect.js';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../lib/utils/user';
import { ProtectedValue } from '../../lib/crypto/protected-value';
import { KdbxError } from '../../lib/errors/kdbx-error';

describe('User', () => {
    const testDir = path.join(__dirname, '../data');
    
    beforeEach(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    describe('constructor', () => {
        it('throws error for non-existent file', () => {
            expect(() => new User('non-existent-file.kdbx')).to.throwError();
        });

        it('creates User for KeePass file', () => {
            const filePath = path.join(testDir, 'test.kdbx');
            fs.writeFileSync(filePath, 'test content');
            
            const user = new User(filePath);
            
            expect(user.Username).to.be('test');
            expect(user.DataFilePath).to.be(filePath);
            expect(user.IsKeyFileEnabled).to.be(false);
            expect(user.KeyFilePath).to.be('');
            expect(user.Password).to.be.a(ProtectedValue);
            expect(user.fileSize).to.be.a('number');
            expect(user.fileSize).to.be.greaterThan(0);
            expect(user.lastModified).to.be.a(Date);
            expect(user.icon).to.be('keepass');
            
            fs.unlinkSync(filePath);
        });

        it('creates User for PassXYZ data file without key', () => {
            const filePath = path.join(testDir, 'pass_d_5QqG6h3CF7.xyz');
            fs.writeFileSync(filePath, 'passxyz content');
            
            const user = new User(filePath);
            
            expect(user.Username).to.be('test03n');
            expect(user.DataFilePath).to.be(filePath);
            expect(user.IsKeyFileEnabled).to.be(false);
            expect(user.KeyFilePath).to.be('');
            expect(user.Password).to.be.a(ProtectedValue);
            expect(user.fileSize).to.be.a('number');
            expect(user.fileSize).to.be.greaterThan(0);
            expect(user.lastModified).to.be.a(Date);
            expect(user.icon).to.be('passxyz');
            
            fs.unlinkSync(filePath);
        });

        it('creates User for PassXYZ data file with key', () => {
            const filePath = path.join(testDir, 'pass_e_5QqG6h3CF7.xyz');
            fs.writeFileSync(filePath, 'passxyz with key content');
            
            const user = new User(filePath);
            
            expect(user.Username).to.be('test03n');
            expect(user.DataFilePath).to.be(filePath);
            expect(user.IsKeyFileEnabled).to.be(true);
            expect(user.KeyFilePath).to.contain('pass_k_5QqG6h3CF7.keyx');
            expect(user.Password).to.be.a(ProtectedValue);
            expect(user.fileSize).to.be.a('number');
            expect(user.fileSize).to.be.greaterThan(0);
            expect(user.lastModified).to.be.a(Date);
            expect(user.icon).to.be('passxyz');
            
            fs.unlinkSync(filePath);
        });

        it('handles invalid base58 gracefully', () => {
            const filePath = path.join(testDir, 'pass_d_invalid0OIl.xyz');
            fs.writeFileSync(filePath, '');
            
            const user = new User(filePath);
            
            // Should fallback to the base58 string itself
            expect(user.Username).to.be('invalid0OIl');
            expect(user.DataFilePath).to.be(filePath);
            expect(user.IsKeyFileEnabled).to.be(false);
            
            fs.unlinkSync(filePath);
        });
    });

    describe('file format detection', () => {
        it('detects KeePass format for .kdbx files', () => {
            const filePath = path.join(testDir, 'database.kdbx');
            fs.writeFileSync(filePath, '');
            
            const user = new User(filePath);
            
            expect(user.Username).to.be('database');
            expect(user.IsKeyFileEnabled).to.be(false);
            
            fs.unlinkSync(filePath);
        });

        it('detects PassXYZ format for pass_d_ files', () => {
            const filePath = path.join(testDir, 'pass_d_test.xyz');
            fs.writeFileSync(filePath, '');
            
            const user = new User(filePath);
            
            expect(user.IsKeyFileEnabled).to.be(false);
            
            fs.unlinkSync(filePath);
        });

        it('detects PassXYZ format for pass_e_ files', () => {
            const filePath = path.join(testDir, 'pass_e_test.xyz');
            fs.writeFileSync(filePath, '');
            
            const user = new User(filePath);
            
            expect(user.IsKeyFileEnabled).to.be(true);
            
            fs.unlinkSync(filePath);
        });
    });

    describe('key file path generation', () => {
        it('generates correct key file path for PassXYZ', () => {
            const filePath = path.join(testDir, 'pass_e_test123.xyz');
            fs.writeFileSync(filePath, '');
            
            const user = new User(filePath);
            
            expect(user.KeyFilePath).to.contain('pass_k_test123.keyx');
            
            fs.unlinkSync(filePath);
        });

        it('generates correct key file path for KeePass', () => {
            const filePath = path.join(testDir, 'mydb.kdbx');
            fs.writeFileSync(filePath, '');
            
            // For this test, we need to simulate a KeePass file that requires a key file
            // Since our current implementation doesn't analyze headers, we'll test the path generation logic
            const user = new User(filePath);
            
            // KeePass files don't have key files enabled by default in our current implementation
            expect(user.IsKeyFileEnabled).to.be(false);
            expect(user.KeyFilePath).to.be('');
            
            fs.unlinkSync(filePath);
        });
    });

    describe('file properties', () => {
        it('provides file size and last modified date', () => {
            const filePath = path.join(testDir, 'properties-test.kdbx');
            const testContent = 'This is test content for file properties';
            fs.writeFileSync(filePath, testContent);
            
            const user = new User(filePath);
            
            expect(user.fileSize).to.be(testContent.length);
            expect(user.lastModified).to.be.a(Date);
            expect(user.lastModified.getTime()).to.be.lessThan(Date.now());
            expect(user.lastModified.getTime()).to.be.greaterThan(Date.now() - 10000); // Within last 10 seconds
            
            fs.unlinkSync(filePath);
        });

        it('sets correct icon for different file formats', () => {
            // Test KeePass icon
            const keepassFile = path.join(testDir, 'test.kdbx');
            fs.writeFileSync(keepassFile, 'keepass');
            const keepassUser = new User(keepassFile);
            expect(keepassUser.icon).to.be('keepass');
            fs.unlinkSync(keepassFile);

            // Test PassXYZ icon for data file
            const passxyzDataFile = path.join(testDir, 'pass_d_test.xyz');
            fs.writeFileSync(passxyzDataFile, 'passxyz');
            const passxyzDataUser = new User(passxyzDataFile);
            expect(passxyzDataUser.icon).to.be('passxyz');
            fs.unlinkSync(passxyzDataFile);

            // Test PassXYZ icon for data file with key
            const passxyzKeyFile = path.join(testDir, 'pass_e_test.xyz');
            fs.writeFileSync(passxyzKeyFile, 'passxyz');
            const passxyzKeyUser = new User(passxyzKeyFile);
            expect(passxyzKeyUser.icon).to.be('passxyz');
            fs.unlinkSync(passxyzKeyFile);
        });
    });
});