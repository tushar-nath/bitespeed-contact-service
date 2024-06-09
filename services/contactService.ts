import { AppDataSource } from '../api'
import { Contact } from '../models'

interface ContactRequest {
  email?: string
  phoneNumber?: string
}

interface ContactResponse {
  contact: {
    primaryContactId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}

export const identifyContact = async (
  data: ContactRequest
): Promise<ContactResponse> => {
  const { email, phoneNumber } = data
  const contactRepository = AppDataSource.getRepository(Contact)

  // Find contacts based on email and phoneNumber
  const emailContact = email
    ? await contactRepository.findOne({ where: { email } })
    : null

  const phoneNumberContact = phoneNumber
    ? await contactRepository.findOne({ where: { phoneNumber } })
    : null

  if (!emailContact && !phoneNumberContact) {
    const newContact = contactRepository.create({
      email,
      phoneNumber,
    })
    const savedContact = await contactRepository.save(newContact)
    return {
      contact: {
        primaryContactId: savedContact.id,
        emails: [savedContact.email || ''],
        phoneNumbers: [savedContact.phoneNumber || ''],
        secondaryContactIds: [],
      },
    }
  }
  let primaryContact: any = emailContact || phoneNumberContact

  // CASE 1: email and phoneNumber belong to different primary contacts
  if (
    emailContact &&
    phoneNumberContact &&
    emailContact.id !== phoneNumberContact.id
  ) {
    // Determine the older primary contact to remain as primary
    if (emailContact.createdAt <= phoneNumberContact.createdAt) {
      primaryContact = emailContact
      phoneNumberContact.linkPrecedence = 'secondary'
      phoneNumberContact.linkedId = emailContact.id
      await contactRepository.save(phoneNumberContact)
    } else {
      primaryContact = phoneNumberContact
      emailContact.linkPrecedence = 'secondary'
      emailContact.linkedId = phoneNumberContact.id
      await contactRepository.save(emailContact)
    }
  } else {
    // If one of them is already secondary, ensure we use the primary
    if (emailContact && emailContact.linkPrecedence === 'secondary') {
      primaryContact = await contactRepository.findOne({
        where: { id: emailContact.linkedId },
      })
    }
    if (
      phoneNumberContact &&
      phoneNumberContact.linkPrecedence === 'secondary'
    ) {
      primaryContact = await contactRepository.findOne({
        where: { id: phoneNumberContact.linkedId },
      })
    }
  }

  // CASE 2: Find all linked secondary contacts
  const secondaryContacts = await contactRepository.find({
    where: { linkedId: primaryContact.id, linkPrecedence: 'secondary' },
  })

  // CASE 3: Check if new secondary contact needs to be created
  const existingSecondaryEmails = secondaryContacts.map(
    (contact) => contact.email
  )
  const existingSecondaryPhoneNumbers = secondaryContacts.map(
    (contact) => contact.phoneNumber
  )

  if (
    (email &&
      !existingSecondaryEmails.includes(email) &&
      primaryContact.email !== email) ||
    (phoneNumber &&
      !existingSecondaryPhoneNumbers.includes(phoneNumber) &&
      primaryContact.phoneNumber !== phoneNumber)
  ) {
    const newSecondaryContact = contactRepository.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary',
    })
    await contactRepository.save(newSecondaryContact)
    secondaryContacts.push(newSecondaryContact)
  }

  // CASE 4: Update primary contact if necessary
  if (email && !primaryContact.email) {
    primaryContact.email = email
  } else if (phoneNumber && !primaryContact.phoneNumber) {
    primaryContact.phoneNumber = phoneNumber
  }
  await contactRepository.save(primaryContact)

  const emails = [
    primaryContact.email || '',
    ...secondaryContacts.map((contact) => contact.email || ''),
  ]
  const phoneNumbers = [
    ...new Set([
      primaryContact.phoneNumber || '',
      ...secondaryContacts.map((contact) => contact.phoneNumber || ''),
    ]),
  ]
  const secondaryContactIds = secondaryContacts.map((contact) => contact.id)

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  }
}
