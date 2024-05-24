import { AppDataSource } from "../index";
import { Contact } from "../models/contact";

interface ContactRequest {
  email?: string;
  phoneNumber?: string;
}

interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export const identifyContact = async (
  data: ContactRequest
): Promise<ContactResponse> => {
  const { email, phoneNumber } = data;
  const contactRepository = AppDataSource.getRepository(Contact);

  // Find existing secondary contact based on email
  let secondaryContact = email
    ? await contactRepository.findOne({ where: { email } })
    : null;

  // If secondary contact found, get the primary contact using linkedId
  if (secondaryContact && secondaryContact.linkPrecedence === "secondary") {
    const primaryContact: any = await contactRepository.findOne({
      where: { id: secondaryContact.linkedId },
    });

    const secondaryContacts = await contactRepository.find({
      where: { linkedId: primaryContact.id, linkPrecedence: "secondary" },
    });
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
  }

  // If no existing secondary contact found, find primary contact based on email or phoneNumber
  let primaryContact = await contactRepository.findOne({
    where: [{ email }, { phoneNumber }],
    order: { createdAt: "ASC" },
  });

  // If no existing contact found, create a new primary contact
  if (!primaryContact) {
    const newContact = contactRepository.create({
      email,
      phoneNumber,
    });
    primaryContact = await contactRepository.save(newContact);
    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: [primaryContact.email || ""],
        phoneNumbers: [primaryContact.phoneNumber || ""],
        secondaryContactIds: [],
      },
    };
  }

  // Find all linked secondary contacts
  const secondaryContacts = await contactRepository.find({
    where: { linkedId: primaryContact.id, linkPrecedence: "secondary" },
  });

  // Check if new secondary contact needs to be created
  const existingSecondaryEmails = secondaryContacts.map(
    (contact) => contact.email
  );
  const existingSecondaryPhoneNumbers = secondaryContacts.map(
    (contact) => contact.phoneNumber
  );

  if (
    (email &&
      !existingSecondaryEmails.includes(email) &&
      !primaryContact.email?.includes(email)) ||
    (phoneNumber &&
      !existingSecondaryPhoneNumbers.includes(phoneNumber) &&
      !primaryContact.phoneNumber?.includes(phoneNumber))
  ) {
    const newSecondaryContact = contactRepository.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    });
    await contactRepository.save(newSecondaryContact);
    secondaryContacts.push(newSecondaryContact);
  }

  // Update primary contact if necessary
  if (email && !primaryContact.email) {
    primaryContact.email = email;
  } else if (phoneNumber && !primaryContact.phoneNumber) {
    primaryContact.phoneNumber = phoneNumber;
  }
  await contactRepository.save(primaryContact);

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
};
