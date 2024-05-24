import { AppDataSource } from "../index";
import { Contact } from "../models/contact";

interface ContactRequest {
  email?: string;
  phoneNumber?: string;
}

export const identifyContact = async (data: ContactRequest) => {
  const contactRepo = AppDataSource.getRepository(Contact);

  const { email, phoneNumber } = data;

  const existingContacts = await contactRepo.find({
    where: [email ? { email } : {}, phoneNumber ? { phoneNumber } : {}],
  });

  let primaryContact: Contact | undefined;
  let secondaryContacts: Contact[] = [];

  // Find the primary contact
  for (const contact of existingContacts) {
    if (contact.linkPrecedence === "primary") {
      primaryContact = contact;
    } else {
      secondaryContacts.push(contact);
    }
  }

  if (!primaryContact) {
    // If no primary contact found, make the first contact the primary one
    primaryContact = existingContacts[0];
    primaryContact.linkPrecedence = "primary";
    await contactRepo.save(primaryContact);
    secondaryContacts = existingContacts.slice(1);
  }

  if (
    (!email || email === primaryContact.email) &&
    (!phoneNumber || phoneNumber === primaryContact.phoneNumber)
  ) {
    // If the incoming contact details are the same as the primary contact, no need to create a new secondary contact
    return formatResponse(primaryContact, secondaryContacts);
  }

  // Check if the incoming contact details are new, if so create a secondary contact
  const isExistingContact = existingContacts.some(
    (contact) =>
      (contact.email === email && email) ||
      (contact.phoneNumber === phoneNumber && phoneNumber)
  );

  if (!isExistingContact) {
    const newContact = contactRepo.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary", // Always set linkPrecedence to "secondary" for new contacts
    });
    await contactRepo.save(newContact);
    secondaryContacts.push(newContact);
  }

  return formatResponse(primaryContact, secondaryContacts);
};

const formatResponse = (primary: Contact, secondary: Contact[]) => {
  const emailsSet: any = new Set<string>();
  const phoneNumbersSet: any = new Set<string>();

  emailsSet.add(primary.email);
  phoneNumbersSet.add(primary.phoneNumber);

  for (const contact of secondary) {
    if (contact.email && contact.email !== primary.email) {
      emailsSet.add(contact.email);
    }
    if (contact.phoneNumber && contact.phoneNumber !== primary.phoneNumber) {
      phoneNumbersSet.add(contact.phoneNumber);
    }
  }

  return {
    contact: {
      primaryContactId: primary.id,
      emails: [...emailsSet],
      phoneNumbers: [...phoneNumbersSet],
      secondaryContactIds: secondary.map((contact) => contact.id),
    },
  };
};
