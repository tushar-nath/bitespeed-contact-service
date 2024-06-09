import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

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

  const emailContact = email
    ? await prisma.contact.findFirst({ where: { email } })
    : null

  const phoneNumberContact = phoneNumber
    ? await prisma.contact.findFirst({ where: { phoneNumber } })
    : null

  if (!emailContact && !phoneNumberContact) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
      },
    })
    return {
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email || ''],
        phoneNumbers: [newContact.phoneNumber || ''],
        secondaryContactIds: [],
      },
    }
  }
  let primaryContact: Prisma.ContactGetPayload<any> | null =
    emailContact || phoneNumberContact

  // CASE 1: email and phoneNumber belong to different primary contacts
  if (
    emailContact &&
    phoneNumberContact &&
    emailContact.id !== phoneNumberContact.id
  ) {
    // Determine the older primary contact to remain as primary
    if (emailContact.createdAt <= phoneNumberContact.createdAt) {
      primaryContact = emailContact
      await prisma.contact.update({
        where: { id: phoneNumberContact.id },
        data: {
          linkPrecedence: 'SECONDARY',
          linkedId: emailContact.id,
        },
      })
    } else {
      primaryContact = phoneNumberContact
      await prisma.contact.update({
        where: { id: emailContact.id },
        data: {
          linkPrecedence: 'SECONDARY',
          linkedId: phoneNumberContact.id,
        },
      })
    }
  } else {
    // If one of them is already secondary, ensure we use the primary
    if (emailContact && emailContact.linkPrecedence === 'SECONDARY') {
      primaryContact = await prisma.contact.findUnique({
        where: { id: emailContact.linkedId! },
      })
    }
    if (
      phoneNumberContact &&
      phoneNumberContact.linkPrecedence === 'SECONDARY'
    ) {
      primaryContact = await prisma.contact.findUnique({
        where: { id: phoneNumberContact.linkedId! },
      })
    }
  }

  // CASE 2: Find all linked secondary contacts
  const secondaryContacts = await prisma.contact.findMany({
    where: { linkedId: primaryContact?.id, linkPrecedence: 'SECONDARY' },
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
      primaryContact?.email !== email) ||
    (phoneNumber &&
      !existingSecondaryPhoneNumbers.includes(phoneNumber) &&
      primaryContact?.phoneNumber !== phoneNumber)
  ) {
    const newSecondaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact?.id,
        linkPrecedence: 'SECONDARY',
      },
    })
    secondaryContacts.push(newSecondaryContact)
  }

  // CASE 4: Update primary contact if necessary
  if (email && !primaryContact?.email) {
    await prisma.contact.update({
      where: { id: primaryContact?.id },
      data: { email },
    })
  } else if (phoneNumber && !primaryContact?.phoneNumber) {
    await prisma.contact.update({
      where: { id: primaryContact?.id },
      data: { phoneNumber },
    })
  }

  const emails = [
    primaryContact?.email || '',
    ...secondaryContacts.map((contact) => contact.email || ''),
  ]
  const phoneNumbers = [
    ...new Set([
      primaryContact?.phoneNumber || '',
      ...secondaryContacts.map((contact) => contact.phoneNumber || ''),
    ]),
  ]
  const secondaryContactIds = secondaryContacts.map((contact) => contact.id)

  return {
    contact: {
      primaryContactId: primaryContact?.id || 0,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  }
}
