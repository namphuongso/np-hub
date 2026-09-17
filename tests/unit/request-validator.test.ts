import { describe, expect, it } from 'vitest';
import { validateUser } from '../../src/core/validation/request-validator';

describe('request-validator', () => {
    it('allows user without phoneNumber', () => {
        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: 'test@example.com',
            }),
        ).not.toThrow();

        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: 'test@example.com',
                phoneNumber: '',
            }),
        ).not.toThrow();
    });

    it('validates phone format when phoneNumber is provided', () => {
        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: 'test@example.com',
                phoneNumber: '0912345678',
            }),
        ).not.toThrow();

        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: 'test@example.com',
                phoneNumber: '+84912345678',
            }),
        ).not.toThrow();

        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: 'test@example.com',
                phoneNumber: '12345',
            }),
        ).toThrow('Phone number is invalid.');
    });

    it('validates required name and email', () => {
        expect(() =>
            validateUser({
                name: '',
                email: 'test@example.com',
            }),
        ).toThrow('user.name is required.');

        expect(() =>
            validateUser({
                name: 'Nguyen Van A',
                email: '',
            }),
        ).toThrow('user.email is required.');
    });
});
