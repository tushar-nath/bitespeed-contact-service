"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const index_1 = require("../index");
const contact_1 = require("../models/contact");
const identifyContact = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = data;
    const contactRepository = index_1.AppDataSource.getRepository(contact_1.Contact);
    // Find contacts based on email and phoneNumber
    const emailContact = email
        ? yield contactRepository.findOne({ where: { email } })
        : null;
    const phoneNumberContact = phoneNumber
        ? yield contactRepository.findOne({ where: { phoneNumber } })
        : null;
    if (!emailContact && !phoneNumberContact) {
        const newContact = contactRepository.create({
            email,
            phoneNumber,
        });
        const savedContact = yield contactRepository.save(newContact);
        return {
            contact: {
                primaryContactId: savedContact.id,
                emails: [savedContact.email || ""],
                phoneNumbers: [savedContact.phoneNumber || ""],
                secondaryContactIds: [],
            },
        };
    }
    let primaryContact = emailContact || phoneNumberContact;
    // CASE 1: email and phoneNumber belong to different primary contacts
    if (emailContact &&
        phoneNumberContact &&
        emailContact.id !== phoneNumberContact.id) {
        // Determine the older primary contact to remain as primary
        if (emailContact.createdAt <= phoneNumberContact.createdAt) {
            primaryContact = emailContact;
            phoneNumberContact.linkPrecedence = "secondary";
            phoneNumberContact.linkedId = emailContact.id;
            yield contactRepository.save(phoneNumberContact);
        }
        else {
            primaryContact = phoneNumberContact;
            emailContact.linkPrecedence = "secondary";
            emailContact.linkedId = phoneNumberContact.id;
            yield contactRepository.save(emailContact);
        }
    }
    else {
        // If one of them is already secondary, ensure we use the primary
        if (emailContact && emailContact.linkPrecedence === "secondary") {
            primaryContact = yield contactRepository.findOne({
                where: { id: emailContact.linkedId },
            });
        }
        if (phoneNumberContact &&
            phoneNumberContact.linkPrecedence === "secondary") {
            primaryContact = yield contactRepository.findOne({
                where: { id: phoneNumberContact.linkedId },
            });
        }
    }
    // CASE 2: Find all linked secondary contacts
    const secondaryContacts = yield contactRepository.find({
        where: { linkedId: primaryContact.id, linkPrecedence: "secondary" },
    });
    // CASE 3: Check if new secondary contact needs to be created
    const existingSecondaryEmails = secondaryContacts.map((contact) => contact.email);
    const existingSecondaryPhoneNumbers = secondaryContacts.map((contact) => contact.phoneNumber);
    if ((email &&
        !existingSecondaryEmails.includes(email) &&
        primaryContact.email !== email) ||
        (phoneNumber &&
            !existingSecondaryPhoneNumbers.includes(phoneNumber) &&
            primaryContact.phoneNumber !== phoneNumber)) {
        const newSecondaryContact = contactRepository.create({
            email,
            phoneNumber,
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
        });
        yield contactRepository.save(newSecondaryContact);
        secondaryContacts.push(newSecondaryContact);
    }
    // CASE 4: Update primary contact if necessary
    if (email && !primaryContact.email) {
        primaryContact.email = email;
    }
    else if (phoneNumber && !primaryContact.phoneNumber) {
        primaryContact.phoneNumber = phoneNumber;
    }
    yield contactRepository.save(primaryContact);
    const emails = [
        primaryContact.email || "",
        ...secondaryContacts.map((contact) => contact.email || ""),
    ];
    const phoneNumbers = [
        ...new Set([
            primaryContact.phoneNumber || "",
            ...secondaryContacts.map((contact) => contact.phoneNumber || ""),
        ]),
    ];
    const secondaryContactIds = secondaryContacts.map((contact) => contact.id);
    return {
        contact: {
            primaryContactId: primaryContact.id,
            emails,
            phoneNumbers,
            secondaryContactIds,
        },
    };
});
exports.identifyContact = identifyContact;
